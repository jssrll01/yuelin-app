import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Bell, Crown, Dices, Gift, History, Home, Info, LifeBuoy, LogIn, Sparkles, Tag, Ticket, User, UserPlus, Users, X } from 'lucide-react';
import { useAuth } from '../auth.jsx';

const discover = [
  ['/', 'Home', Home],
  ['/home-deal', 'Treats', Sparkles],
  ['/about-deal', 'About the brand', Info],
  ['/how-it-works-deal', 'How It Works', BookOpen],
  ['/vip-membership-deal', 'VIP Membership', Crown],
  ['/refer-a-friend-deal', 'Refer a Friend', Users],
  ['/offers-deal', 'Offers', Tag],
  ['/help-center-deal', 'Help Center', LifeBuoy]
];
const member = [['/redeem', 'Redeem a code', Ticket], ['/exchange', 'Reward exchange', Gift], ['/games', 'Play with points', Dices], ['/history', 'Points history', History], ['/notifications', 'Notifications', Bell], ['/profile', 'My profile', User]];
const guest = [['/login', 'Sign in', LogIn], ['/register', 'Create account', UserPlus]];

export default function Menu({ open, onClose }) {
  const { session } = useAuth();
  const loc = useLocation();
  useEffect(() => { onClose(); }, [loc.pathname, onClose]);
  useEffect(() => {
    if (!open) return undefined;
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  const group = (title, items) => (
    <>
      <p className="mh">{title}</p>
      {items.map(([to, label, Icon]) => (
        <NavLink key={to} to={to} end className={({ isActive }) => 'mi' + (isActive ? ' active' : '')}><Icon size={20} />{label}</NavLink>
      ))}
    </>
  );
  return (
    <>
      <div className="drawer-bg" onClick={onClose} aria-hidden="true" />
      <aside className="drawer" aria-label="Menu">
        <div className="row between" style={{ marginBottom: 8 }}>
          <span className="brand gold-text">YUÉLÍN</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close menu"><X size={18} /></button>
        </div>
        {group('DISCOVER', discover)}
        {session ? group('MY ACCOUNT', member) : group('JOIN', guest)}
      </aside>
    </>
  );
}
