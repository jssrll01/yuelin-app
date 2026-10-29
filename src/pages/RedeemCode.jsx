import { useState } from 'react';
import { Ticket } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { peso, pts } from '../format.js';
import { Msg, PageTitle } from '../components/Ui.jsx';

export default function RedeemCode() {
  const { profile, refresh } = useAuth();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setOk('');
    if (!code.trim()) return setErr('Enter a code.');
    setBusy(true);
    const { data, error } = await supabase.rpc('redeem_code', { p_code: code });
    setBusy(false);
    if (error) return setErr('Something went wrong. Please try again.');
    if (!data.ok) return setErr(data.error);
    setOk('Success. ' + pts(data.points) + ' points (' + peso(data.points) + ') were added to your balance.');
    setCode(''); refresh();
  };
  return (
    <div className="stack">
      <PageTitle icon={Ticket} eyebrow="CODES" title="Redeem a code" sub="Turn a YUÉLÍN code into points." />
      <div className="card wallet"><p className="eyebrow">CURRENT BALANCE</p><p className="big gold-text">{pts(profile?.points)}</p><p className="dim">{peso(profile?.points)}</p></div>
      <form onSubmit={submit} className="card stack">
        <Msg>{err}</Msg><Msg kind="good">{ok}</Msg>
        <div className="field"><label htmlFor="code">Your code</label>
          <div className="input"><Ticket size={18} />
            <input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ENTER CODE" autoCapitalize="characters" autoComplete="off" spellCheck="false" style={{ letterSpacing: '.15em', fontWeight: 700 }} />
          </div>
        </div>
        <button className="btn gold block" disabled={busy}>{busy ? 'Checking…' : 'Redeem'}</button>
      </form>
      <div className="card stack">
        <h3>Good to know</h3>
        <ul className="dim" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Each code can be redeemed once per account.</li>
          <li>Some codes expire or have limited uses.</li>
          <li>Points are added instantly and appear in your history.</li>
          <li>Too many wrong attempts will pause redemption for a few minutes.</li>
        </ul>
      </div>
    </div>
  );
}
