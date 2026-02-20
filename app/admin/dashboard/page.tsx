'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data.stats));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header title="Admin Dashboard" username={user?.username} />
      <main className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          System Overview
        </h1>

        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                Total Users
              </p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                Total Banks
              </p>
              <p className="text-2xl font-bold">{stats.totalBanks}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                Admin Wallet
              </p>
              <p className="text-2xl font-bold">
                ${stats.adminWalletBalance.toFixed(2)}
              </p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                Total Transactions
              </p>
              <p className="text-2xl font-bold">{stats.totalTransactions}</p>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => window.location.href = '/admin/keys'}>
                Generate Registration Keys
              </Button>
              <Button className="w-full" onClick={() => window.location.href = '/admin/banks'}>
                Create Bank
              </Button>
              <Button className="w-full" onClick={() => window.location.href = '/admin/settings'}>
                System Settings
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
