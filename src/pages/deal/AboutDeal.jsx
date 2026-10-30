import { Link } from 'react-router-dom';
import { Eye, Heart, Palette, Sparkles, TrendingUp } from 'lucide-react';
import usePage from '../../lib/usePage.js';
import { DealFooter } from '../../components/deal/Parts.jsx';

const values = [
  [Sparkles, 'Thoughtful preparation', 'Care in the details, from the treat to the way it is presented.'],
  [Heart, 'Customer appreciation', 'Loyalty points and referrals exist to say thank you.'],
  [Palette, 'Creativity', 'Everyday treats, reimagined to feel a little more special.'],
  [Eye, 'Accessibility', 'A simple, clear experience that works on any screen.'],
  [TrendingUp, 'Continuous improvement', 'We keep refining the products and the experience.'],
];

export default function AboutDeal() {
  usePage('About');
  return (
    <div className="stack" style={{ gap: 30 }}>
      <section className="card banner" aria-labelledby="ab-h1">
        <p className="eyebrow">ABOUT YUÉLÍN</p>
        <h1 id="ab-h1" className="serif"><span className="gold-text">A Little Treat. A Lasting Memory.</span></h1>
        <p className="dim" style={{ maxWidth: 480, margin: '0 auto' }}>YUÉLÍN is built around delightful treats, thoughtful details, and meaningful customer experiences.</p>
      </section>

      <section className="card stack" aria-labelledby="ab-story">
        <h2 id="ab-story" className="serif">Our story</h2>
        <p className="dim">YUÉLÍN is a confectionery brand focused on making everyday treats feel special, from premium graham bites to the small touches around them. We believe a treat should feel like a moment worth remembering.</p>
      </section>

      <section className="card wallet stack" aria-labelledby="ab-mission">
        <h2 id="ab-mission" className="serif">Our mission</h2>
        <p className="serif" style={{ fontSize: 20, lineHeight: 1.5 }}>“To make every sweet moment feel special through delightful treats, thoughtful presentation, and rewarding experiences.”</p>
      </section>

      <section className="stack" aria-labelledby="ab-values">
        <h2 id="ab-values" className="serif">What we value</h2>
        <div className="grid3">
          {values.map(([Icon, t, d]) => (
            <div key={t} className="card stack" style={{ gap: 8 }}><span className="ico"><Icon size={22} aria-hidden="true" /></span><h3>{t}</h3><p className="dim">{d}</p></div>
          ))}
        </div>
      </section>

      <section className="card stack" aria-labelledby="ab-exp">
        <h2 id="ab-exp" className="serif">The YUÉLÍN experience</h2>
        <p className="dim">Our treats come with a little extra. Each package carries a permanent QR code that leads to the claim page, and a unique package code that earns loyalty points once it is validated. Points can be redeemed for rewards, shared through referrals, and boosted with the optional VIP Membership.</p>
      </section>

      
      <DealFooter />
    </div>
  );
}
