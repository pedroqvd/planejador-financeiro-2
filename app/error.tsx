'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#FCFCFA] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-md"
            >
                <div className="w-16 h-16 border border-zinc-200 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-7 h-7 text-zinc-500" />
                </div>

                <h1 className="text-2xl font-editorial font-bold text-zinc-900">Algo deu errado</h1>
                <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
                    Ocorreu um erro inesperado. Tente novamente ou volte para o Dashboard.
                </p>

                {error.digest && (
                    <p className="mt-3 text-[10px] text-zinc-400 font-mono bg-zinc-100 px-3 py-1.5 inline-block uppercase tracking-wider">
                        Código: {error.digest}
                    </p>
                )}

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Tentar Novamente</span>
                    </button>
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 border border-zinc-200 text-xs font-medium text-zinc-700 uppercase tracking-wider hover:bg-zinc-50 transition-all"
                    >
                        <Home className="w-4 h-4" />
                        <span>Ir para o Dashboard</span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
