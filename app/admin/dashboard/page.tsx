'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import {
  Key,
  Building2,
  Settings,
  FileText,
  Sliders,
  TrendingUp,
  Wallet,
  RotateCw,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data.stats));
  }, []);

  const menuItems = [
    {
      title: 'Generate Keys',
      description: 'Create registration keys for new users',
      icon: Key,
      href: '/admin/keys',
      color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
    },
    {
      title: 'Manage Banks',
      description: 'Create and manage banks',
      icon: Building2,
      href: '/admin/banks',
      color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
    },
    {
      title: 'Audit Logs',
      description: 'View system activity logs',
      icon: FileText,
      href: '/admin/audit',
      color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
    },
    {
      title: 'Settings',
      description: 'Configure system parameters',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300',
    },
    {
      title: 'Statistics',
      description: 'View detailed system stats',
      icon: TrendingUp,
      href: '/admin/stats',
      color: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300',
    },
    {
      title: 'Wallet Transfer',
      description: 'Transfer from admin wallet',
      icon: Wallet,
      href: '/admin/wallet-transfer',
      color: 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300',
    },
    {
      title: 'Advanced Settings',
      description: 'System configuration & reset',
      icon: Sliders,
      href: '/admin/advanced',
      color: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header title="Admin Dashboard" username={user?.username} />
      <main className="p-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            System Overview
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your financial system
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Total Users
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.totalUsers}
              </p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Total Banks
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.totalBanks}
              </p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Admin Wallet
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                ${stats.adminWalletBalance.toFixed(2)}
              </p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Transactions
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.totalTransactions}
              </p>
            </Card>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Management Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.href}
                  hover
                  onClick={() => (window.location.href = item.href)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {stats && (
          <Card>
            <h2 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
              System Health
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Vault Balance</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  ${stats.totalVaultBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Average Account Balance</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  ${stats.averageAccountBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Active Banks</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {stats.activeBanks}
                </span>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
