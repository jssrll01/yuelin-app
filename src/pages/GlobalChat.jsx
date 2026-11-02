import { useEffect, useState, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { PageTitle, Spinner } from '../components/Ui.jsx';
import { when } from '../format.js';

export default function GlobalChat() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  const bottomRef = useRef(null);

  // Fetch initial messages for the current session
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

    // Subscribe to Realtime
    const channel = supabase
      .channel('global_chat_room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_chat_messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'global_chat_messages' }, () => {
        // If a cron job wipes the table, clear the UI
        loadMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = async (e) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;
    
    // Unicode safe character count
    const charCount = Array.from(text).length;
    if (charCount > 5000) return setErr('Message exceeds 5000 characters.');

    setSending(true);
    setErr('');

    const { error } = await supabase.from('global_chat_messages').insert({
      user_id: profile.id,
      message: text.trim(),
      username: 'temp' // DB trigger will overwrite this with the verified username
    });

    if (error) {
      setErr(error.message);
    } else {
      setText('');
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
    <div className="stack" style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <PageTitle icon={MessageSquare} eyebrow="COMMUNITY" title="Global Chat" sub="Connect with the YUÉLÍN community." />

      <div className="card stack" style={{ flex: 1, overflowY: 'auto', padding: 16, gap: 12, marginBottom: 16 }}>
        {loading ? (
          <Spinner />
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', opacity: 0.5, marginTop: 40 }}>
            <MessageSquare size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No messages yet today. Start the conversation!</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMine = m.user_id === profile?.id;
            const isConsecutive = i > 0 && messages[i - 1].user_id === m.user_id;
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                {!isConsecutive && (
                  <span className="dim small" style={{ marginBottom: 4, marginLeft: 4, marginRight: 4, fontWeight: 600 }}>
                    {m.username} · {when(m.created_at).split(',')[1]?.trim() || when(m.created_at)}
                  </span>
                )}
                <div style={{ 
                  background: isMine ? 'var(--gold)' : 'var(--bg)', 
                  color: isMine ? '#000' : 'inherit',
                  padding: '10px 14px', 
                  borderRadius: 16,
                  borderBottomRightRadius: isMine && !isConsecutive ? 4 : 16,
                  borderBottomLeftRadius: !isMine && !isConsecutive ? 4 : 16,
                  maxWidth: '85%',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {err && <p className="small" style={{ color: 'var(--red)', marginBottom: 8 }}>{err}</p>}

      <form onSubmit={submit} className="card row" style={{ padding: 8, alignItems: 'flex-end', gap: 8 }}>
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={{ flex: 1, background: 'none', border: 0, color: 'inherit', font: 'inherit', outline: 'none', resize: 'none', padding: '10px 8px', maxHeight: 120, minHeight: 44 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 4 }}>
          <span className="dim small" style={{ fontSize: 10, marginBottom: 4 }}>{charCount} / 5000</span>
          <button type="submit" className="btn gold" disabled={sending || !text.trim() || charCount > 5000} style={{ padding: '0 16px', height: 36, borderRadius: 18 }}>
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
