'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            rounded-xl
            text-slate-900 dark:text-slate-100
            placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-primary-500
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
