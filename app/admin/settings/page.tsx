'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<{
    id?: string;
    max_bank_fee_cap?: number;
    global_tax_percentage?: number;
    inflation_rate?: number;
    tax_enabled?: boolean;
    inflation_enabled?: boolean;
    admin_wallet_balance?: string;
    vault_transfer_fee?: number;
  } | null>(null);

  const [editValues, setEditValues] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        setSettings(data.settings || null);
        setEditValues({});
      });
  }, []);

  const handleInputChange = (key: string, value: string | boolean) => {
    setEditValues((prev) => ({
      ...prev,
      [key]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });
      if (res.ok) {
        showToast('Settings updated successfully', 'success');
        const data = await res.json();
        setSettings(data.settings || null);
        setIsEditing(false);
        setEditValues({});
      } else {
        showToast('Failed to update settings', 'error');
      }
    } catch {
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({});
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const displayValues = isEditing ? { ...settings, ...editValues } : settings;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header title="System Settings" username={user?.username} />
      <main className="p-4 space-y-6">
        {/* Settings Edit Card */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">System Configuration</h2>
            {!isEditing && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Settings
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Max Bank Fee Cap */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Max Bank Fee Cap (%)
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={String(editValues.maxBankFeeCap ?? settings.max_bank_fee_cap ?? 0)}
                  onChange={(e) => handleInputChange('maxBankFeeCap', e.target.value)}
                />
              ) : (
                <p className="text-slate-900 dark:text-slate-100">
                  {Number(displayValues.max_bank_fee_cap)}%
                </p>
              )}
            </div>

            {/* Global Tax Percentage */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Global Tax Percentage (%)
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={String(editValues.globalTaxPercentage ?? settings.global_tax_percentage ?? 0)}
                  onChange={(e) => handleInputChange('globalTaxPercentage', e.target.value)}
                />
              ) : (
                <p className="text-slate-900 dark:text-slate-100">
                  {Number(displayValues.global_tax_percentage)}%
                </p>
              )}
            </div>

            {/* Inflation Rate */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Inflation Rate (%)
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={String(editValues.inflationRate ?? settings.inflation_rate ?? 0)}
                  onChange={(e) => handleInputChange('inflationRate', e.target.value)}
                />
              ) : (
                <p className="text-slate-900 dark:text-slate-100">
                  {Number(displayValues.inflation_rate)}%
                </p>
              )}
            </div>

            {/* Vault Transfer Fee */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Vault Transfer Fee (%)
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={String(editValues.vaultTransferFee ?? settings.vault_transfer_fee ?? 0)}
                  onChange={(e) => handleInputChange('vaultTransferFee', e.target.value)}
                />
              ) : (
                <p className="text-slate-900 dark:text-slate-100">
                  {Number(displayValues.vault_transfer_fee)}%
                </p>
              )}
            </div>

            {/* Tax Enabled */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    isEditing
                      ? (editValues.taxEnabled ?? settings.tax_enabled) as boolean
                      : (displayValues.tax_enabled as boolean)
                  }
                  onChange={(e) => handleInputChange('taxEnabled', e.target.checked)}
                  disabled={!isEditing}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tax Enabled
                </span>
              </label>
            </div>

            {/* Inflation Enabled */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    isEditing
                      ? (editValues.inflationEnabled ?? settings.inflation_enabled) as boolean
                      : (displayValues.inflation_enabled as boolean)
                  }
                  onChange={(e) => handleInputChange('inflationEnabled', e.target.checked)}
                  disabled={!isEditing}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Inflation Enabled
                </span>
              </label>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex gap-2">
              <Button
                variant="primary"
                onClick={handleUpdate}
                disabled={loading}
              >
                Save Changes
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          )}
        </Card>

        {/* Admin Wallet Card */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Admin Wallet</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Wallet Balance</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                ${Number(settings.admin_wallet_balance || 0).toFixed(2)}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => (window as any).location.href = '/admin/wallet-transfer'}
            >
              Transfer from Wallet
            </Button>
          </div>
        </Card>

        <Button
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Back to Dashboard
        </Button>
      </main>
    </div>
  );
}
