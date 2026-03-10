'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

interface Insights {
  totalSent: number;
  totalReceived: number;
  largestTransaction: {
    id: string;
    amount: number;
    date: string;
  } | null;
  dailyAverage: number;
  transactions30Days: Array<{
    date: string;
    sent: number;
    received: number;
  }>;
  tagSpending?: Array<{
    tag: string;
    amount: number;
  }>;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await fetch('/api/user/insights');
      const data = await res.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    try {
      const res = await fetch(`/api/user/transactions/export?format=${format}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download =
          format === 'csv'
            ? `transactions_${new Date().toISOString().split('T')[0]}.csv`
            : `transactions_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting transactions:', error);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!insights) {
    return (
      <Card>
        <p className="text-center text-slate-500 dark:text-slate-400 py-8">
          No data available
        </p>
      </Card>
    );
  }

  const chartData = insights.transactions30Days.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    sent: day.sent,
    received: day.received,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Spending Insights
        </h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={exporting}
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport('json')}
            disabled={exporting}
          >
            <Download className="w-4 h-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Sent This Month
          </p>
          <p className="text-2xl font-bold text-red-500 dark:text-red-400">
            {formatCurrency(insights.totalSent)}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Received This Month
          </p>
          <p className="text-2xl font-bold text-green-500 dark:text-green-400">
            {formatCurrency(insights.totalReceived)}
          </p>
        </Card>
      </div>

      {insights.largestTransaction && (
        <Card>
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Largest Transaction
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(insights.largestTransaction.amount)}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {new Date(insights.largestTransaction.date).toLocaleDateString()}
          </p>
        </Card>
      )}

      <Card>
        <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Daily Average
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(insights.dailyAverage)}
        </p>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          30-Day Activity
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="sent"
              stroke="#ef4444"
              strokeWidth={2}
              name="Sent"
            />
            <Line
              type="monotone"
              dataKey="received"
              stroke="#10b981"
              strokeWidth={2}
              name="Received"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {insights.tagSpending && insights.tagSpending.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Spending by Category
          </h3>
          <div className="space-y-3">
            {insights.tagSpending.map((item) => {
              const percentage = (item.amount / insights.totalSent) * 100;
              return (
                <div key={item.tag}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.tag}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
