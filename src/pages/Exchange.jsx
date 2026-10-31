import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flame, Gem, Gift, Heart, LayoutGrid, Search, Sparkles, Target } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { peso, pts } from '../format.js';
import { Empty, Msg, PageTitle, Spinner } from '../components/Ui.jsx';
import ConfirmRedeem from '../components/ConfirmRedeem.jsx';
import { catIcon, catName, groupRewards, nextGoal, soldOut } from '../lib/rewardsCat.js';
import { call, isFeatured, isNew } from '../lib/yl.js';

const RANGES = [['Under 500', 0, 500], ['500 – 2,000', 500, 2000], ['2,000 – 10,000', 2000, 10000], ['10,000+', 10000, '']];

export default function Exchange() {
  const { profile, refresh } = useAuth();
  const [sp, setSp] = useSearchParams();
  const [rewards, setRewards] = useState(null);
  const [saved, setSaved] = useState(null); // Set of reward ids, or null when wishlist isn't available
  const [pick, setPick] = useState(null);
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');
  const [f, setF] = useState({ q: '', min: '', max: '', sort: 'low', aff: 'all', wish: false });

  const load = useCallback(async () => {
    const a = await supabase.from('rewards').select('*').eq('is_active', true).order('cost_points');
    setRewards(a.data || []);
    const w = await call('wishlist_ids');
    setSaved(w.error ? null : new Set((w.data || []).map(String)));
  }, []);
  useEffect(() => { load(); }, [load]);

  const bal = Number(profile?.points || 0);
  const sel = sp.get('c') || 'All';
  const filtered = useMemo(() => {
    if (!rewards) return [];
    const q = f.q.trim().toLowerCase();
    const min = f.min === '' ? null : Number(f.min), max = f.max === '' ? null : Number(f.max);
    return rewards.filter((r) => {
      if (q && !(r.name + ' ' + (r.description || '') + ' ' + catName(r)).toLowerCase().includes(q)) return false;
      if (min !== null && r.cost_points < min) return false;
      if (max !== null && r.cost_points > max) return false;
      if (f.aff === 'yes' && r.cost_points > bal) return false;
      if (f.aff === 'no' && r.cost_points <= bal) return false;
      if (f.wish && !(saved && saved.has(String(r.id)))) return false;
      return true;
    }).sort((a, b) => (f.sort === 'high' ? b.cost_points - a.cost_points : a.cost_points - b.cost_points));
  }, [rewards, f, bal, saved]);
  const groups = useMemo(() => groupRewards(filtered), [filtered]);
  if (!rewards) return <Spinner />;

  const all = groupRewards(rewards);
  const active = all.some((g) => g.name === sel) ? sel : 'All';
  const shown = active === 'All' ? groups : groups.filter((g) => g.name === active);
  const flat = f.sort === 'high' ? groups.map((g) => ({ ...g, items: [...g.items].sort((a, b) => b.cost_points - a.cost_points) })) : groups;
  const list = active === 'All' ? flat : flat.filter((g) => g.name === active);
  const goal = nextGoal(rewards, bal);
  const setCat = (c) => { const n = new URLSearchParams(sp); if (c === 'All') n.delete('c'); else n.set('c', c); setSp(n, { replace: true }); };
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const dirty = f.q || f.min !== '' || f.max !== '' || f.aff !== 'all' || f.wish;
  const toggle = async (r) => {
    const r2 = await call('toggle_wishlist', { p_reward: r.id });
    if (r2.error) return setErr('Could not update your wishlist.');
    setSaved((s) => { const n = new Set(s || []); if (r2.data && r2.data.saved) n.add(String(r.id)); else n.delete(String(r.id)); return n; });
  };

  return (
    <div className="stack">
      <PageTitle icon={Gift} eyebrow="COLLECTION" title="Reward exchange" sub={'Your balance: ' + pts(bal) + ' points (' + peso(bal) + ')'} />
      <Msg>{err}</Msg><Msg kind="good">{ok}</Msg>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <Link to="/redemptions" className="btn sm">My exchanges</Link>
        {saved && <Link to="/wishlist" className="btn sm"><Heart size={14} />Wishlist ({saved.size})</Link>}
      </div>

      {goal && (
        <div className="card stack" style={{ gap: 8 }}>
          <div className="row"><span className="ico"><Target size={20} /></span>
            <div style={{ flex: 1 }}><h3>Next up: {goal.name}</h3><p className="dim small">Only <b>{pts(goal.cost_points - bal)}</b> more points ({peso(goal.cost_points - bal)}) to unlock it.</p></div></div>
          <div className="bar"><i style={{ width: Math.max(4, Math.min(100, (bal / goal.cost_points) * 100)) + '%' }} /></div>
        </div>
      )}

      {rewards.length > 0 && (<>
        <div className="input"><Search size={18} /><input value={f.q} onChange={(e) => set('q', e.target.value)} placeholder="Search rewards" aria-label="Search rewards" /></div>
        <div className="cats" role="tablist" aria-label="Reward categories">
          <button role="tab" aria-selected={active === 'All'} className={'cat' + (active === 'All' ? ' on' : '')} onClick={() => setCat('All')}><LayoutGrid size={16} />All <small>{rewards.length}</small></button>
          {all.map((g) => { const I = catIcon(g.name); return (
            <button key={g.name} role="tab" aria-selected={active === g.name} className={'cat' + (active === g.name ? ' on' : '')} onClick={() => setCat(g.name)}><I size={16} />{g.name} <small>{g.items.length}</small></button>
          ); })}
        </div>
        <details className="card flt" open={!!dirty}>
          <summary>Filters &amp; sorting{dirty ? ' • on' : ''}</summary>
          <div className="stack" style={{ gap: 12, marginTop: 12 }}>
            <div className="row" style={{ gap: 10 }}>
              <label className="fld">Min points<input type="number" inputMode="numeric" min="0" value={f.min} onChange={(e) => set('min', e.target.value)} /></label>
              <label className="fld">Max points<input type="number" inputMode="numeric" min="0" value={f.max} onChange={(e) => set('max', e.target.value)} /></label>
            </div>
            <div className="cats" style={{ margin: 0, padding: 0 }}>
              {RANGES.map(([l, a, b]) => <button key={l} type="button" className={'cat' + (String(f.min) === String(a) && String(f.max) === String(b) ? ' on' : '')} onClick={() => setF((x) => ({ ...x, min: a, max: b }))}>{l}</button>)}
            </div>
            <div className="row" style={{ gap: 10 }}>
              <label className="fld">Sort<select value={f.sort} onChange={(e) => set('sort', e.target.value)}><option value="low">Lowest to highest</option><option value="high">Highest to lowest</option></select></label>
              <label className="fld">Affordability<select value={f.aff} onChange={(e) => set('aff', e.target.value)}><option value="all">All rewards</option><option value="yes">I can afford</option><option value="no">Not yet affordable</option></select></label>
            </div>
            {saved && <label className="row small"><input type="checkbox" checked={f.wish} onChange={(e) => set('wish', e.target.checked)} /> Saved to my wishlist only</label>}
            {dirty && <button type="button" className="btn ghost sm" style={{ alignSelf: 'flex-start' }} onClick={() => setF({ q: '', min: '', max: '', sort: f.sort, aff: 'all', wish: false })}>Clear filters</button>}
          </div>
        </details>
      </>)}

      {!rewards.length && <Empty icon={Gem} title="The collection is being curated" text="New rewards will appear here soon." />}
      {rewards.length > 0 && !shown.length && <Empty icon={Search} title="No rewards match" text="Try a different search or clear the filters." />}

      {list.map((g) => { const I = catIcon(g.name); return (
        <section key={g.name} className="stack" style={{ gap: 12 }}>
          {(active === 'All' || list.length > 1) && (
            <div className="sec-h"><h2 className="row" style={{ gap: 8 }}><I size={20} className="gold-text" />{g.name}</h2><span className="dim small">{g.items.length} reward{g.items.length === 1 ? '' : 's'}</span></div>
          )}
          <div className="grid2 stag">
            {g.items.map((r, i) => <RewardCard key={r.id} r={r} i={i} bal={bal} saved={saved} onSave={toggle} onPick={() => { setErr(''); setOk(''); setPick(r); }} />)}
          </div>
        </section>
      ); })}

      {pick && <ConfirmRedeem reward={pick} balance={bal} onClose={() => setPick(null)} onDone={() => { setOk('Exchange placed. We will process it shortly.'); refresh(); load(); }} />}
    </div>
  );
}

export function RewardCard({ r, i = 0, bal, saved, onSave, onPick }) {
  const I = catIcon(catName(r));
  const out = soldOut(r);
  const can = !out && bal >= r.cost_points;
  const low = !out && r.stock !== null && r.stock !== undefined && r.stock <= 5;
  const need = r.cost_points - bal;
  const isSaved = saved && saved.has(String(r.id));
  return (
    <div className="card lift stack" style={{ gap: 10, '--i': i }}>
      {r.image_url ? <img className="rimg" src={r.image_url} alt={r.name} loading="lazy" /> : <div className="rimg ph"><I size={30} /></div>}
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}><h3>{r.name}</h3><p className="gold-text" style={{ fontWeight: 800 }}>{pts(r.cost_points)} pts <span className="dim small">({peso(r.cost_points)})</span></p></div>
        {saved && <button type="button" className={'icon-btn heart' + (isSaved ? ' on' : '')} aria-pressed={!!isSaved} aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => onSave(r)}><Heart size={18} fill={isSaved ? 'currentColor' : 'none'} /></button>}
      </div>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
        <span className="tagline gold">{catName(r)}</span>
        {isFeatured(r) && <span className="tagline gold"><Sparkles size={11} />Featured</span>}
        {isNew(r) && <span className="tagline ok">New</span>}
      </div>
      {r.description && <p className="dim">{r.description}</p>}
      <div className="bar" aria-label="Progress toward this reward"><i style={{ width: Math.min(100, (bal / r.cost_points) * 100) + '%' }} /></div>
      {!out && !can && <p className="small dim">You need <b>{pts(need)}</b> more points to redeem this reward.</p>}
      <div className="row between">
        {out ? <span className="tagline hot">Out of stock</span> : low ? <span className="tagline hot"><Flame size={12} />Only {r.stock} left</span> : <span className="tagline ok">{r.stock !== null && r.stock !== undefined ? r.stock + ' left' : 'Available'}</span>}
        <button className={'btn gold sm' + (can ? ' pulse' : '')} disabled={!can} onClick={onPick}>{out ? 'Unavailable' : can ? 'Redeem' : 'Need ' + pts(need) + ' more'}</button>
      </div>
    </div>
  );
}
