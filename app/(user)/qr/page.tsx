'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { Copy, Download } from 'lucide-react';

export default function QRPaymentPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [qrData, setQrData] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.username) {
      generateQR();
    }
  }, [user?.username]);

  const generateQR = async () => {
    try {
      const res = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user?.username }),
      });
      const data = await res.json();
      if (res.ok) {
        setQrData(data.qrData);
      } else {
        showToast('Failed to generate QR code', 'error');
      }
    } catch (error) {
      showToast('Error generating QR code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `${user?.username}-payment-qr.png`;
        link.click();
        showToast('QR code downloaded', 'success');
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Check out my Rispay: @${user?.username}`);
    showToast('Copied to clipboard', 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header title="Payment QR Code" username={user?.username} />
      <main className="p-4 space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            Share your QR code for quick payments
          </p>
        </div>

        <Card className="flex flex-col items-center space-y-4 p-6">
          <div
            ref={qrRef}
            className="p-4 bg-white rounded-xl border-2 border-slate-300 dark:border-slate-600"
          >
            {qrData && (
              <QRCode
                value={qrData}
                size={256}
                level="H"
                includeMargin={true}
              />
            )}
          </div>

          <div className="text-center">
            <p className="font-semibold text-lg">@{user?.username}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Scan and send me money instantly
            </p>
          </div>

          <div className="flex gap-2 w-full">
            <Button
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4" />
              Copy Handle
            </Button>
            <Button
              className="flex-1 flex items-center justify-center gap-2"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            How to use:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Download your QR code and share it</li>
            <li>• Others can scan to quickly send you money</li>
            <li>• Your username is securely encoded</li>
            <li>• No personal information is exposed</li>
          </ul>
        </Card>

        <Button variant="secondary" onClick={() => window.history.back()} className="w-full">
          Back
        </Button>
      </main>
    </div>
  );
}
