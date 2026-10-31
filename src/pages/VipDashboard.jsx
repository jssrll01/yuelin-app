import { Link } from 'react-router-dom';
import { ArrowRight, Check, Crown, Gift } from 'lucide-react';
import { day, when } from '../format.js';
import { getVip } from '../lib/api.js';
import { call } from '../lib/yl.js';
import useAsync from '../lib/useAsync.js';
import { Empty, PageTitle, Spinner } from '../components/Ui.jsx';

// Status is computed from the server's membership record only; nothing here can activate VIP.
export default function VipDashboard() {
  const base = useAsync(getVip, []);
  const dash = useAsync(() => call('get_vip_dashboard'), []);
  if (base.loading || dash.loading) return <Spinner />;
  const m = base.data && base.data.membership;
  const d = (dash.data && dash.data.ok !== false && dash.data) || {};
  const ends = d.ends_at || (m && m.ends_at);
  const start = d.started_at || (m && (m.starts_at || m.started_at || m.created_at));
  const status = d.status || (m ? (m.status === 'active' && ends && new Date(ends).getTime() > Date.now() ? 'active' : m.status === 'active' ? 'expired' : m.status) : 'none');
  const active = status === 'active';
  const left = ends ? Math.ceil((new Date(ends).getTime() - Date.now()) / 864e5) : null;
  const ents = (base.data && base.data.entitlements) || [];
  const benefits = d.benefits || [];
  const rewards = d.exclusive_rewards || [];
  const activity = d.activity || [];
  return (
    <div className="stack">
      <PageTitle icon={Crown} eyebrow="MEMBERSHIP" title="VIP dashboard" sub="Your membership, benefits and activity." />
      <section className="card wallet stack">
        <div className="row between"><p className="eyebrow">{d.tier ? String(d.tier).toUpperCase() : 'YUÉLÍN VIP'}</p><span className={'tagline ' + (active ? 'ok' : 'hot')}>{status === 'none' ? 'Not a member' : active ? 'Active' : status === 'expired' ? 'Expired' : status}</span></div>
        {m || d.status ? (<>
          <div className="sum">
            {start && <div><span>Member since</span><b>{day(start)}</b></div>}
            {ends && <div><span>{active ? 'Renews / expires' : 'Expired on'}</span><b>{day(ends)}</b></div>}
            {active && left !== null && <div><span>Days remaining</span><b>{Math.max(0, left)}</b></div>}
          </div>
          {d.next_tier && <><div className="bar"><i style={{ width: Math.min(100, Math.round(((d.progress || 0) / (d.target || 1)) * 100)) + '%' }} /></div><p className="small dim">{d.progress || 0} / {d.target} toward {d.next_tier}</p></>}
          {!active && <p className="small dim">VIP benefits are paused while your membership is not active.</p>}
        </>) : <p className="dim">You are not a VIP member yet. Join to unlock 2× points, a monthly snack and more.</p>}
        <Link to="/vip-membership-deal" className="btn gold block">{active ? 'Manage membership' : 'Become a VIP'}<ArrowRight size={16} /></Link>
      </section>

      {benefits.length > 0 && (
        <section className="card stack"><h2>Your benefits</h2>
          {benefits.map((b, i) => <div key={i} className="row"><Check size={16} className="up" /><div><h3>{b.title || b}</h3>{b.text && <p className="dim small">{b.text}</p>}</div></div>)}
        </section>
      )}
      {ents.length > 0 && (
        <section className="card stack"><h2>Entitlements</h2>
          {ents.map((e) => <div key={e.id} className="row between"><div><h3>{String(e.kind || e.type || 'Entitlement').replace(/_/g, ' ')}</h3><p className="dim small">{e.created_at ? when(e.created_at) : ''}</p></div><span className="tagline gold">{e.status}</span></div>)}
        </section>
      )}
      {rewards.length > 0 && (
        <section className="card stack"><h2><Gift size={18} style={{ verticalAlign: '-3px' }} /> Exclusive rewards</h2>
          {rewards.map((r) => <div key={r.id} className="row between"><h3>{r.name}</h3><span className="dim small">{r.cost_points} pts</span></div>)}
          <Link to="/exchange" className="btn sm" style={{ alignSelf: 'flex-start' }}>Browse rewards</Link>
        </section>
      )}
      {activity.length > 0 && (
        <section className="card list"><h2>Membership activity</h2>
          {activity.map((a, i) => <div key={i} className="row between small"><span>{a.text || a.title}</span><span className="dim">{when(a.created_at)}</span></div>)}
        </section>
      )}
      {!m && !benefits.length && !ents.length && <Empty icon={Crown} title="No membership activity" text="Your VIP activity will appear here once you join." />}
    </div>
  );
}
