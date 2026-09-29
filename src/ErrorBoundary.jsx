'use client';

import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    const isChunkError = Boolean(
      error &&
        (error.name === 'ChunkLoadError' ||
          /Loading chunk [\d\w]+ failed/i.test(error.message || '') ||
          /Failed to fetch dynamically imported module/i.test(error.message || ''))
    );
    return { error, isChunkError };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SellSolar ErrorBoundary caught:', error, errorInfo);

    // If chunk loading failed (usually after a new deployment on CDN), automatically reload to pick up fresh bundle
    const isChunkError = Boolean(
      error &&
        (error.name === 'ChunkLoadError' ||
          /Loading chunk [\d\w]+ failed/i.test(error.message || '') ||
          /Failed to fetch dynamically imported module/i.test(error.message || ''))
    );

    if (isChunkError && typeof window !== 'undefined') {
      try {
        const lastReload = parseInt(sessionStorage.getItem('sellsolar_chunk_reload') || '0', 10);
        // Only auto-reload if not already reloaded in the last 15 seconds (prevents loops if offline)
        if (Date.now() - lastReload > 15000) {
          sessionStorage.setItem('sellsolar_chunk_reload', String(Date.now()));
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('sellsolar_chunk_reload');
      } catch {}
      window.location.reload();
    }
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 text-center transition-colors">
          <div className="max-w-md w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-xl space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">
                {this.state.isChunkError ? 'New Update Available' : 'SellSolar Session Refresh'}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {this.state.isChunkError
                  ? 'A new version of SellSolar was deployed. Please reload to load the latest verified solar prices and listings.'
                  : 'A brief connection interrupt occurred while loading. Please refresh to continue.'}
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="btn-primary w-full py-3 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all active:scale-95"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
