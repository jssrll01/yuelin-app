import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Send } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';

const TABLE = 'global_chat_messages';
const MAX = 5000;
const GOLD = '#d4af37';
const BG = '#eceff4';
const OUT = '6px 6px 14px rgba(163,177,198,0.55), -6px -6px 14px rgba(255,255,255,0.95)';
const INN = 'inset 3px 3px 7px rgba(163,177,198,0.5), inset -3px -3px 7px rgba(255,255,255,0.9)';

const timeOf = (iso) => new Date(iso).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' }).toUpperCase();
const phtDate = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
const byTime = (a, b) => new Date(a.created_at) - new Date(b.created_at);

export default function GlobalChat() {
  const { profile } = useAuth();
  const nav = useNavigate();
  const [msgs, setMsgs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const box = useRef(null);
  const first = useRef(true);

  const myId = profile?.id || null;
  const meVip = !!(profile?.vip_expires_at && new Date(profile.vip_expires_at) > new Date());

  // Add a confirmed row; drop the optimistic copy of the same message; never duplicate.
  const addReal = useCallback((row) => {
    setMsgs((list) => {
      if (list.some((m) => m.id === row.id)) return list;
      const rest = list.filter((m) => !(m.pending && m.user_id === row.user_id && m.message === row.message));
      return [...rest, row].sort(byTime);
    });
  }, []);

  // 1) Initial load: the newest 300 rows (an ascending query alone would return only the OLDEST 1000), shown oldest first.
  useEffect(() => {
    let live = true;
    (async () => {
      const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false }).limit(300);
      if (!live) return;
      if (error) setErr('Could not load messages: ' + error.message);
      else setMsgs((cur) => {
        const ids = new Set((data || []).map((m) => m.id));
        return [...(data || []).reverse(), ...cur.filter((m) => !ids.has(m.id))].sort(byTime);
      });
      setLoaded(true);
    })();
    return () => { live = false; };
  }, []);

  // 2) Realtime: INSERT and DELETE.
  useEffect(() => {
    const ch = supabase
      .channel('global-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLE }, (p) => addReal(p.new))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: TABLE }, (p) => {
        const id = p.old && p.old.id;
        if (id) setMsgs((list) => list.filter((m) => m.id !== id));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [addReal]);

  // 3) Auto-scroll: jump on first paint, glide on new messages.
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    if (first.current && msgs.length) { el.scrollTop = el.scrollHeight; first.current = false; }
    else el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs.length]);

  // Lock the page behind the chat so nothing else scrolls.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const send = async () => {
    const body = text.trim();
    if (!body || !profile || body.length > MAX) return;
    setErr('');
    setText('');
    const tmp = {
      id: 'tmp-' + Date.now() + Math.random().toString(36).slice(2, 6), pending: true,
      user_id: profile.id, username: profile.username || 'Member', message: body,
      created_at: new Date().toISOString(), session_date: phtDate(), sender_is_vip: meVip,
    };
    setMsgs((l) => [...l, tmp]);
    const { data, error } = await supabase.from(TABLE)
      .insert({ user_id: tmp.user_id, username: tmp.username, message: body, session_date: tmp.session_date, sender_is_vip: meVip })
      .select().single();
    if (error) {
      setMsgs((l) => l.filter((m) => m.id !== tmp.id));
      setText(body);
      setErr('Message not sent: ' + error.message);
      return;
    }
    setMsgs((l) => l.filter((m) => m.id !== tmp.id));
    addReal(data);
  };

  const left = MAX - text.length;
  const ui = (
    <div style={{ position: 'fixed', inset: 0, height: '100dvh', overflow: 'hidden', background: BG, zIndex: 2000, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      {/* The ONLY scrolling element */}
      <div ref={box} style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', padding: '72px 14px 112px', boxSizing: 'border-box' }}>
        {!loaded && <p style={{ textAlign: 'center', color: '#8a93a3', fontSize: 13 }}>Loading messages…</p>}
        {loaded && !msgs.length && !err && <p style={{ textAlign: 'center', color: '#8a93a3', fontSize: 13, marginTop: 40 }}>No messages yet. Say hello!</p>}
        {err && <div role="alert" style={{ background: '#fdecec', color: '#b42323', borderRadius: 12, padding: '10px 14px', fontSize: 13, margin: '0 auto 12px', maxWidth: 560 }}>{err}</div>}
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
          {msgs.map((m, i) => {
            const mine = !!myId && m.user_id === myId;
            const isVip = m.sender_is_vip === true;
            const consecutive = i > 0 && msgs[i - 1].user_id === m.user_id;
            const bubble = isVip
              ? { background: '#121212', color: '#f8f8f8', border: '1px solid rgba(212, 175, 55, 0.5)', fontFamily: 'Georgia, serif', boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }
              : mine
                ? { background: GOLD, color: '#000', border: '1px solid transparent', boxShadow: '0 2px 8px rgba(163,177,198,0.45)' }
                : { background: '#e2e8f0', color: '#1e293b', border: '1px solid transparent', boxShadow: '0 2px 8px rgba(163,177,198,0.45)' };
            return (
              <div key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%', marginTop: consecutive ? 3 : 14, opacity: m.pending ? 0.65 : 1 }}>
                {!consecutive && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: mine ? 'flex-end' : 'flex-start', margin: '0 6px 4px', fontSize: 11, color: '#6b7280' }}>
                    {isVip && <Crown size={12} color={GOLD} />}
                    <b style={{ color: isVip ? '#8a6d00' : '#4a5160', fontFamily: isVip ? 'Georgia, serif' : undefined }}>{mine ? 'You' : m.username || 'Member'}</b>
                    <span>{timeOf(m.created_at)}</span>
                  </div>
                )}
                <div style={{ ...bubble, borderRadius: 16, padding: '9px 14px', fontSize: 14.5, lineHeight: 1.45, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{m.message}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating back button */}
      <button type="button" onClick={() => nav(-1)} aria-label="Back"
        style={{ position: 'fixed', top: 'max(16px, env(safe-area-inset-top))', left: 16, zIndex: 2100, width: 44, height: 44, borderRadius: '50%', border: 'none', background: BG, boxShadow: OUT, color: '#2b2f3a', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
        <ArrowLeft size={20} />
      </button>

      {/* Floating input pill */}
      <div style={{ position: 'fixed', left: 16, right: 16, bottom: 'max(16px, env(safe-area-inset-bottom))', zIndex: 2100, maxWidth: 560, margin: '0 auto' }}>
        {text.length > 0 && <div style={{ textAlign: 'right', fontSize: 11, margin: '0 14px 4px', color: left < 200 ? '#b42323' : '#8a93a3' }}>{text.length} / {MAX}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: BG, borderRadius: 999, boxShadow: OUT, padding: 6 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={profile ? 'Message everyone…' : 'Sign in to chat'}
            disabled={!profile}
            maxLength={MAX}
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: BG, boxShadow: INN, borderRadius: 999, padding: '12px 16px', fontSize: 15, color: '#2b2f3a' }}
          />
          <button type="button" onClick={send} disabled={!profile || !text.trim()} aria-label="Send"
            style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: text.trim() ? GOLD : '#d9dde5', color: text.trim() ? '#000' : '#8a93a3', display: 'grid', placeItems: 'center', cursor: text.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
  // Portal to <body>: the app's page wrapper uses a transform animation, which would otherwise trap position:fixed inside it.
  return createPortal(ui, document.body);
}
