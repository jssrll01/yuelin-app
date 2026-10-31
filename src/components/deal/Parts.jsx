import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Cookie, Gift, Inbox, Loader2, Settings } from 'lucide-react';
import { DEAL_LINKS, SITE } from '../../lib/siteConfig.js';
import { day, money } from '../../format.js';
import { SkCard } from '../Ui.jsx';

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
  if (kind === 'loading') return <div className="stack" role="status" aria-busy="true"><SkCard /><SkCard /></div>;
  const base = {
    loading: [Loader2, 'Loading…', ''],
    empty: [Inbox, 'Nothing here yet', ''],
    error: [AlertTriangle, 'We could not load this', 'Check your connection and try again.'],
    missing: [Settings, 'Not set up yet', ''],
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

export function DealFooter() { return null; }
