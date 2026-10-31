import { useEffect, useState } from 'react';
import { History as HistoryIcon } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { peso, pts, when } from '../format.js';
import { Empty, PageTitle, Spinner } from '../components/Ui.jsx';

const label = { code: 'Code redeemed', exchange: 'Reward exchange', game_stake: 'Game stake', game_win: 'Game payout', vip_bonus: 'VIP bonus', referral: 'Referral reward', checkin: 'Daily check-in', mission: 'Mission reward', reversal: 'Points returned', refund: 'Points returned', adjustment: 'Adjustment', achievement: 'Achievement reward' };
const isRev = (r) => /revers|refund/i.test(r.reason || '');
const FILTERS = [
  ['all', 'All', () => true],
  ['earned', 'Earned', (r) => r.delta > 0 && !isRev(r)],
  ['spent', 'Spent', (r) => r.delta < 0],
  ['reversed', 'Reversed', isRev],
  ['referral', 'Referrals', (r) => r.reason === 'referral'],
  ['mission', 'Missions', (r) => /mission|achievement/.test(r.reason || '')],
  ['redemption', 'Redemptions', (r) => /exchange|redeem|revers|refund/.test(r.reason || '') && r.reason !== 'code'],
  ['other', 'Other', (r) => !/^(code|exchange|referral|checkin|mission|achievement|vip_bonus)$/.test(r.reason || '') && !isRev(r)],
];
const refOf = (r) => r.reference || r.reference_code || (r.id ? String(r.id).slice(0, 8).toUpperCase() : '');

export default function History() {
  const { profile } = useAuth();
  const [rows, setRows] = useState(null);
  const [f, setF] = useState('all');
  useEffect(() => {
    supabase.from('points_ledger').select('*').order('created_at', { ascending: false }).limit(200).then(({ data }) => setRows(data || []));
  }, []);
  if (!rows) return <Spinner />;
  const test = FILTERS.find((x) => x[0] === f)[2];
  const list = rows.filter(test);
  const sum = (fn) => rows.filter(fn).reduce((a, r) => a + Math.abs(r.delta), 0);
  return (
    <div className="stack">
      <PageTitle icon={HistoryIcon} eyebrow="LEDGER" title="Points history" sub={'Balance ' + pts(profile?.points) + ' points (' + peso(profile?.points) + ')'} />
      {rows.length > 0 && (
        <div className="ladder">
          <div><b className="up">{pts(sum((r) => r.delta > 0 && !isRev(r)))}</b><span className="dim small">earned</span></div>
          <div><b className="down">{pts(sum((r) => r.delta < 0))}</b><span className="dim small">spent</span></div>
          <div><b className="gold-text">{pts(sum(isRev))}</b><span className="dim small">returned</span></div>
        </div>
      )}
      <div className="cats" role="tablist" aria-label="Filter activity">
        {FILTERS.map(([k, l]) => <button key={k} role="tab" aria-selected={f === k} className={'cat' + (f === k ? ' on' : '')} onClick={() => setF(k)}>{l}</button>)}
      </div>
      {!rows.length && <Empty icon={HistoryIcon} title="Nothing here yet" text="Redeem a code or check in and your activity will be listed." />}
      {rows.length > 0 && !list.length && <Empty icon={HistoryIcon} title="No matching activity" text="Try another filter." />}
      {list.length > 0 && (
        <div className="card list">
          {list.map((r) => (
            <div key={r.id} className="row between">
              <div><h3>{label[r.reason] || r.reason}</h3>{r.note && <p className="dim small">{r.note}</p>}<p className="dim small">{when(r.created_at)} · Ref {refOf(r)}</p></div>
              <div style={{ textAlign: 'right' }}>
                <p className={r.delta >= 0 ? 'up' : 'down'} style={{ fontWeight: 800 }}>{r.delta >= 0 ? '+' : ''}{pts(r.delta)}</p>
                {r.balance_after !== null && r.balance_after !== undefined && <p className="dim small">Balance {pts(r.balance_after)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
      {rows.length >= 200 && <p className="dim small center">Showing your latest 200 transactions.</p>}
    </div>
  );
}
