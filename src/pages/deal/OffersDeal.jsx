import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { getOffers } from '../../lib/api.js';
import useAsync from '../../lib/useAsync.js';
import usePage from '../../lib/usePage.js';
import { Async, DealFooter, OfferCard } from '../../components/deal/Parts.jsx';

export default function OffersDeal() {
  usePage('Offers');
  const offers = useAsync(() => getOffers(60), []);
  return (
    <div className="stack" style={{ gap: 28 }}>
      <section className="card banner" aria-labelledby="of-h1">
        <p className="eyebrow">OFFERS</p>
        <h1 id="of-h1" className="serif"><span className="gold-text">Something sweet, right now.</span></h1>
        <p className="dim" style={{ maxWidth: 480, margin: '0 auto' }}>Current promotions on YUÉLÍN treats. Each offer lists its own dates and conditions.</p>
      </section>

      <div className="card row" style={{ alignItems: 'flex-start' }}>
        <span className="ico"><Tag size={22} aria-hidden="true" /></span>
        <p className="dim">The same offers and eligibility rules apply to every customer, including VIP members. Availability and redemption are confirmed by YUÉLÍN.</p>
      </div>

      <Async q={offers} empty={{ title: 'No active offers right now', text: 'Check back soon for something sweet.' }}>
        {(rows) => <div className="pgrid">{rows.map((o) => <OfferCard key={o.id} o={o} />)}</div>}
      </Async>

      
      <DealFooter />
    </div>
  );
}
