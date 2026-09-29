import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-[14px] border shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-4 ${
              isSuccess
                ? 'bg-white border-[#D7D7D5] text-[#30383D] shadow-sm'
                : isError
                ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B] shadow-sm'
                : isWarning
                ? 'bg-[#FFFBEB] border-[#FCD34D] text-[#92400E] shadow-sm'
                : 'bg-white border-[#D7D7D5] text-[#30383D] shadow-sm'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isError && <XCircle className="w-5 h-5 text-rose-600" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#30383D]" />}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-serif font-bold text-[#30383D]">{toast.title}</h4>
              <p className="text-xs text-[#73777A] mt-0.5 leading-relaxed font-sans">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#73777A] hover:text-[#30383D] p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
