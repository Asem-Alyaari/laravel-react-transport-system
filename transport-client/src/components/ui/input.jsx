import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500',
        'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
