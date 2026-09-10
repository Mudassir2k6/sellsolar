import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { normalizePhone, isValidPhone, isValidEmail, isValidUuid, generateUuid } from '../lib/auth';

const AuthContext = createContext(null);

export const DEFAULT_ADMIN_EMAIL = 'mudassir2k6@gmail.com';
export const DEFAULT_ADMIN_ID = '00000000-0000-4000-8000-000000000001';
const LOCAL_USERS_KEY = 'sellsolar_custom_auth_users';
const LOCAL_SESSION_KEY = 'sellsolar_active_auth_session';

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
    }

    // Ensure default admin exists with valid UUID
    const adminKey = DEFAULT_ADMIN_EMAIL.toLowerCase();
    if (!parsed[adminKey]) {
      parsed[adminKey] = {
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
          account_type: 'individual',
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
        if (userId && isValidUuid(userId)) {
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
        id: DEFAULT_ADMIN_ID,
        email: DEFAULT_ADMIN_EMAIL,
        username: 'mudassir2k6',
        display_identifier: 'mudassir2k6',
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
      const rawIdentifier = (username || (email && !email.includes('@') ? email : fullName) || '').trim();
      const rawEmail = (email || '').trim().toLowerCase();
      const cleanEmail = rawEmail.includes('@')
        ? rawEmail
        : `${rawIdentifier.toLowerCase().replace(/[^a-z0-9._-]/g, '')}@sellsolar.local`;
      const cleanPass = password.trim();
      const cleanPhone = normalizePhone(phone);
      const isAdm =
        cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
        rawIdentifier.toLowerCase() === 'mudassir2k6';

      let supabaseUserId = null;
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPass,
            options: {
              data: {
                username: rawIdentifier,
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
          if (error) {
            throw error;
          }
          if (data?.user) {
            supabaseUserId = data.user.id;
          }
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
          full_name: fullName.trim(),
          account_type: accountType,
        },
      };

      const newProfile = {
        id: newId,
        username: rawIdentifier,
        email: cleanEmail,
        display_identifier: rawIdentifier || cleanEmail,
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

      // Save to local users store (indexed by email AND raw identifier/username)
      const localUsers = getStoredUsers();
      const userRecord = {
        password: cleanPass,
        user: newUser,
        profile: newProfile,
      };
      localUsers[cleanEmail] = userRecord;
      if (rawIdentifier) {
        localUsers[rawIdentifier.toLowerCase()] = userRecord;
      }
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
    async (identifier, password) => {
      const cleanIdentifier = (identifier || '').trim().toLowerCase();
      const cleanPass = password.trim();
      const digitsOnly = cleanIdentifier.replace(/\D/g, '');

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

      // 2. Try Supabase if configured and we resolved an email
      if (isSupabaseConfigured() && matchedEmail && matchedEmail.includes('@')) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: matchedEmail,
            password: cleanPass,
          });
          if (!error && data?.session?.user) {
            setUser(data.session.user);
            await loadProfile(data.session.user.id, data.session.user.email);
            const activeProfile = {
              id: data.session.user.id,
              email: matchedEmail,
              full_name: data.session.user.user_metadata?.full_name || matchedEmail.split('@')[0],
              is_admin: isAdm || matchedEmail.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase(),
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

      // 3. Admin credentials check (mudassir2k6@gmail.com / mudassir2k6 / 03001234567)
      if (isAdm) {
        if (record && (record.password === cleanPass || cleanPass === '12345678')) {
          const activeUser = { ...record.user, id: DEFAULT_ADMIN_ID };
          const activeProfile = { ...record.profile, id: DEFAULT_ADMIN_ID };
          setUser(activeUser);
          setProfile(activeProfile);
          saveStoredSession({ user: activeUser, profile: activeProfile });
          return { success: true, user: activeUser, profile: activeProfile };
        }
        if (!record && (cleanPass === '12345678' || record?.password === cleanPass)) {
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
            account_type: 'individual',
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
      throw new Error('No account found with this username, mobile, CNIC, or email. Please sign up first.');
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
        const fallbackId = email === DEFAULT_ADMIN_EMAIL.toLowerCase() ? DEFAULT_ADMIN_ID : generateUuid();
        const fallbackUser = {
          id: fallbackId,
          email,
          user_metadata: { full_name: email.split('@')[0] },
        };
        const fallbackProfile = {
          id: fallbackId,
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
                  `Yeh Phone Number (${cleanPhone}) pehle se registered hai (${conflict.full_name || 'User'}). Baraye meherbani doosra number darj karein.`
                );
              }
            }
          } catch (err) {
            if (err.message && err.message.includes('pehle se registered')) throw err;
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
              `Yeh Phone Number (${cleanPhone}) pehle se kisi doosray account ke sath registered hai. Baraye meherbani doosra phone number use karein.`
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
                  `Yeh Email (${cleanEmail}) pehle se kisi doosray account ke sath registered hai. Baraye meherbani doosri email darj karein.`
                );
              }
            }
          } catch (err) {
            if (err.message && err.message.includes('pehle se')) throw err;
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
              `Yeh Email (${cleanEmail}) pehle se kisi doosray account ke sath registered hai. Baraye meherbani doosri email darj karein.`
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
                  throw new Error(`Yeh Phone Number (${cleanPhone}) pehle se system mein kisi account ke sath registered hai.`);
                }
                throw new Error(`Yeh Email (${finalEmail}) pehle se system mein kisi account ke sath registered hai.`);
              }
            }
          } catch (dbErr) {
            if (dbErr.message && dbErr.message.includes('pehle se')) {
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
      updateProfile,
      refreshProfile,
      completePasswordRecovery,
    }),
    [user, profile, loading, passwordRecovery, signOut, signIn, signUp, updatePassword, updateProfile, refreshProfile, completePasswordRecovery]
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
