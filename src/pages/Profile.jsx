import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AtSign, Building2, Download, History, Home, LogOut, Mail, MapPin, Phone, Save, User } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { cleanPhone, peso, phoneOk, pts, when } from '../format.js';
import { Field, Msg, PageTitle, Spinner } from '../components/Ui.jsx';
import { useInstall } from '../components/InstallPrompt.jsx';

export default function Profile() {
  const nav = useNavigate();
  const { profile, refresh, signOut } = useAuth();
  const inst = useInstall();
  const [f, setF] = useState(null);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (profile) setF({ first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone }); }, [profile]);
  if (!profile || !f) return <Spinner />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setErr(''); setOk('');
    if (!f.first_name.trim() || !f.last_name.trim()) return setErr('Please fill in every field.');
    if (!phoneOk(f.phone)) return setErr('Enter a valid phone number.');
    setBusy(true);
    const { error } = await supabase.from('profiles').update({ ...f, phone: cleanPhone(f.phone) }).eq('id', profile.id);
    setBusy(false);
    if (error) return setErr(error.message);
    setOk('Profile updated.'); refresh();
  };
  const hide = async (on) => {
    setErr(''); setOk('');
    const { error } = await supabase.from('profiles').update({ hide_from_leaderboard: on }).eq('id', profile.id);
    if (error) return setErr('Could not save your privacy setting.');
    refresh();
  };
  const out = async () => { await signOut(); nav('/'); };

  return (
    <div className="stack">
      <PageTitle icon={User} eyebrow={profile?.is_vip || profile?.tier === "vip" ? "VIP MEMBER" : "MEMBER"} title={profile.first_name + ' ' + profile.last_name} sub={'@' + profile.username + ' · Member since ' + when(profile.created_at).split(',')[0]} />
      <div className="card wallet row between">
        <div><p className="eyebrow">BALANCE</p><p className="big gold-text">{pts(profile.points)}</p><p className="dim">{peso(profile.points)}</p></div>
        <button className="btn sm" onClick={() => nav('/history')}><History size={16} />History</button>
      </div>
      <form onSubmit={save} className="card stack">
        <h2>Details</h2>
        <Msg>{err}</Msg><Msg kind="good">{ok}</Msg>
        <div className="grid2">
          <Field label="Username" icon={AtSign} value={profile.username} ro />
          <Field label="Email address" icon={Mail} value={profile.email} ro />
        </div>
        <div className="grid2">
          <Field label="First name" icon={User} value={f.first_name} onChange={set('first_name')} />
          <Field label="Last name" icon={User} value={f.last_name} onChange={set('last_name')} />
        </div>
        <Field label="Phone number" icon={Phone} type="tel" value={f.phone} onChange={set('phone')} />
        <button className="btn gold" disabled={busy}><Save size={18} />{busy ? 'Saving…' : 'Save changes'}</button>
      </form>
      <div className="card stack">
        <h2>Privacy</h2>
        <label className="row between small"><span>Hide me from the public leaderboard</span><input type="checkbox" checked={!!profile.hide_from_leaderboard} onChange={(e) => hide(e.target.checked)} /></label>
        <p className="dim small">Only your username and points are ever shown on the leaderboard. Never your email or phone.</p>
      </div>
      <div className="card stack">
        <h2>App</h2>
        {inst.standalone && <p className="dim">YUÉLÍN is installed on this device.</p>}
        {!inst.standalone && inst.canPrompt && <button className="btn gold" onClick={inst.install}><Download size={18} />Install YUÉLÍN</button>}
        {!inst.standalone && !inst.canPrompt && (
          <p className="dim">{inst.ios ? 'In Safari, tap Share, then Add to Home Screen.' : 'Open your browser menu and choose Install app or Add to Home screen.'}</p>
        )}
      </div>
      <button className="btn ghost" onClick={out}><LogOut size={18} />Sign out</button>
    </div>
  );
}
