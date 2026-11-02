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

  const fetchVips = async () => {
    const vips = new Set();
    try {
      const { data: memberships } = await supabase.from('vip_memberships').select('user_id');
      memberships?.forEach(m => vips.add(m.user_id));
    } catch (e) { console.log(e); }
    try {
      const { data: profiles } = await supabase.from('profiles').select('id').or('is_vip.eq.true, tier.eq.vip');
      profiles?.forEach(p => vips.add(p.id));
    } catch (e) { console.log(e); }
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
      sender_is_vip: vipUsers.has(profile.id)
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
    // Now that parents have 100dvh and no transform, this Flexbox works perfectly
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'var(--bg)' 
    }}>
      
      {/* HEADER */}
      <div style={{ 
        flexShrink: 0, 
        height: 64, 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 16px', 
        borderBottom: '1px solid var(--line)' 
      }}>
        <button onClick={() => nav('/')} style={{ 
          background: 'var(--surface)', border: 'none', borderRadius: '50%', width: 40, height: 40, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginRight: 12
        }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
          Global Chat
        </span>
      </div>

      {/* MESSAGES (Takes remaining space) */}
      <div 
        ref={scrollContainerRef}
        style={{ 
          flex: 1, 
          minHeight: 0, // Forces it to respect the flex bounds
          overflowY: 'auto', 
          padding: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 16 
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
            const isVip = vipUsers.has(m.user_id) || m.sender_is_vip === true; 

            return (
              <div key={m.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                {!isConsecutive && (
                  <span style={{ 
                    fontSize: 11, color: 'var(--dim)', marginBottom: 4, marginLeft: 4, marginRight: 4,
                    display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500
                  }}>
                    {isMine ? 'You' : m.username} 
                    {isVip && <Crown size={12} color="#d4af37" />} 
                    · {formatPhtTime(m.created_at)}
                  </span>
                )}
                
                <div style={{ 
                  background: isMine ? '#d4af37' : '#e2e8f0', 
                  color: isMine ? '#000' : '#1a202c',
                  padding: '12px 16px', 
                  borderRadius: 16, 
                  borderBottomRightRadius: isMine && !isConsecutive ? 4 : 16,
                  borderBottomLeftRadius: !isMine && !isConsecutive ? 4 : 16,
                  maxWidth: '85%', wordBreak: 'break-word', whiteSpace: 'pre-wrap',
                  fontSize: 15, lineHeight: 1.5
                }}>
                  {m.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* COMPOSER (Fixed Height at bottom) */}
      <div style={{ 
        flexShrink: 0, 
        padding: '16px', 
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        borderTop: '1px solid var(--line)'
      }}>
        {err && <p style={{ color: 'red', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>{err}</p>}
        
        <form onSubmit={submit} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 24, padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
            <textarea
              rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Message everyone..."
              style={{ width: '100%', background: 'none', border: 0, color: 'inherit', font: 'inherit', outline: 'none', resize: 'none', padding: '8px 0', maxHeight: 100 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <span style={{ fontSize: 10, color: 'var(--dim)' }}>{charCount}/5000</span>
             <button type="submit" disabled={sending || !text.trim() || charCount > 5000} style={{ 
               background: 'var(--bg)', border: 'none', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
               boxShadow: '2px 2px 8px #c8c8c8, -2px -2px 8px #ffffff',
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
