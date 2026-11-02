import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { when } from '../format.js';

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
        setMessages((prev) => {
          // Prevent duplicates if optimistic UI already added it
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
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
    setText(''); // Clear instantly

    const { data, error } = await supabase.from('global_chat_messages').insert({
      user_id: profile.id,
      message: tempText,
      username: profile.username // Fallback, DB trigger overrides
    }).select().single();

    if (error) {
      setErr(error.message);
      setText(tempText); // Restore text on failure
    } else if (data) {
      // Optimistic UI: instantly show own message
      setMessages(prev => [...prev, data]);
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)', paddingBottom: 16 }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => nav('/')} style={{ background: 'var(--surface)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginRight: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Global Chat</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--dim)' }}>Connect with the YUÉLÍN community.</p>
        </div>
      </div>

      {/* Messages (Flat UI) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
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
            return (
              <div key={m.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                {!isConsecutive && (
                  <span style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4, marginLeft: 4, marginRight: 4 }}>
                    {m.username} · {when(m.created_at).split(',')[1]?.trim() || when(m.created_at)}
                  </span>
                )}
                <div style={{ 
                  background: isMine ? '#d4af37' : '#e2e8f0', 
                  color: isMine ? '#000' : '#1a202c',
                  padding: '10px 14px', 
                  borderRadius: 8, // Flat UI: simple rounded corners
                  maxWidth: '85%',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  fontSize: 15,
                  lineHeight: 1.4
                }}>
                  {m.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input (Neumorphic UI) */}
      <div style={{ padding: '0 16px' }}>
        {err && <p style={{ color: 'red', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>{err}</p>}
        <form onSubmit={submit} style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          
          <div style={{ 
            flex: 1, 
            background: 'var(--bg)', 
            boxShadow: 'inset 4px 4px 10px #c8c8c8, inset -4px -4px 10px #ffffff',
            borderRadius: 24,
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <textarea
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              style={{ width: '100%', background: 'none', border: 0, color: 'inherit', font: 'inherit', outline: 'none', resize: 'none', padding: '8px 0', maxHeight: 100 }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <span style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 4 }}>{charCount}/5000</span>
             <button type="submit" disabled={sending || !text.trim() || charCount > 5000} style={{ 
               background: 'var(--bg)', 
               border: 'none', 
               width: 48, height: 48, 
               borderRadius: '50%', 
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               boxShadow: '4px 4px 10px #c8c8c8, -4px -4px 10px #ffffff',
               cursor: sending || !text.trim() || charCount > 5000 ? 'not-allowed' : 'pointer',
               color: sending || !text.trim() || charCount > 5000 ? 'var(--dim)' : '#d4af37'
             }}>
               <Send size={20} style={{ marginLeft: -2, marginTop: 2 }} />
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}
