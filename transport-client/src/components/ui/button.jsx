import React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = {
  default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-[0.98]',
  destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]',
  outline: 'border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 shadow-xs',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  ghost: 'hover:bg-slate-100 text-slate-700',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
  link: 'text-blue-600 underline-offset-4 hover:underline p-0 h-auto',
};

const buttonSizes = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-12 rounded-xl px-8 text-base font-semibold',
  icon: 'h-9 w-9 p-0 flex items-center justify-center',
};

export const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
          buttonVariants[variant] || buttonVariants.default,
          buttonSizes[size] || buttonSizes.default,
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
