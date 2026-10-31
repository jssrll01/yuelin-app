import { useCallback, useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { pts } from '../format.js';
import { Empty, Msg, PageTitle, Spinner } from '../components/Ui.jsx';
import ConfirmRedeem from '../components/ConfirmRedeem.jsx';
import { RewardCard } from './Exchange.jsx';
import { call } from '../lib/yl.js';

export default function Wishlist() {
  const { profile, refresh } = useAuth();
  const [rows, setRows] = useState(null);
  const [off, setOff] = useState(false);
  const [pick, setPick] = useState(null);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    const w = await call('wishlist_ids');
    if (w.error) { setOff(true); setRows([]); return; }
    const ids = (w.data || []).map(String);
    if (!ids.length) { setRows([]); return; }
    const { data } = await supabase.from('rewards').select('*').in('id', ids); // live price and stock
    setRows(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);
  if (!rows) return <Spinner />;
  const bal = Number(profile?.points || 0);
  const saved = new Set(rows.map((r) => String(r.id)));
  const remove = async (r) => { const x = await call('toggle_wishlist', { p_reward: r.id }); if (x.error) return setErr('Could not update your wishlist.'); setRows((l) => l.filter((y) => y.id !== r.id)); };
  const back = rows.filter((r) => r.is_active !== false && !(r.stock !== null && r.stock !== undefined && r.stock <= 0));
  return (
    <div className="stack">
      <PageTitle icon={Heart} eyebrow="SAVED" title="My wishlist" sub={'Balance ' + pts(bal) + ' points'} />
      <Msg>{err}</Msg>
      {off && <Empty icon={Heart} title="Wishlist is not available yet" text="Check back soon." />}
      {!off && !rows.length && <Empty icon={Heart} title="Nothing saved yet" text="Tap the heart on any reward to save it here." />}
      {rows.length > 0 && <p className="small dim">{back.length} of {rows.length} saved reward{rows.length === 1 ? ' is' : 's are'} available now.</p>}
      <div className="grid2 stag">{rows.map((r, i) => <RewardCard key={r.id} r={r} i={i} bal={bal} saved={saved} onSave={remove} onPick={() => setPick(r)} />)}</div>
      {pick && <ConfirmRedeem reward={pick} balance={bal} onClose={() => setPick(null)} onDone={() => { refresh(); load(); }} />}
    </div>
  );
}
