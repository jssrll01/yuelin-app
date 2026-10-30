import { Dices } from 'lucide-react';
import { PageTitle } from '../components/Ui.jsx';

export default function Games() {
  return (
    <div className="stack">
      <PageTitle icon={Dices} eyebrow="PLAY" title="Play with points" sub="Games are currently unavailable." />
      <div className="card center">
        <p className="dim">There are no games to display at this time.</p>
      </div>
    </div>
  );
}
