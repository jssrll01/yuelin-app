import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, PackageOpen, X } from 'lucide-react';
import { supabase } from '../supabase';
import { pts, when } from '../format.js';
import { call, q, ref, statusOf } from '../lib/yl.js';
import { Empty, PageTitle, Spinner } from '../components/Ui.jsx';

function Detail({ r, onClose }) {
  const [d, setD] = useState(null);
  useEffect(() => { call('get_redemption_detail', { p_id: r.id }).then(setD); }, [r.id]);
  const hist = (d && d.data && d.data.history) || [];
  const [label, kind] = statusOf(r.status);
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Redemption details">
      <div className="card stack route-in cr">
        <div className="row between"><h2>Exchange details</h2><button className="icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button></div>
        <div className="sum">
          <div><span>Reward</span><b>{(r.rewards && r.rewards.name) || 'Reward'}</b></div>
          <div><span>Reference</span><b>{ref(r)}</b></div>
          <div><span>Points spent</span><b>{pts(r.points_spent)}</b></div>
          <div><span>Placed</span><b>{when(r.created_at)}</b></div>
          <div><span>Status</span><b><span className={'tagline ' + kind}>{label}</span></b></div>
        </div>
        <h3>Status updates</h3>
        {!d && <p className="dim small">Loading…</p>}
        {d && !hist.length && <p className="dim small">{d.missing ? 'Detailed status history is not available yet.' : 'No updates yet. We will notify you when the status changes.'}</p>}
        {hist.map((h, i) => <div key={i} className="row between small"><span><b>{statusOf(h.status)[0]}</b>{h.note ? ' — ' + h.note : ''}</span><span className="dim">{when(h.created_at)}</span></div>)}
        {(d && d.data && d.data.redemption && d.data.redemption.fulfillment_note) && <div className="inset small" style={{ padding: 12 }}><b>Fulfillment:</b> {d.data.redemption.fulfillment_note}</div>}
        {/revers|reject|cancel/i.test(r.status || '') && <p className="small dim">Points for rejected or canceled exchanges are returned to your balance and shown in your points history.</p>}
      </div>
    </div>
  );
}

export default function Redemptions() {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(null);
  const load = useCallback(async () => {
    const r = await q(supabase.from('redemptions').select('*, rewards(name)').order('created_at', { ascending: false }).limit(100));
    setRows(r.data || []);
  }, []);
  useEffect(() => { load(); }, [load]);
  if (!rows) return <Spinner />;
  return (
    <div className="stack">
      <PageTitle icon={PackageOpen} eyebrow="ORDERS" title="My exchanges" sub="Track every reward you have exchanged." />
      {!rows.length && <Empty icon={PackageOpen} title="No exchanges yet" text="Your exchanged rewards and their status will be listed here." />}
      {!rows.length && <Link to="/exchange" className="btn gold" style={{ alignSelf: 'flex-start' }}>Browse rewards</Link>}
      {rows.length > 0 && (
        <div className="card list">
          {rows.map((m) => { const [label, kind] = statusOf(m.status); return (
            <button type="button" key={m.id} className="row between" style={{ textAlign: 'left', width: '100%' }} onClick={() => setOpen(m)}>
              <div><h3>{(m.rewards && m.rewards.name) || 'Reward'}</h3><p className="dim small">{when(m.created_at)} · Ref {ref(m)}</p></div>
              <div className="row" style={{ gap: 8 }}><div style={{ textAlign: 'right' }}><span className={'tagline ' + kind}>{label}</span><p className="dim small">{pts(m.points_spent)} pts</p></div><ChevronRight size={16} /></div>
            </button>
          ); })}
        </div>
      )}
      {open && <Detail r={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
