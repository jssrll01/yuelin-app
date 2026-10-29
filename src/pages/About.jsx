import { Link } from 'react-router-dom';
import { Coins, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { BRAND } from '../brand.js';
import { PageTitle } from '../components/Ui.jsx';

const values = [
  [Coins, 'Clear value', 'Points have one fixed rate: 100 points equal ₱1. No surprises.'],
  [ShieldCheck, 'Secure by design', 'Balances and outcomes are handled on the server, not on your device.'],
  [Sparkles, 'Always on record', 'Every point earned or spent is written to your history with a date.'],
];
const faq = [
  ['What are points?', 'Points are your balance in YUÉLÍN. You add them by redeeming codes, and you spend them on rewards or in the games. 100 points equal ₱1.'],
  ['Where do codes come from?', 'Codes are issued by YUÉLÍN. Each one works once per account, and some expire or have limited uses.'],
  ['What happens after I exchange a reward?', 'Your points are deducted right away and the exchange appears under My exchanges as pending. Its status changes once it has been processed.'],
  ['Can I change my details?', 'You can edit your name, phone number and address in your profile. Your username and email address stay fixed.'],
  ['Are the games safe to play?', 'Every game shows its payouts before you play. You can lose the points you stake, so only play with points you are comfortable using.'],
];

export default function About() {
  return (
    <div className="stack">
      <PageTitle icon={Info} eyebrow="ABOUT" title={'What is ' + BRAND.name + '?'} sub="A rewards platform built around clarity." />
      <div className="card stack">
        <p className="dim">{BRAND.name} is a members' rewards platform. You redeem codes for points, keep track of them in one place, and exchange them for rewards from a curated collection. You can also use your points in the games on the Play page.</p>
        <div className="grid3">
          <div className="inset center"><p className="eyebrow">STARTED</p><p className="gold-text" style={{ fontSize: 24, fontWeight: 800 }}>{BRAND.since}</p></div>
          <div className="inset center"><p className="eyebrow">POINT VALUE</p><p className="gold-text" style={{ fontSize: 24, fontWeight: 800 }}>100 = ₱1</p></div>
          <div className="inset center"><p className="eyebrow">RECORDS</p><p className="gold-text" style={{ fontSize: 24, fontWeight: 800 }}>Every point</p></div>
        </div>
      </div>
      <div className="card stack"><h2>Our story</h2><p className="dim">{BRAND.story}</p></div>
      <div className="stack">
        <h2>What we stand for</h2>
        <div className="grid3">
          {values.map(([Icon, t, d]) => (
            <div key={t} className="card stack" style={{ gap: 8 }}><span className="ico"><Icon size={22} /></span><h3>{t}</h3><p className="dim">{d}</p></div>
          ))}
        </div>
      </div>
      <div className="stack">
        <h2>Frequently asked</h2>
        {faq.map(([q, a]) => (
          <details key={q} className="faq"><summary>{q}</summary><div className="body"><p className="dim">{a}</p></div></details>
        ))}
      </div>
      <Link to="/guide" className="btn gold block">See how it works</Link>
    </div>
  );
}
