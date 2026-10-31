import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Coins, Crown, Gift, HelpCircle, ShieldCheck, Ticket, Users, Zap } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { peso, pts } from '../format.js';
import { Msg, PageTitle } from '../components/Ui.jsx';

const steps = [['1', 'Find your code', 'Look for a YUÉLÍN code on your pack or from a promo.'], ['2', 'Enter it below', 'Type it in. Capital letters are applied for you.'], ['3', 'Get points instantly', 'They land in your balance right away.']];
const faq = [
  ['Where do I find a code?', 'On YUÉLÍN products and in YUÉLÍN promos. Keep your pack until the code is redeemed.'],
  ['How much is a point worth?', '100 points = ₱1. Collect them and exchange them for rewards.'],
  ['Can I use a code twice?', 'No. Each code is single-use and redeems once per account.'],
  ['Why was my code refused?', 'It may be used, expired or mistyped. Too many wrong attempts pause redemption for a few minutes.'],
];

export default function RedeemCode() {
  const { profile, refresh } = useAuth();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [won, setWon] = useState(0);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setOk(''); setWon(0);
    if (!code.trim()) return setErr('Enter a code.');
    setBusy(true);
    const { data, error } = await supabase.rpc('redeem_code', { p_code: code });
    setBusy(false);
    if (error) return setErr('Something went wrong: ' + (error.code || '') + ' ' + (error.message || ''));
    if (!data.ok) return setErr(data.error);
    setWon(Number(data.points) || 0);
    setOk('Success. ' + pts(data.points) + ' points (' + peso(data.points) + ') were added to your balance.');
    setCode(''); refresh();
  };
  return (
    <div className="stack">
      <PageTitle icon={Ticket} eyebrow="CODES" title="Redeem a code" sub="Turn a YUÉLÍN code into points." />
      <div className="card wallet"><p className="eyebrow">CURRENT BALANCE</p><p className="big gold-text">{pts(profile?.points)}</p><p className="dim">{peso(profile?.points)}</p></div>

      <form onSubmit={submit} className="card stack">
        <Msg>{err}</Msg>
        {ok && <div className="msg good" role="status"><CheckCircle2 size={16} className="tick" style={{ verticalAlign: '-3px', marginRight: 6 }} />{ok}</div>}
        <div className="field"><label htmlFor="code">Your code</label>
          <div className="input"><Ticket size={18} />
            <input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ENTER CODE" autoCapitalize="characters" autoComplete="off" spellCheck="false" style={{ letterSpacing: '.15em', fontWeight: 700 }} />
          </div>
        </div>
        <button className="btn gold block" disabled={busy}>{busy ? 'Checking…' : 'Redeem'}</button>
        {won > 0 && <Link to="/exchange" className="btn block tick">Spend your points on a reward <ArrowRight size={16} /></Link>}
      </form>

      <div className="trust">
        <span><Zap size={14} />Instant points</span><span><ShieldCheck size={14} />Secure redemption</span><span><Gift size={14} />Free to join</span>
      </div>

      <section className="card stack">
        <h2>How it works</h2>
        {steps.map(([n, t, d]) => (<div key={n} className="row inset"><span className="num">{n}</span><div><h3>{t}</h3><p className="dim">{d}</p></div></div>))}
      </section>

      <section className="card stack">
        <div className="row"><span className="ico"><Coins size={22} /></span><div><h2>What your points are worth</h2><p className="dim">100 points = ₱1, every time.</p></div></div>
        <div className="ladder">
          <div><b className="gold-text">100</b><span className="dim small">pts = {peso(100)}</span></div>
          <div><b className="gold-text">1,000</b><span className="dim small">pts = {peso(1000)}</span></div>
          <div><b className="gold-text">10,000</b><span className="dim small">pts = {peso(10000)}</span></div>
        </div>
        <Link to="/exchange" className="btn sm" style={{ alignSelf: 'flex-start' }}>Browse rewards <ArrowRight size={14} /></Link>
      </section>

      <section className="card stack">
        <div className="row"><span className="ico"><Crown size={22} /></span><div><h2>Earn up to 2× with VIP</h2><p className="dim">VIP members get 2× points on eligible package codes, plus a free snack every month. ₱99/month.</p></div></div>
        <Link to="/vip-membership-deal" className="btn gold sm" style={{ alignSelf: 'flex-start' }}>See VIP perks <ArrowRight size={14} /></Link>
      </section>

      <section className="card stack">
        <div className="row"><span className="ico"><Users size={22} /></span><div><h2>Share and earn more</h2><p className="dim">Refer a friend and get 20% of their base points when they redeem.</p></div></div>
        <Link to="/refer-a-friend-deal" className="btn sm" style={{ alignSelf: 'flex-start' }}>Get my referral link <ArrowRight size={14} /></Link>
      </section>

      <section className="card stack">
        <div className="row"><span className="ico"><HelpCircle size={22} /></span><h2>Quick answers</h2></div>
        {faq.map(([q, a]) => (<details key={q} className="inset" style={{ padding: '10px 14px' }}><summary style={{ fontWeight: 700, cursor: 'pointer' }}>{q}</summary><p className="dim" style={{ marginTop: 8 }}>{a}</p></details>))}
      </section>

      <div className="card stack">
        <h3>Good to know</h3>
        <ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Each code can be redeemed once per account.</li>
          <li>Some codes expire or have limited uses — redeem yours early.</li>
          <li>Points are added instantly and appear in your history.</li>
          <li>Too many wrong attempts will pause redemption for a few minutes.</li>
        </ul>
      </div>
    </div>
  );
}
