'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

export default function AdminBanksPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [banks, setBanks] = useState<{ id: string; name: string; code: string }[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [providerId, setProviderId] = useState('');
  const [loading, setLoading] = useState(false);

  const loadBanks = async () => {
    const res = await fetch('/api/admin/banks');
    const data = await res.json();
    setBanks(data.banks || []);
  };

  useEffect(() => {
    loadBanks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !providerId) {
      showToast('Fill name, code, and select provider', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), code: code.trim().toUpperCase(), providerId }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Bank created', 'success');
        setName('');
        setCode('');
        setProviderId('');
        loadBanks();
      } else {
        showToast(data.error || 'Failed to create bank', 'error');
      }
    } catch {
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header title="Create Bank" username={user?.username} />
      <main className="p-4 space-y-6">
        <form onSubmit={handleCreate}>
          <Card className="space-y-4">
            <Input label="Bank name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. First Bank" />
            <Input label="Bank code (e.g. SGFC1039)" value={code} onChange={(e) => setCode(e.target.value)} placeholder="UPPERCASE" />
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Provider (user ID)</label>
              <input
                type="text"
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                placeholder="Provider user ID"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <Button type="submit" className="w-full" isLoading={loading}>Create bank</Button>
          </Card>
        </form>
        <Card>
          <h2 className="text-lg font-semibold mb-2">Existing banks</h2>
          {banks.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No banks yet.</p>
          ) : (
            <ul className="space-y-2">
              {banks.map((b: { id: string; name: string; code: string }) => (
                <li key={b.id} className="text-sm">
                  {b.name} ({b.code})
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Button variant="secondary" onClick={() => window.history.back()}>Back to dashboard</Button>
      </main>
    </div>
  );
}
