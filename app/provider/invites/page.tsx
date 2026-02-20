'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

export default function ProviderInvitesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [banks, setBanks] = useState<{ id: string; name: string; code: string }[]>([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/provider/banks')
      .then((res) => res.json())
      .then((data) => {
        setBanks(data.banks || []);
        if (data.banks?.length && !selectedBankId) setSelectedBankId(data.banks[0].id);
      });
  }, []);

  const handleGenerate = async () => {
    if (!selectedBankId) {
      showToast('Select a bank first', 'error');
      return;
    }
    setLoading(true);
    setGeneratedCode(null);
    try {
      const res = await fetch('/api/provider/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankId: selectedBankId }),
      });
      const data = await res.json();
      if (res.ok && data.inviteCode) {
        setGeneratedCode(data.inviteCode);
        showToast('Invite code generated. Share it once.', 'success');
      } else {
        showToast(data.error || 'Failed to generate', 'error');
      }
    } catch {
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header title="Invite codes" username={user?.username} />
      <main className="p-4 space-y-6">
        <Card>
          <label className="block text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Bank</label>
          <select
            value={selectedBankId}
            onChange={(e) => setSelectedBankId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            {banks.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
            ))}
          </select>
          <Button className="w-full mt-4" onClick={handleGenerate} isLoading={loading} disabled={banks.length === 0}>
            Generate invite code
          </Button>
        </Card>
        {generatedCode && (
          <Card>
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Invite code (one-time)</p>
            <p className="font-mono text-lg font-semibold p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">{generatedCode}</p>
          </Card>
        )}
        <Button variant="secondary" onClick={() => window.history.back()}>Back to dashboard</Button>
      </main>
    </div>
  );
}
