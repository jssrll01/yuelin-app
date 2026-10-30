import { Link } from 'react-router-dom';
import { ArrowRight, Coins, Crown, Ticket, Users } from 'lucide-react';
import { useAuth } from '../../auth.jsx';
import { pts } from '../../format.js';
import useAsync from '../../lib/useAsync.js';
import usePage from '../../lib/usePage.js';
import { Async, DealFooter, SectionHead } from '../../components/deal/Parts.jsx';

const VIP = ['2× loyalty points', 'One free snack each month', 'No YUÉLÍN transaction fees', 'Priority customer support', 'A personalised NFC card, once'];
const FLOW = ['Discover treats', 'Purchase', 'Scan the permanent QR code', 'Enter the unique package code', 'Receive validated points', 'Redeem rewards', 'Refer friends'];

export default function HomeDeal() {
  usePage('Home');
  const { session, profile } = useAuth();
  return (
    <div className="stack" style={{ gap: 32 }}>
      <section className="card banner" aria-labelledby="hd-h1">
        <p className="eyebrow">YUÉLÍN</p>
        <h1 id="hd-h1" className="serif"><span className="gold-text">Sweet Moments. Last Forever.</span></h1>
        <p className="dim" style={{ maxWidth: 480, margin: '0 auto' }}>Discover delightful treats, collect loyalty points, invite friends, and make every sweet moment count.</p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
          <Link to="/vip-membership-deal" className="btn gold">Join VIP</Link>
          <Link to="/how-it-works-deal" className="btn ghost">Discover Rewards</Link>
        </div>
      </section>

      <section className="card wallet stack" aria-labelledby="hd-loy">
        <div className="row"><span className="ico"><Coins size={22} aria-hidden="true" /></span>
          <div><h2 id="hd-loy" className="serif">Loyalty points</h2><p className="dim">Earn points by redeeming valid package codes.</p></div></div>
        {session
          ? <div><p className="eyebrow">YOUR BALANCE</p><p className="big gold-text">{profile ? pts(profile.points) : '…'}</p></div>
          : <p className="dim">Sign in to see your points balance.</p>}
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {session ? <Link to="/redeem" className="btn gold sm"><Ticket size={16} />Claim points</Link> : <Link to="/login" className="btn gold sm">Sign in</Link>}
          <Link to="/how-it-works-deal" className="btn sm">How it works</Link>
        </div>
      </section>

      <section className="grid2">
        <div className="card stack" aria-labelledby="hd-vip">
          <div className="row"><span className="ico"><Crown size={22} aria-hidden="true" /></span><div><h2 id="hd-vip" className="serif">VIP Membership</h2><p className="gold-text" style={{ fontWeight: 800 }}>₱99/month</p></div></div>
          <ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.7 }}>{VIP.map((b) => <li key={b}>{b}</li>)}</ul>
          <p className="dim small">Benefits apply to verified, active members.</p>
          <Link to="/vip-membership-deal" className="btn sm" style={{ alignSelf: 'flex-start' }}>See membership<ArrowRight size={14} /></Link>
        </div>
        <div className="card stack" aria-labelledby="hd-ref">
          <div className="row"><span className="ico"><Users size={22} aria-hidden="true" /></span><div><h2 id="hd-ref" className="serif">Refer a Friend</h2><p className="dim">Share your username.</p></div></div>
          <p className="dim">When a friend you referred redeems an eligible package code, you earn referral points too. Their points are never reduced.</p>
          <Link to="/refer-a-friend-deal" className="btn sm" style={{ alignSelf: 'flex-start' }}>Learn more<ArrowRight size={14} /></Link>
        </div>
      </section>

      <section className="card stack" aria-labelledby="hd-flow">
        <h2 id="hd-flow" className="serif">How it works</h2>
        {FLOW.map((t, i) => <div key={t} className="row inset"><span className="num">{i + 1}</span><h3>{t}</h3></div>)}
        <Link to="/how-it-works-deal" className="btn gold block">See the full guide</Link>
      </section>

      <DealFooter />
    </div>
  );
}
