'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sun, LoaderCircle, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;
    let pollInterval = null;
    let timeoutTimer = null;

    async function processCallback() {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashStr = window.location.hash.replace(/^#/, '');
        const hashParams = new URLSearchParams(hashStr);

        const error = searchParams.get('error') || hashParams.get('error');
        const errorDesc =
          searchParams.get('error_description') ||
          hashParams.get('error_description') ||
          searchParams.get('message');

        if (error) {
          if (!active) return;
          setStatus('error');
          setErrorMessage(errorDesc || error || 'Authentication was denied or cancelled.');
          return;
        }

        const code = searchParams.get('code');
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');

        // 1. If explicit access_token and refresh_token are in hash, set session safely
        if (accessToken && refreshToken && typeof supabase?.auth?.setSession === 'function') {
          try {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          } catch (e) {
            console.warn('[AuthCallback] setSession notice:', e);
          }
        }

        // 2. If PKCE code is in query params, try exchangeCodeForSession safely
        if (code && typeof supabase?.auth?.exchangeCodeForSession === 'function') {
          try {
            await supabase.auth.exchangeCodeForSession(code);
          } catch (e) {
            // Might already have been exchanged by detectSessionInUrl
            console.warn('[AuthCallback] exchangeCode notice:', e);
          }
        }

        const returnPath =
          (typeof window !== 'undefined' && sessionStorage.getItem('auth_redirect_to')) || '/';

        const handleAuthSuccess = async (sess) => {
          if (!active || !sess?.user) return;
          setStatus('success');

          if (pollInterval) clearInterval(pollInterval);
          if (timeoutTimer) clearTimeout(timeoutTimer);

          try {
            sessionStorage.removeItem('auth_redirect_to');
          } catch {}

          const u = sess.user;
          const cleanEmail = (u.email || '').toLowerCase();
          const meta = u.user_metadata || {};
          const fullName = meta.full_name || meta.name || (cleanEmail ? cleanEmail.split('@')[0] : 'Verified User');
          const isOwnerAdmin =
            cleanEmail === 'mudassir2k6@gmail.com' ||
            cleanEmail === 'admin@sellsolar.pk' ||
            cleanEmail === 'info@sellsolar.pk';

          // Clear any deleted tombstone for this successfully authenticated user
          try {
            const rawDel = localStorage.getItem('sellsolar_deleted_users');
            if (rawDel) {
              const dMap = JSON.parse(rawDel);
              if (dMap[u.id] || dMap[cleanEmail]) {
                delete dMap[u.id];
                delete dMap[cleanEmail];
                localStorage.setItem('sellsolar_deleted_users', JSON.stringify(dMap));
              }
            }
          } catch {}

          // Cache active session immediately in localStorage for instantaneous boot
          try {
            const profObj = {
              id: u.id,
              email: cleanEmail,
              username: cleanEmail ? cleanEmail.split('@')[0] : 'user',
              full_name: fullName,
              phone: meta.phone || '',
              city: meta.city || '',
              account_type: isOwnerAdmin ? 'admin' : 'individual',
              is_admin: isOwnerAdmin,
              is_super_admin: isOwnerAdmin,
              is_verified_dealer: false,
              created_at: u.created_at || new Date().toISOString(),
            };
            localStorage.setItem('sellsolar_active_auth_session', JSON.stringify({ user: u, profile: profObj }));

            const rawUsers = localStorage.getItem('sellsolar_custom_auth_users');
            const usersMap = rawUsers ? JSON.parse(rawUsers) : {};
            usersMap[cleanEmail] = { user: u, profile: profObj };
            localStorage.setItem('sellsolar_custom_auth_users', JSON.stringify(usersMap));
          } catch {}

          // Sync with cloud profiles table
          try {
            if (supabase) {
              const upsertPayload = {
                id: u.id,
                email: cleanEmail,
                full_name: fullName,
                account_type: isOwnerAdmin ? 'admin' : 'individual',
                is_admin: isOwnerAdmin,
                created_at: u.created_at || new Date().toISOString(),
              };
              if (meta.phone) upsertPayload.phone = meta.phone;
              await supabase.from('profiles').upsert(upsertPayload, { onConflict: 'id' }).catch(() => {});
            }
          } catch (syncErr) {
            console.warn('[AuthCallback] Cloud sync notice:', syncErr);
          }

          // Notify opener if popup, otherwise full redirect
          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage(
                {
                  type: 'SELLSOLAR_GOOGLE_AUTH_SUCCESS',
                  session: sess,
                },
                '*'
              );
            } catch {}

            setTimeout(() => {
              try {
                window.close();
              } catch {}
            }, 400);

            setTimeout(() => {
              if (typeof window !== 'undefined' && !window.closed) {
                window.location.replace(returnPath);
              }
            }, 800);
          } else {
            setTimeout(() => {
              window.location.replace(returnPath);
            }, 300);
          }
        };

        // Check if session is already active
        const { data: initialCheck } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
        if (initialCheck?.session?.user) {
          await handleAuthSuccess(initialCheck.session);
          return;
        }

        // Listen for auth state change
        const authSub = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user && active) {
            await handleAuthSuccess(session);
          }
        });

        // Polling loop: Check every 250ms for up to 8 seconds
        let attempts = 0;
        const maxAttempts = 32; // 32 * 250ms = 8 seconds
        pollInterval = setInterval(async () => {
          if (!active) {
            clearInterval(pollInterval);
            return;
          }
          attempts++;
          try {
            const { data } = await supabase.auth.getSession();
            if (data?.session?.user) {
              clearInterval(pollInterval);
              await handleAuthSuccess(data.session);
            } else if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              if (active) {
                setStatus('error');
                setErrorMessage('Authentication session could not be established. Please try signing in again.');
              }
            }
          } catch (pollErr) {
            if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              if (active) {
                setStatus('error');
                setErrorMessage('Authentication request timed out. Please try signing in again.');
              }
            }
          }
        }, 250);

        return () => {
          if (pollInterval) clearInterval(pollInterval);
          if (authSub?.data?.subscription) {
            authSub.data.subscription.unsubscribe();
          }
        };
      } catch (err) {
        if (!active) return;
        setStatus('error');
        setErrorMessage(err?.message || 'Something went wrong during sign-in.');
      }
    }

    processCallback();

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };
  }, []);

  const handleRetryGoogle = async () => {
    setStatus('verifying');
    setErrorMessage('');
    try {
      const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://sellsolar.pk';
      const redirectTo = `${origin}/auth/callback`;
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
      if (error) throw error;
      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (retryErr) {
      setStatus('error');
      setErrorMessage(retryErr?.message || 'Failed to restart Google Sign-In.');
    }
  };

  return (
    <div
      id="auth-callback-container"
      className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans"
    >
      <div
        id="auth-callback-card"
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-md shadow-amber-500/20">
            <Sun className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
          Sell<span className="text-amber-500">Solar</span>
        </h1>

        {status === 'verifying' && (
          <div className="py-4 space-y-3">
            <LoaderCircle className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Verifying Google Sign-In...
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please wait while we confirm your account and set up your session.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4 space-y-3">
            <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Sign-In Successful!
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Taking you back to SellSolar...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4 space-y-3">
            <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              Authentication Error
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                id="auth-callback-retry-btn"
                onClick={handleRetryGoogle}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Google Sign-In
              </button>
              <button
                type="button"
                id="auth-callback-close-btn"
                onClick={() => {
                  if (window.opener) {
                    window.close();
                  } else {
                    window.location.replace('/');
                  }
                }}
                className="w-full py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
