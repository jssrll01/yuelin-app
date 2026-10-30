import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { SITE } from '../../lib/siteConfig.js';

export default function PaymentDetails({ amount = 99 }) {
  const p = SITE.payment || {};
  const [done, setDone] = useState(false);
  if (!p.qrUrl && !p.accountName && !p.accountNumber) {
    return <div className="card"><h3>Payment details</h3><p className="dim">Payment details have not been added yet. Please check back soon.</p></div>;
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(String(p.accountNumber).replace(/\s/g, '')); setDone(true); setTimeout(() => setDone(false), 1500); } catch (e) { /* clipboard blocked */ }
  };
  return (
    <section className="card stack" aria-labelledby="pay-h">
      <h3 id="pay-h">Payment details</h3>
      <p className="dim">Pay ₱{amount} via {p.method || 'bank transfer'}, then upload your receipt.</p>
      {p.qrUrl && <div className="thumb" style={{ aspectRatio: '1/1', maxWidth: 260, margin: '0 auto' }}><img src={p.qrUrl} alt={(p.method || 'Payment') + ' QR code'} style={{ objectFit: 'contain' }} /></div>}
      <div className="inset stack" style={{ gap: 8 }}>
        {p.accountName && <div className="row between"><span className="dim small">Account name</span><b>{p.accountName}</b></div>}
        {p.accountNumber && (
          <div className="row between"><span className="dim small">Mobile number</span>
            <span className="row" style={{ gap: 8 }}><b>{p.accountNumber}</b>
              <button type="button" className="btn sm" onClick={copy}>{done ? <Check size={14} /> : <Copy size={14} />}{done ? 'Copied' : 'Copy'}</button></span></div>
        )}
        <div className="row between"><span className="dim small">Amount</span><b>₱{Number(amount).toFixed(2)}</b></div>
      </div>
      {p.instructions && <p className="dim small">{p.instructions}</p>}
    </section>
  );
}
