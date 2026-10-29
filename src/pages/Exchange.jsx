import { useCallback, useEffect, useState } from 'react';
import { Gem, Gift, PackageOpen } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { peso, pts, uid, when } from '../format.js';
import { Empty, Msg, PageTitle, Spinner } from '../components/Ui.jsx';

export default function Exchange() {
  const { profile, refresh } = useAuth();
  const [rewards, setRewards] = useState(null);
  const [mine, setMine] = useState([]);
  const [pick, setPick] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      supabase.from('rewards').select('*').eq('is_active', true).order('cost_points'),
      supabase.from('redemptions').select('*, rewards(name)').order('created_at', { ascending: false }).limit(20),
    ]);
    setRewards(a.data || []); setMine(b.data || []);
  }, []);
  useEffect(() => { load(); }, [load]);
  if (!rewards) return <Spinner />;
  const bal = Number(profile?.points || 0);

  const open = (r) => { setErr(''); setOk(''); setPick({ r, key: uid() }); };
  const confirm = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc('exchange_reward', { p_reward: pick.r.id, p_key: pick.key });
    setBusy(false);
    setPick(null);
    if (error) return setErr('Something went wrong. Please try again.');
    if (!data.ok) return setErr(data.error);
    setOk('Exchange placed. We will process it shortly.');
    refresh(); load();
  };

  return (
    <div className="stack">
      <PageTitle icon={Gift} eyebrow="COLLECTION" title="Reward exchange" sub={'Your balance: ' + pts(bal) + ' points (' + peso(bal) + ')'} />
      <Msg>{err}</Msg><Msg kind="good">{ok}</Msg>
      {!rewards.length && <Empty icon={Gem} title="The collection is being curated" text="New rewards will appear here soon." />}
      <div className="grid2">
        {rewards.map((r) => {
          const out = r.stock !== null && r.stock <= 0;
          const can = !out && bal >= r.cost_points;
          return (
            <div key={r.id} className="card stack" style={{ gap: 10 }}>
              <div className="row"><span className="ico"><Gem size={22} /></span>
                <div style={{ flex: 1 }}><h3>{r.name}</h3><p className="gold-text" style={{ fontWeight: 800 }}>{pts(r.cost_points)} pts <span className="dim small">({peso(r.cost_points)})</span></p></div></div>
              {r.description && <p className="dim">{r.description}</p>}
              <div className="bar" aria-label="Progress toward this reward"><i style={{ width: Math.min(100, (bal / r.cost_points) * 100) + '%' }} /></div>
              <div className="row between">
                <span className="dim small">{out ? 'Out of stock' : r.stock !== null ? r.stock + ' left' : 'Available'}</span>
                <button className="btn gold sm" disabled={!can} onClick={() => open(r)}>{out ? 'Unavailable' : can ? 'Exchange' : 'Need ' + pts(r.cost_points - bal) + ' more'}</button>
              </div>
            </div>
          );
        })}
      </div>

      <h2>My exchanges</h2>
      {!mine.length && <Empty icon={PackageOpen} title="No exchanges yet" text="Your exchanged rewards and their status will be listed here." />}
      {mine.length > 0 && (
        <div className="card list">
          {mine.map((m) => (
            <div key={m.id} className="row between">
              <div><h3>{m.rewards?.name || 'Reward'}</h3><p className="dim small">{when(m.created_at)}</p></div>
              <div style={{ textAlign: 'right' }}><span className="badge">{m.status}</span><p className="dim small">{pts(m.points_spent)} pts</p></div>
            </div>
          ))}
        </div>
      )}

      {pick && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="card stack">
            <h2>Confirm exchange</h2>
            <p className="dim">Exchange <b>{pts(pick.r.cost_points)} points</b> for <b>{pick.r.name}</b>? Points are deducted immediately.</p>
            <div className="row"><button className="btn ghost" style={{ flex: 1 }} onClick={() => setPick(null)}>Cancel</button>
              <button className="btn gold" style={{ flex: 1 }} disabled={busy} onClick={confirm}>{busy ? 'Working…' : 'Confirm'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
