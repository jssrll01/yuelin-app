import { Award, Lock } from 'lucide-react';
import { day } from '../format.js';
import { call } from '../lib/yl.js';
import useAsync from '../lib/useAsync.js';
import { Empty, PageTitle, Spinner } from '../components/Ui.jsx';

export default function Achievements() {
  const s = useAsync(() => call('get_achievements'), []);
  if (s.loading) return <Spinner />;
  const items = (s.data && s.data.items) || [];
  const got = items.filter((a) => a.unlocked);
  return (
    <div className="stack">
      <PageTitle icon={Award} eyebrow="BADGES" title="Achievements" sub={s.error || !items.length ? 'Earn badges as you use YUÉLÍN.' : got.length + ' of ' + items.length + ' unlocked'} />
      {(s.error || !items.length) && <Empty icon={Award} title={s.missing ? 'Achievements are coming soon' : 'No achievements yet'} text={s.missing ? 'Check back shortly.' : 'Achievements will appear here.'} />}
      <div className="grid2 stag">
        {items.map((a, i) => {
          const pct = a.target ? Math.min(100, Math.round(((a.progress || 0) / a.target) * 100)) : a.unlocked ? 100 : 0;
          return (
            <div key={a.id || a.code} className={'card stack ach' + (a.unlocked ? ' on' : '')} style={{ gap: 8, '--i': i }}>
              <div className="row"><span className="ico">{a.unlocked ? <Award size={22} /> : <Lock size={20} />}</span><div style={{ flex: 1 }}><h3>{a.title}</h3><p className="dim small">{a.description}</p></div></div>
              {a.target > 0 && !a.unlocked && <><div className="bar"><i style={{ width: pct + '%' }} /></div><p className="small dim">{a.progress || 0} / {a.target}</p></>}
              {a.unlocked ? <span className="tagline ok" style={{ alignSelf: 'flex-start' }}>Unlocked{a.unlocked_at ? ' · ' + day(a.unlocked_at) : ''}</span> : <span className="tagline gold" style={{ alignSelf: 'flex-start' }}>Locked</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
