'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { Send, Plus, Building2, CreditCard, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface Account {
  id: string;
  balance: string;
  bank: {
    name: string;
    code: string;
  };
  is_primary: boolean;
}

export default function HomePage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, transactionsRes] = await Promise.all([
        fetch('/api/user/accounts'),
        fetch('/api/user/transactions?limit=5'),
      ]);

      const accountsData = await accountsRes.json();
      const transactionsData = await transactionsRes.json();

      if (accountsData.accounts) {
        setAccounts(accountsData.accounts);
        const total = accountsData.accounts.reduce(
          (sum: number, acc: Account) => sum + Number(acc.balance),
          0
        );
        setTotalBalance(total);
      }

      if (transactionsData.transactions) {
        setRecentTransactions(transactionsData.transactions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm uppercase tracking-wider opacity-90">
              Available Balance
            </p>
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {balanceVisible ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <motion.h2
            key={totalBalance}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold tracking-tight mb-2"
          >
            {balanceVisible ? formatCurrency(totalBalance) : '••••••'}
          </motion.h2>
          <p className="text-sm opacity-75">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''} linked
          </p>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/send">
          <Card hover className="text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-2">
              <Send className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              Send Money
            </p>
          </Card>
        </Link>
        <Card hover className="text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
            <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="font-medium text-slate-900 dark:text-slate-100">
            Request
          </p>
        </Card>
        <Link href="/accounts">
          <Card hover className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              Add Bank
            </p>
          </Card>
        </Link>
        <Card hover className="text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
            <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="font-medium text-slate-900 dark:text-slate-100">
            Add Account
          </p>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Recent Transactions
        </h3>
        {recentTransactions.length === 0 ? (
          <Card>
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">
              No transactions yet
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx, index) => {
              const isSent =
                tx.sender_account.user_id === user?.id ||
                accounts.some((acc) => acc.id === tx.sender_account_id);
              const amount = Number(tx.amount);
              const otherUser = isSent
                ? tx.receiver_account.user
                : tx.sender_account.user;

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover padding="sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          username={otherUser?.username || 'Unknown'}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {otherUser?.username || 'Unknown'}
                          </p>
                          {tx.memo && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {tx.memo}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            isSent
                              ? 'text-red-500 dark:text-red-400'
                              : 'text-green-500 dark:text-green-400'
                          }`}
                        >
                          {isSent ? '-' : '+'}
                          {formatCurrency(amount)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
