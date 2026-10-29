import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Coins, CreditCard, Crown, Gift, ImagePlus, LifeBuoy, Loader2, Percent, Sparkles, Upload, XCircle } from 'lucide-react';
import { useAuth } from '../../auth.jsx';
import { day } from '../../format.js';
import { getVip, submitVipApplication } from '../../lib/api.js';
import { RECEIPT_MAX_MB, checkReceipt, uploadReceipt } from '../../lib/cloud.js';
import { SITE } from '../../lib/siteConfig.js';
import useAsync from '../../lib/useAsync.js';
import usePage from '../../lib/usePage.js';
import { DealFooter, StateBox } from '../../components/deal/Parts.jsx';
import { Field, Msg } from '../../components/Ui.jsx';

const PRICE = 99;
const ENT_LABEL = { available: 'Available', requested: 'Requested', redeemed: 'Redeemed', issued: 'Issued', fulfilled: 'Fulfilled', unavailable: 'Unavailable' };

const BENEFITS = [
  { icon: Coins, title: '2× loyalty points', badge: 'Active members', text: 'Active members receive twice the points on eligible package-code redemptions: your base points plus an equal VIP bonus, shown as separate lines in your history. Points are whole numbers, so nothing is rounded. The bonus is never applied again to referral rewards or other bonuses.' },
  { icon: Gift, title: 'One free snack per month', ent: 'free_snack', text: 'Each active membership month includes one free snack entitlement. Choices, stock conditions and pickup or delivery arrangements are announced when your entitlement is issued. Delivery is not free unless stated.' },
  { icon: Percent, title: 'No YUÉLÍN transaction fees', badge: 'YUÉLÍN fees only', text: 'Eligible fees that YUÉLÍN itself would charge are waived for active members. Bank transfer charges and any third-party or payment-provider fees are not waived.' },
  { icon: LifeBuoy, title: 'Priority customer support', badge: 'Priority classification', text: 'Support requests from active members are classified as priority. No specific response time is promised.' },
  { icon: Sparkles, title: 'Higher chance of points multipliers', badge: 'Pending configuration', text: 'Planned. A points-multiplier promotion system with published eligibility rules is not operational yet, so no multiplier above 2× is offered or implied.' },
  { icon: CreditCard, title: 'Personalised NFC card', ent: 'nfc_card', text: 'Each verified VIP member may receive one personalised NFC card, once. YUÉLÍN fulfils it manually, and any pickup or delivery arrangement and cost is explained before you confirm.' },
];

const TERMS = [
  'VIP Membership costs ₱' + PRICE + ' per month. Benefits apply only while your membership is verified and active.',
  'Uploading a receipt submits it for review. It does not confirm payment or activate membership.',
  'The 2× points benefit applies to eligible package-code redemptions. The bonus equals your base points and is not applied to referral rewards.',
  'Referral rewards are calculated from base points only, so VIP status never changes them.',
  'Free snack and NFC card entitlements are issued by YUÉLÍN. Arrangements and any costs are explained before you confirm.',
  'Waived fees cover YUÉLÍN-imposed fees only, not bank, payment-provider or other third-party charges.',
  'The Offers page uses the same rules for everyone. VIP Membership does not unlock exclusive offers or pricing.',
  'A receipt may be declined. When a reason is recorded, it is shown on this page and you can submit a new receipt.',
];

function stateOf(v) {
  const m = v.membership, a = v.application;
  if (m && m.status === 'active' && new Date(m.ends_at).getTime() > Date.now()) return 'active';
  if (a && a.status === 'pending') return 'pending';
  if (m) return m.status === 'cancelled' ? 'cancelled' : 'expired';
  if (a && a.status === 'rejected') return 'rejected';
  if (a && a.status === 'verified') return 'verified';
  return 'none';
}

function describe(st, v) {
  const m = v.membership, a = v.application;
  switch (st) {
    case 'active': return [CheckCircle2, 'Active VIP', 'Your membership is active until ' + day(m.ends_at) + '.'];
    case 'pending': return [Clock, 'Submission pending verification', 'We received your receipt on ' + day(a.created_at) + '. Membership is not active until your payment is verified.'];
    case 'verified': return [CheckCircle2, 'Payment verified', 'Your payment was verified. Your membership will show as active as soon as it is activated.'];
    case 'rejected': return [XCircle, 'Receipt not approved', (a.reject_reason ? 'Reason: ' + a.reject_reason + '. ' : '') + 'You can submit a new receipt.'];
    case 'expired': return [Clock, 'Membership expired', 'Your membership ended on ' + day(m.ends_at) + '. You can apply again to renew.'];
    case 'cancelled': return [XCircle, 'Membership cancelled', 'You can apply again at any time.'];
    default: return [Crown, 'Not a member', 'Receipt not submitted yet.'];
  }
}

function EntBadge({ list, kind, active }) {
  const e = list.find((x) => x.kind === kind);
  if (e) return <span className="badge">{(ENT_LABEL[e.status] || e.status) + ' · issued ' + day(e.created_at)}</span>;
  return <span className="badge">{active ? 'Not issued yet' : 'Unavailable'}</span>;
}

export default function VipDeal() {
  usePage('VIP Membership');
  const { session } = useAuth();
  const uid = session && session.user ? session.user.id : null;
  const vip = useAsync(() => (uid ? getVip() : Promise.resolve({ data: null, missing: false, error: null })), [uid]);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [pct, setPct] = useState(0);
  const [stage, setStage] = useState('idle');
  const [uploaded, setUploaded] = useState(null);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [paid, setPaid] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!file) { setPreview(''); return undefined; }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const v = vip.data;
  const st = v ? stateOf(v) : 'none';
  const active = st === 'active';
  const ents = v ? v.entitlements : [];
  const canApply = !!uid && !!v && !vip.missing && !vip.error && ['none', 'rejected', 'expired', 'cancelled'].includes(st);
  const pay = SITE.payment;
  const payRows = [['Bank or e-wallet', pay.bankName], ['Account name', pay.accountName], ['Account number', pay.accountNumber]].filter((r) => r[1]);

  const pick = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    setErr(''); setUploaded(null);
    if (!f) return;
    const bad = checkReceipt(f);
    if (bad) { setFile(null); setErr(bad); return; }
    setFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (stage !== 'idle') return;
    setErr('');
    if (!file && !uploaded) return setErr('Choose your transfer receipt first.');
    if (!paid) return setErr('Please confirm that you have completed the transfer.');
    if (reference.length > 60) return setErr('The transfer reference is too long (60 characters at most).');
    if (note.length > 300) return setErr('The note is too long (300 characters at most).');
    try {
      let up = uploaded;
      if (!up) {
        setStage('uploading'); setPct(0);
        up = await uploadReceipt(file, setPct);
        setUploaded(up);
      }
      setStage('submitting');
      const r = await submitVipApplication({ url: up.url, publicId: up.publicId, reference: reference.trim(), note: note.trim() });
      if (r.error || !r.data) throw new Error('We could not record your application. Your receipt is uploaded, so you can press Submit to retry.');
      if (r.data.ok === false) throw new Error(r.data.error || 'Your application was not accepted.');
      setDone(true); setOpen(false);
      setFile(null); setUploaded(null); setReference(''); setNote(''); setPaid(false);
      vip.reload();
    } catch (x) {
      setErr(x.message || 'Something went wrong. Please try again.');
    } finally { setStage('idle'); }
  };

  let status;
  if (!uid) {
    status = (
      <div className="card stack center">
        <h2 className="serif">Join as a member</h2>
        <p className="dim">Sign in to apply and to see your membership status.</p>
        <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" state={{ from: '/vip-membership-deal' }} className="btn gold">Sign in</Link>
          <Link to="/register" className="btn">Create account</Link>
        </div>
      </div>
    );
  } else if (vip.loading && !v) status = <StateBox kind="loading" />;
  else if (vip.missing) status = <StateBox kind="missing" />;
  else if (vip.error) status = <StateBox kind="error" onRetry={vip.reload} />;
  else {
    const [Icon, title, text] = describe(st, v);
    status = (
      <div className="card wallet stack" role="status">
        <div className="row"><span className="ico"><Icon size={22} aria-hidden="true" /></span><div><p className="eyebrow">YOUR MEMBERSHIP</p><h2 className="serif">{title}</h2></div></div>
        <p className="dim">{text}</p>
        <Msg kind="good">{done ? 'Receipt submitted. It is now pending verification.' : ''}</Msg>
        <button type="button" className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={vip.reload} disabled={vip.loading}>{vip.loading ? 'Refreshing…' : 'Refresh status'}</button>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 28 }}>
      <section className="card banner" aria-labelledby="vp-h1">
        <p className="eyebrow">VIP MEMBERSHIP</p>
        <h1 id="vp-h1" className="serif"><span className="gold-text">VIP Membership — ₱{PRICE}/month</span></h1>
        <p className="dim" style={{ maxWidth: 480, margin: '0 auto' }}>Membership benefits depend on an approved, verified membership status.</p>
      </section>

      {status}

      <section className="stack" aria-labelledby="vp-ben">
        <h2 id="vp-ben" className="serif">Member benefits</h2>
        <div className="grid2">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card stack" style={{ gap: 10 }}>
              <div className="row between"><span className="ico"><b.icon size={22} aria-hidden="true" /></span>
                {b.ent ? <EntBadge list={ents} kind={b.ent} active={active} /> : <span className="badge">{b.badge}</span>}</div>
              <h3>{b.title}</h3>
              <p className="dim">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {canApply && (
        <section className="card stack" aria-labelledby="vp-apply">
          <h2 id="vp-apply" className="serif">Apply for VIP Membership</h2>
          {!open ? (
            <button type="button" className="btn gold block" onClick={() => { setOpen(true); setDone(false); }}><Crown size={18} />Apply for VIP Membership</button>
          ) : (
            <form onSubmit={submit} className="stack">
              <ol className="dim" style={{ paddingLeft: 18, lineHeight: 1.8 }}>
                <li>Review the price and terms below.</li>
                <li>Transfer ₱{PRICE} using the payment details shown here.</li>
                <li>Upload your transfer receipt.</li>
                <li>Wait for verification. Membership is not active until then.</li>
              </ol>

              <div className="inset stack" style={{ gap: 6 }}>
                <p className="eyebrow">PAYMENT DETAILS</p>
                {payRows.length > 0 ? payRows.map(([k, val]) => <p key={k}><span className="dim small">{k}: </span><b>{val}</b></p>)
                  : <p className="dim">Payment details have not been published yet. Please do not transfer money until they appear here.</p>}
                {pay.instructions && <p className="dim">{pay.instructions}</p>}
              </div>

              <div className="field">
                <p className="eyebrow">TRANSFER RECEIPT</p>
                <label htmlFor="vip-receipt" className="btn block" style={{ cursor: 'pointer' }}><ImagePlus size={18} />{file ? 'Choose a different image' : 'Choose receipt image'}</label>
                <input id="vip-receipt" type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
                <p className="dim small">JPG, PNG or WebP, up to {RECEIPT_MAX_MB} MB. The amount, date and reference must be readable.</p>
                {preview && <img src={preview} alt="Selected receipt preview" style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 14, alignSelf: 'flex-start' }} />}
              </div>

              <Field label="Transfer reference (optional)" icon={CreditCard} value={reference} onChange={(e) => setReference(e.target.value)} />
              <Field label="Note (optional)" icon={LifeBuoy} value={note} onChange={(e) => setNote(e.target.value)} />

              <label className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
                <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} style={{ marginTop: 4, width: 18, height: 18, accentColor: '#b8860b' }} />
                <span className="dim">I have completed the ₱{PRICE} transfer outside this app.</span>
              </label>

              {stage === 'uploading' && (
                <div className="bar" role="progressbar" aria-label="Receipt upload" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{ width: pct + '%' }} /></div>
              )}
              {uploaded && stage === 'idle' && <p className="dim small">Your receipt is already uploaded. Press Submit to try again without re-uploading.</p>}
              <Msg>{err}</Msg>

              <div className="row" style={{ flexWrap: 'wrap' }}>
                <button className="btn gold" disabled={stage !== 'idle'}>
                  {stage === 'idle' ? <Upload size={18} /> : <Loader2 size={18} className="spin" />}
                  {stage === 'uploading' ? 'Uploading receipt… ' + pct + '%' : stage === 'submitting' ? 'Submitting…' : 'Submit receipt for verification'}
                </button>
                <button type="button" className="btn ghost" disabled={stage !== 'idle'} onClick={() => setOpen(false)}>Cancel</button>
              </div>
            </form>
          )}
        </section>
      )}

      <section className="stack" aria-labelledby="vp-terms">
        <h2 id="vp-terms" className="serif">Membership terms</h2>
        <details className="faq"><summary>Read the terms</summary>
          <div className="body"><ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.8 }}>{TERMS.map((t) => <li key={t}>{t}</li>)}</ul></div>
        </details>
      </section>

      <div className="row" style={{ flexWrap: 'wrap' }}>
        <Link to="/offers-deal" className="btn">View offers</Link>
        <Link to="/help-center-deal" className="btn">Visit the Help Center</Link>
      </div>
      <DealFooter />
    </div>
  );
}
