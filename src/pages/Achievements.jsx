import { Award, Crown, Star, Gift, MessageSquare } from 'lucide-react';
import { PageTitle } from '../components/Ui.jsx';

const BADGES = [
  { id: 1, name: 'First Steps', desc: 'Joined the community', icon: Star, unlocked: true },
  { id: 2, name: 'Reviewer', desc: 'Wrote your first review', icon: Award, unlocked: true },
  { id: 3, name: 'Sweet Tooth', desc: 'Earned 100 points', icon: Gift, unlocked: true },
  { id: 4, name: 'VIP Member', desc: 'Subscribed to VIP', icon: Crown, unlocked: false },
  { id: 5, name: 'Socialite', desc: 'Sent 10 global chats', icon: MessageSquare, unlocked: false },
  { id: 6, name: 'Loyal Fan', desc: 'Redeemed a reward', icon: Gift, unlocked: false },
];

export default function Achievements() {
  return (
    <div className="stack">
      <PageTitle icon={Award} eyebrow="BADGES" title="Achievements" sub="Earn badges as you use YUÉLÍN." />
      
      <div className="grid2" style={{ gap: 16, paddingBottom: 40 }}>
        {BADGES.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.id} className="card stack" style={{ opacity: b.unlocked ? 1 : 0.5, alignItems: 'center', textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: '50%', 
                background: b.unlocked ? 'rgba(212, 175, 55, 0.1)' : 'var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: b.unlocked ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid var(--line)',
                marginBottom: 12
              }}>
                <Icon size={28} color={b.unlocked ? '#d4af37' : 'var(--dim)'} />
              </div>
              <h3 style={{ margin: 0, fontSize: 15 }}>{b.name}</h3>
              <p className="dim small" style={{ margin: '4px 0 0' }}>{b.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
