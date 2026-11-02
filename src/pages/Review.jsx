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

function Stars({ value, onChange, size = 30 }) {
  return (
    <div className="row" style={{ gap: 2 }} role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => {
        const full = value >= n;
        const half = !full && value >= n - 0.5;
        return (
          <span key={n} style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
            <Star size={size} color="#d4af37" fill={full ? '#d4af37' : 'none'} />
            {half && <span style={{ position: 'absolute', inset: 0, width: '50%', overflow: 'hidden' }}><Star size={size} color="#d4af37" fill="#d4af37" /></span>}
            {onChange && (<>
              <button type="button" aria-label={(n - 0.5) + ' stars'} onClick={() => onChange(n - 0.5)} style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%' }} />
              <button type="button" aria-label={n + ' stars'} onClick={() => onChange(n)} style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%' }} />
            </>)}
          </span>
        );
      })}
    </div>
  );
}

export default function Review() {
  const { refresh } = useAuth();
  const [mine, setMine] = useState(undefined);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    const { data } = await supabase.from('member_reviews').select('*').maybeSingle();
    setMine(data || null);
  };
  useEffect(() => { load(); }, []);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  if (mine === undefined) return <Spinner />;

  if (mine) return (
    <div className="stack">
      <PageTitle icon={Star} eyebrow="REVIEW" title="Your review" sub="Thank you. Reviews can only be changed by our team." />
      <div className="card stack">
        <div className="row between"><Stars value={Number(mine.rating)} size={24} /><span className={'tagline ' + (mine.status === 'active' ? 'ok' : 'hot')}>{mine.status === 'active' ? 'Active' : 'Hidden'}</span></div>
        <p>{mine.body}</p>
        <div className="grid3">{mine.photos.map((u) => <img key={u} className="rimg" src={u} alt="Review" loading="lazy" />)}</div>
        <p className="dim small">Posted {when(mine.created_at)}{mine.bonus_points > 0 ? ' · +' + mine.bonus_points + ' bonus points' : ''}</p>
        {mine.status !== 'active' && <p className="small dim">This review is not active, so rewards are locked. Please contact support.</p>}
        <Link to="/exchange" className="btn gold" style={{ alignSelf: 'flex-start' }}>Browse rewards</Link>
      </div>
    </div>
  );

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
    <form className="stack" onSubmit={submit}>
      <PageTitle icon={Star} eyebrow="REVIEW" title="Write a review" sub="Required before your first redemption. One review per account, and it can't be edited later." />
      <div className="card stack">
        <Msg>{err}</Msg>
        <div className="field"><label>Your rating</label><Stars value={rating} onChange={setRating} /><p className="dim small">{rating ? rating + ' / 5' : 'Tap a star (half stars allowed)'}{rating === 5 ? ' · earns 30 bonus points' : ''}</p></div>
        <div className="field"><label htmlFor="rv">Your review</label>
          <div className="input"><textarea id="rv" rows={5} maxLength={1000} value={body} onChange={(e) => setBody(e.target.value)} style={{ flex: 1, padding: '12px 0', background: 'none', border: 0, color: 'inherit', font: 'inherit', outline: 'none' }} placeholder="Tell us about your experience" /></div>
        </div>
        <div className="field"><label>Photos ({files.length}/5, all 5 required)</label>
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
      </div>
    </form>
  );
}
