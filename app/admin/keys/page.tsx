'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

export default function AdminKeysPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [keyType, setKeyType] = useState<'USER' | 'PROVIDER'>('USER');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedKey(null);
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyType }),
      });
      const data = await res.json();
      if (res.ok && data.registrationKey) {
        setGeneratedKey(data.registrationKey);
        showToast('Key generated. Copy it now; it won’t be shown again.', 'success');
      } else {
        showToast(data.error || 'Failed to generate key', 'error');
      }
    } catch {
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header title="Registration Keys" username={user?.username} />
      <main className="p-4 space-y-6">
        <Card>
          <label className="block text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Key type
          </label>
          <select
            value={keyType}
            onChange={(e) => setKeyType(e.target.value as 'USER' | 'PROVIDER')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="USER">User</option>
            <option value="PROVIDER">Provider</option>
          </select>
          <Button className="w-full mt-4" onClick={handleGenerate} isLoading={loading}>
            Generate key
          </Button>
        </Card>
        {generatedKey && (
          <Card>
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Generated key (copy once)
            </p>
            <p className="font-mono text-sm break-all p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {generatedKey}
            </p>
          </Card>
        )}
        <Button variant="secondary" onClick={() => window.history.back()}>
          Back to dashboard
        </Button>
      </main>
    </div>
  );
}
