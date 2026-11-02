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
  const [vipUsers, setVipUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  
  const scrollContainerRef = useRef(null);

  // 1. Fetch VIP users directly from the tables on load
  const fetchVips = async () => {
    const vips = new Set();
    
    // Check vip_memberships table (assuming it has user_id)
    try {
      const { data: memberships } = await supabase.from('vip_memberships').select('user_id');
      memberships?.forEach(m => vips.add(m.user_id));
    } catch (e) { console.log('vip_memberships error', e); }

    // Also check profiles table just in case
    try {
      const { data: profiles } = await supabase.from('profiles').select('id').or('is_vip.eq.true, tier.eq.vip');
      profiles?.forEach(p => vips.add(p.id));
    } catch (e) { console.log('profiles error', e); }

    setVipUsers(vips);
  };

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
    fetchVips();
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
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
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

    const optimisticMsg = {
      id: 'temp-' + Date.now(),
      user_id: profile.id,
      username: profile.username,
      message: tempText,
      created_at: new Date().toISOString(),
      sender_is_vip: vipUsers.has(profile.id) // Use the live VIP list
    };

    setMessages(prev => [...prev, optimisticMsg]);

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
    <div style={{ height: '100dvh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Animation CSS */}
      <style>
        {`
          @keyframes vipGlow {
            0% { box-shadow: 0 0 5px rgba(212, 175, 55, 0.4), inset 0 0 5px rgba(212, 175, 55, 0.1); }
            50% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.8), inset 0 0 15px rgba(212, 175, 55, 0.3); }
            100% { box-shadow: 0 0 5px rgba(212, 175, 55, 0.4), inset 0 0 5px rgba(212, 175, 55, 0.1); }
          }
          .vip-bubble {
            animation: vipGlow 3s infinite;
          }
        `}
      </style>

      {/* Floating Header with Text */}
      <div style={{ 
        position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 12, pointerEvents: 'none'
      }}>
        <button onClick={() => nav('/')} style={{ 
          background: 'var(--surface)', border: 'none', borderRadius: '50%', width: 44, height: 44, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', pointerEvents: 'auto' 
        }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', pointerEvents: 'auto' }}>
          Global Chat
        </span>
      </div>

      {/* Scrollable Messages Area */}
      <div 
        ref={scrollContainerRef}
        style={{ 
          height: '100%', overflowY: 'auto', padding: '80px 16px 100px 16px', 
          display: 'flex', flexDirection: 'column', gap: 16 
        }}
      >
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
            // Check live VIP list first, fallback to database flag
            const isVip = vipUsers.has(m.user_id) || m.sender_is_vip === true; 

            return (
              <div key={m.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                {!isConsecutive && (
                  <span style={{ 
                    fontSize: 11, color: isVip ? '#d4af37' : 'var(--dim)', marginBottom: 4, marginLeft: 4, marginRight: 4,
                    display: 'flex', alignItems: 'center', gap: 4, fontWeight: isVip ? 700 : 500
                  }}>
                    {isMine ? 'You' : m.username} {isVip && <Crown size={12} color="#d4af37" />} · {formatPhtTime(m.created_at)}
                  </span>
                )}
                
                <div className={isVip ? 'vip-bubble' : ''} style={{ 
                  background: isVip ? '#121212' : (isMine ? '#d4af37' : '#e2e8f0'), 
                  color: isVip ? '#f8f8f8' : (isMine ? '#000' : '#1a202c'),
                  border: isVip ? '1px solid rgba(212, 175, 55, 0.5)' : 'none',
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
      </div>

      {/* Floating Input Area */}
      <div style={{ 
        position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 10,
        background: 'var(--surface)', padding: '8px 12px', borderRadius: 30,
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        {err && <p style={{ position: 'absolute', top: -24, left: 0, right: 0, color: 'red', fontSize: 12, textAlign: 'center' }}>{err}</p>}
        
        <form onSubmit={submit} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <textarea
              rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Message everyone..."
              style={{ width: '100%', background: 'none', border: 0, color: 'inherit', font: 'inherit', outline: 'none', resize: 'none', padding: '8px 4px', maxHeight: 100 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <span style={{ fontSize: 10, color: 'var(--dim)' }}>{charCount}/5000</span>
             <button type="submit" disabled={sending || !text.trim() || charCount > 5000} style={{ 
               background: 'var(--bg)', border: 'none', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
               boxShadow: '3px 3px 8px #c8c8c8, -3px -3px 8px #ffffff',
               cursor: sending || !text.trim() || charCount > 5000 ? 'not-allowed' : 'pointer',
               color: sending || !text.trim() || charCount > 5000 ? 'var(--dim)' : '#d4af37'
             }}>
               <Send size={16} style={{ marginLeft: -2, marginTop: 2 }} />
             </button>
          </div>
        </form>
      </div>

    </div>
  );
}
