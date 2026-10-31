import { useCallback, useEffect, useState } from 'react';
import { Archive, Bell, CheckCheck, Settings } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { when } from '../format.js';
import { call } from '../lib/yl.js';
import { Empty, Msg, PageTitle, Spinner } from '../components/Ui.jsx';

const CATS = [['redemption', 'Redemptions'], ['points', 'Points'], ['referral', 'Referrals'], ['mission', 'Missions'], ['achievement', 'Achievements'], ['wishlist', 'Wishlist'], ['vip', 'VIP'], ['promo', 'Promotions'], ['account', 'Account']];
const catLabel = Object.fromEntries(CATS);

export default function Notifications() {
  const { refresh } = useAuth();
  const [rows, setRows] = useState(null);
  const [cat, setCat] = useState('all');
  const [prefs, setPrefs] = useState(null);
  const [showPrefs, setShowPrefs] = useState(false);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100);
    setRows((data || []).filter((n) => !n.archived_at && !n.is_archived));
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { call('get_notification_prefs').then((r) => { if (!r.error && r.data) setPrefs(r.data.prefs || {}); }); }, []);

  const read = async (n) => { if (n.is_read) return; await supabase.from('notifications').update({ is_read: true }).eq('id', n.id); await load(); refresh(); };
  const readAll = async () => { await supabase.from('notifications').update({ is_read: true }).eq('is_read', false); await load(); refresh(); };
  const remove = async (n) => {
    setErr('');
    const a = await call('archive_notification', { p_id: n.id });
    if (a.error) { const d = await supabase.from('notifications').delete().eq('id', n.id); if (d.error) return setErr('Could not remove this notification.'); }
    await load(); refresh();
  };
  const setPref = async (k, on) => {
    setPrefs((p) => ({ ...p, [k]: on }));
    const r = await call('set_notification_pref', { p_category: k, p_enabled: on });
    if (r.error) { setErr('Could not save your preference.'); setPrefs((p) => ({ ...p, [k]: !on })); }
  };
  if (!rows) return <Spinner />;
  const present = CATS.filter(([k]) => rows.some((n) => n.category === k));
  const list = cat === 'all' ? rows : rows.filter((n) => n.category === cat);
  const unread = rows.filter((r) => !r.is_read).length;
  return (
    <div className="stack">
      <PageTitle icon={Bell} eyebrow="INBOX" title="Notifications" sub={unread ? unread + ' unread' : 'You are all caught up.'} />
      <Msg>{err}</Msg>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        {unread > 0 && <button className="btn sm" onClick={readAll}><CheckCheck size={16} />Mark all as read</button>}
        {prefs && <button className="btn ghost sm" onClick={() => setShowPrefs((v) => !v)}><Settings size={16} />Preferences</button>}
      </div>
      {showPrefs && prefs && (
        <div className="card stack" style={{ gap: 10 }}>
          <h3>Notify me about</h3>
          {CATS.map(([k, l]) => <label key={k} className="row between small"><span>{l}</span><input type="checkbox" checked={prefs[k] !== false} onChange={(e) => setPref(k, e.target.checked)} /></label>)}
          <p className="dim small">Important account notices are always delivered.</p>
        </div>
      )}
      {present.length > 0 && (
        <div className="cats" role="tablist" aria-label="Notification categories">
          <button role="tab" aria-selected={cat === 'all'} className={'cat' + (cat === 'all' ? ' on' : '')} onClick={() => setCat('all')}>All</button>
          {present.map(([k, l]) => <button key={k} role="tab" aria-selected={cat === k} className={'cat' + (cat === k ? ' on' : '')} onClick={() => setCat(k)}>{l}</button>)}
        </div>
      )}
      {!list.length && <Empty icon={Bell} title="No notifications" text="Updates about your account, points, missions and exchanges will appear here." />}
      <div className="stack" style={{ gap: 12 }}>
        {list.map((n) => (
          <div key={n.id} className="card" style={{ opacity: n.is_read ? 0.7 : 1 }}>
            <button type="button" style={{ textAlign: 'left', width: '100%' }} onClick={() => read(n)}>
              <div className="row between"><h3>{n.title}</h3>{!n.is_read && <span className="badge">New</span>}</div>
              {n.body && <p className="dim" style={{ marginTop: 6 }}>{n.body}</p>}
            </button>
            <div className="row between" style={{ marginTop: 8 }}>
              <p className="dim small">{n.category && catLabel[n.category] ? catLabel[n.category] + ' · ' : ''}{when(n.created_at)}</p>
              <button type="button" className="icon-btn" aria-label="Remove notification" onClick={() => remove(n)}><Archive size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
