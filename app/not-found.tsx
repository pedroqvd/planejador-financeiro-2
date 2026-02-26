'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Home, ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#FCFCFA] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-md"
            >
                <div className="w-16 h-16 border border-zinc-200 flex items-center justify-center mx-auto mb-6">
                    <SearchX className="w-7 h-7 text-zinc-500" />
                </div>

                <h1 className="text-6xl font-editorial font-bold text-zinc-900">
                    404
                </h1>
                <h2 className="mt-3 text-lg font-editorial font-bold text-zinc-900">Página não encontrada</h2>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                    A página que você procura não existe ou foi movida. Verifique a URL ou volte para o início.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all"
                    >
                        <Home className="w-4 h-4" />
                        <span>Ir para o Dashboard</span>
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 border border-zinc-200 text-xs font-medium text-zinc-700 uppercase tracking-wider hover:bg-zinc-50 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Voltar</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
