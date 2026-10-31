import { Trophy } from 'lucide-react';
import { PageTitle } from '../components/Ui.jsx';
import Leaderboard from '../components/Leaderboard.jsx';

export default function LeaderboardPage() {
  return (
    <div className="stack">
      <PageTitle icon={Trophy} eyebrow="RANKINGS" title="Leaderboard" sub="Ranked by points earned in the period, not by current balance. Members who prefer privacy are not listed." />
      <Leaderboard limit={50} />
    </div>
  );
}
