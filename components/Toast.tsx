'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type Toast = {
    id: string;
    message: string;
    type: ToastType;
};

type ToastContextType = {
    toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({ toast: () => { } });

export const useToast = () => useContext(ToastContext);

const icons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
    success: Check,
    error: X,
    warning: AlertTriangle,
    info: Info,
};

const styles: Record<ToastType, string> = {
    success: 'border-zinc-900 bg-zinc-900 text-white',
    error: 'border-zinc-200 bg-white text-zinc-900',
    warning: 'border-zinc-300 bg-zinc-50 text-zinc-900',
    info: 'border-zinc-200 bg-white text-zinc-700',
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            {/* Toast container */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col space-y-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => {
                        const IconComp = icons[t.type];
                        return (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className={`pointer-events-auto flex items-center space-x-3 px-4 py-3 border shadow-lg min-w-[280px] max-w-[400px] ${styles[t.type]}`}
                            >
                                <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 ${t.type === 'success' ? 'bg-white/20' : 'border border-zinc-200'}`}>
                                    <IconComp className="w-3.5 h-3.5" />
                                </div>
                                <p className="text-sm font-medium flex-1">{t.message}</p>
                                <button
                                    onClick={() => removeToast(t.id)}
                                    className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
