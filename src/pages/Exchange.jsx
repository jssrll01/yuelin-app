import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flame, Gem, Gift, LayoutGrid, PackageOpen, Target } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { peso, pts, uid, when } from '../format.js';
import { Empty, Msg, PageTitle, Spinner } from '../components/Ui.jsx';
import { catIcon, groupRewards, nextGoal, soldOut } from '../lib/rewardsCat.js';

export default function Exchange() {
  const { profile, refresh } = useAuth();
  const [sp, setSp] = useSearchParams();
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

  const groups = useMemo(() => groupRewards(rewards || []), [rewards]);
  if (!rewards) return <Spinner />;
  const bal = Number(profile?.points || 0);
  const sel = sp.get('c') || 'All';
  const active = groups.some((g) => g.name === sel) ? sel : 'All';
  const shown = active === 'All' ? groups : groups.filter((g) => g.name === active);
  const goal = nextGoal(rewards, bal);
  const setCat = (c) => { const n = new URLSearchParams(sp); if (c === 'All') n.delete('c'); else n.set('c', c); setSp(n, { replace: true }); };

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

      {goal && (
        <div className="card stack" style={{ gap: 8 }}>
          <div className="row"><span className="ico"><Target size={20} /></span>
            <div style={{ flex: 1 }}><h3>Next up: {goal.name}</h3><p className="dim small">Only <b>{pts(goal.cost_points - bal)}</b> more points ({peso(goal.cost_points - bal)}) to unlock it.</p></div></div>
          <div className="bar"><i style={{ width: Math.max(4, Math.min(100, (bal / goal.cost_points) * 100)) + '%' }} /></div>
        </div>
      )}

      {rewards.length > 0 && (
        <div className="cats" role="tablist" aria-label="Reward categories">
          <button role="tab" aria-selected={active === 'All'} className={'cat' + (active === 'All' ? ' on' : '')} onClick={() => setCat('All')}><LayoutGrid size={16} />All <small>{rewards.length}</small></button>
          {groups.map((g) => { const I = catIcon(g.name); return (
            <button key={g.name} role="tab" aria-selected={active === g.name} className={'cat' + (active === g.name ? ' on' : '')} onClick={() => setCat(g.name)}><I size={16} />{g.name} <small>{g.items.length}</small></button>
          ); })}
        </div>
      )}

      {!rewards.length && <Empty icon={Gem} title="The collection is being curated" text="New rewards will appear here soon." />}

      {shown.map((g) => { const I = catIcon(g.name); return (
        <section key={g.name} className="stack" style={{ gap: 12 }}>
          {(active === 'All' || shown.length > 1) && (
            <div className="sec-h"><h2 className="row" style={{ gap: 8 }}><I size={20} className="gold-text" />{g.name}</h2><span className="dim small">from {pts(g.min)} pts</span></div>
          )}
          <div className="grid2 stag">
            {g.items.map((r, i) => {
              const out = soldOut(r);
              const can = !out && bal >= r.cost_points;
              const low = !out && r.stock !== null && r.stock !== undefined && r.stock <= 5;
              return (
                <div key={r.id} className="card lift stack" style={{ gap: 10, '--i': i }}>
                  <div className="row"><span className="ico"><I size={22} /></span>
                    <div style={{ flex: 1 }}><h3>{r.name}</h3><p className="gold-text" style={{ fontWeight: 800 }}>{pts(r.cost_points)} pts <span className="dim small">({peso(r.cost_points)})</span></p></div></div>
                  {r.description && <p className="dim">{r.description}</p>}
                  <div className="bar" aria-label="Progress toward this reward"><i style={{ width: Math.min(100, (bal / r.cost_points) * 100) + '%' }} /></div>
                  <div className="row between">
                    {out ? <span className="dim small">Out of stock</span> : low ? <span className="tagline hot"><Flame size={12} />Only {r.stock} left</span> : <span className="tagline ok">{r.stock !== null && r.stock !== undefined ? r.stock + ' left' : 'Available'}</span>}
                    <button className={'btn gold sm' + (can ? ' pulse' : '')} disabled={!can} onClick={() => open(r)}>{out ? 'Unavailable' : can ? 'Exchange' : 'Need ' + pts(r.cost_points - bal) + ' more'}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ); })}

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
          <div className="card stack route-in">
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
