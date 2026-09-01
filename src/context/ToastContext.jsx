import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback(({ title, message, type = 'success', duration = 4500 }) => {
    setToast({
      id: Date.now(),
      title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice'),
      message,
      type,
      duration,
    });
  }, []);

  useEffect(() => {
    if (!toast || !toast.duration) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <div
          id="top-right-toast-notification"
          role="alert"
          aria-live="assertive"
          className="fixed top-5 right-4 sm:right-6 z-[120] max-w-sm sm:max-w-md w-full pointer-events-auto transition-all duration-300 transform translate-y-0"
        >
          <div
            className={`flex items-start gap-3.5 p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all ${
              toast.type === 'success'
                ? 'bg-white/95 dark:bg-gray-900/95 border-emerald-500/30 text-gray-900 dark:text-gray-100 shadow-emerald-500/10'
                : toast.type === 'error'
                ? 'bg-white/95 dark:bg-gray-900/95 border-rose-500/30 text-gray-900 dark:text-gray-100 shadow-rose-500/10'
                : 'bg-white/95 dark:bg-gray-900/95 border-primary-500/30 text-gray-900 dark:text-gray-100 shadow-primary-500/10'
            }`}
          >
            {/* Icon Container */}
            <div
              className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl ${
                toast.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                  : toast.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                  : 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>

            {/* Text details */}
            <div className="flex-1 pt-0.5 min-w-0 pr-2">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-1.5">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed break-words">
                  {toast.message}
                </p>
              )}
            </div>

            {/* Dismiss button */}
            <button
              onClick={hideToast}
              aria-label="Dismiss notification"
              className="flex-shrink-0 -mr-1 -mt-1 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      showToast: ({ title, message }) => {
        console.log(`[Toast] ${title}: ${message}`);
      },
      hideToast: () => {},
    };
  }
  return context;
}
