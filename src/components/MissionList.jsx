import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Target } from 'lucide-react';
import { useAuth } from '../auth.jsx';
import { supabase } from '../supabase';
import { day, pts } from '../format.js';
import { q } from '../lib/yl.js';
import { Empty, PageSkeleton } from './Ui.jsx';

export const MISSION_CATS = [['daily', 'Daily'], ['weekly', 'Weekly'], ['special', 'Special'], ['seasonal', 'Seasonal'], ['promotional', 'Promo']];

/** Reads real missions + the member's progress. Completion and rewards are decided by the backend; this only displays them. */
export async function loadMissions(uidv) {
  const m = await q(supabase.from('missions').select('*').eq('is_active', true).order('reward_points', { ascending: true }));
  if (m.error) return { missing: m.missing, rows: [] };
  const p = uidv ? await q(supabase.from('user_mission_progress').select('*').eq('user_id', uidv)) : { data: [] };
  const now = Date.now();
  const rows = (m.data || []).map((x) => {
    const pr = (p.data || []).find((y) => y.mission_id === x.id);
    const target = Number(x.target_count || 1);
    const prog = pr ? Number(pr.current_count || 0) : 0;
    const done = !!(pr && pr.is_completed);
    const sd = x.starts_at || x.start_date; const starts = sd ? new Date(sd).getTime() : null;
    const ed = x.ends_at || x.end_date || x.expires_at; const ends = ed ? new Date(ed).getTime() : null;
    const state = done ? 'done' : (ends && ends < now) ? 'expired' : (starts && starts > now) ? 'soon' : 'open';
    return { ...x, target, prog, done, state, doneAt: pr && pr.completed_at, ends };
  }).filter((x) => x.state !== 'expired' || x.done);
  return { rows, missing: false };
}

export function MissionCard({ m }) {
  const pct = Math.min(100, Math.round((m.prog / m.target) * 100));
  return (
    <div className="card stack mis" style={{ gap: 10 }}>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        {(m.image_url || m.icon_url) ? <img className="rimg sm" src={m.image_url || m.icon_url} alt="" loading="lazy" /> : <span className="ico"><Target size={20} /></span>}
        <div style={{ flex: 1 }}><h3>{m.title}</h3>{m.description && <p className="dim small">{m.description}</p>}</div>
        <span className="tagline gold">+{pts(m.reward_points || 0)}</span>
      </div>
      <div className="bar"><i style={{ width: Math.max(m.prog ? 4 : 0, pct) + '%' }} /></div>
      <div className="row between small">
        <span className="dim">{Math.min(m.prog, m.target)} / {m.target}</span>
        {m.done ? <span className="tagline ok"><CheckCircle2 size={12} />Completed{m.doneAt ? ' · ' + day(m.doneAt) : ''}</span>
          : m.state === 'soon' ? <span className="tagline gold">Starts {day(m.starts_at || m.start_date)}</span>
          : m.ends ? <span className="dim"><Clock size={12} style={{ verticalAlign: '-2px' }} /> Ends {day(m.ends)}</span> : <span className="dim">In progress</span>}
      </div>
    </div>
  );
}

export default function MissionList({ limit, showTabs = true, initial = 'daily' }) {
  const { session } = useAuth();
  const [st, setSt] = useState(null);
  const [cat, setCat] = useState(initial);
  const uidv = session && session.user ? session.user.id : null;
  useEffect(() => { let dead = false; loadMissions(uidv).then((r) => { if (!dead) setSt(r); }); return () => { dead = true; }; }, [uidv]);
  if (!st) return <PageSkeleton variant="list" n={3} />;
  if (st.missing) return <Empty icon={Target} title="Missions are coming soon" text="Check back shortly." />;
  const rows = st.rows.filter((m) => !m.done || cat === 'done');
  const shown = (showTabs ? (cat === 'done' ? st.rows.filter((m) => m.done) : rows.filter((m) => m.category === cat)) : rows.filter((m) => !m.done)).slice(0, limit || 99);
  return (
    <div className="stack" style={{ gap: 12 }}>
      {showTabs && (
        <div className="cats" role="tablist" aria-label="Mission categories">
          {MISSION_CATS.map(([k, l]) => <button key={k} role="tab" aria-selected={cat === k} className={'cat' + (cat === k ? ' on' : '')} onClick={() => setCat(k)}>{l}</button>)}
          <button role="tab" aria-selected={cat === 'done'} className={'cat' + (cat === 'done' ? ' on' : '')} onClick={() => setCat('done')}>History</button>
        </div>
      )}
      {!shown.length && <Empty icon={Target} title={cat === 'done' ? 'No completed missions yet' : 'No missions right now'} text={cat === 'done' ? 'Complete a mission and it will be listed here.' : 'New missions appear here when they are active.'} />}
      {shown.map((m) => <MissionCard key={m.id} m={m} />)}
      {!showTabs && st.rows.length > shown.length && <Link to="/missions" className="btn sm" style={{ alignSelf: 'flex-start' }}>All missions</Link>}
    </div>
  );
}
