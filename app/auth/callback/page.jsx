'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sun, LoaderCircle, CheckCircle, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function processCallback() {
      try {
        // Check for error in query or hash params
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

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

        // Supabase with detectSessionInUrl: true handles parsing tokens automatically.
        // Retrieve the current session or exchange PKCE code if present.
        const code = searchParams.get('code');
        let currentSession = null;

        if (code && typeof supabase?.auth?.exchangeCodeForSession === 'function') {
          try {
            const { data, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
            if (!exchangeErr && data?.session) {
              currentSession = data.session;
            }
          } catch (e) {
            console.warn('[AuthCallback] exchangeCode error, falling back to getSession:', e);
          }
        }

        if (!currentSession) {
          const { data } = await supabase.auth.getSession();
          currentSession = data?.session;
        }

        if (currentSession?.user) {
          if (!active) return;
          setStatus('success');

          // Notify opener window if opened in a popup
          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage(
                {
                  type: 'SELLSOLAR_GOOGLE_AUTH_SUCCESS',
                  session: currentSession,
                },
                '*'
              );
            } catch (postErr) {
              console.warn('[AuthCallback] postMessage error:', postErr);
            }

            // Close popup after a short pause
            setTimeout(() => {
              try {
                window.close();
              } catch {}
            }, 500);

            // Fallback redirect if popup window cannot close itself
            setTimeout(() => {
              if (typeof window !== 'undefined' && !window.closed) {
                window.location.replace('/');
              }
            }, 1200);
          } else {
            // Full-window redirect flow
            setTimeout(() => {
              window.location.replace('/');
            }, 400);
          }
        } else {
          // Wait up to 2 seconds for onAuthStateChange
          const authListener = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user && active) {
              setStatus('success');
              if (window.opener && !window.opener.closed) {
                try {
                  window.opener.postMessage(
                    {
                      type: 'SELLSOLAR_GOOGLE_AUTH_SUCCESS',
                      session,
                    },
                    '*'
                  );
                } catch {}
                setTimeout(() => {
                  try {
                    window.close();
                  } catch {}
                }, 400);
              } else {
                setTimeout(() => {
                  window.location.replace('/');
                }, 400);
              }
            }
          });

          // Fallback timeout
          setTimeout(async () => {
            if (!active) return;
            const finalCheck = await supabase.auth.getSession();
            if (finalCheck.data?.session?.user) {
              setStatus('success');
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage(
                  {
                    type: 'SELLSOLAR_GOOGLE_AUTH_SUCCESS',
                    session: finalCheck.data.session,
                  },
                  '*'
                );
                window.close();
              } else {
                window.location.replace('/');
              }
            } else {
              setStatus('error');
              setErrorMessage('Authentication session could not be established. Please try signing in again.');
            }
            if (authListener?.data?.subscription) {
              authListener.data.subscription.unsubscribe();
            }
          }, 2500);
        }
      } catch (err) {
        if (!active) return;
        setStatus('error');
        setErrorMessage(err?.message || 'Something went wrong during sign-in.');
      }
    }

    processCallback();

    return () => {
      active = false;
    };
  }, []);

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
              Closing this window and taking you back to SellSolar...
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
            <button
              type="button"
              id="auth-callback-close-btn"
              onClick={() => {
                if (window.opener) {
                  window.close();
                } else {
                  window.location.replace('/login');
                }
              }}
              className="mt-3 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
            >
              {window.opener ? 'Close Window' : 'Back to Login'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
