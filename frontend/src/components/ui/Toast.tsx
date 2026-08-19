import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive' | 'info';
}

interface ToastContextType {
  toast: (options: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          const icons = {
            default: <Info className="h-4 w-4 text-zinc-700" />,
            success: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
            destructive: <AlertCircle className="h-4 w-4 text-rose-600" />,
            info: <Info className="h-4 w-4 text-blue-600" />,
          };

          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-3.5 bg-white rounded-lg border shadow-lg transition-all duration-200 animate-in slide-in-from-bottom-2',
                t.variant === 'destructive'
                  ? 'border-rose-200 text-rose-950'
                  : t.variant === 'success'
                  ? 'border-emerald-200 text-emerald-950'
                  : 'border-zinc-200 text-zinc-900'
              )}
            >
              <div className="shrink-0 mt-0.5">{icons[t.variant || 'default']}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-zinc-400 hover:text-zinc-700 p-0.5 rounded-sm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
