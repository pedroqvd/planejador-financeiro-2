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

const toastStyles: Record<ToastType, { bg: string; border: string; text: string; iconBg: string }> = {
    success: { bg: '#10b981', border: '#10b981', text: '#ffffff', iconBg: 'rgba(255,255,255,0.2)' },
    error: { bg: '#f43f5e', border: '#f43f5e', text: '#ffffff', iconBg: 'rgba(255,255,255,0.2)' },
    warning: { bg: 'var(--bg-card)', border: '#f59e0b', text: 'var(--text-primary)', iconBg: 'rgba(245,158,11,0.15)' },
    info: { bg: 'var(--bg-card)', border: 'var(--accent-ink)', text: 'var(--text-primary)', iconBg: 'color-mix(in srgb, var(--accent-ink) 15%, transparent)' },
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
                                className="pointer-events-auto flex items-center space-x-3 px-4 py-3 shadow-lg min-w-[280px] max-w-[400px]"
                                style={{
                                    backgroundColor: toastStyles[t.type].bg,
                                    borderLeft: `3px solid ${toastStyles[t.type].border}`,
                                    color: toastStyles[t.type].text,
                                    boxShadow: 'var(--shadow-lg)',
                                }}
                            >
                                <div
                                    className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: toastStyles[t.type].iconBg }}
                                >
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
