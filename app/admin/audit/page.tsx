'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminAuditPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const limit = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit?page=${page}&limit=${limit}`);
      const data = await res.json();
      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATED') || action.includes('GENERATED'))
      return 'text-green-600 dark:text-green-400';
    if (action.includes('UPDATE') || action.includes('TRANSFER'))
      return 'text-blue-600 dark:text-blue-400';
    if (action.includes('RESET') || action.includes('DELETE')) return 'text-red-600 dark:text-red-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  const formatActionType = (action: string) => {
    return action.replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header title="Audit Logs" username={user?.username} />
      <main className="p-4 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            System Audit Logs
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View all administrative actions and system events
          </p>
        </div>

        {loading && page === 1 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : logs.length === 0 ? (
          <Card>
            <p className="text-center text-slate-500 dark:text-slate-400">
              No audit logs yet
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <Card
                key={log.id}
                className="cursor-pointer"
                onClick={() =>
                  setExpandedId(expandedId === log.id ? null : log.id)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p
                        className={`font-semibold ${getActionColor(log.action_type)}`}
                      >
                        {formatActionType(log.action_type)}
                      </p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {log.admin.username}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {formatDate(log.created_at)}
                    </p>
                  </div>
                  {expandedId === log.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>

                {expandedId === log.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      Details:
                    </p>
                    <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-auto max-h-64 text-slate-900 dark:text-slate-100">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => window.history.back()}
          className="w-full"
        >
          Back
        </Button>
      </main>
    </div>
  );
}
