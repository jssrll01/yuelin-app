import { useState } from 'react';
import { Coins, Dices, PackageOpen, RotateCw, Trophy } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { peso, pts, uid } from '../format.js';
import { Msg, PageTitle } from '../components/Ui.jsx';

// Odds below mirror the server function play_game. The server decides every outcome.
const GAMES = [
  { id: 'spin', name: 'Lucky Spin', icon: RotateCw, stakes: [100], text: 'One spin, five possible payouts.',
    odds: [['No payout', '35%'], ['50 pts', '25%'], ['100 pts', '20%'], ['200 pts', '14%'], ['500 pts', '6%']] },
  { id: 'box', name: 'Mystery Box', icon: PackageOpen, stakes: [500], text: 'Open the box and see what is inside.',
    odds: [['No payout', '30%'], ['250 pts', '30%'], ['500 pts', '20%'], ['1,000 pts', '15%'], ['2,500 pts', '5%']] },
  { id: 'flip', name: 'Coin Flip', icon: Coins, stakes: [100, 500, 1000], text: 'Call it. A win pays double your stake.',
    odds: [['Win (2x stake)', '45%'], ['No payout', '55%']] },
];

export default function Games() {
  const { profile, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const bal = Number(profile?.points || 0);

  const play = async (game, stake) => {
    if (busy) return;
    setBusy(true); setErr(''); setRes(null);
    const { data, error } = await supabase.rpc('play_game', { p_game: game.id, p_stake: stake, p_key: uid() });
    setBusy(false);
    if (error) return setErr('Something went wrong. Please try again.');
    if (!data.ok) return setErr(data.error);
    setRes({ game: game.name, stake, payout: data.payout });
    refresh();
  };

  return (
    <div className="stack">
      <PageTitle icon={Dices} eyebrow="THE SALON" title="Play with points" sub="100 points equal ₱1. Play thoughtfully." />
      <div className="card wallet"><p className="eyebrow">AVAILABLE</p><p className="big gold-text">{pts(bal)}</p><p className="dim">{peso(bal)}</p></div>
      <Msg>{err}</Msg>
      {res && (
        <div className="card center pop" aria-live="polite">
          <span className="ico" style={{ margin: '0 auto 10px' }}><Trophy size={22} /></span>
          <h2>{res.payout > 0 ? 'You received ' + pts(res.payout) + ' points' : 'No payout this time'}</h2>
          <p className="dim">{res.game}, stake {pts(res.stake)}. {res.payout > res.stake ? 'Net gain ' + pts(res.payout - res.stake) + '.' : res.payout === res.stake ? 'Your stake was returned.' : 'Net ' + pts(res.payout - res.stake) + '.'}</p>
        </div>
      )}
      <div className="stack">
        {GAMES.map((g) => (
          <div key={g.id} className="card stack">
            <div className="row"><span className="ico"><g.icon size={22} className={busy ? 'spin' : ''} /></span><div><h2>{g.name}</h2><p className="dim">{g.text}</p></div></div>
            <div className="inset">
              <p className="eyebrow" style={{ marginBottom: 8 }}>PAYOUTS</p>
              {g.odds.map(([a, b]) => <div key={a} className="row between small" style={{ padding: '3px 0' }}><span>{a}</span><span className="dim">{b}</span></div>)}
            </div>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              {g.stakes.map((s) => (
                <button key={s} className="btn gold" disabled={busy || bal < s} onClick={() => play(g, s)}>Play for {pts(s)} pts</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="card"><p className="dim small">Games involve risk: you can lose the points you stake. Every outcome is decided on the server and recorded in your history. Only stake what you are comfortable with.</p></div>
    </div>
  );
}
