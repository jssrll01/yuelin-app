import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Cookie, Gift, Inbox, Loader2, Settings } from 'lucide-react';
import { DEAL_LINKS, SITE } from '../../lib/siteConfig.js';
import { day, money } from '../../format.js';

export function SectionHead({ eyebrow, title, sub, to, cta, id }) {
  return (
    <div className="row between" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={id} className="serif">{title}</h2>
        {sub && <p className="dim">{sub}</p>}
      </div>
      {to && <Link to={to} className="badge">{cta || 'View all'}</Link>}
    </div>
  );
}

export function StateBox({ kind, title, text, onRetry }) {
  const base = {
    loading: [Loader2, 'Loading…', ''],
    empty: [Inbox, 'Nothing here yet', ''],
    error: [AlertTriangle, 'We could not load this', 'Check your connection and try again.'],
    missing: [Settings, 'Not set up yet', 'This section is waiting for backend setup. Please check back soon.'],
  }[kind];
  const Icon = base[0];
  return (
    <div className="card sbox" role={kind === 'error' ? 'alert' : 'status'}>
      <span className="ico" style={{ margin: '0 auto 12px' }}><Icon size={22} className={kind === 'loading' ? 'spin' : ''} /></span>
      <h3>{title || base[1]}</h3>
      {(text || base[2]) && <p className="dim" style={{ marginTop: 6 }}>{text || base[2]}</p>}
      {kind === 'error' && onRetry && <button type="button" className="btn sm" style={{ marginTop: 14 }} onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Async({ q, empty, children }) {
  if (q.loading) return <StateBox kind="loading" />;
  if (q.missing) return <StateBox kind="missing" />;
  if (q.error) return <StateBox kind="error" onRetry={q.reload} />;
  if (!q.data || !q.data.length) return <StateBox kind="empty" title={empty && empty.title} text={empty && empty.text} />;
  return children(q.data);
}

export function ProductCard({ p }) {
  return (
    <article className="card stack" style={{ gap: 10 }}>
      <div className="thumb">{p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy" /> : <Cookie size={34} aria-hidden="true" />}</div>
      <div className="row between"><h3>{p.name}</h3><span className="badge">{p.in_stock ? 'Available' : 'Sold out'}</span></div>
      {p.description && <p className="dim">{p.description}</p>}
      <p className="gold-text" style={{ fontWeight: 800, fontSize: 18 }}>{money(p.price)}</p>
    </article>
  );
}

export function OfferCard({ o }) {
  const pr = o.products;
  return (
    <article className="card stack" style={{ gap: 10 }}>
      <div className="row between">
        <span className="ico"><Gift size={22} aria-hidden="true" /></span>
        <span className="badge">{o.valid_until ? 'Until ' + day(o.valid_until) : 'Ongoing'}</span>
      </div>
      <h3>{o.title}</h3>
      {o.description && <p className="dim">{o.description}</p>}
      {pr && <p className="dim small">Applies to: <b>{pr.name}</b>{pr.in_stock === false ? ' (currently sold out)' : ''}</p>}
      {o.purchase_requirement && <p className="dim small"><b>Purchase requirement:</b> {o.purchase_requirement}</p>}
      {o.conditions && <p className="dim small"><b>Conditions:</b> {o.conditions}</p>}
      {o.valid_from && <p className="dim small">Starts {day(o.valid_from)}</p>}
      <Link to="/home-deal#treats" className="btn sm" style={{ alignSelf: 'flex-start' }}>View treats<ArrowRight size={14} /></Link>
    </article>
  );
}

export function Steps({ items }) {
  return (
    <ol className="stack" style={{ listStyle: 'none' }}>
      {items.map((s, i) => (
        <li key={s.title} className="card row" style={{ alignItems: 'flex-start' }}>
          <span className="num">{i + 1}</span>
          <div className="stack" style={{ gap: 6, flex: 1 }}>
            <div className="row"><s.icon size={18} color="#b8860b" aria-hidden="true" /><h3>{s.title}</h3></div>
            <p className="dim">{s.text}</p>
            {s.to && <Link to={s.to} className="btn sm" style={{ alignSelf: 'flex-start' }}>{s.cta}<ArrowRight size={14} /></Link>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function DealFooter() {
  const contact = [SITE.contactEmail, SITE.contactPhone].filter(Boolean).join(' · ');
  return (
    <footer className="foot stack" style={{ gap: 14 }}>
      <p className="gold-text serif" style={{ fontSize: 22, fontWeight: 800 }}>YUÉLÍN</p>
      <p className="dim small">Sweet Moments. Last Forever.</p>
      <nav aria-label="Footer" className="fnav">{DEAL_LINKS.map(([to, l]) => <Link key={to} to={to}>{l}</Link>)}</nav>
      {contact && <p className="dim small">{contact}</p>}
      <p className="dim small">© {new Date().getFullYear()} YUÉLÍN</p>
    </footer>
  );
}
