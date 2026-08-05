import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none font-sans">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className="pointer-events-auto flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 shadow-xl text-xs">
      {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
      {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />}
      {toast.type === 'info' && <Info className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />}

      <div className="flex-1 space-y-0.5">
        <h4 className="font-bold text-slate-900">{toast.title}</h4>
        {toast.message && <p className="text-slate-500 text-[11px] leading-relaxed">{toast.message}</p>}
      </div>

      <button onClick={() => onDismiss(toast.id)} className="p-0.5 text-slate-400 hover:text-slate-700">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
