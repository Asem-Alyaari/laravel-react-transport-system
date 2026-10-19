import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Dialog({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* خلفية معتمة ببلور (Backdrop Blur) */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-2xl animate-in zoom-in-95 duration-150">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ className, onClose, children, ...props }) {
  return (
    <div
      className={cn(
        'relative w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl',
        'max-h-[90vh] flex flex-col overflow-hidden',
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">إغلاق</span>
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-right pb-4 border-b border-slate-100', className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }) {
  return (
    <h3
      className={cn('text-lg font-bold leading-none tracking-tight text-slate-900', className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }) {
  return (
    <p
      className={cn('text-xs text-slate-500 font-medium', className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 pt-4 border-t border-slate-100', className)}
      {...props}
    />
  );
}
