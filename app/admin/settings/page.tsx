'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<{
    max_bank_fee_cap?: number;
    global_tax_percentage?: number;
    inflation_rate?: number;
    tax_enabled?: boolean;
    inflation_enabled?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings || null));
  }, []);

  const handleUpdate = async (updates: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        showToast('Settings updated', 'success');
        const data = await res.json();
        setSettings(data.settings || null);
      } else {
        showToast('Failed to update', 'error');
      }
    } catch {
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header title="System Settings" username={user?.username} />
      <main className="p-4 space-y-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Current settings</h2>
          <div className="space-y-2 text-sm">
            <p>Max bank fee cap: {Number(settings.max_bank_fee_cap)}%</p>
            <p>Global tax: {Number(settings.global_tax_percentage)}%</p>
            <p>Inflation rate: {Number(settings.inflation_rate)}%</p>
            <p>Tax enabled: {settings.tax_enabled ? 'Yes' : 'No'}</p>
            <p>Inflation enabled: {settings.inflation_enabled ? 'Yes' : 'No'}</p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => handleUpdate({ taxEnabled: !settings.tax_enabled })} disabled={loading}>
              Toggle tax
            </Button>
            <Button variant="secondary" onClick={() => handleUpdate({ inflationEnabled: !settings.inflation_enabled })} disabled={loading}>
              Toggle inflation
            </Button>
          </div>
        </Card>
        <Button variant="secondary" onClick={() => window.history.back()}>Back to dashboard</Button>
      </main>
    </div>
  );
}
