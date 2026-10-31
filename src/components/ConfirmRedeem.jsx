import { useEffect, useState } from 'react';
import { Gift, Info, X } from 'lucide-react';
import { call } from '../lib/yl.js';
import { supabase } from '../supabase';
import { peso, pts, uid } from '../format.js';
import { Msg } from './Ui.jsx';
import { soldOut } from '../lib/rewardsCat.js';

const ERR = { insufficient_points: 'You do not have enough points for this reward.', out_of_stock: 'Sorry, this reward just ran out of stock.', not_found: 'This reward is no longer available.', inactive: 'This reward is no longer available.' };

/** Confirmation step. Nothing is deducted until the member presses Confirm; the server re-checks balance, price and stock. */
export default function ConfirmRedeem({ reward, balance, onClose, onDone }) {
  const [live, setLive] = useState(reward);
  const [key] = useState(() => uid());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [res, setRes] = useState(null);

  // re-validate availability and price when the dialog opens
  useEffect(() => {
    let dead = false;
    supabase.from('rewards').select('*').eq('id', reward.id).maybeSingle().then(({ data }) => { if (!dead && data) setLive(data); });
    return () => { dead = true; };
  }, [reward.id]);

  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [busy, onClose]);

  const cost = Number(live.cost_points);
  const out = soldOut(live) || live.is_active === false;
  const left = balance - cost;
  const confirm = async () => {
    if (busy || res) return;
    setBusy(true); setErr('');
    const r = await call('exchange_reward', { p_reward: live.id, p_key: key });
    setBusy(false);
    if (r.error && !r.data) return setErr('Something went wrong. Please try again.');
    if (r.error) return setErr(ERR[r.data.error] || r.data.error || 'Exchange failed.');
    setRes(r.data || {});
    onDone();
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Confirm redemption">
      <div className="card stack route-in cr">
        <div className="row between"><h2>{res ? 'Exchange placed' : 'Confirm redemption'}</h2>{!busy && <button className="icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button>}</div>
        <div className="row">
          {live.image_url ? <img className="rimg sm" src={live.image_url} alt="" loading="lazy" /> : <span className="ico"><Gift size={22} /></span>}
          <div style={{ flex: 1 }}><h3>{live.name}</h3><p className="gold-text" style={{ fontWeight: 800 }}>{pts(cost)} pts <span className="dim small">({peso(cost)})</span></p></div>
        </div>
        {!res && (<>
          <div className="sum">
            <div><span>Current balance</span><b>{pts(balance)}</b></div>
            <div><span>This reward</span><b className="down">−{pts(cost)}</b></div>
            <div className="tot"><span>Balance after</span><b className={left < 0 ? 'down' : 'up'}>{pts(left)}</b></div>
          </div>
          <p className="small dim">{out ? 'Out of stock' : live.stock !== null && live.stock !== undefined ? live.stock + ' left in stock' : 'Available'}</p>
          <div className="inset small dim" style={{ padding: 12 }}><Info size={14} style={{ verticalAlign: '-2px' }} /> Points are deducted when you confirm. Your exchange starts as <b>Pending</b> and is processed by our team. If it is rejected or canceled, your points are returned and shown in your history.</div>
          <Msg>{err}</Msg>
          <div className="row"><button className="btn ghost" style={{ flex: 1 }} disabled={busy} onClick={onClose}>Cancel</button>
            <button className="btn gold" style={{ flex: 1 }} disabled={busy || out || left < 0} onClick={confirm}>{busy ? 'Working…' : 'Confirm redemption'}</button></div>
        </>)}
        {res && (<>
          <p className="tick">Your exchange was placed. We will process it shortly.</p>
          {(res.reference || res.reference_code) && <p className="small">Reference <b>{res.reference || res.reference_code}</b></p>}
          <div className="row"><button className="btn ghost" style={{ flex: 1 }} onClick={onClose}>Close</button></div>
        </>)}
      </div>
    </div>
  );
}
