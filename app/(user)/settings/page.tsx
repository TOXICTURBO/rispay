'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { Bell, Lock, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const router = useRouter();
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetPin = async () => {
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      showToast('PIN must be 4 digits', 'error');
      return;
    }

    if (pin !== confirmPin) {
      showToast('PINs do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/settings/pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        showToast('PIN set successfully', 'success');
        setPinModalOpen(false);
        setPin('');
        setConfirmPin('');
      } else {
        showToast('Failed to set PIN', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Settings
      </h2>

      {/* Profile */}
      <Card>
        <div className="flex items-center gap-4">
          <Avatar username={user?.username || ''} size="lg" />
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {user?.username}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {user?.role}
            </p>
          </div>
        </div>
      </Card>

      {/* Dark Mode */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              {theme === 'dark' ? (
                <svg
                  className="w-5 h-5 text-slate-600 dark:text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-slate-600 dark:text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Dark Mode
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {theme === 'dark' ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`
              relative w-14 h-8 rounded-full transition-colors duration-300
              ${theme === 'dark' ? 'bg-primary-600' : 'bg-slate-300'}
            `}
          >
            <span
              className={`
                absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300
                ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <button
          onClick={() => setPinModalOpen(true)}
          className="w-full flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-slate-500" />
            <div className="text-left">
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Transaction PIN
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Set or change your PIN
              </p>
            </div>
          </div>
        </button>
      </Card>

      {/* Logout */}
      <Card>
        <Button
          variant="danger"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </Card>

      <Modal
        isOpen={pinModalOpen}
        onClose={() => {
          setPinModalOpen(false);
          setPin('');
          setConfirmPin('');
        }}
        title="Set Transaction PIN"
      >
        <div className="space-y-4">
          <Input
            label="PIN"
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setPin(value);
            }}
            placeholder="0000"
          />
          <Input
            label="Confirm PIN"
            type="password"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setConfirmPin(value);
            }}
            placeholder="0000"
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setPinModalOpen(false);
                setPin('');
                setConfirmPin('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSetPin}
              isLoading={loading}
              disabled={pin.length !== 4 || confirmPin.length !== 4}
            >
              Set PIN
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
