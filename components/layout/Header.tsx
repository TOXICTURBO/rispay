'use client';

import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Bell, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  username?: string;
}

export function Header({ title, username }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {username && <Avatar username={username} size="sm" />}
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No new notifications
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
