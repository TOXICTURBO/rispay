'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { AlertCircle } from 'lucide-react';

export default function AdminAdvancedPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [resetPassword, setResetPassword] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleResetEconomy = async () => {
    if (!resetPassword.trim()) {
      showToast('Please enter admin password', 'error');
      return;
    }

    if (confirmText !== 'RESET ECONOMY') {
      showToast('Please type "RESET ECONOMY" to confirm', 'error');
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch('/api/admin/economy/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: resetPassword }),
      });

      if (res.ok) {
        showToast(
          'Economy reset successfully. All accounts cleared, balances reset.',
          'success'
        );
        setResetPassword('');
        setConfirmText('');
        setResetModalOpen(false);
      } else {
        const error = await res.json();
        showToast(error.error || 'Reset failed', 'error');
      }
    } catch {
      showToast('An error occurred', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header title="Advanced Settings" username={user?.username} />
      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Advanced Administration
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Dangerous operations - use with caution
          </p>
        </div>

        {/* Economy Reset Card */}
        <Card className="border-2 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Reset System Economy
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                This will:
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 mb-4 ml-4 list-disc">
                <li>Clear all account balances (set to $0)</li>
                <li>Clear all transaction history</li>
                <li>Reset all vault balances</li>
                <li>Reset admin wallet to $0</li>
                <li>Keep user accounts and banks intact</li>
              </ul>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4 border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-800 dark:text-red-200">
                  ⚠️ This action is irreversible. All transaction data will be lost.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => setResetModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
              >
                Reset Economy
              </Button>
            </div>
          </div>
        </Card>

        {/* Data Management Card */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            System Data Management
          </h2>
          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={() => (window.location.href = '/admin/audit')}
              className="w-full"
            >
              View Audit Logs
            </Button>
            <Button
              variant="secondary"
              onClick={() => (window.location.href = '/admin/stats')}
              className="w-full"
            >
              View System Statistics
            </Button>
          </div>
        </Card>

        {/* Back Button */}
        <Button
          variant="secondary"
          onClick={() => window.history.back()}
          className="w-full"
        >
          Back to Dashboard
        </Button>
      </main>

      {/* Reset Confirmation Modal */}
      <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)}>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Confirm Economy Reset
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This action cannot be undone. All balances and transactions will be permanently
              deleted.
            </p>
          </div>

          {/* Admin Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Admin Password
            </label>
            <Input
              type="password"
              placeholder="Enter admin password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              disabled={resetLoading}
            />
          </div>

          {/* Confirmation Text */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Type "RESET ECONOMY" to confirm
            </label>
            <Input
              type="text"
              placeholder="Type here to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              disabled={resetLoading}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleResetEconomy}
              disabled={resetLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
            >
              {resetLoading ? 'Processing...' : 'Confirm Reset'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setResetModalOpen(false);
                setResetPassword('');
                setConfirmText('');
              }}
              disabled={resetLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
