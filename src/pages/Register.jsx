import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AtSign, Building2, Crown, Home, Lock, Mail, MapPin, Phone, User, UserPlus } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { cleanPhone, phoneOk } from '../format.js';
import { Field, Msg } from '../components/Ui.jsx';

const blank = { username: '', first_name: '', last_name: '', phone: '', email: '', password: '', confirm: '', province: '', city: '', barangay: '' };

export default function Register() {
  const nav = useNavigate();
  const { session } = useAuth();
  const [f, setF] = useState(blank);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (session) nav('/', { replace: true }); }, [session]); // eslint-disable-line
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const validate = () => {
    if (!/^[A-Za-z0-9_]{3,20}$/.test(f.username)) return 'Username must be 3 to 20 letters, numbers or underscores.';
    if (!f.first_name.trim() || !f.last_name.trim()) return 'Enter your first and last name.';
    if (!phoneOk(f.phone)) return 'Enter a valid phone number (10 to 13 digits).';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return 'Enter a valid email address.';
    if (f.password.length < 6) return 'Password must be at least 6 characters.';
    if (f.password !== f.confirm) return 'Passwords do not match.';
    if (!f.province.trim() || !f.city.trim() || !f.barangay.trim()) return 'Enter your province, city/municipality and barangay.';
    return '';
  };
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setInfo('');
    const v = validate(); if (v) return setErr(v);
    setBusy(true);
    const { data: free, error: uErr } = await supabase.rpc('username_available', { p_username: f.username });
    if (uErr) { setBusy(false); return setErr('Could not check the username. Please try again.'); }
    if (!free) { setBusy(false); return setErr('That username is already taken.'); }
    const { data, error } = await supabase.auth.signUp({
      email: f.email.trim().toLowerCase(), password: f.password,
      options: { data: { username: f.username.trim(), first_name: f.first_name.trim(), last_name: f.last_name.trim(), phone: cleanPhone(f.phone), province: f.province.trim(), city: f.city.trim(), barangay: f.barangay.trim() } },
    });
    setBusy(false);
    if (error) return setErr(error.message);
    if (!data.session) setInfo('Account created. Check your email to confirm your address, then sign in.');
  };
  return (
    <form onSubmit={submit} className="card stack" style={{ maxWidth: 560, margin: '20px auto' }}>
      <div className="center"><div className="crest"><Crown size={28} /></div><p className="eyebrow">JOIN</p><h1>Create account</h1><p className="dim">Become a YUÉLÍN member.</p></div>
      <Msg>{err}</Msg><Msg kind="good">{info}</Msg>
      <h3 className="gold-text">Account</h3>
      <Field label="Username" icon={AtSign} autoComplete="username" value={f.username} onChange={set('username')} />
      <Field label="Email address" icon={Mail} type="email" autoComplete="email" value={f.email} onChange={set('email')} />
      <div className="grid2">
        <Field label="Password" icon={Lock} type="password" autoComplete="new-password" value={f.password} onChange={set('password')} />
        <Field label="Confirm password" icon={Lock} type="password" autoComplete="new-password" value={f.confirm} onChange={set('confirm')} />
      </div>
      <p className="dim small">Minimum of 6 characters.</p>
      <h3 className="gold-text">Personal</h3>
      <div className="grid2">
        <Field label="First name" icon={User} autoComplete="given-name" value={f.first_name} onChange={set('first_name')} />
        <Field label="Last name" icon={User} autoComplete="family-name" value={f.last_name} onChange={set('last_name')} />
      </div>
      <Field label="Phone number" icon={Phone} type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} />
      <h3 className="gold-text">Address</h3>
      <Field label="Province" icon={MapPin} value={f.province} onChange={set('province')} />
      <div className="grid2">
        <Field label="City / Municipality" icon={Building2} value={f.city} onChange={set('city')} />
        <Field label="Barangay" icon={Home} value={f.barangay} onChange={set('barangay')} />
      </div>
      <button className="btn gold block" disabled={busy}><UserPlus size={18} />{busy ? 'Creating…' : 'Create account'}</button>
      <p className="center dim">Already a member? <Link to="/login" className="gold-text" style={{ fontWeight: 700 }}>Sign in</Link></p>
    </form>
  );
}
