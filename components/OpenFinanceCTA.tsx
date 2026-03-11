'use client';

import { useState, useEffect } from 'react';
import { Landmark, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function OpenFinanceCTA() {
    const [hasItems, setHasItems] = useState<boolean | null>(null);

    useEffect(() => {
        fetch('/api/pluggy/items')
            .then(res => res.json())
            .then(data => setHasItems(data.items && data.items.length > 0))
            .catch(() => setHasItems(false));
    }, []);

    if (hasItems === null || hasItems === true) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700" />

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 blur-[60px] -ml-24 -mb-24 rounded-full" />

            <div className="relative z-10 p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-white">
                        <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-editorial font-bold text-white">Automatize sua vida financeira</h3>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-500 text-white text-[9px] font-bold uppercase tracking-tight">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>AI Power</span>
                            </div>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">Conecte seus bancos via Open Finance e deixe nossa IA categorizar tudo para você em tempo real.</p>
                    </div>
                </div>

                <a
                    href="/settings"
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-zinc-900 text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 transition-all group/btn shadow-xl"
                >
                    <span>Conectar Bancos</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </a>
            </div>
        </motion.div>
    );
}
