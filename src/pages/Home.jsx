import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Coins, Gem, Gift, History, Ticket } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { peso, pts } from '../format.js';
import { BRAND, CAMPAIGNS } from '../brand.js';

const join = [['1', 'Create your account', 'Sign up with your email and a few details.'], ['2', 'Redeem a code', 'Add points to your balance in seconds.'], ['3', 'Exchange a reward', 'Pick something from the collection.']];

export default function Home() {
  const { session, profile } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [total, setTotal] = useState(null);
  
  useEffect(() => {
    supabase.from('rewards').select('*', { count: 'exact' }).eq('is_active', true).order('cost_points').limit(3)
      .then(({ data, count }) => { setRewards(data || []); setTotal(count); });
  }, []);

  return (
    <div className="stack" style={{ gap: 28 }}>
      {session ? (
        <section className="card wallet stack">
          <div className="row between"><p className="eyebrow">WELCOME BACK</p><span className="badge">Member</span></div>
          <div><p className="big gold-text">{pts(profile?.points)}</p><p className="dim">points, worth {peso(profile?.points)}</p></div>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <Link to="/redeem" className="btn gold sm"><Ticket size={16} />Redeem code</Link>
            <Link to="/exchange" className="btn sm"><Gift size={16} />Exchange</Link>
            <Link to="/history" className="btn sm"><History size={16} />History</Link>
          </div>
        </section>
      ) : (
        <section className="card banner">
          <p className="eyebrow">WELCOME TO {BRAND.name}</p>
          <h1><span className="gold-text">{BRAND.tagline}</span></h1>
          <p className="dim" style={{ maxWidth: 460, margin: '0 auto' }}>Redeem codes, collect points and exchange them for rewards from a curated collection.</p>
          <div className="row" style={{ justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn gold">Join {BRAND.name} <ArrowRight size={16} /></Link>
            <Link to="/login" className="btn ghost">Sign in</Link>
          </div>
        </section>
      )}

      <section className="grid3">
        <div className="card center"><p className="gold-text" style={{ fontSize: 26, fontWeight: 800 }}>100 pts = ₱1</p><p className="dim small">A fixed, transparent rate</p></div>
        <div className="card center"><p className="gold-text" style={{ fontSize: 26, fontWeight: 800 }}>{total === null ? '…' : total}</p><p className="dim small">Rewards in the collection</p></div>
        <div className="card center"><p className="gold-text" style={{ fontSize: 26, fontWeight: 800 }}>100%</p><p className="dim small">Of your points on record</p></div>
      </section>

      <section className="stack">
        <h2>What's on at {BRAND.name}</h2>
        <div className="grid2">
          {CAMPAIGNS.map((c) => (
            <div key={c.title} className="card stack" style={{ gap: 10 }}>
              <div className="row between"><span className="ico"><c.icon size={22} /></span><span className="badge">{c.tag}</span></div>
              <h3>{c.title}</h3><p className="dim">{c.text}</p>
              <Link to={c.to} className="btn sm" style={{ alignSelf: 'flex-start' }}>{c.cta}<ArrowRight size={14} /></Link>
            </div>
          ))}
        </div>
      </section>

      <section className="card stack">
        <div className="row"><span className="ico"><Coins size={22} /></span><div><h2>Start in three steps</h2><p className="dim">Simple from the first tap.</p></div></div>
        {join.map(([n, t, d]) => (
          <div key={n} className="row inset"><span className="num">{n}</span><div><h3>{t}</h3><p className="dim">{d}</p></div></div>
        ))}
        {!session && <Link to="/register" className="btn gold block">Create my account</Link>}
      </section>

      {rewards.length > 0 && (
        <section className="stack">
          <div className="row between"><h2>From the collection</h2><Link to="/exchange" className="badge">View all</Link></div>
          <div className="grid3">
            {rewards.map((r) => (
              <div key={r.id} className="card stack" style={{ gap: 8 }}>
                <span className="ico"><Gem size={22} /></span><h3>{r.name}</h3>
                <p className="gold-text" style={{ fontWeight: 800 }}>{pts(r.cost_points)} pts</p>
                <p className="dim small">{peso(r.cost_points)} value</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
