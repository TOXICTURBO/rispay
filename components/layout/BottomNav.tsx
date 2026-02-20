'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, Send, BarChart3, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/accounts', icon: CreditCard, label: 'Accounts' },
  { href: '/send', icon: Send, label: 'Send' },
  { href: '/insights', icon: BarChart3, label: 'Insights' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl shadow-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="flex-1 relative">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`
                  flex flex-col items-center justify-center py-2 rounded-xl
                  transition-colors duration-200
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }
                `}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-t-full" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
