import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Coins, Crown, Dices, Gem, Gift, History, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { peso, pts } from '../format.js';

const steps = [
  [Ticket, 'Redeem a code', 'Enter a YUÉLÍN code to add points to your balance.'],
  [Gift, 'Exchange rewards', 'Spend your points on rewards from the collection.'],
  [Dices, 'Play with points', 'Try the games with your points. Outcomes are decided securely on the server.'],
  [History, 'Track everything', 'Every point earned or spent is recorded in your history.'],
];

export default function Home() {
  const { session, profile } = useAuth();
  const [rewards, setRewards] = useState([]);
  useEffect(() => {
    supabase.from('rewards').select('*').eq('is_active', true).order('cost_points').limit(3).then(({ data }) => setRewards(data || []));
  }, []);
  return (
    <div className="stack" style={{ gap: 28 }}>
      <section className="hero">
        <div className="crest"><Crown size={30} /></div>
        <p className="eyebrow">REWARDS ATELIER</p>
        <h1><span className="gold-text">YUÉLÍN</span></h1>
        <p className="dim" style={{ maxWidth: 460, margin: '0 auto' }}>A refined place to redeem codes, exchange rewards and play with your points.</p>
        {!session && (
          <div className="row" style={{ justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn gold">Create account <ArrowRight size={16} /></Link>
            <Link to="/login" className="btn ghost">Sign in</Link>
          </div>
        )}
      </section>

      {session && (
        <section className="card wallet stack">
          <div className="row between"><p className="eyebrow">YOUR BALANCE</p><span className="badge">Member</span></div>
          <div><p className="big gold-text">{pts(profile?.points)}</p><p className="dim">points, worth {peso(profile?.points)}</p></div>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <Link to="/redeem" className="btn gold sm"><Ticket size={16} />Redeem code</Link>
            <Link to="/exchange" className="btn sm"><Gift size={16} />Exchange</Link>
            <Link to="/history" className="btn sm"><History size={16} />History</Link>
          </div>
        </section>
      )}

      <section className="card stack">
        <div className="row"><span className="ico"><Coins size={22} /></span><div><h2>The value of your points</h2><p className="dim">A simple, fixed rate.</p></div></div>
        <div className="grid3">
          {[[100, '1'], [1000, '10'], [10000, '100']].map(([p, v]) => (
            <div key={p} className="inset center"><p className="gold-text" style={{ fontSize: 22, fontWeight: 800 }}>{pts(p)}</p><p className="dim small">points = ₱{v}</p></div>
          ))}
        </div>
      </section>

      <section className="stack">
        <h2>How it works</h2>
        <div className="grid2">
          {steps.map(([Icon, t, d]) => (
            <div key={t} className="card row" style={{ alignItems: 'flex-start' }}>
              <span className="ico"><Icon size={22} /></span><div><h3>{t}</h3><p className="dim">{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {rewards.length > 0 && (
        <section className="stack">
          <div className="row between"><h2>From the collection</h2><Link to="/exchange" className="badge">View all</Link></div>
          <div className="grid3">
            {rewards.map((r) => (
              <div key={r.id} className="card stack" style={{ gap: 8 }}>
                <span className="ico"><Gem size={22} /></span>
                <h3>{r.name}</h3>
                <p className="gold-text" style={{ fontWeight: 800 }}>{pts(r.cost_points)} pts</p>
                <p className="dim small">{peso(r.cost_points)} value</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card row" style={{ alignItems: 'flex-start' }}>
        <span className="ico"><ShieldCheck size={22} /></span>
        <div><h3>Built with care</h3><p className="dim">Balances and outcomes are handled on the server, and every change is written to your points history.</p></div>
      </section>
      <p className="center dim small"><Sparkles size={12} style={{ verticalAlign: -2 }} /> YUÉLÍN</p>
    </div>
  );
}
