import { useMemo, useState } from 'react';
import { LifeBuoy, Search, SearchX } from 'lucide-react';
import { HELP_CATEGORIES, HELP_FAQ } from '../../lib/helpContent.js';
import { SITE } from '../../lib/siteConfig.js';
import usePage from '../../lib/usePage.js';
import { DealFooter } from '../../components/deal/Parts.jsx';

export default function HelpCenterDeal() {
  usePage('Help Center');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(-1);
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return HELP_FAQ.filter((f) => (cat < 0 || f.c === cat) && (!t || (f.q + ' ' + f.a).toLowerCase().includes(t)));
  }, [q, cat]);
  const contact = [SITE.contactEmail, SITE.contactPhone].filter(Boolean);

  return (
    <div className="stack" style={{ gap: 26 }}>
      <section className="card banner" aria-labelledby="hc-h1">
        <p className="eyebrow">HELP CENTER</p>
        <h1 id="hc-h1" className="serif"><span className="gold-text">How can we help?</span></h1>
        <p className="dim" style={{ maxWidth: 480, margin: '0 auto' }}>Answers about treats, points, referrals, VIP Membership and your account.</p>
      </section>

      <div className="field">
        <label htmlFor="hc-search">Search the Help Center</label>
        <div className="input"><Search size={18} aria-hidden="true" />
          <input id="hc-search" type="search" placeholder="Search questions" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="row" style={{ flexWrap: 'nowrap', overflowX: 'auto', gap: 8, paddingBottom: 8, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }} role="group" aria-label="Categories">
        <button type="button" aria-pressed={cat < 0} style={{ flexShrink: 0 }} className={'btn sm' + (cat < 0 ? ' gold' : '')} onClick={() => setCat(-1)}>All</button>
        {HELP_CATEGORIES.map((c, i) => (
          <button key={c} type="button" aria-pressed={cat === i} style={{ flexShrink: 0 }} className={'btn sm' + (cat === i ? ' gold' : '')} onClick={() => setCat(i)}>{c}</button>
        ))}
      </div>

      <p className="dim small" aria-live="polite">{rows.length} {rows.length === 1 ? 'answer' : 'answers'}</p>

      {rows.length === 0 ? (
        <div className="card sbox" role="status">
          <span className="ico" style={{ margin: '0 auto 12px' }}><SearchX size={22} aria-hidden="true" /></span>
          <h3>No matching answers</h3>
          <p className="dim" style={{ marginTop: 6 }}>Try different words or choose another category.</p>
        </div>
      ) : (
        <div className="stack" style={{ gap: 12 }}>
          {rows.map((f) => (
            <details key={f.q} className="faq">
              <summary>{f.q}</summary>
              <div className="body"><span className="badge" style={{ alignSelf: 'flex-start' }}>{HELP_CATEGORIES[f.c]}</span><p className="dim">{f.a}</p></div>
            </details>
          ))}
        </div>
      )}

      <section className="card stack" aria-labelledby="hc-contact">
        <div className="row"><span className="ico"><LifeBuoy size={22} aria-hidden="true" /></span><h2 id="hc-contact" className="serif">Still need help?</h2></div>
        {contact.length > 0
          ? <p className="dim">Contact support: <b>{contact.join(' · ')}</b>. Please include the relevant package or transaction reference. Never share your password.</p>
          : <p className="dim">Support contact details have not been published yet. A support request form will appear here once a support channel is connected.</p>}
      </section>
      <DealFooter />
    </div>
  );
}
