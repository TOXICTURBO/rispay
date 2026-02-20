'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const [vaultData, setVaultData] = useState<any>(null);
  const [banks, setBanks] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/provider/vault').then((res) => res.json()),
      fetch('/api/provider/banks').then((res) => res.json()),
    ]).then(([vault, banksData]) => {
      setVaultData(vault);
      setBanks(banksData.banks || []);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header title="Provider Dashboard" username={user?.username} />
      <main className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Vault Overview
        </h1>

        {vaultData && (
          <Card>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              Total Vault Balance
            </p>
            <p className="text-3xl font-bold text-primary-600">
              ${vaultData.totalVaultBalance?.toFixed(2) || '0.00'}
            </p>
          </Card>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-4">My Banks</h2>
          {banks.length === 0 ? (
            <Card>
              <p className="text-center text-slate-500 py-8">
                No banks assigned yet
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {banks.map((bank) => (
                <Card key={bank.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{bank.name}</h3>
                      <p className="text-sm text-slate-500">{bank.code}</p>
                      <p className="text-lg font-bold mt-2">
                        ${Number(bank.vault_balance).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={() => window.location.href = '/provider/invites'}>
            Generate Invite Codes
          </Button>
          <Button className="w-full" onClick={() => window.location.href = '/provider/account-requests'}>
            Process Account Requests
          </Button>
        </div>
      </main>
    </div>
  );
}
