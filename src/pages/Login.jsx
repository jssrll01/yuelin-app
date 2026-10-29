import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Crown, Loader2, Lock, LogIn, Mail } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { Field, Msg } from '../components/Ui.jsx';
import BackButton from '../components/BackButton.jsx';

const friendly = (m) => (/invalid login/i.test(m) ? 'Incorrect email or password.'
  : /not confirmed/i.test(m) ? 'This account is not activated yet. Please contact support.'
  : /rate limit|too many/i.test(m) ? 'Too many attempts. Please wait a moment and try again.' : m);

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { session } = useAuth();
  const [email, setEmail] = useState((loc.state && loc.state.email) || '');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const notice = (loc.state && loc.state.notice) || '';
  useEffect(() => { if (session) nav((loc.state && loc.state.from) || '/', { replace: true }); }, [session]); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErr('');
    if (!email.trim() || !password) return setErr('Enter your email address and password.');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (error) setErr(friendly(error.message));
  };
  return (
    <form onSubmit={submit} className="card stack" style={{ maxWidth: 440, margin: '12px auto' }}>
      <BackButton />
      <div className="center"><div className="crest"><Crown size={28} /></div><p className="eyebrow">WELCOME BACK</p><h1>Sign in</h1><p className="dim">Access your points and rewards.</p></div>
      <Msg kind="good">{notice}</Msg>
      <Field label="Email address" icon={Mail} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="Password" icon={Lock} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Msg>{err}</Msg>
      <button className="btn gold block" disabled={busy}>{busy ? <Loader2 size={18} className="spin" /> : <LogIn size={18} />}{busy ? 'Signing in…' : 'Sign in'}</button>
      <p className="center dim">New to YUÉLÍN? <Link to="/register" className="gold-text" style={{ fontWeight: 700 }}>Create an account</Link></p>
    </form>
  );
}
