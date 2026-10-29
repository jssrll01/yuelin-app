import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { PageTitle } from '../components/Ui.jsx';

const steps = [
  ['Create an account', 'Join with your email and a few details.'],
  ['Redeem a code', 'Turn your code into points.'],
  ['Exchange a reward', 'Spend points on items from the collection.'],
  ['Track it all', 'Check your history and notifications any time.'],
];
const topics = [
  ['Create your account', ['Tap Create account and enter your username, name, phone number, email, password and address.', 'Passwords need at least 6 characters. Usernames are unique: 3 to 20 letters, numbers or underscores.', 'When your account is created you are taken to the sign in page.']],
  ['Redeem a code', ['Open Redeem, type your code and tap Redeem.', 'Each code works once per account. Some codes expire or have limited uses.', 'After several wrong attempts, redemption pauses for a few minutes.']],
  ['Exchange points for a reward', ['Open Rewards and pick an item you can afford. The progress bar shows how close you are.', 'Confirm the exchange. Points are deducted immediately.', 'Follow its status under My exchanges: pending, fulfilled or cancelled.']],
  ['Read your points history', ['Tap your balance in the header to see every point earned and spent, with the date and your balance after each change.']],
  ['Use notifications', ['The bell shows unread messages about your account, codes and exchanges. Tap a message to mark it read.']],
  ['Play with points', ['The Play page lists each game and its payouts before you play.', 'You can lose the points you stake. Only stake what you are comfortable with.']],
  ['Install the app', ['Android: open the browser menu and choose Install app or Add to Home screen.', 'iPhone: in Safari, tap Share, then Add to Home Screen.']],
  ['Keep your details up to date', ['Open Me to update your name, phone number and address. Your username and email address cannot be changed.']],
];

export default function Guide() {
  return (
    <div className="stack">
      <PageTitle icon={BookOpen} eyebrow="GUIDE" title="How it works" sub="From your first code to your first reward." />
      <div className="card stack">
        {steps.map(([t, d], i) => (
          <div key={t} className="row inset"><span className="num">{i + 1}</span><div><h3>{t}</h3><p className="dim">{d}</p></div></div>
        ))}
      </div>
      <h2>How to use YUÉLÍN</h2>
      <div className="stack">
        {topics.map(([t, ps]) => (
          <details key={t} className="faq"><summary>{t}</summary><div className="body">{ps.map((p) => <p key={p} className="dim">{p}</p>)}</div></details>
        ))}
      </div>
      
    </div>
  );
}
