import { useCallback, useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bell, Coins, Crown, Dices, Gift, Home, Menu as MenuIcon, Ticket, User, Users , MessageSquare } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { pts } from '../format.js';
import InstallPrompt from './InstallPrompt.jsx';
import Menu from './Menu.jsx';
import { useRefCapture } from '../lib/refCapture.js';

const tabs = [['/', 'Home', Home], ['/redeem', 'Redeem', Ticket], ['/exchange', 'Rewards', Gift], ['/refer-a-friend-deal', 'Referral', Users], ['/vip-membership-deal', 'VIP', Crown]];

export default function Layout() {
  const location = useLocation();
  const isChat = location.pathname === '/global-chat';
  const { session, profile, unread } = useAuth();

  const [hasUnreadChat, setHasUnreadChat] = useState(() => localStorage.getItem('unread_chat') === 'true');
  
  useEffect(() => {
    // Listen for Realtime Messages globally
    const channel = supabase
      .channel('global_chat_unread')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_chat_messages' }, (payload) => {
        // Only show dot if NOT on the chat page, NOT my message, and NOT a system message
        if (location.pathname !== '/global-chat' && payload.new.user_id !== profile?.id && payload.new.username !== 'System') {
          setHasUnreadChat(true);
          localStorage.setItem('unread_chat', 'true');
        }
      })
      .subscribe();

    // Listen for custom event to clear the dot when user opens chat
    const handleClear = () => {
      setHasUnreadChat(false);
      localStorage.removeItem('unread_chat');
    };
    window.addEventListener('chat-read', handleClear);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('chat-read', handleClear);
    };
  }, [location.pathname, profile?.id]);

  const loc = useLocation();
  useRefCapture();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <div className="app">
      {!isChat && (
      <header className="top">
        <div className="top-in">
          <div className="row" style={{ gap: 10 }}>
            <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Open menu"><MenuIcon size={20} /></button>
            <Link to="/" className="brand gold-text" aria-label="YUÉLÍN home">YUÉLÍN</Link>
          </div>
          <div className="top-r">
            {session && <Link to="/history" className="chip" aria-label="Points balance"><Coins size={14} />{pts(profile?.points)}</Link>}
            <Link to="/notifications" className="icon-btn" aria-label="Notifications">
              <Bell size={20} />{unread > 0 && <span className="dot">{unread > 9 ? '9+' : unread}</span>}
            </Link>
            <Link to="/global-chat" className="icon-btn" aria-label="Global Community" ><MessageSquare size={18} /></Link>
<Link to="/profile" className="icon-btn" aria-label="Profile"><User size={20} /></Link>
          </div>
        </div>
      </header>
      )}
      <Menu open={open} onClose={close} />
      <main className="page" style={isChat ? { padding: 0, height: '100dvh', overflow: 'hidden' } : {}}><div key={loc.pathname} className="route-in" style={isChat ? { transform: 'none', height: '100%' } : {}}><Outlet /></div></main>
      {session && !isChat && (
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
