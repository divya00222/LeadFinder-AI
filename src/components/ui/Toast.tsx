import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

type ToastProps = {
  message: string;
  type?: ToastType;
  onClose: () => void;
};

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="text-brand-success" size={20} />,
    error: <AlertCircle className="text-brand-danger" size={20} />,
    warning: <AlertTriangle className="text-brand-warning" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  const bgColors = {
    success: 'bg-white border-l-4 border-brand-success',
    error: 'bg-white border-l-4 border-brand-danger',
    warning: 'bg-white border-l-4 border-brand-warning',
    info: 'bg-white border-l-4 border-blue-500'
  };

  return (
    <div className={`${bgColors[type]} shadow-lg rounded-r-lg p-4 flex items-start gap-3 min-w-[300px] max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300`}>
      <div className="shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-brand-text">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// A simple toast manager hook to be used in context/providers
export function useToast() {
  const [toasts, setToasts] = useState<{id: string, message: string, type: ToastType}[]>([]);

  const toast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  };

  return { toasts, toast, removeToast };
}
