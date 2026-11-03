import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { ArrowRight, CalendarCheck, Coins, Crown, Flame, Gift, ShieldCheck, Sparkles, Target, Ticket, Users, Zap } from 'lucide-react';
import { useAuth } from '../auth.jsx';
import { peso, pts } from '../format.js';
import { BRAND, CAMPAIGNS } from '../brand.js';
import { catIcon, groupRewards, nextGoal } from '../lib/rewardsCat.js';
import { PageSkeleton } from '../components/Ui.jsx';
import HomeExtras from '../components/HomeExtras.jsx';
import BannerCarousel from '../components/BannerCarousel.jsx';

const join = [['1', 'Create your account', 'Sign up free with your email and a few details.'], ['2', 'Redeem a code', 'Every YUÉLÍN pack can carry a code worth points.'], ['3', 'Exchange a reward', 'Pick something from the collection.']];
const why = [
  [Zap, 'Instant points', 'Redeem a code and your balance updates right away.'],
  [Coins, '100 points = ₱1', 'A simple, fixed value on every point you earn.'],
  [ShieldCheck, 'Single-use codes', 'Each code redeems once, so your points stay safe.'],
  [Gift, 'Free to join', 'Creating an account costs nothing.'],
];

export default function Home() {
  const { session, profile } = useAuth();
  const [vipOn, setVipOn] = useState(false);
  const [rewards, setRewards] = useState(null);
  const uid = session && session.user ? session.user.id : null;
  useEffect(() => {
    let dead = false;
    if (!uid) { setVipOn(false); return undefined; }
    supabase.from('vip_memberships').select('status, ends_at').eq('user_id', uid).maybeSingle()
      .then(({ data }) => { if (!dead) setVipOn(!!data && data.status === 'active' && new Date(data.ends_at).getTime() > Date.now()); })
      .catch(() => {});
    return () => { dead = true; };
  }, [uid]);
  useEffect(() => {
    let dead = false;
    if (!uid) { setRewards([]); return undefined; }
    supabase.from('rewards').select('*').eq('is_active', true).order('cost_points')
      .then(({ data }) => { if (!dead) setRewards(data || []); })
      .catch(() => { if (!dead) setRewards([]); });
    return () => { dead = true; };
  }, [uid]);

  if (session && !profile) return <PageSkeleton variant="home" />;
  const bal = Number(profile?.points || 0);
  const goal = rewards ? nextGoal(rewards, bal) : null;
  const cats = rewards ? groupRewards(rewards) : [];
  const low = rewards ? rewards.filter((r) => r.stock !== null && r.stock !== undefined && r.stock > 0 && r.stock <= 5) : [];

  return (
    <div className="stack stag" style={{ gap: 28 }}>
      {session ? (
        <section className="card wallet stack" style={{ '--i': 0 }}>
          <div className="row between"><p className="eyebrow">WELCOME BACK</p><span className="badge">{vipOn ? <><Crown size={12} aria-hidden="true" /> VIP Member</> : 'Member'}</span></div>
          <div><p className="big gold-text">{pts(profile?.points)}</p><p className="dim">points, worth {peso(profile?.points)}</p></div>
          {rewards === null && <span className="sk" style={{ height: 40, borderRadius: 12 }} aria-hidden="true" />}
          {goal && (<>
            <div className="bar"><i style={{ width: Math.max(4, Math.min(100, (bal / goal.cost_points) * 100)) + '%' }} /></div>
            <p className="small"><Target size={13} style={{ verticalAlign: '-2px' }} /> <b>{pts(goal.cost_points - bal)}</b> points to go for <b>{goal.name}</b></p>
          </>)}
          {rewards && !goal && rewards.length > 0 && <p className="small"><Sparkles size={13} style={{ verticalAlign: '-2px' }} /> You can afford everything in the collection. Treat yourself!</p>}
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <Link to="/redeem" className="btn gold sm"><Ticket size={14} />Redeem a code</Link>
            <Link to="/checkin" className="btn sm"><CalendarCheck size={14} />Daily check-in</Link>
            <Link to="/exchange" className="btn sm">Rewards<ArrowRight size={14} /></Link>
          </div>
        </section>
      ) : (
        <section className="card banner" style={{ '--i': 0 }}>
          <p className="eyebrow">WELCOME TO {BRAND.name}</p>
          <h1><span className="gold-text">{BRAND.tagline}</span></h1>
          <p className="dim" style={{ maxWidth: 460, margin: '0 auto' }}>Every YUÉLÍN product can carry a code. Redeem it for points, then exchange them for rewards from a curated collection.</p>
          <div className="row" style={{ justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn gold pulse">Join {BRAND.name} — it's free <ArrowRight size={16} /></Link>
            <Link to="/login" className="btn ghost">Sign in</Link>
          </div>
          <p className="dim small" style={{ marginTop: 14 }}>100 points = ₱1 · Instant points · No fees to join</p>
        </section>
      )}

      <BannerCarousel />

      {low.length > 0 && (
        <section className="card stack" style={{ gap: 8 }}>
          <span className="tagline hot" style={{ alignSelf: 'flex-start' }}><Flame size={12} />Running low</span>
          {low.slice(0, 3).map((r) => (<div key={r.id} className="row between"><h3>{r.name}</h3><span className="dim small">{r.stock} left · {pts(r.cost_points)} pts</span></div>))}
          <Link to="/exchange" className="btn gold sm" style={{ alignSelf: 'flex-start' }}>Grab yours<ArrowRight size={14} /></Link>
        </section>
      )}

            <div className="card stack" style={{ marginBottom: 16, border: '1px solid rgba(212, 175, 55, 0.3)' }}>
        <div className="row between">
          <h3 style={{ margin: 0, fontSize: 16 }}>✨ Discover the World of YUÉLÍN ✨</h3>
          <span className="tagline" style={{ background: 'rgba(212, 175, 55, 0.1)', color: '#d4af37', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>event</span>
        </div>
        <p className="dim small" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, marginTop: 8 }}>
          An indulgent little delight, crafted to make every bite feel special.{"\n\n"}
          Introducing the YUÉLÍN Flavor Collection — six distinctive creations, each offering its own delightful character, flavor, and experience.{"\n\n"}
          🍓 YUÉLÍN Fraise Dorée{"\n"}
          A delicate strawberry-extract flavor with a sweet, fruity character.{"\n\n"}
          🌰 YUÉLÍN Amande Dorée{"\n"}
          A delightful almond-extract flavor for a distinctive nutty aroma.{"\n\n"}
          🍵 YUÉLÍN Jade Élixir{"\n"}
          A matcha-coated creation with an elegant, signature green tea taste.{"\n\n"}
          🌹 YUÉLÍN Rosé Élixir{"\n"}
          A strawberry-coated delight with a beautiful fruity finish.{"\n\n"}
          🍫 YUÉLÍN Premium Noir Élixir{"\n"}
          Chocolate-coated indulgence for those who love rich chocolate flavor.{"\n\n"}
          🤍 YUÉLÍN Blanc Élixir{"\n"}
          White chocolate-coated goodness with a smooth, creamy sweetness.{"\n\n"}
          SIX SIGNATURE FLAVORS. ONE YUÉLÍN EXPERIENCE.{"\n\n"}
          Whether you prefer fruity, nutty, matcha, or chocolate, there's a YUÉLÍN creation waiting for you.{"\n\n"}
          Treat yourself. Share the delight. Discover your favorite.{"\n\n"}
          Make every bite a little more extraordinary.{"\n\n"}
          💌 Message us to inquire and place your order!{"\n\n"}
          #YUÉLÍN #YuelinCollection #DiscoverYuelin #SweetMoments #FlavorCollection
        </p>
      </div>

      {session && rewards && <HomeExtras rewards={rewards} bal={bal} />}

      {!vipOn && (
        <section className="card stack">
          <div className="row"><span className="ico"><Crown size={22} /></span><div><h2>Earn twice as fast with VIP</h2><p className="dim">₱99/month</p></div></div>
          <div className="cmp">
            <div className="h" /><div className="h">Member</div><div className="h v">VIP</div>
            <div>Points on eligible packages</div><div>1×</div><div className="v">2×</div>
            <div>Free snack each month</div><div>—</div><div className="v">Yes</div>
            <div>Priority support</div><div>—</div><div className="v">Yes</div>
          </div>
          <p className="dim small">Plus no YUÉLÍN fees and an NFC card. Some perks can have limited availability.</p>
          <Link to="/vip-membership-deal" className="btn gold block">Become VIP<ArrowRight size={16} /></Link>
        </section>
      )}

      {!session && (
        <section className="card cta-band stack">
          <h2>Your first code is waiting</h2>
          <p className="dim">Join free today and start turning every YUÉLÍN purchase into rewards.</p>
          <Link to="/register" className="btn gold block pulse">Create my account<ArrowRight size={16} /></Link>
        </section>
      )}
    </div>
  );
}
