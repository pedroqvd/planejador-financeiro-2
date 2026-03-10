'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineStatus() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        Promise.resolve().then(() => {
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
                setIsOffline(true);
            }
        });

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
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-amber-100 dark:bg-amber-900 border-b border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 px-4 py-2 flex items-center justify-center space-x-2 text-sm z-50 w-full"
                >
                    <WifiOff className="w-4 h-4" />
                    <span className="font-medium">Você está offline. Visualizando dados em cache.</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
