import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const DEFAULT_ADMIN_EMAIL = 'mudassir2k6@gmail.com';
const LOCAL_USERS_KEY = 'sellsolar_custom_auth_users';
const LOCAL_SESSION_KEY = 'sellsolar_active_auth_session';

function getStoredUsers() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    // Ensure default admin exists
    if (!parsed[DEFAULT_ADMIN_EMAIL.toLowerCase()]) {
      parsed[DEFAULT_ADMIN_EMAIL.toLowerCase()] = {
        password: '12345678',
        user: {
          id: 'admin-user-mudassir',
          email: DEFAULT_ADMIN_EMAIL,
          user_metadata: { full_name: 'Mudassir (Admin)' },
        },
        profile: {
          id: 'admin-user-mudassir',
          email: DEFAULT_ADMIN_EMAIL,
          full_name: 'Mudassir (Admin)',
          phone: '03001234567',
          city: 'Lahore',
          account_type: 'individual',
          is_admin: true,
          is_verified_dealer: false,
          created_at: '2026-01-01T00:00:00Z',
        },
      };
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return {
      [DEFAULT_ADMIN_EMAIL.toLowerCase()]: {
        password: '12345678',
        user: {
          id: 'admin-user-mudassir',
          email: DEFAULT_ADMIN_EMAIL,
          user_metadata: { full_name: 'Mudassir (Admin)' },
        },
        profile: {
          id: 'admin-user-mudassir',
          email: DEFAULT_ADMIN_EMAIL,
          full_name: 'Mudassir (Admin)',
          phone: '03001234567',
          city: 'Lahore',
          account_type: 'individual',
          is_admin: true,
          is_verified_dealer: false,
          created_at: '2026-01-01T00:00:00Z',
        },
      },
    };
  }
}

function saveStoredUsers(users) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save auth users:', err);
  }
}

function getStoredSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredSession(session) {
  if (typeof window === 'undefined') return;
  try {
    if (session) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch (err) {
    console.error('Failed to save auth session:', err);
  }
}

function hasRecoveryParams() {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash?.replace(/^#/, '') || '';
  const search = window.location.search?.replace(/^\?/, '') || '';
  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(search);
  
  return (
    hashParams.get('type') === 'recovery' ||
    searchParams.get('type') === 'recovery' ||
    hashParams.get('type') === 'invite' ||
    searchParams.get('type') === 'invite' ||
    Boolean(hashParams.get('access_token') && hashParams.get('type') === 'recovery')
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(() => hasRecoveryParams());

  const loadProfile = useCallback(async (userId, userEmail) => {
    if (!userId && !userEmail) {
      setProfile(null);
      return;
    }

    try {
      const email = userEmail?.toLowerCase();
      let query = supabase.from('profiles').select('*');
      if (userId && !userId.startsWith('admin-') && !userId.startsWith('local-')) {
        query = query.eq('id', userId);
      } else if (email) {
        query = query.eq('email', email);
      }
      const { data } = await query.maybeSingle();
      if (data) {
        setProfile(data);
        return;
      }
    } catch {
      // Fall back to local profile
    }

    const localUsers = getStoredUsers();
    const targetEmail = (userEmail || '').toLowerCase();
    for (const key of Object.keys(localUsers)) {
      const u = localUsers[key];
      if ((targetEmail && key === targetEmail) || (userId && u.user?.id === userId)) {
        setProfile(u.profile);
        return;
      }
    }

    if (targetEmail === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
      setProfile({
        id: 'admin-user-mudassir',
        email: DEFAULT_ADMIN_EMAIL,
        full_name: 'Mudassir (Admin)',
        phone: '03001234567',
        city: 'Lahore',
        account_type: 'individual',
        is_admin: true,
        is_verified_dealer: false,
        created_at: '2026-01-01T00:00:00Z',
      });
    }
  }, []);

  const refreshProfile = useCallback(async (userId) => {
    const id = userId || user?.id;
    const email = user?.email;
    await loadProfile(id, email);
  }, [loadProfile, user?.id, user?.email]);

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
    }, 3000);

    if (hasRecoveryParams()) {
      setPasswordRecovery(true);
    }

    // Check local session first for fast boot
    const localSess = getStoredSession();
    if (localSess?.user) {
      setUser(localSess.user);
      setProfile(localSess.profile);
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          loadProfile(session.user.id, session.user.email).finally(() => {
            if (mounted) setLoading(false);
          });
        } else if (!localSess?.user) {
          setUser(null);
          setProfile(null);
          if (mounted) setLoading(false);
        } else {
          if (mounted) setLoading(false);
        }
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
        if (session?.user) {
          setUser(session.user);
          loadProfile(session.user.id, session.user.email);
        } else {
          const currentLocal = getStoredSession();
          if (!currentLocal?.user) {
            setUser(null);
            setProfile(null);
          }
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

  const signIn = useCallback(async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Try Supabase
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });
      if (!error && data?.session?.user) {
        setUser(data.session.user);
        await loadProfile(data.session.user.id, data.session.user.email);
        saveStoredSession({
          user: data.session.user,
          profile: {
            id: data.session.user.id,
            email: cleanEmail,
            full_name: data.session.user.user_metadata?.full_name || 'User',
            is_admin: cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase(),
          },
        });
        return { success: true, user: data.session.user };
      }
    } catch {
      // Proceed to local fallback
    }

    // 2. Local credentials verification
    const users = getStoredUsers();
    const record = users[cleanEmail];

    if (record && record.password === cleanPass) {
      const activeUser = record.user;
      const activeProfile = record.profile;
      setUser(activeUser);
      setProfile(activeProfile);
      saveStoredSession({ user: activeUser, profile: activeProfile });
      return { success: true, user: activeUser, profile: activeProfile };
    }

    // 3. Fallback check for default admin
    if (cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() && cleanPass === '12345678') {
      const defaultUser = {
        id: 'admin-user-mudassir',
        email: DEFAULT_ADMIN_EMAIL,
        user_metadata: { full_name: 'Mudassir (Admin)' },
      };
      const defaultProfile = {
        id: 'admin-user-mudassir',
        email: DEFAULT_ADMIN_EMAIL,
        full_name: 'Mudassir (Admin)',
        phone: '03001234567',
        city: 'Lahore',
        account_type: 'individual',
        is_admin: true,
        is_verified_dealer: false,
        created_at: '2026-01-01T00:00:00Z',
      };
      setUser(defaultUser);
      setProfile(defaultProfile);
      saveStoredSession({ user: defaultUser, profile: defaultProfile });
      return { success: true, user: defaultUser, profile: defaultProfile };
    }

    throw new Error('Invalid email or password. Please check your credentials.');
  }, [loadProfile]);

  const updatePassword = useCallback(async (newPassword, targetEmail) => {
    const email = (targetEmail || user?.email || DEFAULT_ADMIN_EMAIL).toLowerCase();
    
    // Update local store
    const users = getStoredUsers();
    if (users[email]) {
      users[email].password = newPassword;
      saveStoredUsers(users);
    } else {
      users[email] = {
        password: newPassword,
        user: {
          id: `local-user-${Date.now()}`,
          email,
          user_metadata: { full_name: email.split('@')[0] },
        },
        profile: {
          id: `local-user-${Date.now()}`,
          email,
          full_name: email.split('@')[0],
          phone: '03001234567',
          city: 'Lahore',
          account_type: 'individual',
          is_admin: email === DEFAULT_ADMIN_EMAIL.toLowerCase(),
          is_verified_dealer: false,
          created_at: new Date().toISOString(),
        },
      };
      saveStoredUsers(users);
    }

    // Also update Supabase if user has an active Supabase session
    try {
      await supabase.auth.updateUser({ password: newPassword });
    } catch {
      // Ignored if local session
    }

    return { success: true };
  }, [user?.email]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    saveStoredSession(null);
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
      signIn,
      updatePassword,
      refreshProfile,
      completePasswordRecovery,
    }),
    [user, profile, loading, passwordRecovery, signOut, signIn, updatePassword, refreshProfile, completePasswordRecovery]
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

