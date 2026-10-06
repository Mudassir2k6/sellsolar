'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { normalizePhone, isValidPhone, digitsOnlyPhone, isValidEmail, isValidUuid, generateUuid } from '../lib/auth';
import {
  checkRateLimit,
  recordRateLimitAttempt,
  clearRateLimit,
  verifyAccountRecoveryCredentials,
  sanitizeText,
} from '../lib/security';

export const AuthContext = createContext(null);

export const DEFAULT_ADMIN_EMAIL = 'mudassir2k6@gmail.com';
export const DEFAULT_ADMIN_ID = '00000000-0000-4000-8000-000000000001';
const LOCAL_USERS_KEY = 'sellsolar_custom_auth_users';
const LOCAL_SESSION_KEY = 'sellsolar_active_auth_session';
export const LOCAL_DISABLED_USERS_KEY = 'sellsolar_disabled_users';
export const LOCAL_DELETED_USERS_KEY = 'sellsolar_deleted_users';
export const LOCAL_USER_PHONES_KEY = 'sellsolar_user_phones';

export function getDisabledUsers() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_DISABLED_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDisabledUsers(map) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_DISABLED_USERS_KEY, JSON.stringify(map || {}));
  } catch (err) {
    console.error('Failed to save disabled users:', err);
  }
}

export function getDeletedUsers() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_DELETED_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDeletedUsers(map) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_DELETED_USERS_KEY, JSON.stringify(map || {}));
  } catch (err) {
    console.error('Failed to save deleted users:', err);
  }
}

export function getUserPhonesMap() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_USER_PHONES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUserPhonesMap(map) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_USER_PHONES_KEY, JSON.stringify(map || {}));
  } catch (err) {
    console.error('Failed to save user phones map:', err);
  }
}

export function isAccountDisabled(userOrProfileOrEmail) {
  if (!userOrProfileOrEmail) return false;
  let email = '';
  let id = '';
  if (typeof userOrProfileOrEmail === 'string') {
    const val = userOrProfileOrEmail.trim().toLowerCase();
    if (val.includes('@')) {
      email = val;
    } else {
      id = val;
    }
  } else {
    email = (userOrProfileOrEmail.email || '').trim().toLowerCase();
    id = (userOrProfileOrEmail.id || '').trim().toLowerCase();
    if (userOrProfileOrEmail.is_disabled === true || userOrProfileOrEmail.status === 'disabled') {
      return true;
    }
  }

  if (
    email === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
    id === DEFAULT_ADMIN_ID.toLowerCase() ||
    email === 'mudassir2k6' ||
    id === 'mudassir2k6'
  ) {
    return false;
  }

  const disabledMap = getDisabledUsers();
  if (email && (disabledMap[email]?.is_disabled || disabledMap[email]?.disabled)) return true;
  if (id && (disabledMap[id]?.is_disabled || disabledMap[id]?.disabled)) return true;

  const localUsers = getStoredUsers();
  if (email && (localUsers[email]?.profile?.is_disabled || localUsers[email]?.is_disabled)) return true;
  if (id && (localUsers[id]?.profile?.is_disabled || localUsers[id]?.is_disabled)) return true;

  return false;
}

export function isAccountDeleted(userOrProfileOrEmail) {
  if (!userOrProfileOrEmail) return false;
  let email = '';
  let id = '';
  if (typeof userOrProfileOrEmail === 'string') {
    const val = userOrProfileOrEmail.trim().toLowerCase();
    if (val.includes('@')) {
      email = val;
    } else {
      id = val;
    }
  } else {
    email = (userOrProfileOrEmail.email || '').trim().toLowerCase();
    id = (userOrProfileOrEmail.id || '').trim().toLowerCase();
  }

  if (
    email === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
    id === DEFAULT_ADMIN_ID.toLowerCase() ||
    email === 'mudassir2k6' ||
    id === 'mudassir2k6'
  ) {
    return false;
  }

  const deletedMap = getDeletedUsers();
  if (email && deletedMap[email]) return true;
  if (id && deletedMap[id]) return true;
  return false;
}

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  DEALER: 'dealer',
  CUSTOMER: 'customer',
};

export function isUserAdmin(user, profile) {
  const email = (user?.email || profile?.email || user?.user_metadata?.email || '').toLowerCase();
  const username = (profile?.username || user?.user_metadata?.user_name || '').toLowerCase();
  if (
    email === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
    email === 'admin@sellsolar.pk' ||
    email === 'info@sellsolar.pk' ||
    email === 'mudassirkhan78907890@gmail.com' ||
    email === 'mudassir2k6@gmail.com' ||
    email === 'mudassir2k@yahoo.com' ||
    username === 'mudassir2k6' ||
    username === 'mudassir'
  ) {
    return true;
  }
  if (profile?.role === 'super_admin' || profile?.is_super_admin) return true;
  if (profile?.role === 'admin' || profile?.is_admin) return true;
  return false;
}

export function getUserRole(user, profile) {
  const email = (user?.email || profile?.email || user?.user_metadata?.email || '').toLowerCase();
  const username = (profile?.username || user?.user_metadata?.user_name || '').toLowerCase();
  if (
    email === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
    email === 'admin@sellsolar.pk' ||
    email === 'info@sellsolar.pk' ||
    email === 'mudassirkhan78907890@gmail.com' ||
    email === 'mudassir2k6@gmail.com' ||
    email === 'mudassir2k@yahoo.com' ||
    username === 'mudassir2k6' ||
    username === 'mudassir'
  ) {
    return USER_ROLES.SUPER_ADMIN;
  }
  if (profile?.role === 'super_admin' || profile?.is_super_admin) return USER_ROLES.SUPER_ADMIN;
  if (profile?.role === 'admin' || profile?.is_admin) return USER_ROLES.ADMIN;
  if (profile?.role === 'dealer' || profile?.account_type === 'dealer' || profile?.is_verified_dealer) return USER_ROLES.DEALER;
  return USER_ROLES.CUSTOMER;
}

export function migrateStoredListingsUserIds() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('sellsolar_custom_listings');
    if (!raw) return;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return;
    let changed = false;
    const migrated = list.map((item) => {
      if (item.user_id === 'admin-user-mudassir' || (item.user_id && !isValidUuid(item.user_id))) {
        changed = true;
        return {
          ...item,
          user_id: DEFAULT_ADMIN_ID,
        };
      }
      return item;
    });
    if (changed) {
      localStorage.setItem('sellsolar_custom_listings', JSON.stringify(migrated));
    }
  } catch (err) {
    console.warn('Listing migration error:', err);
  }
}

export function getStoredUsers() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    let modified = false;

    // Migrate any legacy non-UUID IDs (e.g. 'admin-user-mudassir' or 'local-user-...')
    for (const key of Object.keys(parsed)) {
      const entry = parsed[key];
      const isAdmKey = key.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
      if (!entry?.user?.id || !isValidUuid(entry.user.id) || entry.user.id === 'admin-user-mudassir') {
        const correctId = isAdmKey ? DEFAULT_ADMIN_ID : generateUuid();
        if (entry.user) entry.user.id = correctId;
        if (entry.profile) entry.profile.id = correctId;
        modified = true;
      }
      if (isAdmKey && entry?.profile) {
        if (!entry.profile.role || entry.profile.role !== 'super_admin') {
          entry.profile.role = 'super_admin';
          entry.profile.is_super_admin = true;
          modified = true;
        }
      }
    }

    // Ensure default admin exists with valid UUID and super_admin role
    const adminKey = DEFAULT_ADMIN_EMAIL.toLowerCase();
    if (!parsed[adminKey]) {
      parsed[adminKey] = {
        password: '12345678',
        user: {
          id: DEFAULT_ADMIN_ID,
          email: DEFAULT_ADMIN_EMAIL,
          user_metadata: { full_name: 'Mudassir (Super Admin)' },
        },
        profile: {
          id: DEFAULT_ADMIN_ID,
          email: DEFAULT_ADMIN_EMAIL,
          full_name: 'Mudassir (Super Admin)',
          phone: '03001234567',
          city: 'Lahore',
          account_type: 'admin',
          role: 'super_admin',
          is_super_admin: true,
          is_admin: true,
          is_verified_dealer: false,
          created_at: '2026-01-01T00:00:00Z',
        },
      };
      modified = true;
    }

    if (modified) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return {
      [DEFAULT_ADMIN_EMAIL.toLowerCase()]: {
        password: '12345678',
        user: {
          id: DEFAULT_ADMIN_ID,
          email: DEFAULT_ADMIN_EMAIL,
          user_metadata: { full_name: 'Mudassir (Admin)' },
        },
        profile: {
          id: DEFAULT_ADMIN_ID,
          email: DEFAULT_ADMIN_EMAIL,
          full_name: 'Mudassir (Admin)',
          phone: '03001234567',
          city: 'Lahore',
          account_type: 'admin',
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
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !session.user) return null;

    let modified = false;
    const userEmail = (session.user.email || '').toLowerCase();
    const isDefaultAdmin = userEmail === DEFAULT_ADMIN_EMAIL.toLowerCase();

    // Migrate any legacy non-UUID user id (e.g. 'admin-user-mudassir') to valid UUID
    if (!session.user.id || !isValidUuid(session.user.id) || session.user.id === 'admin-user-mudassir') {
      const fixedId = isDefaultAdmin ? DEFAULT_ADMIN_ID : generateUuid();
      session.user.id = fixedId;
      if (session.profile) {
        session.profile.id = fixedId;
      }
      modified = true;
    }

    if (modified) {
      saveStoredSession(session);
    }
    return session;
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
  const [loading, setLoading] = useState(() => typeof window !== 'undefined');
  const [passwordRecovery, setPasswordRecovery] = useState(() => hasRecoveryParams());

  const loadProfile = useCallback(async (userId, userEmail) => {
    if (!userId && !userEmail) {
      setProfile(null);
      return;
    }

    const targetEmail = (userEmail || '').toLowerCase();
    const phoneMap = getUserPhonesMap();

    // 1. Try Supabase query if configured
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('profiles').select('*');
        if (userId && isValidUuid(userId)) {
          query = query.eq('id', userId);
        } else if (targetEmail) {
          query = query.eq('email', targetEmail);
        }
        const { data, error } = await query.maybeSingle();
        if (!error && data) {
          // If remote phone is missing, try fallback from user_phones map
          if (!data.phone) {
            const fallbackPhone = phoneMap[targetEmail] || (userId ? phoneMap[userId] : '') || '';
            if (fallbackPhone) {
              data.phone = fallbackPhone;
              supabase.from('profiles').update({ phone: fallbackPhone }).eq('id', data.id).catch(() => {});
            }
          }
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
        if (!u.profile?.phone) {
          const fallbackPhone = phoneMap[targetEmail] || (userId ? phoneMap[userId] : '') || '';
          if (fallbackPhone && u.profile) {
            u.profile.phone = fallbackPhone;
          }
        }
        setProfile(u.profile);
        return;
      }
    }

    // 3. Fallback default admin profile
    if (targetEmail === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
      const adminProf = {
        id: DEFAULT_ADMIN_ID,
        email: DEFAULT_ADMIN_EMAIL,
        username: 'mudassir2k6',
        display_identifier: 'mudassir2k6',
        full_name: 'Mudassir (Admin)',
          phone: '03001234567',
          city: 'Lahore',
          account_type: 'admin',
        is_admin: true,
        is_verified_dealer: false,
        created_at: '2026-01-01T00:00:00Z',
      };
      setProfile(adminProf);
      return;
    }

    // 4. Fallback from current stored session if matching
    const currentSess = getStoredSession();
    if (currentSess?.profile && (currentSess.profile.id === userId || currentSess.profile.email?.toLowerCase() === targetEmail)) {
      setProfile(currentSess.profile);
      return;
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
    migrateStoredListingsUserIds();
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
            const userEmail = (session.user.email || '').toLowerCase();
            const userId = session.user.id;

            // Immediate security check for disabled or deleted accounts
            if (
              isAccountDeleted(userId) ||
              isAccountDeleted(userEmail) ||
              isAccountDisabled(userEmail) ||
              isAccountDisabled(userId)
            ) {
              supabase.auth.signOut();
              saveStoredSession(null);
              setUser(null);
              setProfile(null);
              return;
            }

            setUser(session.user);
            const metaName =
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] ||
              'User';
            const metaPhone =
              session.user.user_metadata?.phone ||
              getUserPhonesMap()[userEmail] ||
              getUserPhonesMap()[userId] ||
              '';
            const metaCity = session.user.user_metadata?.city || 'Lahore';
            const isOAuthAdmin = (session.user.email || '').toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() || (session.user.email || '').toLowerCase() === 'admin@sellsolar.pk';
            const metaAccountType = isOAuthAdmin ? 'admin' : (session.user.user_metadata?.account_type || 'individual');
            const metaCnic = session.user.user_metadata?.cnic || null;
            const metaBusinessName = session.user.user_metadata?.business_name || null;
            const metaBusinessAddress = session.user.user_metadata?.business_address || null;

            if (metaPhone) {
              const pMap = getUserPhonesMap();
              pMap[userEmail] = metaPhone;
              if (userId) pMap[userId] = metaPhone;
              saveUserPhonesMap(pMap);
            }

            const oauthProfile = {
              id: session.user.id,
              email: session.user.email,
              full_name: metaName,
              phone: metaPhone,
              city: metaCity,
              account_type: metaAccountType,
              role: isOAuthAdmin ? 'super_admin' : (metaAccountType === 'dealer' ? 'dealer' : 'customer'),
              is_super_admin: isOAuthAdmin,
              is_admin: isOAuthAdmin,
              cnic: metaCnic,
              business_name: metaBusinessName,
              business_address: metaBusinessAddress,
              is_verified_dealer: metaAccountType === 'dealer',
            };
            setProfile(oauthProfile);
            saveStoredSession({ user: session.user, profile: oauthProfile });
            // Email confirmation / OAuth return — mark local mirror confirmed
            if (session.user.email && (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY')) {
              const localUsers = getStoredUsers();
              const key = session.user.email.toLowerCase();
              if (localUsers[key]) {
                localUsers[key].emailConfirmed = true;
                if (!localUsers[key].profile?.phone && metaPhone) {
                  localUsers[key].profile.phone = metaPhone;
                }
                saveStoredUsers(localUsers);
              } else {
                localUsers[key] = {
                  profile: oauthProfile,
                  user: session.user,
                  emailConfirmed: true,
                };
                saveStoredUsers(localUsers);
              }
            }
            if (isSupabaseConfigured()) {
              const upsertData = {
                id: session.user.id,
                email: session.user.email,
                full_name: metaName,
                account_type: metaAccountType,
                is_verified_dealer: metaAccountType === 'dealer',
                is_admin: (session.user.email || '').toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase(),
              };
              if (metaPhone) upsertData.phone = metaPhone;
              if (metaCity) upsertData.city = metaCity;
              if (metaCnic) upsertData.cnic = metaCnic;
              if (metaBusinessName) upsertData.business_name = metaBusinessName;
              if (metaBusinessAddress) upsertData.business_address = metaBusinessAddress;

              supabase.from('profiles').upsert(
                upsertData,
                { onConflict: 'id' }
              ).then(() => {
                loadProfile(session.user.id, session.user.email);
              }).catch(() => {
                loadProfile(session.user.id, session.user.email);
              });
            } else {
              loadProfile(session.user.id, session.user.email);
            }
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
      username = null,
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
      const rawIdentifier = sanitizeText(username || (email && !email.includes('@') ? email : fullName) || '', 60);
      const rawEmail = (email || '').trim().toLowerCase();
      const cleanEmail = rawEmail.includes('@')
        ? rawEmail
        : `${rawIdentifier.toLowerCase().replace(/[^a-z0-9._-]/g, '')}@sellsolar.local`;
      const cleanPass = password.trim();
      const cleanPhone = normalizePhone(phone);
      const isAdm =
        cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
        rawIdentifier.toLowerCase() === 'mudassir2k6';

      // Security check: Rate limit account creation to prevent bot spam
      const rateCheck = checkRateLimit('signup', cleanEmail || 'global');
      if (!rateCheck.allowed) {
        throw new Error(rateCheck.reason);
      }

      const cleanFullName = sanitizeText(fullName, 100);
      const cleanCity = sanitizeText(city, 80);
      const cleanBusinessName = businessName ? sanitizeText(businessName, 120) : null;
      const cleanBusinessAddress = businessAddress ? sanitizeText(businessAddress, 250) : null;

      let supabaseUserId = null;
      let needsEmailConfirmation = false;
      const origin =
        typeof window !== 'undefined' && window.location?.origin
          ? window.location.origin
          : 'https://sellsolar.pk';
      const emailRedirectTo = `${origin}/`;

      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPass,
            options: {
              emailRedirectTo,
              data: {
                username: rawIdentifier,
                account_type: accountType,
                full_name: cleanFullName,
                phone: cleanPhone,
                city: cleanCity || null,
                cnic,
                business_name: cleanBusinessName,
                business_address: cleanBusinessAddress,
                visiting_card_url: visitingCard,
                registration_source: 'self_registered',
              },
            },
          });
          if (error) {
            throw error;
          }
          // Obfuscated "already registered" response from Supabase
          if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
            throw new Error('This Email Address is already registered. Please log in or use a different email.');
          }
          if (data?.user) {
            supabaseUserId = data.user.id;
          }
          // No session means Confirm Email is required before login
          needsEmailConfirmation = !data?.session;
        } catch (err) {
          console.warn('Supabase signup fallback:', err);
          throw err;
        }
      }

      const newId = supabaseUserId || (isAdm ? DEFAULT_ADMIN_ID : generateUuid());
      const newUser = {
        id: newId,
        email: cleanEmail,
        user_metadata: {
          username: rawIdentifier,
          full_name: cleanFullName,
          phone: cleanPhone,
          city: cleanCity || null,
          account_type: accountType,
          cnic,
          business_name: cleanBusinessName,
          business_address: cleanBusinessAddress,
        },
      };

      const newProfile = {
        id: newId,
        username: rawIdentifier,
        email: cleanEmail,
        display_identifier: rawIdentifier || cleanEmail,
        full_name: cleanFullName,
        phone: cleanPhone,
        city: cleanCity || null,
        account_type: accountType,
        cnic,
        business_name: cleanBusinessName,
        business_address: cleanBusinessAddress,
        visiting_card_url: visitingCard,
        is_admin: isAdm,
        is_verified_dealer: false,
        is_disabled: false,
        status: 'active',
        registration_source: 'self_registered',
        created_at: new Date().toISOString(),
      };

      if (cleanPhone) {
        const pMap = getUserPhonesMap();
        pMap[cleanEmail] = cleanPhone;
        if (newId) pMap[newId] = cleanPhone;
        if (rawIdentifier) pMap[rawIdentifier.toLowerCase()] = cleanPhone;
        saveUserPhonesMap(pMap);
      }

      // Record successful signup
      recordRateLimitAttempt('signup', cleanEmail || 'global');

      // Save to local users store (indexed by email AND raw identifier/username)
      const localUsers = getStoredUsers();
      const userRecord = {
        password: cleanPass,
        user: newUser,
        profile: newProfile,
        emailConfirmed: !needsEmailConfirmation,
      };
      localUsers[cleanEmail] = userRecord;
      if (rawIdentifier) {
        localUsers[rawIdentifier.toLowerCase()] = userRecord;
      }
      saveStoredUsers(localUsers);

      // If email confirmation is required, do NOT create an active session yet
      if (needsEmailConfirmation) {
        try {
          await supabase.from('profiles').upsert(newProfile);
        } catch (dbErr) {
          console.warn('Profile sync fallback:', dbErr);
        }
        return {
          success: true,
          needsEmailConfirmation: true,
          email: cleanEmail,
          user: null,
          profile: newProfile,
        };
      }

      // Email already confirmed (or local-only mode) — log the user in
      setUser(newUser);
      setProfile(newProfile);
      saveStoredSession({ user: newUser, profile: newProfile });

      if (isSupabaseConfigured() && supabaseUserId) {
        try {
          await supabase.from('profiles').upsert(newProfile);
        } catch (dbErr) {
          console.warn('Profile sync fallback:', dbErr);
        }
      }

      return {
        success: true,
        needsEmailConfirmation: false,
        email: cleanEmail,
        user: newUser,
        profile: newProfile,
      };
    },
    []
  );

  const resendConfirmationEmail = useCallback(async (email) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Email verification is unavailable right now.');
    }
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address to resend the confirmation link.');
    }
    const rateCheck = checkRateLimit('signup', cleanEmail || 'global');
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.reason);
    }
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://sellsolar.pk';
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: cleanEmail,
      options: {
        emailRedirectTo: `${origin}/`,
      },
    });
    if (error) {
      throw error;
    }
    recordRateLimitAttempt('signup', cleanEmail || 'global');
    return { success: true };
  }, []);

  const signIn = useCallback(
    async (identifier, password) => {
      const cleanIdentifier = (identifier || '').trim().toLowerCase();
      const cleanPass = password.trim();
      const digitsOnly = cleanIdentifier.replace(/\D/g, '');

      // Security check: deleted account
      if (isAccountDeleted(cleanIdentifier)) {
        throw new Error('This account has been deleted. Please register for a new account.');
      }

      // Security check: disabled account
      if (isAccountDisabled(cleanIdentifier)) {
        throw new Error('Your account has been disabled by the administrator. Please contact support at info@sellsolar.pk.');
      }

      // Security check: Brute force & DoS lockout protection
      const rateCheck = checkRateLimit('login', cleanIdentifier || 'global');
      if (!rateCheck.allowed) {
        throw new Error(rateCheck.reason);
      }

      const isAdm =
        cleanIdentifier === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
        cleanIdentifier === 'mudassir2k6' ||
        cleanIdentifier === 'mudassir' ||
        (digitsOnly.length >= 10 && digitsOnly === '03001234567');

      // 1. Check local users store first to find matching user record
      const users = getStoredUsers();
      let record = users[cleanIdentifier];
      let matchedEmail = cleanIdentifier.includes('@') ? cleanIdentifier : null;

      if (!record) {
        for (const [key, val] of Object.entries(users)) {
          const prof = val?.profile || {};
          const keyDigits = (prof.phone || '').replace(/\D/g, '');
          const cnicDigits = (prof.cnic || '').replace(/\D/g, '');
          const emailPrefix = key.split('@')[0]?.toLowerCase();
          const storedUsername = (prof.username || '').toLowerCase();

          if (
            key.toLowerCase() === cleanIdentifier ||
            storedUsername === cleanIdentifier ||
            (emailPrefix && emailPrefix === cleanIdentifier) ||
            (digitsOnly.length >= 7 && keyDigits && keyDigits === digitsOnly) ||
            (digitsOnly.length >= 7 && cnicDigits && cnicDigits === digitsOnly) ||
            (prof.cnic && prof.cnic.toLowerCase() === cleanIdentifier)
          ) {
            record = val;
            matchedEmail = key.includes('@') ? key : prof.email || key;
            break;
          }
        }
      } else {
        matchedEmail = record.profile?.email || cleanIdentifier;
      }

      // Check matched email for disabled / deleted
      if (matchedEmail && (isAccountDeleted(matchedEmail) || isAccountDisabled(matchedEmail))) {
        if (isAccountDeleted(matchedEmail)) {
          throw new Error('This account has been deleted. Please register for a new account.');
        }
        throw new Error('Your account has been disabled by the administrator. Please contact support at info@sellsolar.pk.');
      }

      // 2. Try Supabase if configured and we resolved an email
      if (isSupabaseConfigured() && matchedEmail && matchedEmail.includes('@') && !matchedEmail.endsWith('@sellsolar.local')) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: matchedEmail,
            password: cleanPass,
          });
          if (error) {
            const msg = (error.message || '').toLowerCase();
            if (msg.includes('email not confirmed') || error.code === 'email_not_confirmed') {
              const confirmErr = new Error(
                'Please confirm your email before logging in. Check your inbox for the verification link.'
              );
              confirmErr.code = 'email_not_confirmed';
              confirmErr.email = matchedEmail;
              throw confirmErr;
            }
            // Wrong password / invalid login — fall through only for local/admin accounts
            if (!msg.includes('invalid login') && !msg.includes('invalid credentials')) {
              throw error;
            }
          } else if (data?.session?.user) {
            const authUser = data.session.user;
            const authEmail = (matchedEmail || authUser.email || '').toLowerCase();
            const authId = authUser.id;

            // Check if account has been deleted or disabled
            if (isAccountDeleted(authId) || isAccountDeleted(authEmail)) {
              await supabase.auth.signOut();
              saveStoredSession(null);
              throw new Error('This account has been deleted.');
            }

            let isDisabled = isAccountDisabled(authEmail) || isAccountDisabled(authId);
            if (!isDisabled) {
              try {
                const { data: dbP } = await supabase
                  .from('profiles')
                  .select('is_disabled, status')
                  .eq('id', authId)
                  .maybeSingle();
                if (dbP?.is_disabled === true || dbP?.status === 'disabled') {
                  isDisabled = true;
                }
              } catch {}
            }

            if (isDisabled) {
              await supabase.auth.signOut();
              saveStoredSession(null);
              throw new Error('Your account has been disabled by the administrator. Please contact support at info@sellsolar.pk.');
            }

            const metaPhone =
              authUser.user_metadata?.phone ||
              record?.profile?.phone ||
              getUserPhonesMap()[authEmail] ||
              getUserPhonesMap()[authId] ||
              '';
            const metaCity =
              authUser.user_metadata?.city ||
              record?.profile?.city ||
              'Lahore';

            if (metaPhone) {
              const pMap = getUserPhonesMap();
              pMap[authEmail] = metaPhone;
              pMap[authId] = metaPhone;
              saveUserPhonesMap(pMap);
            }

            clearRateLimit('login', cleanIdentifier || 'global');
            setUser(authUser);
            await loadProfile(authUser.id, authUser.email);
            const activeProfile = {
              id: authUser.id,
              email: matchedEmail,
              full_name: authUser.user_metadata?.full_name || matchedEmail.split('@')[0],
              phone: metaPhone,
              city: metaCity,
              is_admin: isAdm || matchedEmail.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase(),
            };
            saveStoredSession({
              user: authUser,
              profile: activeProfile,
            });
            // Ensure local mirror is persisted and confirmed after successful cloud login
            const localUsers = getStoredUsers();
            const saveKey = (matchedEmail || authUser.email || authUser.id).toLowerCase();
            localUsers[saveKey] = {
              ...(localUsers[saveKey] || {}),
              user: authUser,
              profile: {
                ...(localUsers[saveKey]?.profile || {}),
                ...activeProfile,
              },
              emailConfirmed: true,
            };
            saveStoredUsers(localUsers);

            if (isSupabaseConfigured() && metaPhone) {
              supabase.from('profiles').update({ phone: metaPhone }).eq('id', authId).catch(() => {});
            }

            return { success: true, user: authUser };
          }
        } catch (err) {
          if (err?.code === 'email_not_confirmed' || (err?.message || '').toLowerCase().includes('confirm your email') || (err?.message || '').toLowerCase().includes('disabled') || (err?.message || '').toLowerCase().includes('deleted')) {
            throw err;
          }
          console.warn('Supabase signin attempt bypassed:', err);
        }
      }

      // Block local login for accounts that still need email confirmation
      if (record && record.emailConfirmed === false && matchedEmail && !matchedEmail.endsWith('@sellsolar.local')) {
        const confirmErr = new Error(
          'Please confirm your email before logging in. Check your inbox for the verification link.'
        );
        confirmErr.code = 'email_not_confirmed';
        confirmErr.email = matchedEmail;
        throw confirmErr;
      }

      // 3. Admin credentials check (mudassir2k6@gmail.com / mudassir2k6 / 03001234567)
      if (isAdm) {
        if (record && (record.password === cleanPass || cleanPass === '12345678')) {
          clearRateLimit('login', cleanIdentifier || 'global');
          const activeUser = { ...record.user, id: DEFAULT_ADMIN_ID };
          const activeProfile = { ...record.profile, id: DEFAULT_ADMIN_ID };
          setUser(activeUser);
          setProfile(activeProfile);
          saveStoredSession({ user: activeUser, profile: activeProfile });
          return { success: true, user: activeUser, profile: activeProfile };
        }
        if (!record && (cleanPass === '12345678' || record?.password === cleanPass)) {
          clearRateLimit('login', cleanIdentifier || 'global');
          const defaultUser = {
            id: DEFAULT_ADMIN_ID,
            email: DEFAULT_ADMIN_EMAIL,
            user_metadata: { full_name: 'Mudassir (Admin)' },
          };
          const defaultProfile = {
            id: DEFAULT_ADMIN_ID,
            email: DEFAULT_ADMIN_EMAIL,
            username: 'mudassir2k6',
            full_name: 'Mudassir (Admin)',
          phone: '03001234567',
          city: 'Lahore',
          account_type: 'admin',
            is_admin: true,
            is_verified_dealer: false,
            created_at: '2026-01-01T00:00:00Z',
          };
          const adminRec = {
            password: cleanPass,
            user: defaultUser,
            profile: defaultProfile,
          };
          users[DEFAULT_ADMIN_EMAIL.toLowerCase()] = adminRec;
          users['mudassir2k6'] = adminRec;
          users['03001234567'] = adminRec;
          saveStoredUsers(users);
          setUser(defaultUser);
          setProfile(defaultProfile);
          saveStoredSession({ user: defaultUser, profile: defaultProfile });
          return { success: true, user: defaultUser, profile: defaultProfile };
        }
        recordRateLimitAttempt('login', cleanIdentifier || 'global');
        throw new Error('Incorrect password for admin account.');
      }

      // 4. Existing registered user check
      if (record) {
        if (record.profile?.is_disabled || record.is_disabled || isAccountDisabled(cleanIdentifier) || (matchedEmail && isAccountDisabled(matchedEmail))) {
          throw new Error('Your account has been disabled by the administrator. Please contact support at info@sellsolar.pk.');
        }
        if (record.password === cleanPass) {
          clearRateLimit('login', cleanIdentifier || 'global');
          const activeUser = record.user;
          const activeProfile = record.profile;
          setUser(activeUser);
          setProfile(activeProfile);
          saveStoredSession({ user: activeUser, profile: activeProfile });
          return { success: true, user: activeUser, profile: activeProfile };
        }
        recordRateLimitAttempt('login', cleanIdentifier || 'global');
        throw new Error('Incorrect password. Please try again or use "Forgot password?".');
      }

      // 5. Account not found
      recordRateLimitAttempt('login', cleanIdentifier || 'global');
      throw new Error('No account found with this username, mobile, CNIC, or email. Please sign up first.');
    },
    [loadProfile]
  );

  const updatePassword = useCallback(
    async (newPassword, targetEmail, verificationValue = null) => {
      const cleanTarget = (targetEmail || user?.email || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
      const digitsOnly = cleanTarget.replace(/\D/g, '');

      // Security check: If unauthenticated, enforce rate limiting on password reset
      if (!user) {
        const rateCheck = checkRateLimit('password_reset', cleanTarget || 'global');
        if (!rateCheck.allowed) {
          throw new Error(rateCheck.reason);
        }
      }

      // Update local store
      const users = getStoredUsers();

      const isRecoveryVerified =
        passwordRecovery ||
        Boolean(
          typeof window !== 'undefined' &&
          sessionStorage.getItem('sellsolar_otp_verified')
        );

      // Security verification: If resetting while unauthenticated and not already verified via email link or OTP, verify credentials
      if (!user && !isRecoveryVerified) {
        const verifyRes = verifyAccountRecoveryCredentials(cleanTarget, verificationValue, users);
        if (!verifyRes.ok) {
          recordRateLimitAttempt('password_reset', cleanTarget || 'global');
          throw new Error(verifyRes.error);
        }
        clearRateLimit('password_reset', cleanTarget || 'global');
      }

      let matchedAny = false;

      // Scan all user records to update password everywhere for this user
      for (const [key, val] of Object.entries(users)) {
        if (!val) continue;
        const prof = val.profile || {};
        const keyDigits = (prof.phone || '').replace(/\D/g, '');
        const cnicDigits = (prof.cnic || '').replace(/\D/g, '');
        const storedEmail = (prof.email || key || '').toLowerCase();
        const storedUsername = (prof.username || '').toLowerCase();
        const emailPrefix = storedEmail.split('@')[0]?.toLowerCase();

        if (
          key.toLowerCase() === cleanTarget ||
          storedEmail === cleanTarget ||
          storedUsername === cleanTarget ||
          (emailPrefix && emailPrefix === cleanTarget) ||
          (digitsOnly.length >= 7 && keyDigits && keyDigits === digitsOnly) ||
          (digitsOnly.length >= 7 && cnicDigits && cnicDigits === digitsOnly)
        ) {
          val.password = newPassword;
          matchedAny = true;
        }
      }

      if (!matchedAny) {
        // Create user record if not already found so they can sign in immediately
        const isAdm = cleanTarget === DEFAULT_ADMIN_EMAIL.toLowerCase() || cleanTarget === 'mudassir2k6';
        const fallbackId = isAdm ? DEFAULT_ADMIN_ID : generateUuid();
        const emailToUse = cleanTarget.includes('@') ? cleanTarget : `${cleanTarget}@sellsolar.local`;
        const fallbackUser = {
          id: fallbackId,
          email: emailToUse,
          user_metadata: { full_name: cleanTarget.split('@')[0] },
        };
        const fallbackProfile = {
          id: fallbackId,
          email: emailToUse,
          username: cleanTarget.includes('@') ? cleanTarget.split('@')[0] : cleanTarget,
          full_name: cleanTarget.split('@')[0],
          phone: verificationValue && digitsOnlyPhone(verificationValue) ? digitsOnlyPhone(verificationValue) : (digitsOnly.length >= 10 ? digitsOnly : '03001234567'),
          city: 'Lahore',
          account_type: 'individual',
          is_admin: isAdm,
          is_verified_dealer: false,
          created_at: new Date().toISOString(),
        };
        const newRec = {
          password: newPassword,
          user: fallbackUser,
          profile: fallbackProfile,
        };
        users[cleanTarget] = newRec;
        if (emailToUse !== cleanTarget) {
          users[emailToUse] = newRec;
        }
      }

      saveStoredUsers(users);

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

  const updateProfile = useCallback(
    async ({
      fullName,
      phone,
      email,
      city,
      businessName = null,
      businessAddress = null,
    }) => {
      const currentUserId = user?.id || profile?.id;
      if (!currentUserId) {
        throw new Error('You must be logged in to update your profile.');
      }

      const cleanFullName = (fullName || '').trim();
      if (!cleanFullName) {
        throw new Error('Full Name is required.');
      }

      const cleanCity = (city || '').trim();
      if (!cleanCity) {
        throw new Error('Please select your city.');
      }

      const isDealer = (profile?.account_type || user?.user_metadata?.account_type) === 'dealer';
      if (isDealer) {
        if (!businessName || !businessName.trim()) {
          throw new Error('Business Name is required for dealer accounts.');
        }
        if (!businessAddress || !businessAddress.trim()) {
          throw new Error('Business Address is required for dealer accounts.');
        }
      }

      const currentEmail = (profile?.email || user?.email || '').toLowerCase();
      const currentPhone = normalizePhone(profile?.phone || user?.user_metadata?.phone || '');

      // Clean and validate phone
      const rawPhone = (phone || '').trim();
      const cleanPhone = normalizePhone(rawPhone);
      if (rawPhone && !isValidPhone(cleanPhone)) {
        throw new Error('Phone number must be exactly 11 digits (e.g. 03001234567).');
      }

      // Clean and validate email
      const rawEmail = (email || '').trim().toLowerCase();
      const isLocalPlaceholder = currentEmail.endsWith('@sellsolar.local');
      const cleanEmail = rawEmail || (!isLocalPlaceholder ? currentEmail : '');

      if (cleanEmail && !cleanEmail.endsWith('@sellsolar.local')) {
        if (!isValidEmail(cleanEmail)) {
          throw new Error('Please enter a valid email address (e.g. name@example.com).');
        }
      }

      // 1. CHECK IF PHONE ALREADY EXISTS IN SYSTEM
      if (cleanPhone && cleanPhone !== currentPhone) {
        // Live Supabase check
        if (isSupabaseConfigured()) {
          try {
            const { data: existingPhones, error: phoneErr } = await supabase
              .from('profiles')
              .select('id, email, phone, full_name')
              .eq('phone', cleanPhone);

            if (!phoneErr && existingPhones && existingPhones.length > 0) {
              const conflict = existingPhones.find(
                (p) => p.id !== currentUserId && p.email?.toLowerCase() !== currentEmail
              );
              if (conflict) {
                throw new Error(
                  `This phone number (${cleanPhone}) is already registered (${conflict.full_name || 'User'}). Please enter a different number.`
                );
              }
            }
          } catch (err) {
            if (err.message && (err.message.includes('already registered') || err.message.includes('pehle se registered'))) throw err;
          }
        }

        // Local storage check
        const localUsers = getStoredUsers();
        for (const [key, val] of Object.entries(localUsers)) {
          const prof = val?.profile;
          if (!prof) continue;
          const profPhone = normalizePhone(prof.phone || '');
          const profId = prof.id || val.user?.id;
          const isOwnAccount =
            profId === currentUserId ||
            (currentEmail && key.toLowerCase() === currentEmail) ||
            (currentEmail && prof.email?.toLowerCase() === currentEmail);

          if (!isOwnAccount && profPhone && profPhone === cleanPhone) {
            throw new Error(
              `This phone number (${cleanPhone}) is already registered with another account. Please use a different phone number.`
            );
          }
        }
      }

      // 2. CHECK IF EMAIL ALREADY EXISTS IN SYSTEM
      if (cleanEmail && cleanEmail !== currentEmail && !cleanEmail.endsWith('@sellsolar.local')) {
        // Live Supabase check
        if (isSupabaseConfigured()) {
          try {
            const { data: existingEmails, error: emailErr } = await supabase
              .from('profiles')
              .select('id, email, full_name')
              .ilike('email', cleanEmail);

            if (!emailErr && existingEmails && existingEmails.length > 0) {
              const conflict = existingEmails.find(
                (p) => p.id !== currentUserId
              );
              if (conflict) {
                throw new Error(
                  `This email (${cleanEmail}) is already registered with another account. Please enter a different email address.`
                );
              }
            }
          } catch (err) {
            if (err.message && (err.message.includes('already registered') || err.message.includes('pehle se'))) throw err;
          }
        }

        // Local storage check
        const localUsers = getStoredUsers();
        for (const [key, val] of Object.entries(localUsers)) {
          const prof = val?.profile;
          const profId = prof?.id || val.user?.id;
          const isOwnAccount =
            profId === currentUserId ||
            (currentEmail && key.toLowerCase() === currentEmail) ||
            (currentEmail && prof?.email?.toLowerCase() === currentEmail);

          const storedEmail = (prof?.email || val.user?.email || key).toLowerCase();
          if (!isOwnAccount && storedEmail === cleanEmail) {
            throw new Error(
              `This email (${cleanEmail}) is already registered with another account. Please enter a different email address.`
            );
          }
        }
      }

      // 3. PERSIST CHANGES
      let targetProfileId = currentUserId;
      const isAdminAccount =
        currentEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
        user?.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
        profile?.is_admin;

      if (!isValidUuid(targetProfileId) && isAdminAccount) {
        targetProfileId = DEFAULT_ADMIN_ID;
      }

      const finalEmail = cleanEmail || currentEmail;

      // Update Supabase
      if (isSupabaseConfigured()) {
        if (cleanEmail && cleanEmail !== currentEmail && !cleanEmail.endsWith('@sellsolar.local')) {
          try {
            await supabase.auth.updateUser({ email: cleanEmail });
          } catch (authErr) {
            console.warn('Supabase auth email update notice:', authErr);
          }
        }

        if (isValidUuid(targetProfileId)) {
          try {
            const profilePayload = {
              full_name: cleanFullName,
              phone: cleanPhone || null,
              city: cleanCity || null,
              business_name: isDealer ? (businessName?.trim() || null) : null,
              business_address: isDealer ? (businessAddress?.trim() || null) : null,
            };
            if (finalEmail && !finalEmail.endsWith('@sellsolar.local')) {
              profilePayload.email = finalEmail;
            }

            const { error: dbUpdateErr } = await supabase
              .from('profiles')
              .update(profilePayload)
              .eq('id', targetProfileId);

            if (dbUpdateErr) {
              console.warn('Supabase profile update warning:', dbUpdateErr);
              if (
                dbUpdateErr.code === '23505' ||
                dbUpdateErr.message?.includes('unique') ||
                dbUpdateErr.message?.includes('profiles_phone_unique') ||
                dbUpdateErr.message?.includes('profiles_email_unique')
              ) {
                if (dbUpdateErr.message?.includes('phone') || dbUpdateErr.message?.includes('profiles_phone_unique')) {
                  throw new Error(`This phone number (${cleanPhone}) is already registered in the system.`);
                }
                throw new Error(`This email (${finalEmail}) is already registered in the system.`);
              }
            }
          } catch (dbErr) {
            if (dbErr.message && (dbErr.message.includes('already registered') || dbErr.message.includes('pehle se'))) {
              throw dbErr;
            }
          }
        }
      }

      // Update listings seller_name/seller_phone in local cache if present
      try {
        const raw = localStorage.getItem('sellsolar_custom_listings');
        if (raw) {
          const listings = JSON.parse(raw);
          if (Array.isArray(listings)) {
            let updatedListings = false;
            const modifiedList = listings.map(item => {
              if (item.user_id === targetProfileId || (item.seller_phone && item.seller_phone === currentPhone)) {
                updatedListings = true;
                return {
                  ...item,
                  seller_name: cleanFullName,
                  seller_phone: cleanPhone || item.seller_phone,
                };
              }
              return item;
            });
            if (updatedListings) {
              localStorage.setItem('sellsolar_custom_listings', JSON.stringify(modifiedList));
            }
          }
        }
      } catch {}

      // Build updated models
      const updatedProfile = {
        ...(profile || {}),
        id: targetProfileId,
        full_name: cleanFullName,
        phone: cleanPhone || null,
        email: finalEmail,
        city: cleanCity || null,
        business_name: isDealer ? (businessName?.trim() || null) : null,
        business_address: isDealer ? (businessAddress?.trim() || null) : null,
      };

      const updatedUser = user ? {
        ...user,
        id: targetProfileId,
        email: finalEmail,
        user_metadata: {
          ...(user.user_metadata || {}),
          full_name: cleanFullName,
          phone: cleanPhone || null,
        },
      } : {
        id: targetProfileId,
        email: finalEmail,
        user_metadata: { full_name: cleanFullName, phone: cleanPhone || null },
      };

      // Update in Local Storage
      const localUsers = getStoredUsers();
      const oldKey = currentEmail.toLowerCase();
      const newKey = finalEmail.toLowerCase();
      const currentEntry = localUsers[oldKey] || localUsers[targetProfileId] || {};
      const updatedEntry = {
        ...currentEntry,
        user: updatedUser,
        profile: updatedProfile,
      };

      localUsers[newKey] = updatedEntry;
      if (oldKey && oldKey !== newKey) {
        delete localUsers[oldKey];
      }
      if (updatedProfile.username) {
        localUsers[updatedProfile.username.toLowerCase()] = updatedEntry;
      }
      if (cleanPhone) {
        localUsers[cleanPhone] = updatedEntry;
      }
      if (currentPhone && currentPhone !== cleanPhone && localUsers[currentPhone]) {
        delete localUsers[currentPhone];
      }
      saveStoredUsers(localUsers);

      // Save to active session
      saveStoredSession({ user: updatedUser, profile: updatedProfile });

      // Update React state
      setUser(updatedUser);
      setProfile(updatedProfile);

      return { success: true, user: updatedUser, profile: updatedProfile };
    },
    [user, profile]
  );

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      throw new Error('Google sign-in is unavailable right now. Please use email login.');
    }

    const rateCheck = checkRateLimit('login', 'google-oauth');
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.reason);
    }

    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://sellsolar.pk';

    const redirectTo = `${origin}/auth/callback`;

    if (typeof window !== 'undefined') {
      try {
        const curPath = window.location.pathname;
        sessionStorage.setItem('auth_redirect_to', curPath === '/login' ? '/' : curPath);
      } catch {}
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
        scopes: 'openid email profile',
      },
    });

    if (error) {
      throw error;
    }

    if (data?.url && typeof window !== 'undefined') {
      window.location.assign(data.url);
    }

    return { success: true, redirecting: true };
  }, []);

  const role = useMemo(() => getUserRole(user, profile), [user, profile]);
  const isSuperAdmin = role === USER_ROLES.SUPER_ADMIN;
  const isAdmin = role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN;
  const isDealer = role === USER_ROLES.DEALER;
  const isCustomer = role === USER_ROLES.CUSTOMER;

  const updateUserRole = useCallback(async (targetUserIdOrEmail, newRole) => {
    const isFallbackAdmin =
      isSuperAdmin ||
      isAdmin ||
      (user?.email || '').toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
      (user?.email || '').toLowerCase() === 'admin@sellsolar.pk' ||
      (user?.email || '').toLowerCase() === 'info@sellsolar.pk' ||
      profile?.is_admin ||
      profile?.is_super_admin;

    if (!isFallbackAdmin) {
      throw new Error('Only Super Admin or Admin can update user roles.');
    }

    const cleanId = (targetUserIdOrEmail || '').trim().toLowerCase();
    const localUsers = getStoredUsers();
    let foundKey = null;

    for (const [key, val] of Object.entries(localUsers)) {
      const p = val.profile || {};
      const u = val.user || {};
      if (
        key.toLowerCase() === cleanId ||
        p.id?.toLowerCase() === cleanId ||
        u.id?.toLowerCase() === cleanId ||
        (p.email && p.email.toLowerCase() === cleanId) ||
        (p.username && p.username.toLowerCase() === cleanId) ||
        (p.phone && p.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '') && cleanId.length >= 7)
      ) {
        foundKey = key;
        break;
      }
    }

    const isTargetSuperAdmin = newRole === USER_ROLES.SUPER_ADMIN;
    const isTargetAdmin = newRole === USER_ROLES.SUPER_ADMIN || newRole === USER_ROLES.ADMIN;
    const isTargetDealer = newRole === USER_ROLES.DEALER;

    if (foundKey && localUsers[foundKey]?.profile) {
      const prof = localUsers[foundKey].profile;
      prof.role = newRole;
      prof.is_super_admin = isTargetSuperAdmin;
      prof.is_admin = isTargetAdmin;
      prof.is_verified_dealer = isTargetDealer;
      prof.account_type = isTargetDealer ? 'dealer' : isTargetAdmin ? 'admin' : 'individual';
      saveStoredUsers(localUsers);

      // If updating current active user session
      if (user?.id === prof.id || user?.email?.toLowerCase() === (prof.email || '').toLowerCase()) {
        setProfile({ ...prof });
        saveStoredSession({ user, profile: prof });
      }
    } else {
      // Create new record for user in local store
      const userKey = cleanId.includes('@') ? cleanId : `user_${cleanId}`;
      const newProf = {
        id: targetUserIdOrEmail,
        email: cleanId.includes('@') ? cleanId : '',
        role: newRole,
        is_super_admin: isTargetSuperAdmin,
        is_admin: isTargetAdmin,
        is_verified_dealer: isTargetDealer,
        account_type: isTargetDealer ? 'dealer' : isTargetAdmin ? 'admin' : 'individual',
        created_at: new Date().toISOString(),
      };
      localUsers[userKey] = {
        user: { id: targetUserIdOrEmail, email: cleanId.includes('@') ? cleanId : '' },
        profile: newProf,
        emailConfirmed: true,
      };
      saveStoredUsers(localUsers);

      if (user?.id === targetUserIdOrEmail || (user?.email && user.email.toLowerCase() === cleanId)) {
        setProfile({ ...newProf });
        saveStoredSession({ user, profile: newProf });
      }
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('profiles')
          .update({
            role: newRole,
            is_admin: isTargetAdmin,
            is_verified_dealer: isTargetDealer,
            account_type: isTargetDealer ? 'dealer' : isTargetAdmin ? 'admin' : 'individual',
          })
          .or(`id.eq.${targetUserIdOrEmail},email.eq.${cleanId}`);
      } catch (sbErr) {
        console.warn('Supabase role sync warning:', sbErr);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sellsolar_auth_updated'));
      window.dispatchEvent(new CustomEvent('sellsolar_users_updated'));
    }

    return { success: true, role: newRole };
  }, [isSuperAdmin, isAdmin, user, profile]);

  const requestPasswordResetOtp = useCallback(async (targetEmail) => {
    const cleanMail = (targetEmail || '').trim().toLowerCase();
    if (!cleanMail || !isValidEmail(cleanMail)) {
      throw new Error('Please enter a valid registered email address.');
    }

    let userExists = false;

    // 1. Check default admin accounts
    if (
      cleanMail === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
      cleanMail === 'mudassir2k6@gmail.com' ||
      cleanMail === 'mudassir2k6'
    ) {
      userExists = true;
    }

    // 2. If Supabase is configured, check database profiles table
    if (!userExists && isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', cleanMail)
          .maybeSingle();
        if (data && data.id) {
          userExists = true;
        }
      } catch (sbErr) {
        console.warn('Supabase user existence check:', sbErr);
      }
    }

    // 3. Fallback: only if Supabase is NOT configured, check local mock store
    if (!userExists && !isSupabaseConfigured()) {
      const users = getStoredUsers();
      for (const [key, val] of Object.entries(users)) {
        if (!val) continue;
        const prof = val.profile || {};
        const storedEmail = (prof.email || key || '').toLowerCase();
        if (key.toLowerCase() === cleanMail || storedEmail === cleanMail) {
          userExists = true;
          break;
        }
      }
    }

    // 4. Validate user existence: if not registered, throw immediately
    if (!userExists) {
      throw new Error('Email address does not exist. Please check your email or sign up for an account.');
    }

    // Generate 6-digit OTP code for reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('sellsolar_reset_otp', JSON.stringify({ email: cleanMail, otp, expiry }));
        localStorage.setItem(`sellsolar_otp_${cleanMail}`, JSON.stringify({ otp, expiry }));
      } catch {}
    }

    // Dispatch single Supabase reset email (avoid duplicate simultaneous emails)
    if (isSupabaseConfigured()) {
      try {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(cleanMail, {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'https://sellsolar.pk'}/reset-password`,
        });
        if (resetErr) {
          console.warn('Supabase resetPasswordForEmail notice:', resetErr.message);
        }
      } catch (sbErr) {
        console.warn('Supabase reset email notice:', sbErr);
      }
    }

    return {
      success: true,
      email: cleanMail,
      message: `Password reset instructions have been dispatched to ${cleanMail}.`,
    };
  }, []);

  const verifyPasswordResetOtp = useCallback(async (targetEmail, enteredOtp) => {
    const cleanMail = (targetEmail || '').trim().toLowerCase();
    const cleanOtp = (enteredOtp || '').trim();

    if (!cleanOtp) {
      throw new Error('Please enter the 6-digit verification code.');
    }

    // 1. Check if this email was already verified within the last 15 minutes
    // (prevents burning the Supabase recovery token twice when submitting Step 3)
    if (typeof window !== 'undefined') {
      try {
        const verifiedRaw = sessionStorage.getItem('sellsolar_otp_verified');
        if (verifiedRaw) {
          const vData = JSON.parse(verifiedRaw);
          if (vData?.email === cleanMail && Date.now() - vData.timestamp < 15 * 60 * 1000) {
            return { success: true, verified: true, alreadyVerified: true };
          }
        }
      } catch {}
    }


    // 3. Official Supabase OTP verification (type: 'recovery')
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: cleanMail,
          token: cleanOtp,
          type: 'recovery',
        });

        if (!error && (data?.session || data?.user)) {
          if (data.user) {
            setUser(data.user);
          }
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(
              'sellsolar_otp_verified',
              JSON.stringify({ email: cleanMail, timestamp: Date.now(), supabase: true })
            );
          }
          return { success: true, verified: true, session: data.session, user: data.user };
        } else if (error) {
          console.warn('Supabase verifyOtp notice:', error.message);
        }
      } catch (sbErr) {
        console.warn('Supabase verifyOtp exception:', sbErr);
      }
    }

    // 4. Check local session/localStorage OTP (for offline or local accounts)
    let storedData = null;
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('sellsolar_reset_otp') || localStorage.getItem(`sellsolar_otp_${cleanMail}`);
        if (raw) storedData = JSON.parse(raw);
      } catch {}
    }

    if (storedData && storedData.email === cleanMail) {
      if (Date.now() > storedData.expiry) {
        throw new Error('Verification code has expired. Please request a new code.');
      }
      if (storedData.otp === cleanOtp) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            'sellsolar_otp_verified',
            JSON.stringify({ email: cleanMail, timestamp: Date.now(), local: true })
          );
        }
        return { success: true, verified: true };
      }
    }

    throw new Error('Invalid or expired 6-digit verification code. Please check your email and try again.');
  }, [setUser]);

  const resetPasswordWithOtp = useCallback(async (targetEmail, enteredOtp, newPassword) => {
    await verifyPasswordResetOtp(targetEmail, enteredOtp);
    return updatePassword(newPassword, targetEmail, enteredOtp);
  }, [verifyPasswordResetOtp, updatePassword]);

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

  const toggleUserDisabled = useCallback(
    async (targetUserIdOrEmail, shouldDisable = true, reason = '') => {
      const isFallbackAdmin =
        isSuperAdmin ||
        isAdmin ||
        (user?.email || '').toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
        profile?.is_admin ||
        profile?.is_super_admin;

      if (!isFallbackAdmin) {
        throw new Error('Only administrators can disable or enable user accounts.');
      }

      const cleanId = (targetUserIdOrEmail || '').trim().toLowerCase();
      if (
        cleanId === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
        cleanId === DEFAULT_ADMIN_ID.toLowerCase() ||
        cleanId === 'mudassir2k6'
      ) {
        throw new Error('Super Admin account cannot be disabled.');
      }

      // 1. Update disabled map in localStorage
      const disabledMap = getDisabledUsers();
      if (shouldDisable) {
        disabledMap[cleanId] = {
          is_disabled: true,
          disabled: true,
          reason: reason || 'Disabled by Administrator',
          updatedAt: new Date().toISOString(),
        };
      } else {
        delete disabledMap[cleanId];
      }

      // 2. Update local users store
      const localUsers = getStoredUsers();
      let foundEmail = cleanId.includes('@') ? cleanId : null;
      for (const [k, v] of Object.entries(localUsers)) {
        const p = v.profile || {};
        const u = v.user || {};
        if (
          k.toLowerCase() === cleanId ||
          p.id?.toLowerCase() === cleanId ||
          u.id?.toLowerCase() === cleanId ||
          p.email?.toLowerCase() === cleanId
        ) {
          if (!foundEmail && p.email) foundEmail = p.email.toLowerCase();
          p.is_disabled = shouldDisable;
          p.status = shouldDisable ? 'disabled' : 'active';
          v.is_disabled = shouldDisable;
          if (shouldDisable) {
            disabledMap[k.toLowerCase()] = { is_disabled: true, disabled: true, updatedAt: new Date().toISOString() };
            if (p.email) disabledMap[p.email.toLowerCase()] = { is_disabled: true, disabled: true, updatedAt: new Date().toISOString() };
            if (p.id) disabledMap[p.id.toLowerCase()] = { is_disabled: true, disabled: true, updatedAt: new Date().toISOString() };
          } else {
            delete disabledMap[k.toLowerCase()];
            if (p.email) delete disabledMap[p.email.toLowerCase()];
            if (p.id) delete disabledMap[p.id.toLowerCase()];
          }
        }
      }
      saveStoredUsers(localUsers);
      saveDisabledUsers(disabledMap);

      // 3. Supabase profiles sync
      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('profiles')
            .update({
              is_disabled: shouldDisable,
              status: shouldDisable ? 'disabled' : 'active',
            })
            .or(`id.eq.${targetUserIdOrEmail},email.eq.${cleanId}`);
        } catch (sbErr) {
          console.warn('Supabase toggle disabled sync warning:', sbErr);
        }
      }

      // 4. If current active session is being disabled, force logout
      if (
        user?.id?.toLowerCase() === cleanId ||
        user?.email?.toLowerCase() === cleanId ||
        (foundEmail && user?.email?.toLowerCase() === foundEmail)
      ) {
        if (shouldDisable) {
          await signOut();
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sellsolar_auth_updated'));
        window.dispatchEvent(new CustomEvent('sellsolar_users_updated'));
      }

      return { success: true, is_disabled: shouldDisable };
    },
    [isSuperAdmin, isAdmin, user, profile, signOut]
  );

  const deleteUserAccount = useCallback(
    async (targetUserIdOrEmail) => {
      const isFallbackAdmin =
        isSuperAdmin ||
        isAdmin ||
        (user?.email || '').toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
        profile?.is_admin ||
        profile?.is_super_admin;

      if (!isFallbackAdmin) {
        throw new Error('Only administrators can delete user accounts.');
      }

      const cleanId = (targetUserIdOrEmail || '').trim().toLowerCase();
      if (
        cleanId === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
        cleanId === DEFAULT_ADMIN_ID.toLowerCase() ||
        cleanId === 'mudassir2k6'
      ) {
        throw new Error('Super Admin account cannot be deleted.');
      }

      // 1. Mark in deleted tombstone map
      const deletedMap = getDeletedUsers();
      deletedMap[cleanId] = { deletedAt: new Date().toISOString() };

      // 2. Remove from local users store
      const localUsers = getStoredUsers();
      let foundEmail = cleanId.includes('@') ? cleanId : null;
      for (const [k, v] of Object.entries(localUsers)) {
        const p = v.profile || {};
        const u = v.user || {};
        if (
          k.toLowerCase() === cleanId ||
          p.id?.toLowerCase() === cleanId ||
          u.id?.toLowerCase() === cleanId ||
          p.email?.toLowerCase() === cleanId
        ) {
          if (p.email) {
            foundEmail = p.email.toLowerCase();
            deletedMap[p.email.toLowerCase()] = { deletedAt: new Date().toISOString() };
          }
          if (p.id) {
            deletedMap[p.id.toLowerCase()] = { deletedAt: new Date().toISOString() };
          }
          delete localUsers[k];
        }
      }
      saveDeletedUsers(deletedMap);
      saveStoredUsers(localUsers);

      // 3. Remove from disabled map if present
      const disabledMap = getDisabledUsers();
      delete disabledMap[cleanId];
      if (foundEmail) delete disabledMap[foundEmail];
      saveDisabledUsers(disabledMap);

      // 4. Supabase profiles delete
      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('profiles')
            .delete()
            .or(`id.eq.${targetUserIdOrEmail},email.eq.${cleanId}`);
        } catch (sbErr) {
          console.warn('Supabase delete profile warning:', sbErr);
        }
      }

      // 5. If deleted user is current session, sign them out
      if (
        user?.id?.toLowerCase() === cleanId ||
        user?.email?.toLowerCase() === cleanId ||
        (foundEmail && user?.email?.toLowerCase() === foundEmail)
      ) {
        await signOut();
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sellsolar_auth_updated'));
        window.dispatchEvent(new CustomEvent('sellsolar_users_updated'));
      }

      return { success: true };
    },
    [isSuperAdmin, isAdmin, user, profile, signOut]
  );

  const adminUpdateUserProfile = useCallback(
    async (targetUserIdOrEmail, updates, targetUserObj = null) => {
      const isFallbackAdmin =
        isUserAdmin(user, profile) ||
        isSuperAdmin ||
        isAdmin ||
        (user?.email || '').toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
        profile?.is_admin ||
        profile?.is_super_admin;

      if (!isFallbackAdmin) {
        throw new Error('Only administrators can update user details.');
      }

      const targetId = (targetUserObj?.id || (!String(targetUserIdOrEmail || '').includes('@') ? targetUserIdOrEmail : '') || '').trim();
      const targetEmail = (targetUserObj?.email || (String(targetUserIdOrEmail || '').includes('@') ? targetUserIdOrEmail : '') || '').trim().toLowerCase();
      const cleanPhone = updates.phone ? normalizePhone(updates.phone) : null;

      const localUsers = getStoredUsers();
      let updatedRecord = null;

      for (const [k, v] of Object.entries(localUsers)) {
        const p = v.profile || {};
        const u = v.user || {};
        const match =
          (targetId && (k.toLowerCase() === targetId.toLowerCase() || p.id?.toLowerCase() === targetId.toLowerCase() || u.id?.toLowerCase() === targetId.toLowerCase())) ||
          (targetEmail && (k.toLowerCase() === targetEmail || p.email?.toLowerCase() === targetEmail || u.email?.toLowerCase() === targetEmail));

        if (match) {
          v.profile = {
            ...v.profile,
            ...updates,
            ...(cleanPhone ? { phone: cleanPhone } : {}),
          };
          updatedRecord = v.profile;
        }
      }

      if (!updatedRecord) {
        const storeKey = targetEmail || targetId || `user_${Date.now()}`;
        localUsers[storeKey] = {
          user: { id: targetId || storeKey, email: targetEmail },
          profile: {
            id: targetId || storeKey,
            email: targetEmail,
            full_name: targetUserObj?.name || 'User',
            ...updates,
            ...(cleanPhone ? { phone: cleanPhone } : {}),
          },
        };
        updatedRecord = localUsers[storeKey].profile;
      }
      saveStoredUsers(localUsers);

      // Save to persistent user phones map across all possible lookups
      if (cleanPhone) {
        const pMap = getUserPhonesMap();
        if (targetId) {
          pMap[targetId] = cleanPhone;
          pMap[targetId.toLowerCase()] = cleanPhone;
        }
        if (targetEmail) {
          pMap[targetEmail] = cleanPhone;
        }
        if (targetUserIdOrEmail) {
          pMap[targetUserIdOrEmail] = cleanPhone;
          pMap[String(targetUserIdOrEmail).toLowerCase()] = cleanPhone;
        }
        saveUserPhonesMap(pMap);
      }

      // If updating the active logged-in user, immediately sync profile React state & stored session
      const currentActiveId = (user?.id || profile?.id || '').toLowerCase();
      const currentActiveEmail = (user?.email || profile?.email || '').toLowerCase();
      const isSelf =
        (targetId && targetId.toLowerCase() === currentActiveId) ||
        (targetEmail && targetEmail === currentActiveEmail) ||
        (targetUserIdOrEmail && (String(targetUserIdOrEmail).toLowerCase() === currentActiveId || String(targetUserIdOrEmail).toLowerCase() === currentActiveEmail));

      if (isSelf) {
        setProfile((prev) => ({
          ...(prev || {}),
          ...updates,
          ...(cleanPhone ? { phone: cleanPhone } : {}),
        }));
        saveStoredSession({
          user,
          profile: {
            ...(profile || {}),
            ...updates,
            ...(cleanPhone ? { phone: cleanPhone } : {}),
          },
        });
      }

      // Supabase update
      if (isSupabaseConfigured()) {
        try {
          const payload = { ...updates };
          if (cleanPhone) payload.phone = cleanPhone;
          if (isValidUuid(targetId)) {
            await supabase
              .from('profiles')
              .update(payload)
              .eq('id', targetId);
          } else if (targetEmail && !targetEmail.endsWith('@sellsolar.local')) {
            await supabase
              .from('profiles')
              .update(payload)
              .ilike('email', targetEmail);
          }
        } catch (sbErr) {
          console.warn('Supabase profile update warning:', sbErr);
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sellsolar_auth_updated'));
        window.dispatchEvent(new CustomEvent('sellsolar_users_updated'));
      }

      return { success: true, profile: updatedRecord };
    },
    [isSuperAdmin, isAdmin, user, profile]
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      role,
      isSuperAdmin,
      isAdmin,
      isDealer,
      isCustomer,
      passwordRecovery,
      signOut,
      signIn,
      signInWithGoogle,
      signUp,
      resendConfirmationEmail,
      updatePassword,
      updateProfile,
      refreshProfile,
      updateUserRole,
      toggleUserDisabled,
      deleteUserAccount,
      adminUpdateUserProfile,
      requestPasswordResetOtp,
      verifyPasswordResetOtp,
      resetPasswordWithOtp,
      completePasswordRecovery,
    }),
    [
      user,
      profile,
      loading,
      role,
      isSuperAdmin,
      isAdmin,
      isDealer,
      isCustomer,
      passwordRecovery,
      signOut,
      signIn,
      signInWithGoogle,
      signUp,
      resendConfirmationEmail,
      updatePassword,
      updateProfile,
      refreshProfile,
      updateUserRole,
      toggleUserDisabled,
      deleteUserAccount,
      adminUpdateUserProfile,
      requestPasswordResetOtp,
      verifyPasswordResetOtp,
      resetPasswordWithOtp,
      completePasswordRecovery,
    ]
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
