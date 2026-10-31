import { Target } from 'lucide-react';
import { PageTitle } from '../components/Ui.jsx';
import MissionList from '../components/MissionList.jsx';

export default function Missions() {
  return (
    <div className="stack">
      <PageTitle icon={Target} eyebrow="EARN MORE" title="Mission center" sub="Complete missions to earn bonus points. Rewards are added automatically." />
      <MissionList />
    </div>
  );
}
