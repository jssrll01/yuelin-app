import { Link } from 'react-router-dom';
import { ArrowRight, Coins } from 'lucide-react';
import { useAuth } from '../auth.jsx';
import { BRAND, CAMPAIGNS } from '../brand.js';

const join = [['1', 'Create your account', 'Sign up with your email and a few details.'], ['2', 'Redeem a code', 'Add points to your balance in seconds.'], ['3', 'Exchange a reward', 'Pick something from the collection.']];

export default function Home() {
  const { session } = useAuth();
  return (
    <div className="stack" style={{ gap: 28 }}>
      <section className="card banner">
        <p className="eyebrow">WELCOME TO {BRAND.name}</p>
        <h1><span className="gold-text">{BRAND.tagline}</span></h1>
        <p className="dim" style={{ maxWidth: 460, margin: '0 auto' }}>Redeem codes, collect points and exchange them for rewards from a curated collection.</p>
        {!session && (
          <div className="row" style={{ justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn gold">Join {BRAND.name} <ArrowRight size={16} /></Link>
            <Link to="/login" className="btn ghost">Sign in</Link>
          </div>
        )}
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
    </div>
  );
}
