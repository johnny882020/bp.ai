import React from 'react';
import { X } from 'lucide-react';

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-md mx-4">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ className = '', children, onClose }) {
  return (
    <div className={`bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto ${className}`}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({ children }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ className = '', children }) {
  return <h2 className={`text-xl font-bold text-slate-900 ${className}`}>{children}</h2>;
}
