import { Link } from 'react-router-dom';
import { Coins, Crown, Gift, QrCode, Search, ShoppingBag, Ticket, Users } from 'lucide-react';
import usePage from '../../lib/usePage.js';
import { DealFooter, Steps } from '../../components/deal/Parts.jsx';

const steps = [
  { icon: Search, title: 'Discover', text: 'Browse the available YUÉLÍN treats and offers.', to: '/home-deal#treats', cta: 'See treats' },
  { icon: ShoppingBag, title: 'Purchase', text: 'Buy a treat through the configured ordering process.' },
  { icon: QrCode, title: 'Scan', text: 'Scan the permanent QR code on the package. It opens the claim page.' },
  { icon: Ticket, title: 'Claim', text: 'Sign in and enter the unique code associated with your package.', to: '/redeem', cta: 'Claim points' },
  { icon: Coins, title: 'Collect', text: 'The system validates the code and awards the configured points exactly once.' },
  { icon: Gift, title: 'Redeem', text: 'Use your points for eligible rewards, following the published reward rules.', to: '/exchange', cta: 'View rewards' },
  { icon: Users, title: 'Refer', text: 'Share your username with a friend. When that friend successfully redeems an eligible package code, you earn referral points.', to: '/refer-a-friend-deal', cta: 'Refer a Friend' },
  { icon: Crown, title: 'Join VIP', text: 'Optionally apply for VIP Membership at ₱99/month and submit your transfer receipt for verification.', to: '/vip-membership-deal', cta: 'See VIP Membership' },
];

export default function HowItWorksDeal() {
  usePage('How It Works');
  return (
    <div className="stack" style={{ gap: 30 }}>
      <section className="card banner" aria-labelledby="hw-h1">
        <p className="eyebrow">HOW IT WORKS</p>
        <h1 id="hw-h1" className="serif"><span className="gold-text">From first bite to first reward.</span></h1>
        <p className="dim" style={{ maxWidth: 480, margin: '0 auto' }}>Eight simple steps, from discovering a treat to earning rewards.</p>
      </section>

      <Steps items={steps} />

      <section className="card stack" aria-labelledby="hw-codes">
        <h2 id="hw-codes" className="serif">Two different codes</h2>
        <div className="grid2">
          <div className="inset"><h3>The permanent QR code</h3><p className="dim">Printed on the package. Scanning it opens the claim page. It does not award points.</p></div>
          <div className="inset"><h3>The unique package code</h3><p className="dim">Entered on the claim page. It is validated and can be redeemed only once.</p></div>
        </div>
        <p className="dim"><b>Scanning alone never awards points.</b> Points are credited only after a valid, unused package code is successfully redeemed.</p>
      </section>

      <section className="card stack" aria-labelledby="hw-ref">
        <h2 id="hw-ref" className="serif">How referral points are calculated</h2>
        <p className="dim">Referral points are based on the points actually awarded for a successful, eligible package-code redemption. Opening a link or creating an account does not earn them. The referring customer receives 20% of the friend's base points, rounded down to a whole point. The friend's own points are not reduced.</p>
      </section>

      <div className="row" style={{ flexWrap: 'wrap' }}>
        <Link to="/redeem" className="btn gold">Claim points</Link>
        <Link to="/help-center-deal" className="btn">Visit the Help Center</Link>
      </div>
      <DealFooter />
    </div>
  );
}
