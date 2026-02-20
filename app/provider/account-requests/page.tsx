'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

export default function ProviderAccountRequestsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<{ id: string; user: { username: string }; bank: { name: string } }[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = async () => {
    const res = await fetch('/api/provider/account-requests');
    const data = await res.json();
    setRequests(data.requests || []);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header title="Account requests" username={user?.username} />
      <main className="p-4 space-y-6">
        <Card>
          <h2 className="text-lg font-semibold mb-2">Pending requests</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Users request an account and get a request code. They send you the code; you enter it in your system and generate an activation key for them.
          </p>
          {requests.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No pending requests.</p>
          ) : (
            <ul className="space-y-2">
              {requests.map((r) => (
                <li key={r.id} className="text-sm">
                  {r.user?.username} – {r.bank?.name}
                </li>
              ))}
            </ul>
          )}
          <Button variant="secondary" className="mt-4" onClick={loadRequests} disabled={loading}>
            Refresh
          </Button>
        </Card>
        <Button variant="secondary" onClick={() => window.history.back()}>Back to dashboard</Button>
      </main>
    </div>
  );
}
