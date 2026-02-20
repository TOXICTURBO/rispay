'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { QrCode } from 'lucide-react';

interface Account {
  id: string;
  balance: string;
  is_primary: boolean;
  bank: {
    name: string;
  };
}

interface Preview {
  amount: number;
  bankFeePercentage: number;
  bankFee: number;
  taxPercentage: number;
  tax: number;
  totalDeducted: number;
  receiverReceives: number;
  senderBalance: number;
  receiverUsername: string;
  receiverAccountId: string;
}

export default function SendPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [pin, setPin] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/user/accounts');
      const data = await res.json();
      if (data.accounts) {
        setAccounts(data.accounts);
        const primary = data.accounts.find((acc: Account) => acc.is_primary);
        if (primary) {
          setSelectedAccountId(primary.id);
        }
      }
    } catch (error) {
      showToast('Failed to load accounts', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handlePreview = async () => {
    if (!selectedAccountId || !recipient || !amount) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Invalid amount', 'error');
      return;
    }

    try {
      const res = await fetch('/api/transactions/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderAccountId: selectedAccountId,
          recipient,
          amount: amountNum,
        }),
      });

      const data = await res.json();
      if (res.ok && data.preview) {
        setPreview(data.preview);
        setPinModalOpen(true);
      } else {
        showToast(data.error || 'Failed to generate preview', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    }
  };

  const handleSend = async () => {
    if (!pin || pin.length !== 4) {
      showToast('Please enter a valid 4-digit PIN', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/transactions/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderAccountId: selectedAccountId,
          recipient,
          amount: parseFloat(amount),
          memo: memo || undefined,
          pin,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Transaction completed successfully!', 'success');
        setRecipient('');
        setAmount('');
        setMemo('');
        setPin('');
        setPreview(null);
        setPinModalOpen(false);
        fetchAccounts();
      } else {
        showToast(data.error || 'Transaction failed', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Send Money
      </h2>

      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              From Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bank.name} - {account.id.slice(0, 8)}
                  {account.is_primary && ' (Primary)'}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Recipient (Username or Account ID)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter username or account ID"
          />

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-4 text-3xl font-bold text-center bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <Input
            label="Memo (Optional)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Add a note"
            maxLength={200}
          />

          <Button
            onClick={handlePreview}
            className="w-full"
            disabled={!selectedAccountId || !recipient || !amount}
          >
            Continue
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={pinModalOpen}
        onClose={() => {
          setPinModalOpen(false);
          setPin('');
        }}
        title="Confirm Transaction"
      >
        {preview && (
          <div className="space-y-4">
            <Card padding="sm" className="bg-slate-50 dark:bg-slate-800">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Amount:
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(preview.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Bank Fee ({preview.bankFeePercentage}%):
                  </span>
                  <span>{formatCurrency(preview.bankFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Tax ({preview.taxPercentage}%):
                  </span>
                  <span>{formatCurrency(preview.tax)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold">
                  <span>Total Deducted:</span>
                  <span className="text-red-500">
                    {formatCurrency(preview.totalDeducted)}
                  </span>
                </div>
                <div className="flex justify-between text-green-500 font-semibold">
                  <span>Receiver Gets:</span>
                  <span>{formatCurrency(preview.receiverReceives)}</span>
                </div>
              </div>
            </Card>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Enter PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setPin(value);
                }}
                placeholder="0000"
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setPinModalOpen(false);
                  setPin('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSend}
                isLoading={loading}
                disabled={pin.length !== 4}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
