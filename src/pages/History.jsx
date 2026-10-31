import { useEffect, useState } from 'react';
import { History as HistoryIcon } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { peso, pts, when } from '../format.js';
import { Empty, PageTitle, Spinner } from '../components/Ui.jsx';

const label = { code: 'Code redeemed', exchange: 'Reward exchange', game_stake: 'Game stake', game_win: 'Game payout', vip_bonus: 'VIP bonus', referral: 'Referral reward', checkin: 'Daily check-in' };

export default function History() {
  const { profile } = useAuth();
  const [rows, setRows] = useState(null);
  useEffect(() => {
    supabase.from('points_ledger').select('*').order('created_at', { ascending: false }).limit(100).then(({ data }) => setRows(data || []));
  }, []);
  if (!rows) return <Spinner />;
  return (
    <div className="stack">
      <PageTitle icon={HistoryIcon} eyebrow="LEDGER" title="Points history" sub={'Balance ' + pts(profile?.points) + ' points (' + peso(profile?.points) + ')'} />
      {!rows.length && <Empty icon={HistoryIcon} title="Nothing here yet" text="Redeem a code or play a game and your activity will be listed." />}
      {rows.length > 0 && (
        <div className="card list">
          {rows.map((r) => (
            <div key={r.id} className="row between">
              <div><h3>{label[r.reason] || r.reason}</h3><p className="dim small">{when(r.created_at)}</p></div>
              <div style={{ textAlign: 'right' }}>
                <p className={r.delta >= 0 ? 'up' : 'down'} style={{ fontWeight: 800 }}>{r.delta >= 0 ? '+' : ''}{pts(r.delta)}</p>
                <p className="dim small">Balance {pts(r.balance_after)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
