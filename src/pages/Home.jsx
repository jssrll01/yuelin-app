import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { ArrowRight, Coins, Crown } from 'lucide-react';
import { useAuth } from '../auth.jsx';
import { peso, pts } from '../format.js';
import { BRAND, CAMPAIGNS } from '../brand.js';

const join = [['1', 'Create your account', 'Sign up with your email and a few details.'], ['2', 'Redeem a code', 'Add points to your balance in seconds.'], ['3', 'Exchange a reward', 'Pick something from the collection.']];

export default function Home() {
  const { session, profile } = useAuth();
  const [vipOn, setVipOn] = useState(false);
  const uid = session && session.user ? session.user.id : null;
  useEffect(() => {
    let dead = false;
    if (!uid) { setVipOn(false); return undefined; }
    supabase.from('vip_memberships').select('status, ends_at').eq('user_id', uid).maybeSingle()
      .then(({ data }) => { if (!dead) setVipOn(!!data && data.status === 'active' && new Date(data.ends_at).getTime() > Date.now()); })
      .catch(() => {});
    return () => { dead = true; };
  }, [uid]);

  return (
    <div className="stack" style={{ gap: 28 }}>
      {session ? (
        <section className="card wallet stack">
          <div className="row between"><p className="eyebrow">WELCOME BACK</p><span className="badge">{vipOn ? <><Crown size={12} aria-hidden="true" /> VIP Member</> : 'Member'}</span></div>
          <div><p className="big gold-text">{pts(profile?.points)}</p><p className="dim">points, worth {peso(profile?.points)}</p></div>
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
