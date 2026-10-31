import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AtSign, Check, Copy, Share2 } from 'lucide-react';
import { refLink } from '../../lib/refCapture.js';
import { useAuth } from '../../auth.jsx';
import { day, pts } from '../../format.js';
import { getReferral, registerReferral } from '../../lib/api.js';
import useAsync from '../../lib/useAsync.js';
import usePage from '../../lib/usePage.js';
import { DealFooter, StateBox } from '../../components/deal/Parts.jsx';
import { Field, Msg } from '../../components/Ui.jsx';

// Policy v1: referral = floor(base points x 20%). Integer math, so there is no float drift.
const RULES = [
  'Your referral link is built from your username. When a friend opens it, the code is saved on their device and added automatically when they sign up.',
  'A friend can add one referrer, once, before their first package-code redemption. It cannot be changed afterwards.',
  'You cannot refer yourself, and two accounts cannot refer each other.',
  'Points come only from a friend successfully redeeming a valid package code, not from opening a link or creating an account.',
  'The reward is 20% of the friend\'s base points for each redemption, rounded down to a whole point.',
  'VIP bonuses are never included in the calculation, and VIP status never changes anyone\'s referral reward.',
  'Each redemption pays its referral reward once. Your friend\'s own points are never reduced.',
];

export default function ReferDeal() {
  usePage('Refer a Friend');
  const { session } = useAuth();
  const uid = session && session.user ? session.user.id : null;
  const ref = useAsync(() => (uid ? getReferral() : Promise.resolve({ data: null, missing: false, error: null })), [uid]);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [copied, setCopied] = useState(false);
  const d = ref.data;

  const copy = async () => {
    try { await navigator.clipboard.writeText(d.username); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch (e) { setMsg({ kind: 'bad', text: 'Copy failed. Select your username and copy it manually.' }); }
  };
  const share = async () => {
    const url = refLink(d.username);
    const text = 'Join me on YUÉLÍN and earn rewards.';
    try {
      if (navigator.share) { await navigator.share({ title: 'YUÉLÍN', text, url }); return; }
      await navigator.clipboard.writeText(url);
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch (e) { if (e && e.name !== 'AbortError') setMsg({ kind: 'bad', text: 'Could not share. Copy your username instead.' }); }
  };
  const add = async (e) => {
    e.preventDefault();
    if (busy) return;
    setMsg(null);
    const v = name.trim();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(v)) return setMsg({ kind: 'bad', text: 'Enter a valid username (3 to 20 letters, numbers or underscores).' });
    setBusy(true);
    const r = await registerReferral(v);
    setBusy(false);
    if (r.error || !r.data) return setMsg({ kind: 'bad', text: 'Something went wrong. Please try again.' });
    if (r.data.ok === false) return setMsg({ kind: 'bad', text: r.data.error || 'We could not record that referral.' });
    setName('');
    setMsg({ kind: 'good', text: 'Referral recorded.' });
    ref.reload();
  };

  let mine;
  if (!uid) {
    mine = (
      <div className="card stack center">
        <h2 className="serif">Your referral username</h2>
        <p className="dim">Sign in to see your referral username and your referral activity.</p>
        <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" state={{ from: '/refer-a-friend-deal' }} className="btn gold">Sign in</Link>
          <Link to="/register" className="btn">Create account</Link>
        </div>
      </div>
    );
  } else if (ref.loading && !d) mine = <StateBox kind="loading" />;
  else if (ref.missing) mine = <StateBox kind="missing" />;
  else if (ref.error || !d) mine = <StateBox kind="error" onRetry={ref.reload} />;
  else {
    mine = (
      <>
        <div className="card wallet stack">
          <p className="eyebrow">YOUR REFERRAL USERNAME</p>
          <p className="big gold-text" style={{ wordBreak: 'break-all' }}>{d.username}</p>
          <button type="button" className="btn gold sm" style={{ alignSelf: 'flex-start' }} onClick={copy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : 'Copy username'}
          </button>
          <button type="button" className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={share}><Share2 size={16} />Share referral link</button>
          <p className="dim small">Your link: <b style={{ wordBreak: 'break-all' }}>{refLink(d.username)}</b></p>
          <p className="dim small">Share the link, never your password. It fills in your username for your friend automatically.</p>
        </div>

        <div className="grid3">
          <div className="inset center"><p className="eyebrow">SUCCESSFUL</p><p className="gold-text" style={{ fontSize: 26, fontWeight: 800 }}>{d.successful}</p></div>
          <div className="inset center"><p className="eyebrow">PENDING</p><p className="gold-text" style={{ fontSize: 26, fontWeight: 800 }}>{d.pending}</p></div>
          <div className="inset center"><p className="eyebrow">POINTS EARNED</p><p className="gold-text" style={{ fontSize: 26, fontWeight: 800 }}>{pts(d.points)}</p></div>
        </div>

        {d.referred_by ? (
          <div className="card stack"><h3>Your referrer</h3><p className="dim">You were referred by <b>{d.referred_by}</b>. This cannot be changed.</p></div>
        ) : d.can_add_referrer ? (
          <form onSubmit={add} className="card stack">
            <h3>Were you referred by a friend?</h3>
            <p className="dim">Enter their username. You can do this once, before your first package-code redemption.</p>
            <Field label="Friend's username" icon={AtSign} value={name} onChange={(e) => setName(e.target.value)} />
            {msg && <Msg kind={msg.kind}>{msg.text}</Msg>}
            <button className="btn gold block" disabled={busy}>{busy ? 'Saving…' : 'Add my referrer'}</button>
          </form>
        ) : (
          <div className="card stack"><h3>Add a referrer</h3><p className="dim">A referrer can only be added before your first package-code redemption, so this is no longer available for your account.</p></div>
        )}

        <div className="card stack">
          <h3>Referral activity</h3>
          {d.activity && d.activity.length > 0 ? (
            <div className="list">
              {d.activity.map((a, i) => (
                <div key={i} className="row between">
                  <div><b>{a.friend}</b><p className="dim small">{day(a.created_at)} · {pts(a.base_points)} base points redeemed</p></div>
                  <span className="gold-text" style={{ fontWeight: 800 }}>+{pts(a.points)}</span>
                </div>
              ))}
            </div>
          ) : <p className="dim">No referral rewards yet. They appear here after a friend you referred redeems a package code.</p>}
        </div>
      </>
    );
  }

  return (
    <div className="stack" style={{ gap: 28 }}>
      <section className="card banner" aria-labelledby="rf-h1">
        <p className="eyebrow">REFER A FRIEND</p>
        <h1 id="rf-h1" className="serif"><span className="gold-text">Share the sweetness.</span></h1>
        <p className="dim" style={{ maxWidth: 480, margin: '0 auto' }}>Invite friends with your username. When they redeem an eligible package code, you earn referral points too.</p>
      </section>

      {mine}

      <section className="card stack" aria-labelledby="rf-calc">
        <h2 id="rf-calc" className="serif">How the reward is calculated</h2>
        <p className="dim">Referral reward = base points redeemed by your friend × 20%, rounded down to a whole point.</p>
        <p className="dim small">Your friend still receives all of their own points. The reward is on top, not taken from them.</p>
      </section>

      <section className="stack" aria-labelledby="rf-rules">
        <h2 id="rf-rules" className="serif">Eligibility rules</h2>
        <div className="card"><ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.8 }}>{RULES.map((r) => <li key={r}>{r}</li>)}</ul></div>
      </section>

      
      <DealFooter />
    </div>
  );
}
