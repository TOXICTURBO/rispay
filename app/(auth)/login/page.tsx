'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        showToast('Login successful!', 'success');
        const role = result.user.role.toLowerCase();
        if (role === 'admin') {
          router.push('/admin/dashboard');
        } else if (role === 'provider') {
          router.push('/provider/dashboard');
        } else {
          router.push('/home');
        }
      } else {
        showToast(result.error || 'Login failed', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Rispay
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Username"
            {...register('username')}
            error={errors.username?.message as string}
            placeholder="Enter your username"
          />
          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message as string}
            placeholder="Enter your password"
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <a
              href="/register"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Register
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
