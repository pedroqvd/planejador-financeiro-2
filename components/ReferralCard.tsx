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
            className="card-editorial p-6 relative overflow-hidden group mb-6"
            style={{ backgroundColor: 'var(--accent-ink)', color: 'var(--bg-cream)' }}
        >
            <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-colors duration-1000"
                style={{ backgroundColor: count >= 3 ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.08)' }}
            />

            <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <Gift className={`w-5 h-5 ${count >= 3 ? 'text-yellow-400' : 'text-white/80'}`} />
                    </div>
                    <div>
                        <h2 className="font-editorial font-semibold flex items-center gap-2" style={{ color: 'var(--bg-cream)' }}>
                            Convide e Ganhe
                            {count >= 3 && <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />}
                        </h2>
                        <p className="text-[10px] uppercase tracking-wider max-w-[200px] sm:max-w-none" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            {count >= 3 ? 'Você desbloqueou os descontos!' : '3 Amigos = 3 Meses Premium por R$ 4,99'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-2 relative z-10">
                <div className="flex justify-between text-xs mb-2">
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Progresso Atual</span>
                    <span className={`font-bold ${count >= 3 ? 'text-yellow-400' : 'text-white'}`}>{count} / 3 amigos</span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                        className={`h-full ${count >= 3 ? 'bg-yellow-400' : 'bg-white'}`}
                    />
                </div>
            </div>

            <div className="mt-5 flex items-center space-x-2 relative z-10">
                <div className="flex-1 px-3 py-2 text-xs truncate select-all font-mono" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}>
                    {link || 'Gerando link...'}
                </div>
                <button
                    onClick={handleCopy}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 shrink-0 hover:opacity-80"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--bg-cream)' }}
                >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
            </div>
        </motion.div>
    );
}
