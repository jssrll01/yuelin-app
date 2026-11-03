import { Crown, Gem, MessageCircle, ShieldCheck, Users } from 'lucide-react';
import { PRODUCTS, peso } from '../lib/products.js';

const FB = 'https://www.facebook.com/share/1EMPotxs2u/';
const PROMISE = [
  [ShieldCheck, 'Single-use codes', 'Each code redeems once, so your points stay safe.'],
  [Crown, 'VIP: 2x points', 'On eligible package codes, plus a monthly snack.'],
  [Users, 'Refer a friend', 'Earn 20% of their base points when they redeem.'],
];

function Product({ p, i }) {
  const price = peso(p.price);
  return (
    <article className="card lift pl" style={{ '--i': i }}>
      <div className="pl-img">
        {p.image ? <img src={p.image} alt={'YUÉLÍN ' + p.name} loading="lazy" /> : <div className="pl-ph"><Gem size={34} /></div>}
        <span className="pl-tag">{p.kind}</span>
      </div>
      <div className="pl-body">
        <p className="eyebrow">YUÉLÍN</p>
        <h3 className="pl-name">{p.name}</h3>
        <p className="dim small">{p.desc}</p>
        <div className="pl-price">{price ? <><b className="gold-text">{price}</b><span className="dim small"> · 3 pcs</span></> : <span className="dim">Price on request</span>}</div>
        <a className="btn gold sm" href={FB} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} />Inquire</a>
        <details className="pl-more">
          <summary>More info</summary>
          <div className="sum" style={{ marginTop: 10 }}>
            {p.more.map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}
          </div>
        </details>
      </div>
    </article>
  );
}

export default function HomePremium() {
  return (
    <>
      <section className="stack" style={{ gap: 14 }}>
        <div><p className="eyebrow">THE COLLECTION</p><h2>Six signature flavors</h2><p className="dim">One YUÉLÍN experience, six distinctive creations.</p></div>
        <div className="pgrid stag">{PRODUCTS.map((p, i) => <Product key={p.id} p={p} i={i} />)}</div>
        <p className="dim small center">Every flavor is ₱59 for 3 pcs. Tap Inquire to order.</p>
      </section>

      <section className="stack" style={{ gap: 12 }}>
        <div><p className="eyebrow">THE YUÉLÍN PROMISE</p><h2>Made to be rewarding</h2></div>
        <div className="grid3 stag">
          {PROMISE.map(([I, t, d], i) => (
            <div key={t} className="card lift stack" style={{ gap: 8, '--i': i }}>
              <span className="ico"><I size={22} /></span><h3>{t}</h3><p className="dim small">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
