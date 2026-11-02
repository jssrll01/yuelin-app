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

  // Lock body scroll when chat is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

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
    <div style={{ 
      height: '100dvh', 
      display: 'grid', 
      gridTemplateRows: '64px minmax(0, 1fr) auto', 
      background: 'var(--bg)',
      overflow: 'hidden' 
    }}>
      
      <style>
        {`
          @keyframes skeletonPulse {
            0% { opacity: 0.7; }
            50% { opacity: 0.3; }
            100% { opacity: 0.7; }
          }
          .skeleton-pulse {
            animation: skeletonPulse 1.5s ease-in-out infinite;
          }
        `}
      </style>
      {/* 1. HEADER ROW */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 16px', 
        borderBottom: '1px solid var(--line)',
        background: 'var(--bg)',
        zIndex: 10
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

      {/* 2. MESSAGES ROW (Scrollable) */}
      <div 
        ref={scrollContainerRef}
        style={{ 
          minHeight: 0, 
          overflowY: 'auto', 
          overscrollBehavior: 'contain',
          padding: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 16 
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', marginTop: 16 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => {
              const isRight = i % 2 === 0;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isRight ? 'flex-end' : 'flex-start', width: '100%' }}>
                  {/* Skeleton Username */}
                  <div style={{ width: isRight ? 80 : 60, height: 12, background: 'var(--line)', borderRadius: 4, marginBottom: 8 }} className="skeleton-pulse" />
                  {/* Skeleton Bubble */}
                  <div style={{ 
                    width: isRight ? '65%' : '50%', 
                    height: i % 3 === 0 ? 75 : 50, 
                    background: 'var(--surface)', 
                    borderRadius: 16, 
                    borderBottomRightRadius: isRight ? 4 : 16, 
                    borderBottomLeftRadius: !isRight ? 4 : 16 
                  }} className="skeleton-pulse" />
                </div>
              );
            })}
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--dim)' }}>
            <MessageSquare size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No messages yet today. Start the conversation!</p>
          </div>
        ) : (
          messages.map((m, i) => {
            // Render System Message Distinctly
            if (m.username === 'System') {
              return (
                <div key={m.id || i} style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                  <div style={{ 
                    background: 'var(--surface)', 
                    color: 'var(--text)', 
                    padding: '16px', 
                    borderRadius: 16, 
                    fontSize: 13, 
                    textAlign: 'left',
                    whiteSpace: 'pre-wrap', // This ensures line breaks are preserved
                    border: '1px solid var(--line)',
                    maxWidth: '90%',
                    lineHeight: 1.6
                  }}>
                    {m.message}
                  </div>
                </div>
              );
            }

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

      {/* 3. COMPOSER ROW (Fixed at bottom) */}
      <div style={{ 
        padding: '12px 16px', 
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        borderTop: '1px solid var(--line)',
        background: 'var(--bg)',
        zIndex: 10
      }}>
        {err && <p style={{ color: 'red', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>{err}</p>}
        
        <form onSubmit={submit} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          
          {/* Neumorphic Input Pill */}
          <div style={{ 
            flex: 1, 
            background: 'var(--bg)', 
            borderRadius: 24, 
            padding: '8px 16px', 
            display: 'flex', 
            alignItems: 'center',
            boxShadow: 'inset 4px 4px 10px #c8c8c8, inset -4px -4px 10px #ffffff' 
          }}>
            <textarea
              rows={1} 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              onKeyDown={handleKeyDown} 
              placeholder="Message everyone..."
              style={{ 
                width: '100%', 
                background: 'none', 
                border: 0, 
                color: 'var(--text)', 
                font: 'inherit', 
                outline: 'none', 
                resize: 'none', 
                padding: '4px 0', 
                maxHeight: 100 
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
             <span style={{ fontSize: 10, color: 'var(--dim)', fontWeight: 500 }}>{charCount}/5000</span>
             
             {/* Neumorphic Send Button */}
             <button type="submit" disabled={sending || !text.trim() || charCount > 5000} style={{ 
               background: 'var(--bg)', 
               border: 'none', 
               width: 44, 
               height: 44, 
               borderRadius: '50%', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               boxShadow: '4px 4px 10px #c8c8c8, -4px -4px 10px #ffffff',
               cursor: sending || !text.trim() || charCount > 5000 ? 'not-allowed' : 'pointer',
               color: sending || !text.trim() || charCount > 5000 ? 'var(--dim)' : '#d4af37',
               transition: 'all 0.2s'
             }}>
               <Send size={18} style={{ marginLeft: -2, marginTop: 2 }} />
             </button>
          </div>
        </form>
      </div>

    </div>
  );
}
