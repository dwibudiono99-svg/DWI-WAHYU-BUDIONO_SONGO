import React from 'react';
import { CheckCircle2, Info, X, Zap } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'realtime';
  title: string;
  message: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isRealtime = toast.type === 'realtime';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start space-x-3 transition-all transform animate-in slide-in-from-bottom-5 duration-200 ${
              isRealtime
                ? 'bg-amber-950/95 border-amber-500/50 text-amber-200'
                : isSuccess
                ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-200'
                : 'bg-slate-900/95 border-slate-700 text-slate-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isRealtime ? (
                <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Info className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-white">{toast.title}</div>
              <div className="mt-0.5 text-slate-300 leading-relaxed">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
