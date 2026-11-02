import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, MessageSquare, ArrowLeft, Crown } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';

const formatPhtTime = (isoString) => {
  if (!isoString) return '';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(isoString));
};

export default function GlobalChat() {
  const { profile } = useAuth();
  const nav = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  const bottomRef = useRef(null);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('global_chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);
    
    if (!error && data) setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel('global_chat_room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_chat_messages' }, (payload) => {
        const newMsg = payload.new;
        setMessages((prev) => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          const filtered = prev.filter(m => !m.id.startsWith('temp-') || m.message !== newMsg.message);
          return [...filtered, newMsg];
        });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'global_chat_messages' }, () => {
        loadMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = async (e) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;
    
    const charCount = Array.from(text).length;
    if (charCount > 5000) return setErr('Message exceeds 5000 characters.');

    setSending(true);
    setErr('');
    const tempText = text.trim();
    setText(''); 

    // Optimistic UI insert
    const isMeVip = profile?.is_vip || profile?.tier === 'vip';
    const optimisticMsg = {
      id: 'temp-' + Date.now(),
      user_id: profile.id,
      username: profile.username,
      message: tempText,
      created_at: new Date().toISOString(),
      sender_is_vip: isMeVip
    };

    setMessages(prev => [...prev, optimisticMsg]);

    // Send to DB (Trigger overrides username and VIP status)
    const { error } = await supabase.from('global_chat_messages').insert({
      user_id: profile.id,
      message: tempText,
      username: profile.username
    });

    if (error) {
      setErr(error.message);
      setText(tempText);
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const charCount = Array.from(text).length;

  return (
    // Outer container locks the viewport height
    <div style={{ height: '100dvh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Fixed Header */}
      <div style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, 
        background: 'var(--bg)', borderBottom: '1px solid var(--line)', 
        display: 'flex', alignItems: 'center', padding: '0 16px', zIndex: 10 
      }}>
        <button onClick={() => nav('/')} style={{ background: 'var(--surface)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginRight: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Global Chat</h2>
        </div>
      </div>

      {/* Scrollable Messages (Padded so they don't hide behind fixed header/footer) */}
      <div style={{ 
        position: 'absolute', top: 64, bottom: 80, left: 0, right: 0, 
        overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--dim)' }}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--dim)' }}>
            <MessageSquare size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No messages yet today. Start the conversation!</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMine = m.user_id === profile?.id;
            const isConsecutive = i > 0 && messages[i - 1].user_id === m.user_id;
            const isVip = m.sender_is_vip; 

            return (
              <div key={m.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                {!isConsecutive && (
                  <span style={{ 
                    fontSize: 11, color: isVip ? '#d4af37' : 'var(--dim)', marginBottom: 4, marginLeft: 4, marginRight: 4,
                    display: 'flex', alignItems: 'center', gap: 4, fontWeight: isVip ? 700 : 400
                  }}>
                    {m.username} {isVip && <Crown size={12} />} · {formatPhtTime(m.created_at)}
                  </span>
                )}
                
                {/* Distinct VIP vs Standard Message Box */}
                <div style={{ 
                  background: isVip ? '#0a0a0a' : (isMine ? '#d4af37' : '#e2e8f0'), 
                  color: isVip ? '#f8f8f8' : (isMine ? '#000' : '#1a202c'),
                  border: isVip ? '1px solid #d4af37' : 'none',
                  boxShadow: isVip ? '0 4px 15px rgba(212, 175, 55, 0.2)' : 'none',
                  padding: '12px 16px', 
                  borderRadius: 16, 
                  borderBottomRightRadius: isMine && !isConsecutive ? 4 : 16,
                  borderBottomLeftRadius: !isMine && !isConsecutive ? 4 : 16,
                  maxWidth: '85%', wordBreak: 'break-word', whiteSpace: 'pre-wrap',
                  fontFamily: isVip ? 'Georgia, serif' : 'inherit', 
                  fontSize: isVip ? 15 : 14, lineHeight: 1.5
                }}>
                  {m.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Fixed Input Area */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 80, 
        background: 'var(--bg)', padding: '0 16px', display: 'flex', alignItems: 'center',
        paddingBottom: 'env(safe-area-inset-bottom)' 
      }}>
        {err && <p style={{ position: 'absolute', top: -20, left: 0, right: 0, color: 'red', fontSize: 12, textAlign: 'center' }}>{err}</p>}
        
        <form onSubmit={submit} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <div style={{ flex: 1, background: 'var(--bg)', boxShadow: 'inset 4px 4px 10px #c8c8c8, inset -4px -4px 10px #ffffff', borderRadius: 24, padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
            <textarea
              rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..."
              style={{ width: '100%', background: 'none', border: 0, color: 'inherit', font: 'inherit', outline: 'none', resize: 'none', padding: '8px 0', maxHeight: 100 }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <span style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 2 }}>{charCount}/5000</span>
             <button type="submit" disabled={sending || !text.trim() || charCount > 5000} style={{ 
               background: 'var(--bg)', border: 'none', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
               boxShadow: '4px 4px 10px #c8c8c8, -4px -4px 10px #ffffff',
               cursor: sending || !text.trim() || charCount > 5000 ? 'not-allowed' : 'pointer',
               color: sending || !text.trim() || charCount > 5000 ? 'var(--dim)' : '#d4af37'
             }}>
               <Send size={18} style={{ marginLeft: -2, marginTop: 2 }} />
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
