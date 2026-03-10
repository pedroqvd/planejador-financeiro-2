'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineStatus() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            setIsOffline(true);
        }

        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[100] px-4 py-3 flex items-center justify-center space-x-3 text-sm"
                >
                    <div className="glass shadow-lg rounded-full px-5 py-2.5 flex items-center space-x-3 border-amber-200/50 dark:border-amber-800/50 border bg-amber-50/80 dark:bg-amber-900/40">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </div>
                        <span className="font-editorial text-zinc-900 dark:text-zinc-100 tracking-tight">
                            Você está <span className="font-bold underline">Offline</span>. Visualizando dados em cache.
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
