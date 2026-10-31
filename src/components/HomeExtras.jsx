import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Megaphone, Sparkles } from 'lucide-react';
import { pts } from '../format.js';
import { call } from '../lib/yl.js';
import { catName, soldOut } from '../lib/rewardsCat.js';
import { isFeatured, isNew } from '../lib/yl.js';
import Leaderboard from './Leaderboard.jsx';
import MissionList from './MissionList.jsx';

/** Real data only: rewards come from the database, the rest from backend functions. Sections hide themselves when empty. */
export default function HomeExtras({ rewards, bal }) {
  const [ann, setAnn] = useState([]);
  useEffect(() => { call('get_announcements').then((r) => { if (!r.error && r.data && r.data.items) setAnn(r.data.items); }); }, []);
  const feat = (rewards || []).slice().sort((a, b) => (isFeatured(b) - isFeatured(a)) || (isNew(b) - isNew(a)) || a.cost_points - b.cost_points).slice(0, 4);
  return (
    <>
      {ann.length > 0 && (
        <section className="stack">
          <h2><Megaphone size={18} style={{ verticalAlign: '-3px' }} /> Announcements</h2>
          {ann.slice(0, 3).map((a) => (
            <div key={a.id} className="card stack" style={{ gap: 6 }}>
              <div className="row between"><h3>{a.title}</h3>{a.kind && <span className="tagline gold">{a.kind}</span>}</div>
              {a.body && <p className="dim">{a.body}</p>}
              {a.link && <Link to={a.link} className="btn sm" style={{ alignSelf: 'flex-start' }}>Learn more<ArrowRight size={14} /></Link>}
            </div>
          ))}
        </section>
      )}
      {feat.length > 0 && (
        <section className="stack">
          <div className="sec-h"><h2>Featured rewards</h2><Link to="/exchange" className="small gold-text" style={{ fontWeight: 700 }}>View catalog</Link></div>
          <div className="cats">
            {feat.map((r) => (
              <Link key={r.id} to={'/exchange?c=' + encodeURIComponent(catName(r))} className="card fr" style={soldOut(r) ? { opacity: 0.6 } : undefined}>
                {r.image_url ? <img className="rimg" src={r.image_url} alt="" loading="lazy" /> : <div className="rimg ph"><Sparkles size={26} /></div>}
                <h3>{r.name}</h3>
                <p className="gold-text" style={{ fontWeight: 800 }}>{pts(r.cost_points)} pts</p>
                <p className="small dim">{soldOut(r) ? 'Out of stock' : r.stock !== null && r.stock !== undefined ? r.stock + ' left' : bal >= r.cost_points ? 'You can redeem this' : pts(r.cost_points - bal) + ' pts to go'}</p>
                {(isFeatured(r) || isNew(r)) && <span className={'tagline ' + (isFeatured(r) ? 'gold' : 'ok')}>{isFeatured(r) ? 'Featured' : 'New'}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="stack">
        <div className="sec-h"><h2>Missions</h2><Link to="/missions" className="small gold-text" style={{ fontWeight: 700 }}>See all</Link></div>
        <MissionList limit={3} showTabs={false} />
      </section>
      <section className="stack">
        <div className="sec-h"><h2>Top members</h2></div>
        <Leaderboard limit={5} compact />
      </section>
    </>
  );
}
