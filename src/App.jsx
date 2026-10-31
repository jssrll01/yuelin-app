import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Guide from './pages/Guide.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';
import History from './pages/History.jsx';
import RedeemCode from './pages/RedeemCode.jsx';
import Exchange from './pages/Exchange.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Missions from './pages/Missions.jsx';
import Achievements from './pages/Achievements.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import Redemptions from './pages/Redemptions.jsx';
import VipDashboard from './pages/VipDashboard.jsx';
import CheckIn from './pages/CheckIn.jsx';
import HomeDeal from './pages/deal/HomeDeal.jsx';
import AboutDeal from './pages/deal/AboutDeal.jsx';
import HowItWorksDeal from './pages/deal/HowItWorksDeal.jsx';
import VipDeal from './pages/deal/VipDeal.jsx';
import ReferDeal from './pages/deal/ReferDeal.jsx';
import HelpCenterDeal from './pages/deal/HelpCenterDeal.jsx';

const guard = (el) => <RequireAuth>{el}</RequireAuth>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/notifications" element={guard(<Notifications />)} />
        <Route path="/profile" element={guard(<Profile />)} />
        <Route path="/history" element={guard(<History />)} />
        <Route path="/redeem" element={guard(<RedeemCode />)} />
        <Route path="/exchange" element={guard(<Exchange />)} />
        <Route path="/wishlist" element={guard(<Wishlist />)} />
        <Route path="/missions" element={guard(<Missions />)} />
        <Route path="/achievements" element={guard(<Achievements />)} />
        <Route path="/leaderboard" element={guard(<LeaderboardPage />)} />
        <Route path="/redemptions" element={guard(<Redemptions />)} />
        <Route path="/vip-dashboard" element={guard(<VipDashboard />)} />
        <Route path="/checkin" element={guard(<CheckIn />)} />
        <Route path="/home-deal" element={<HomeDeal />} />
        <Route path="/about-deal" element={<AboutDeal />} />
        <Route path="/how-it-works-deal" element={<HowItWorksDeal />} />
        <Route path="/vip-membership-deal" element={<VipDeal />} />
        <Route path="/refer-a-friend-deal" element={<ReferDeal />} />
        <Route path="/help-center-deal" element={<HelpCenterDeal />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
