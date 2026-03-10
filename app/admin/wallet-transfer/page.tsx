'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft } from 'lucide-react';

export default function AdminWalletTransferPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch('/api/admin/wallet-transfer')
      .then((res) => res.json())
      .then((data) => {
        setWalletBalance(Number(data.adminWalletBalance || 0));
        setFetching(false);
      })
      .catch(() => {
        showToast('Failed to fetch wallet balance', 'error');
        setFetching(false);
      });
  }, [showToast]);

  const handleTransfer = async () => {
    if (!recipientUsername.trim()) {
      showToast('Please enter recipient username', 'error');
      return;
    }

    const transferAmount = Number(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (transferAmount > walletBalance) {
      showToast('Insufficient wallet balance', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/wallet-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientUsername: recipientUsername.trim(),
          amount: transferAmount,
          memo: memo.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(data.message || 'Transfer successful', 'success');
        setRecipientUsername('');
        setAmount('');
        setMemo('');
        setWalletBalance(walletBalance - transferAmount);
      } else {
        const error = await res.json();
        showToast(error.error || 'Transfer failed', 'error');
      }
    } catch {
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header title="Admin Wallet Transfer" username={user?.username} />
      <main className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Wallet Balance Card */}
        <Card>
          <h2 className="text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Available Balance
          </h2>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            ${walletBalance.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You can transfer funds from this wallet to any user account
          </p>
        </Card>

        {/* Transfer Form Card */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Transfer Funds</h2>
          <div className="space-y-4">
            {/* Recipient Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Recipient Username
              </label>
              <Input
                type="text"
                placeholder="Enter username"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                User must have an active account
              </p>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Amount ($)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Max: ${walletBalance.toFixed(2)}
              </p>
            </div>

            {/* Memo */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Memo (Optional)
              </label>
              <Input
                type="text"
                placeholder="Add a note about this transfer"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Transfer Button */}
            <Button
              variant="primary"
              onClick={handleTransfer}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Transfer'}
            </Button>
          </div>
        </Card>

        {/* Back Button */}
        <Button
          variant="secondary"
          onClick={() => window.history.back()}
          className="w-full flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </main>
    </div>
  );
}
