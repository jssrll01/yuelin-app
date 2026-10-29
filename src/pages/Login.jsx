import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Crown, Lock, LogIn, Mail } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { Field, Msg } from '../components/Ui.jsx';

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (session) nav(loc.state?.from || '/', { replace: true }); }, [session]); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!email.trim() || !password) return setErr('Enter your email address and password.');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (error) setErr(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message);
  };
  return (
    <form onSubmit={submit} className="card stack" style={{ maxWidth: 440, margin: '20px auto' }}>
      <div className="center"><div className="crest"><Crown size={28} /></div><p className="eyebrow">WELCOME BACK</p><h1>Sign in</h1><p className="dim">Access your points and rewards.</p></div>
      <Msg>{err}</Msg>
      <Field label="Email address" icon={Mail} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="Password" icon={Lock} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="btn gold block" disabled={busy}><LogIn size={18} />{busy ? 'Signing in…' : 'Sign in'}</button>
      <p className="center dim">New to YUÉLÍN? <Link to="/register" className="gold-text" style={{ fontWeight: 700 }}>Create an account</Link></p>
    </form>
  );
}
