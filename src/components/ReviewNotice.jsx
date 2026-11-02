import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { supabase } from '../supabase';

export default function ReviewNotice() {
  const [st, setSt] = useState(null);
  useEffect(() => {
    let d = false;
    supabase.from('member_reviews').select('status').maybeSingle().then(({ data, error }) => { if (!d) setSt(error ? 'err' : data ? data.status : 'none'); });
    return () => { d = true; };
  }, []);
  if (st === null || st === 'active' || st === 'err') return null;
  return (
    <div className="card stack" style={{ gap: 8 }}>
      <div className="row"><span className="ico"><Star size={20} /></span>
        <div style={{ flex: 1 }}>
          <h3>{st === 'hidden' ? 'Your review is not active' : 'Write a review to unlock rewards'}</h3>
          <p className="dim small">{st === 'hidden' ? 'Rewards are locked while your review is hidden. Please contact support.' : 'One short review with 5 photos is needed before your first redemption. A 5-star review earns 30 bonus points.'}</p>
        </div>
      </div>
      {st === 'none' && <Link to="/review" className="btn gold sm" style={{ alignSelf: 'flex-start' }}>Write a review</Link>}
    </div>
  );
}
