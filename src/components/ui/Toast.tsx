import React, { useEffect } from 'react';
import { ErrorIcon } from '../icons/ErrorIcon';
import { CloseIcon } from '../icons/CloseIcon';

interface ToastProps {
  message: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, action, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000); // Auto-dismiss after 8 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg mx-auto"
      role="alert"
    >
        <div className="relative bg-[#1f1d2b] border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-4">
            <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                    <ErrorIcon className="w-6 h-6 text-red-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-slate-200">{message}</p>
                    {action && (
                        <div className="mt-2">
                            <button
                                onClick={action.onClick}
                                className="text-sm font-semibold text-purple-400 hover:text-purple-300"
                            >
                                {action.text}
                            </button>
                        </div>
                    )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        onClick={onDismiss}
                        className="p-1 rounded-full text-slate-400 hover:bg-white/10 hover:text-slate-100 transition-colors"
                        aria-label="Dismiss"
                    >
                       <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};