import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

function hasRecoveryParams() {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash?.replace(/^#/, '') || '';
  const search = window.location.search?.replace(/^\?/, '') || '';
  const params = new URLSearchParams(hash.includes('type=') ? hash : search);
  return params.get('type') === 'recovery';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(() => hasRecoveryParams());

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }

    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      setProfile(data);
    } catch {
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async (userId) => {
    const id = userId || user?.id;
    await loadProfile(id);
  }, [loadProfile, user?.id]);

  const completePasswordRecovery = useCallback(() => {
    setPasswordRecovery(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const timeout = window.setTimeout(() => {
      if (mounted) setLoading(false);
    }, 4000);

    if (hasRecoveryParams()) {
      setPasswordRecovery(true);
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          return loadProfile(session.user.id).finally(() => {
            if (mounted) setLoading(false);
          });
        }
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    let subscription = { unsubscribe() {} };
    try {
      const result = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setPasswordRecovery(true);
        }
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      });
      subscription = result.data.subscription;
    } catch {
      if (mounted) setLoading(false);
    }

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPasswordRecovery(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      passwordRecovery,
      signOut,
      refreshProfile,
      completePasswordRecovery,
    }),
    [user, profile, loading, passwordRecovery, signOut, refreshProfile, completePasswordRecovery]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
