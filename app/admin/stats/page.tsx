'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminStatsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header title="System Statistics" username={user?.username} />
        <main className="p-4">
          <Card>
            <p className="text-center text-slate-600 dark:text-slate-400">
              Unable to load statistics
            </p>
          </Card>
        </main>
      </div>
    );
  }

  const bankData = stats.bankStats || [];
  const topBanks = bankData
    .sort((a: any, b: any) => Number(b.vault_balance) - Number(a.vault_balance))
    .slice(0, 10)
    .map((b: any) => ({
      name: b.code,
      balance: Number(b.vault_balance),
    }));

  const statusData =
    stats.transactionStats && stats.transactionStats.length > 0
      ? stats.transactionStats
      : [
          { status: 'COMPLETED', count: 0 },
          { status: 'PENDING', count: 0 },
        ];

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header title="System Statistics" username={user?.username} />
      <main className="p-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            System Statistics
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Detailed view of system metrics and analytics
          </p>
        </div>

        {/* Summary Stats */}
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
              Total Transactions
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.totalTransactions}
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
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              Total Vault Balance
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              ${stats.totalVaultBalance.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Across all banks
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              Total System Balance
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              ${(
                Number(stats.totalVaultBalance) + Number(stats.adminWalletBalance)
              ).toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Vault + Admin wallet
            </p>
          </Card>
        </div>

        {/* User Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              Average Account Balance
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              ${stats.averageAccountBalance.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Across all accounts
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              Active Accounts
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stats.activeAccounts || 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Activated by users
            </p>
          </Card>
        </div>

        {/* Top Banks Chart */}
        {topBanks.length > 0 && (
          <Card>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              Top Banks by Vault Balance
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topBanks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="balance" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Transaction Status */}
        {statusData.length > 0 && (
          <Card>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              Transaction Status Distribution
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Bank Details Table */}
        {bankData.length > 0 && (
          <Card>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              All Banks
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-600 dark:text-slate-400">
                      Bank Name
                    </th>
                    <th className="text-left py-2 px-3 text-slate-600 dark:text-slate-400">
                      Code
                    </th>
                    <th className="text-right py-2 px-3 text-slate-600 dark:text-slate-400">
                      Vault Balance
                    </th>
                    <th className="text-right py-2 px-3 text-slate-600 dark:text-slate-400">
                      Fee %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bankData.map((bank: any) => (
                    <tr
                      key={bank.id}
                      className="border-b border-slate-100 dark:border-slate-800"
                    >
                      <td className="py-2 px-3 text-slate-900 dark:text-slate-100">
                        {bank.name}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                        {bank.code}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-900 dark:text-slate-100">
                        ${Number(bank.vault_balance).toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-900 dark:text-slate-100">
                        {Number(bank.base_fee_percentage).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
