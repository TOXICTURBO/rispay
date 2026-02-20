'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        showToast('Registration successful!', 'success');
        const role = result.user.role.toLowerCase();
        if (role === 'provider') {
          router.push('/provider/dashboard');
        } else {
          router.push('/home');
        }
      } else {
        showToast(result.error || 'Registration failed', 'error');
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
            Create Account
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Enter your registration key to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Registration Key"
            {...register('registrationKey')}
            error={errors.registrationKey?.message as string}
            placeholder="32-character registration key"
          />
          <Input
            label="Username"
            {...register('username')}
            error={errors.username?.message as string}
            placeholder="Choose a username"
          />
          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message as string}
            placeholder="Create a password (min 6 characters)"
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            Register
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Sign In
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
