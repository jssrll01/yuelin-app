import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (userId) => {
    if (!userId) { setProfile(null); setUnread(0); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfile(data || null);
    const { count } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('is_read', false);
    setUnread(count || 0);
  }, []);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => { setSession(data.session); return load(data.session?.user.id); })
      .finally(() => setLoading(false));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setTimeout(() => load(s?.user.id), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const refresh = useCallback(() => load(session?.user.id), [load, session]);
  const signOut = async () => { await supabase.auth.signOut(); };

  return <Ctx.Provider value={{ session, profile, unread, loading, refresh, signOut }}>{children}</Ctx.Provider>;
}
