import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { when } from '../format.js';
import { Empty, PageTitle, Spinner } from '../components/Ui.jsx';

export default function Notifications() {
  const { refresh } = useAuth();
  const [rows, setRows] = useState(null);
  const load = useCallback(async () => {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
    setRows(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);
  const read = async (n) => {
    if (n.is_read) return;
    await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
    await load(); refresh();
  };
  const readAll = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    await load(); refresh();
  };
  if (!rows) return <Spinner />;
  const unread = rows.filter((r) => !r.is_read).length;
  return (
    <div className="stack">
      <PageTitle icon={Bell} eyebrow="INBOX" title="Notifications" sub={unread ? unread + ' unread' : 'You are all caught up.'} />
      {unread > 0 && <button className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={readAll}><CheckCheck size={16} />Mark all as read</button>}
      {!rows.length && <Empty icon={Bell} title="No notifications yet" text="Updates about your account, codes and exchanges will appear here." />}
      <div className="stack" style={{ gap: 12 }}>
        {rows.map((n) => (
          <button key={n.id} className="card" style={{ textAlign: 'left', opacity: n.is_read ? 0.65 : 1 }} onClick={() => read(n)}>
            <div className="row between"><h3>{n.title}</h3>{!n.is_read && <span className="badge">New</span>}</div>
            {n.body && <p className="dim" style={{ marginTop: 6 }}>{n.body}</p>}
            <p className="dim small" style={{ marginTop: 8 }}>{when(n.created_at)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
