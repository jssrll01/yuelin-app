import { Link, NavLink, Outlet } from 'react-router-dom';
import { Bell, Coins, Dices, Gem, Gift, Home, Ticket, User } from 'lucide-react';
import { useAuth } from '../auth.jsx';
import { pts } from '../format.js';
import InstallPrompt from './InstallPrompt.jsx';

const tabs = [['/', 'Home', Home], ['/redeem', 'Redeem', Ticket], ['/exchange', 'Rewards', Gift], ['/games', 'Play', Dices], ['/profile', 'Me', User]];

export default function Layout() {
  const { session, profile, unread } = useAuth();
  return (
    <div className="app">
      <header className="top">
        <div className="top-in">
          <Link to="/" className="brand" aria-label="YUÉLÍN home"><Gem size={20} /><span className="gold-text">YUÉLÍN</span></Link>
          <div className="top-r">
            {session && <Link to="/history" className="chip" aria-label="Points balance"><Coins size={14} />{pts(profile?.points)}</Link>}
            <Link to="/notifications" className="icon-btn" aria-label="Notifications">
              <Bell size={20} />{unread > 0 && <span className="dot">{unread > 9 ? '9+' : unread}</span>}
            </Link>
            <Link to="/profile" className="icon-btn" aria-label="Profile"><User size={20} /></Link>
          </div>
        </div>
      </header>
      <main className="page"><Outlet /></main>
      {session && (
        <nav className="bottom" aria-label="Main">
          <div className="bottom-in">
            {tabs.map(([to, label, Icon]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => 'nav' + (isActive ? ' active' : '')}>
                <Icon size={20} /><span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
      <InstallPrompt />
    </div>
  );
}
