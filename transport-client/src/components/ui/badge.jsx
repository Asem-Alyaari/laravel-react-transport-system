import React from 'react';
import { cn } from '../../lib/utils';

const badgeVariants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200',
  destructive: 'bg-red-50 text-red-700 border-red-200',
  outline: 'text-slate-800 border-slate-300',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  vip: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    />
  );
}
