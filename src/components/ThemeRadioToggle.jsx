import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeRadioToggle({ className = '', compact = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      className={`group relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
        isDark
          ? 'bg-gray-800 text-amber-400 border-gray-700 hover:bg-gray-700 hover:text-amber-300 hover:border-gray-600 shadow-sm'
          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="h-4.5 w-4.5 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
}

