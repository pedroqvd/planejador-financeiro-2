'use client';

import { motion } from 'motion/react';
import { Gift, Copy, Check, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ReferralCard({ code, count }: { code: string; count: number }) {
    const [copied, setCopied] = useState(false);
    const [link, setLink] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line
            setLink(`${window.location.origin}/register?ref=${code}`);
        }
    }, [code]);

    const progress = Math.min((count / 3) * 100, 100);

    const handleCopy = () => {
        if (!link) return;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 border border-zinc-800 p-6 text-white relative overflow-hidden group mb-6"
        >
            <div className={`absolute top-0 right-0 w-48 h-48 ${count >= 3 ? 'bg-yellow-500/10' : 'bg-sky-500/10'} rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-colors duration-1000`} />

            <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 border border-zinc-700 bg-zinc-800 flex items-center justify-center shrink-0">
                        <Gift className={`w-5 h-5 ${count >= 3 ? 'text-yellow-400' : 'text-sky-400'}`} />
                    </div>
                    <div>
                        <h2 className="font-editorial font-semibold text-zinc-100 flex items-center gap-2">
                            Convide e Ganhe
                            {count >= 3 && <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />}
                        </h2>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider max-w-[200px] sm:max-w-none">
                            {count >= 3 ? 'Você desbloqueou os descontos!' : '3 Amigos = 3 Meses Premium por R$ 4,99'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-2 relative z-10">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-400">Progresso Atual</span>
                    <span className={`font-bold ${count >= 3 ? 'text-yellow-400' : 'text-sky-400'}`}>{count} / 3 amigos</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                        className={`h-full ${count >= 3 ? 'bg-yellow-400' : 'bg-sky-500'}`}
                    />
                </div>
            </div>

            <div className="mt-5 flex items-center space-x-2 relative z-10">
                <div className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-400 truncate select-all font-mono">
                    {link || 'Gerando link...'}
                </div>
                <button
                    onClick={handleCopy}
                    className="px-4 py-2 border border-zinc-700 hover:border-zinc-500 text-white text-xs font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 transition-all flex items-center space-x-2 shrink-0"
                >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
            </div>
        </motion.div>
    );
}
