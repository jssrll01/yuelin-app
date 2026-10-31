import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Trophy } from 'lucide-react';
import { pts } from '../format.js';
import { call } from '../lib/yl.js';
import { Empty, PageSkeleton } from './Ui.jsx';

const PERIODS = [['week', 'Weekly'], ['month', 'Monthly'], ['all', 'All-time']];

/** Ranking comes from the server. "Earned" is points earned in the period; "Balance" is the current balance. */
export default function Leaderboard({ limit = 10, compact = false }) {
  const [period, setPeriod] = useState('week');
  const [st, setSt] = useState(null);
  useEffect(() => {
    let dead = false; setSt(null);
    call('get_leaderboard', { p_period: period, p_limit: limit }).then((r) => { if (!dead) setSt(r); });
    return () => { dead = true; };
  }, [period, limit]);
  const rows = (st && st.data && st.data.rows) || [];
  const me = st && st.data && st.data.me;
  if (st && st.missing) return compact ? null : <Empty icon={Trophy} title="Leaderboard is coming soon" text="Check back shortly." />;
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="cats" role="tablist" aria-label="Leaderboard period">
        {PERIODS.map(([k, l]) => <button key={k} role="tab" aria-selected={period === k} className={'cat' + (period === k ? ' on' : '')} onClick={() => setPeriod(k)}>{l}</button>)}
      </div>
      {!st && <PageSkeleton variant="list" n={compact ? 3 : 5} />}
      {st && !rows.length && <Empty icon={Trophy} title="No rankings yet" text="Earn points to appear on the leaderboard." />}
      {rows.length > 0 && (
        <div className="card list">
          {rows.map((r) => (
            <div key={r.rank + '-' + r.username} className={'row between lb' + (r.is_me ? ' me' : '')}>
              <div className="row" style={{ gap: 10 }}>
                <span className={'rk r' + r.rank}>{r.rank <= 3 ? <Crown size={13} /> : r.rank}</span>
                {r.avatar_url && <img className="av" src={r.avatar_url} alt="" loading="lazy" />}
                <div><h3>{r.username}{r.is_me ? ' (you)' : ''}</h3><p className="dim small">Balance {pts(r.points_balance)}</p></div>
              </div>
              <div style={{ textAlign: 'right' }}><b className="gold-text">{pts(r.points_earned)}</b><p className="dim small">earned</p></div>
            </div>
          ))}
        </div>
      )}
      {me && !rows.some((r) => r.is_me) && <p className="small dim">Your rank: <b>#{me.rank}</b> · {pts(me.points_earned)} earned</p>}
      {compact && <Link to="/leaderboard" className="btn sm" style={{ alignSelf: 'flex-start' }}>View all leaderboard</Link>}
    </div>
  );
}
