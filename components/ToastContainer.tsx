
import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { X, CheckCircle, AlertTriangle, Info } from './Icons';

const ToastIcons = {
  success: <CheckCircle className="w-6 h-6 text-green-500" />,
  error: <AlertTriangle className="w-6 h-6 text-red-500" />,
  info: <Info className="w-6 h-6 text-blue-500" />,
};

const Toast = ({ id, message, type, onDismiss }: { id: number, message: string, type: 'success' | 'error' | 'info', onDismiss: (id: number) => void }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      const dismissTimer = setTimeout(() => onDismiss(id), 500); // Corresponds to animation duration
      return () => clearTimeout(dismissTimer);
    }, 4500); // Start exit animation before auto-dismiss

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 500);
  };
  
  const bgColors = {
      success: 'bg-green-50 border-green-200',
      error: 'bg-red-50 border-red-200',
      info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className={`w-full max-w-sm rounded-lg shadow-lg border p-4 flex items-start gap-4 animate-toast-in ${isExiting ? 'animate-toast-out' : ''} ${bgColors[type]}`}>
      <div className="flex-shrink-0">{ToastIcons[type]}</div>
      <div className="flex-1 text-sm text-gray-800">{message}</div>
      <button onClick={handleDismiss} className="p-1 -m-1 rounded-full hover:bg-black/10 transition-colors">
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm space-y-3">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={removeToast}
        />
      ))}
    </div>
  );
};
