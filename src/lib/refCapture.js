import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { registerReferral } from './api.js';

const KEY = 'yl_ref';
const TTL = 30 * 24 * 3600 * 1000;
const OK = /^[A-Za-z0-9_]{3,20}$/;

export function refCode() {
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (o && OK.test(o.c) && Date.now() - o.t < TTL) return o.c;
    localStorage.removeItem(KEY);
  } catch (e) { /* storage unavailable */ }
  return '';
}
const save = (c) => { try { localStorage.setItem(KEY, JSON.stringify({ c, t: Date.now() })); } catch (e) { /* ignore */ } };
const clear = () => { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } };

export const refLink = (u) => window.location.origin + '/register?ref=' + encodeURIComponent(u);

// Captures ?ref=CODE on any page, keeps it for 30 days, and attaches it once the member is signed in.
// The server validates everything (self-referral, duplicates, eligibility); the client only passes the code.
export function useRefCapture() {
  const loc = useLocation();
  const { session } = useAuth();
  const uid = session && session.user ? session.user.id : null;
  useEffect(() => {
    const c = new URLSearchParams(loc.search).get('ref');
    if (c && OK.test(c)) save(c);
  }, [loc.search]);
  useEffect(() => {
    if (!uid) return undefined;
    const c = refCode();
    if (!c) return undefined;
    let dead = false;
    registerReferral(c).then((r) => {
      if (dead) return;
      if (r.error) return; // transport problem: keep the code and retry later
      clear();             // answered (accepted or refused): do not retry
    });
    return () => { dead = true; };
  }, [uid, loc.search]);
}
