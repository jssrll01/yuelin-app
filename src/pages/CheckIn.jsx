import { useCallback, useEffect, useState } from 'react';
import { CalendarCheck, Check, Gift, Lock } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { pts, when } from '../format.js';
import { Empty, Msg, PageTitle, Spinner } from '../components/Ui.jsx';

const ERR = {
  already_claimed: 'You already checked in for today. Come back after the reset.',
  disabled: 'Daily check-in is paused right now.',
  not_authenticated: 'Please sign in again.',
  no_profile: 'Your profile could not be found.',
};

export default function CheckIn() {
  const { refresh } = useAuth();
  const [st, setSt] = useState(null);
  const [hist, setHist] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [fail, setFail] = useState('');

  const load = useCallback(async () => {
    const a = await supabase.rpc('get_checkin_status');
    if (a.error || !a.data || !a.data.ok) { setFail((a.error && a.error.message) || 'Could not load check-in.'); setSt({}); return; }
    setFail(''); setSt(a.data);
    const h = await supabase.from('daily_checkins').select('id,cycle_day,claimed_at,points_awarded,is_vip').order('claimed_at', { ascending: false }).limit(30);
    setHist(h.data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function claim() {
    if (busy) return;
    setBusy(true); setMsg(null);
    const r = await supabase.rpc('claim_checkin');
    setBusy(false);
    if (r.error) { setMsg({ kind: 'bad', text: 'Something went wrong. Please try again.' }); return; }
    if (!r.data.ok) { setMsg({ kind: 'bad', text: ERR[r.data.error] || 'Check-in failed.' }); await load(); return; }
    setMsg({ kind: 'good', text: 'Checked in for Day ' + r.data.cycle_day + '! +' + pts(r.data.points) + ' points added.' });
    await load();
    if (refresh) refresh();
  }

  if (!st) return <Spinner />;
  const days = st.days || [];
  const reset = st.next_reset_at ? new Date(st.next_reset_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' }) : '';
  return (
    <div className="stack">
      <PageTitle icon={CalendarCheck} eyebrow="DAILY" title="Daily check-in" sub="Check in every day to keep your streak going." />
      <Msg kind={fail ? 'bad' : msg && msg.kind}>{fail || (msg && msg.text)}</Msg>
      {days.length > 0 && (
        <section className="card stack">
          <div className="row between"><b>Day {st.claimed_today ? st.progress : Math.min(7, st.next_day)} of 7</b><span className="dim small">{st.progress}/7 claimed</span></div>
          <div className="bar"><i style={{ width: (st.progress / 7) * 100 + '%' }} /></div>
          <div className="ci-grid">
            {days.map((d) => (
              <div key={d.day} className={'ci-day ' + d.state}>
                <small>Day {d.day}</small>
                {d.state === 'claimed' ? <Check size={22} /> : d.state === 'today' ? <Gift size={22} /> : <Lock size={18} />}
                <small>{d.state === 'claimed' ? 'Claimed' : d.state === 'today' ? 'Today' : 'Locked'}</small>
              </div>
            ))}
          </div>
          {st.claimed_today
            ? <p className="small dim">You are checked in. Next check-in opens at <b>{reset}</b> (Philippine time).</p>
            : <button type="button" className="btn gold block" onClick={claim} disabled={busy || !st.enabled}>{busy ? 'Claiming…' : 'Claim Day ' + st.next_day}</button>}
          <p className="small dim">The day resets at 1:00 AM Philippine time. Miss a day and the streak restarts at Day 1.</p>
        </section>
      )}
      <section className="card list">
        <h3>Check-in history</h3>
        {!hist.length && <Empty icon={CalendarCheck} title="No check-ins yet" text="Your claimed days will be listed here." />}
        {hist.map((h) => (
          <div key={h.id} className="row between">
            <div><b>Day {h.cycle_day}</b>{h.is_vip ? ' · VIP' : ''}<p className="dim small">{when(h.claimed_at)}</p></div>
            <b className="up">+{pts(h.points_awarded)}</b>
          </div>
        ))}
      </section>
    </div>
  );
}
