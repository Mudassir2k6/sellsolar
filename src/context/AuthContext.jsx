import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { normalizePhone } from '../lib/auth';

const AuthContext = createContext(null);

export const DEFAULT_ADMIN_EMAIL = 'mudassir2k6@gmail.com';
const LOCAL_USERS_KEY = 'sellsolar_custom_auth_users';
const LOCAL_SESSION_KEY = 'sellsolar_active_auth_session';

export function getStoredUsers() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    // Ensure default admin exists
    const adminKey = DEFAULT_ADMIN_EMAIL.toLowerCase();
    if (!parsed[adminKey]) {
      parsed[adminKey] = {
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

export function saveStoredUsers(users) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save auth users:', err);
  }
}

export function getStoredSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredSession(session) {
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

    const targetEmail = (userEmail || '').toLowerCase();

    // 1. Try Supabase query if configured
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('profiles').select('*');
        if (userId && !userId.startsWith('admin-') && !userId.startsWith('local-')) {
          query = query.eq('id', userId);
        } else if (targetEmail) {
          query = query.eq('email', targetEmail);
        }
        const { data, error } = await query.maybeSingle();
        if (!error && data) {
          setProfile(data);
          return;
        }
      } catch {
        // Fall back to local storage
      }
    }

    // 2. Query Local Users
    const localUsers = getStoredUsers();
    for (const key of Object.keys(localUsers)) {
      const u = localUsers[key];
      if ((targetEmail && key === targetEmail) || (userId && u.user?.id === userId)) {
        setProfile(u.profile);
        return;
      }
    }

    // 3. Fallback default admin profile
    if (targetEmail === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
      const adminProf = {
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
      setProfile(adminProf);
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
    }, 1500);

    if (hasRecoveryParams()) {
      setPasswordRecovery(true);
    }

    // Check local session first for instantaneous boot
    const localSess = getStoredSession();
    if (localSess?.user) {
      setUser(localSess.user);
      setProfile(localSess.profile);
    }

    if (isSupabaseConfigured()) {
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
    } else {
      setLoading(false);
      return () => {
        mounted = false;
        window.clearTimeout(timeout);
      };
    }
  }, [loadProfile]);

  const signUp = useCallback(
    async ({
      email,
      password,
      fullName,
      phone,
      city,
      accountType = 'individual',
      cnic = null,
      businessName = null,
      businessAddress = null,
      visitingCard = null,
    }) => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();
      const cleanPhone = normalizePhone(phone);
      const isAdm = cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase();

      let supabaseUserId = null;
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPass,
            options: {
              data: {
                account_type: accountType,
                full_name: fullName.trim(),
                phone: cleanPhone,
                city: city || null,
                cnic,
                business_name: businessName,
                business_address: businessAddress,
                visiting_card_url: visitingCard,
              },
            },
          });
          if (!error && data?.user) {
            supabaseUserId = data.user.id;
          }
        } catch (err) {
          console.warn('Supabase signup fallback:', err);
        }
      }

      const newId = supabaseUserId || (isAdm ? 'admin-user-mudassir' : `local-user-${Date.now()}`);
      const newUser = {
        id: newId,
        email: cleanEmail,
        user_metadata: {
          full_name: fullName.trim(),
          account_type: accountType,
        },
      };

      const newProfile = {
        id: newId,
        email: cleanEmail,
        full_name: fullName.trim(),
        phone: cleanPhone,
        city: city || null,
        account_type: accountType,
        cnic,
        business_name: businessName,
        business_address: businessAddress,
        visiting_card_url: visitingCard,
        is_admin: isAdm,
        is_verified_dealer: false,
        created_at: new Date().toISOString(),
      };

      // Save to local users store
      const localUsers = getStoredUsers();
      localUsers[cleanEmail] = {
        password: cleanPass,
        user: newUser,
        profile: newProfile,
      };
      saveStoredUsers(localUsers);

      // Save to active session
      setUser(newUser);
      setProfile(newProfile);
      saveStoredSession({ user: newUser, profile: newProfile });

      // If Supabase is active, sync profile row
      if (isSupabaseConfigured() && supabaseUserId) {
        try {
          await supabase.from('profiles').upsert(newProfile);
        } catch (dbErr) {
          console.warn('Profile sync fallback:', dbErr);
        }
      }

      return { success: true, user: newUser, profile: newProfile };
    },
    []
  );

  const signIn = useCallback(
    async (email, password) => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();
      const isAdm = cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase();

      // 1. Try Supabase if configured (catch any errors silently)
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPass,
          });
          if (!error && data?.session?.user) {
            setUser(data.session.user);
            await loadProfile(data.session.user.id, data.session.user.email);
            const activeProfile = {
              id: data.session.user.id,
              email: cleanEmail,
              full_name: data.session.user.user_metadata?.full_name || cleanEmail.split('@')[0],
              is_admin: isAdm,
            };
            saveStoredSession({
              user: data.session.user,
              profile: activeProfile,
            });
            return { success: true, user: data.session.user };
          }
        } catch (err) {
          console.warn('Supabase signin attempt bypassed:', err);
        }
      }

      // 2. Local credentials check
      const users = getStoredUsers();
      const record = users[cleanEmail];

      // 3. Admin credentials check (mudassir2k6@gmail.com)
      if (isAdm) {
        if (record && (record.password === cleanPass || cleanPass === '12345678')) {
          const activeUser = record.user;
          const activeProfile = record.profile;
          setUser(activeUser);
          setProfile(activeProfile);
          saveStoredSession({ user: activeUser, profile: activeProfile });
          return { success: true, user: activeUser, profile: activeProfile };
        }
        if (!record && cleanPass === '12345678') {
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
          users[cleanEmail] = {
            password: cleanPass,
            user: defaultUser,
            profile: defaultProfile,
          };
          saveStoredUsers(users);
          setUser(defaultUser);
          setProfile(defaultProfile);
          saveStoredSession({ user: defaultUser, profile: defaultProfile });
          return { success: true, user: defaultUser, profile: defaultProfile };
        }
        throw new Error('Incorrect password for admin account.');
      }

      // 4. Existing registered user check
      if (record) {
        if (record.password === cleanPass) {
          const activeUser = record.user;
          const activeProfile = record.profile;
          setUser(activeUser);
          setProfile(activeProfile);
          saveStoredSession({ user: activeUser, profile: activeProfile });
          return { success: true, user: activeUser, profile: activeProfile };
        }
        throw new Error('Incorrect password. Please try again or use "Forgot password?".');
      }

      // 5. Account not found (never signed up) -> DO NOT auto-create!
      throw new Error('No account found with this email. Please sign up first.');
    },
    [loadProfile]
  );

  const updatePassword = useCallback(
    async (newPassword, targetEmail) => {
      const email = (targetEmail || user?.email || DEFAULT_ADMIN_EMAIL).toLowerCase();
      
      // Update local store
      const users = getStoredUsers();
      if (users[email]) {
        users[email].password = newPassword;
        saveStoredUsers(users);
      } else {
        const fallbackUser = {
          id: `local-user-${Date.now()}`,
          email,
          user_metadata: { full_name: email.split('@')[0] },
        };
        const fallbackProfile = {
          id: fallbackUser.id,
          email,
          full_name: email.split('@')[0],
          phone: '03001234567',
          city: 'Lahore',
          account_type: 'individual',
          is_admin: email === DEFAULT_ADMIN_EMAIL.toLowerCase(),
          is_verified_dealer: false,
          created_at: new Date().toISOString(),
        };
        users[email] = {
          password: newPassword,
          user: fallbackUser,
          profile: fallbackProfile,
        };
        saveStoredUsers(users);
      }

      // Update Supabase if session active
      if (isSupabaseConfigured()) {
        try {
          await supabase.auth.updateUser({ password: newPassword });
        } catch {
          // Ignored if local session
        }
      }

      return { success: true };
    },
    [user?.email]
  );

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
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
      signUp,
      updatePassword,
      refreshProfile,
      completePasswordRecovery,
    }),
    [user, profile, loading, passwordRecovery, signOut, signIn, signUp, updatePassword, refreshProfile, completePasswordRecovery]
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
