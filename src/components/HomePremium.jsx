import { Link } from 'react-router-dom';
import { ArrowRight, Cherry, Coins, Cookie, Crown, Flower2, Gift, Heart, Leaf, Nut, ShieldCheck, Ticket, Users } from 'lucide-react';

const FLAVORS = [
  [Cherry, 'Fraise Dorée', 'Strawberry extract', 'A delicate, sweet and fruity character.'],
  [Nut, 'Amande Dorée', 'Almond extract', 'A distinctive nutty aroma.'],
  [Leaf, 'Jade Élixir', 'Matcha-coated', 'An elegant, signature green tea taste.'],
  [Flower2, 'Rosé Élixir', 'Strawberry-coated', 'A beautiful fruity finish.'],
  [Cookie, 'Premium Noir Élixir', 'Chocolate-coated', 'Rich chocolate for true chocolate lovers.'],
  [Heart, 'Blanc Élixir', 'White chocolate-coated', 'Smooth, creamy sweetness.'],
];
const STEPS = [
  [Ticket, 'Find your code', 'Look for a YUÉLÍN code on your pack.'],
  [Coins, 'Collect points', '100 points are worth ₱1.'],
  [Gift, 'Exchange rewards', 'Choose from the reward collection.'],
];
const PROMISE = [
  [ShieldCheck, 'Single-use codes', 'Each code redeems once, so your points stay safe.'],
  [Crown, 'VIP: 2x points', 'On eligible package codes, plus a monthly snack.'],
  [Users, 'Refer a friend', 'Earn 20% of their base points when they redeem.'],
];

export default function HomePremium() {
  return (
    <>
      <section className="stack" style={{ gap: 14 }}>
        <div><p className="eyebrow">THE COLLECTION</p><h2>Six signature flavors</h2><p className="dim">One YUÉLÍN experience, six distinctive creations.</p></div>
        <div className="grid2 stag">
          {FLAVORS.map(([I, name, kind, text], i) => (
            <div key={name} className="card lift row" style={{ '--i': i, alignItems: 'flex-start' }}>
              <span className="ico"><I size={22} /></span>
              <div><h3>YUÉLÍN {name}</h3><p className="gold-text small" style={{ fontWeight: 700 }}>{kind}</p><p className="dim small">{text}</p></div>
            </div>
          ))}
        </div>
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
