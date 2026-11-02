import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Star, X } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { when } from '../format.js';
import { call } from '../lib/yl.js';
import { Msg, PageTitle, Spinner } from '../components/Ui.jsx';

const CLOUD = import.meta.env.VITE_CLD_CLOUD || 'bvw3okdf';
const PRESET = 'yuelin_reviews';
const MAX_MB = 8;

async function upload(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', PRESET);
  const r = await fetch('https://api.cloudinary.com/v1_1/' + CLOUD + '/image/upload', { method: 'POST', body: fd });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.secure_url) throw new Error((j.error && j.error.message) || 'Photo upload failed');
  return j.secure_url;
}

// Whole stars only now
function Stars({ value, onChange, size = 30 }) {
  return (
    <div className="row" style={{ gap: 2 }} role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => {
        const full = value >= n;
        return (
          <span key={n} style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
            <Star size={size} color="#d4af37" fill={full ? '#d4af37' : 'none'} />
            {onChange && (
              <button type="button" aria-label={n + ' stars'} onClick={() => onChange(n)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
            )}
          </span>
        );
      })}
    </div>
  );
}

function ReviewCard({ review, isMine }) {
  return (
    <div className="card stack">
      <div className="row between">
        <Stars value={Number(review.rating)} size={20} />
        <span className={'tagline ' + (review.status === 'active' ? 'ok' : 'hot')}>
          {review.status === 'active' ? 'Active' : 'Hidden'}
        </span>
      </div>
      <p>{review.body}</p>
      <div className="grid3">
        {review.photos.map((u) => <img key={u} className="rimg" src={u} alt="Review" loading="lazy" />)}
      </div>
      <p className="dim small">
        {isMine ? 'You' : 'Member'} · Posted {when(review.created_at)}
        {isMine && review.bonus_points > 0 ? ' · +' + review.bonus_points + ' bonus points' : ''}
      </p>
      {isMine && review.status !== 'active' && (
        <p className="small dim">This review is not active, so rewards are locked. Please contact support.</p>
      )}
    </div>
  );
}

export default function Review() {
  const { session, refresh } = useAuth();
  const [reviews, setReviews] = useState(undefined);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    // Fetch ALL reviews. The new RLS policy allows this.
    const { data } = await supabase.from('member_reviews').select('*').order('created_at', { ascending: false });
    setReviews(data || []);
  };
  useEffect(() => { load(); }, []);
  
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  if (reviews === undefined) return <Spinner />;

  // Find my review and separate the global feed
  const myId = session?.user?.id;
  const mine = reviews.find(r => r.user_id === myId);
  const others = reviews.filter(r => r.user_id !== myId);

  const addFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    const bad = picked.find((f) => !f.type.startsWith('image/') || f.size > MAX_MB * 1048576);
    if (bad) return setErr('Photos must be images under ' + MAX_MB + ' MB.');
    setErr('');
    setFiles((cur) => [...cur, ...picked].slice(0, 5));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErr('');
    if (!rating) return setErr('Choose a star rating.');
    if (body.trim().length < 10) return setErr('Write at least 10 characters.');
    if (files.length !== 5) return setErr('Please add exactly 5 photos.');
    setBusy(true);
    try {
      const urls = await Promise.all(files.map(upload));
      const r = await call('submit_review', { p_rating: rating, p_body: body, p_photos: urls });
      if (r.error) throw new Error(r.data && r.data.error ? r.data.error : 'Could not save your review.');
      refresh(); await load();
    } catch (x) { setErr(x.message || 'Something went wrong.'); }
    setBusy(false);
  };

  return (
    <div className="stack" style={{ paddingBottom: 40 }}>
      <PageTitle icon={Star} eyebrow="REVIEWS" title="Community Reviews" sub="Read what others are saying, or write your own to unlock rewards." />

      {/* My Section */}
      <h3 style={{ marginTop: 16, marginBottom: 8 }}>Your Review</h3>
      {mine ? (
        <div className="stack">
          <ReviewCard review={mine} isMine={true} />
          <div className="row" style={{ marginTop: 8 }}>
            <Link to="/exchange" className="btn gold" style={{ flex: 1 }}>Browse rewards</Link>
          </div>
        </div>
      ) : (
        <form className="card stack" onSubmit={submit}>
          <p className="dim small">Required before your first redemption. One review per account, and it can't be edited later.</p>
          <Msg>{err}</Msg>
          <div className="field">
            <label>Your rating</label>
            <Stars value={rating} onChange={setRating} />
            <p className="dim small">{rating ? rating + ' / 5' : 'Tap a star'}{rating === 5 ? ' · earns 30 bonus points' : ''}</p>
          </div>
          <div className="field">
            <label htmlFor="rv">Your review</label>
            <div className="input">
              <textarea id="rv" rows={4} maxLength={1000} value={body} onChange={(e) => setBody(e.target.value)} style={{ flex: 1, padding: '12px 0', background: 'none', border: 0, color: 'inherit', font: 'inherit', outline: 'none' }} placeholder="Tell us about your experience" />
            </div>
          </div>
          <div className="field">
            <label>Photos ({files.length}/5, all 5 required)</label>
            <div className="grid3">
              {previews.map((u, i) => (
                <div key={u} style={{ position: 'relative' }}>
                  <img className="rimg" src={u} alt="" />
                  <button type="button" className="icon-btn" aria-label="Remove photo" style={{ position: 'absolute', top: 4, right: 4, width: 30, height: 30 }} onClick={() => setFiles((c) => c.filter((_, k) => k !== i))}><X size={14} /></button>
                </div>
              ))}
              {files.length < 5 && <label className="rimg ph" style={{ cursor: 'pointer' }}><Camera size={26} /><input type="file" accept="image/*" multiple hidden onChange={addFiles} /></label>}
            </div>
          </div>
          <button className="btn gold block" disabled={busy}>{busy ? 'Uploading and saving…' : 'Submit review'}</button>
        </form>
      )}

      {/* Global Feed Section */}
      <h3 style={{ marginTop: 32, marginBottom: 8 }}>Recent Reviews</h3>
      {others.length === 0 ? (
        <p className="dim">No other reviews yet.</p>
      ) : (
        <div className="stack">
          {others.map(r => <ReviewCard key={r.id} review={r} isMine={false} />)}
        </div>
      )}
    </div>
  );
}
