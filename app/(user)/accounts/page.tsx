'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { MoreVertical, CheckCircle } from 'lucide-react';

interface Account {
  id: string;
  balance: string;
  nickname?: string;
  is_primary: boolean;
  bank: {
    id: string;
    name: string;
    code: string;
  };
}

export default function AccountsPage() {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [nicknameModalOpen, setNicknameModalOpen] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/user/accounts');
      const data = await res.json();
      if (data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      showToast('Failed to load accounts', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSetPrimary = async (accountId: string) => {
    try {
      const res = await fetch(`/api/user/accounts/${accountId}/primary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      if (res.ok) {
        showToast('Primary account updated', 'success');
        fetchAccounts();
      } else {
        showToast('Failed to update primary account', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    }
  };

  const handleUpdateNickname = async () => {
    if (!selectedAccount) return;

    try {
      const res = await fetch(
        `/api/user/accounts/${selectedAccount.id}/nickname`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: selectedAccount.id,
            nickname: newNickname || null,
          }),
        }
      );

      if (res.ok) {
        showToast('Nickname updated', 'success');
        setNicknameModalOpen(false);
        setSelectedAccount(null);
        setNewNickname('');
        fetchAccounts();
      } else {
        showToast('Failed to update nickname', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Group accounts by bank
  const accountsByBank = accounts.reduce((acc, account) => {
    const bankId = account.bank.id;
    if (!acc[bankId]) {
      acc[bankId] = {
        bank: account.bank,
        accounts: [],
      };
    }
    acc[bankId].accounts.push(account);
    return acc;
  }, {} as Record<string, { bank: Account['bank']; accounts: Account[] }>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        My Accounts
      </h2>

      {Object.values(accountsByBank).length === 0 ? (
        <Card>
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            No accounts yet. Link a bank to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.values(accountsByBank).map((bankGroup, bankIndex) => (
            <motion.div
              key={bankGroup.bank.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: bankIndex * 0.1 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {bankGroup.bank.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {bankGroup.bank.code}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {bankGroup.accounts.map((account, index) => (
                    <motion.div
                      key={account.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        p-4 rounded-xl border-2 transition-colors
                        ${
                          account.is_primary
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-slate-200 dark:border-slate-700'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {account.nickname || `Account ${account.id.slice(0, 8)}`}
                            </p>
                            {account.is_primary && (
                              <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            {account.id}
                          </p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(Number(account.balance))}
                          </p>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => {
                              setSelectedAccount(account);
                              setNewNickname(account.nickname || '');
                              setNicknameModalOpen(true);
                            }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                          >
                            <MoreVertical className="w-5 h-5 text-slate-500" />
                          </button>
                        </div>
                      </div>
                      {!account.is_primary && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-3 w-full"
                          onClick={() => handleSetPrimary(account.id)}
                        >
                          Set as Primary
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={nicknameModalOpen}
        onClose={() => {
          setNicknameModalOpen(false);
          setSelectedAccount(null);
          setNewNickname('');
        }}
        title="Edit Account"
      >
        <div className="space-y-4">
          <Input
            label="Nickname"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            placeholder="Enter nickname"
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setNicknameModalOpen(false);
                setSelectedAccount(null);
                setNewNickname('');
              }}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleUpdateNickname}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
