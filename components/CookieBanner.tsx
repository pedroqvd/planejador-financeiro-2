'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, X, Check } from 'lucide-react';
import Link from 'next/link';

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('wealthcash-cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000); // Show after 2s
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('wealthcash-cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('wealthcash-cookie-consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 z-[100] max-w-lg mx-auto md:mx-0 md:left-6"
                >
                    <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-2xl border border-white/5 relative overflow-hidden">
                        {/* Subtle glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h3 className="font-editorial font-bold text-lg">Privacidade e Cookies</h3>
                            </div>

                            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                                Utilizamos cookies para melhorar sua experiência, analisar tráfego e fornecer insights financeiros mais precisos. Ao continuar, você concorda com nossa <Link href="/privacidade" className="text-white hover:underline underline-offset-2">Política de Privacidade</Link>.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 bg-white text-zinc-900 rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <Check className="w-3 h-3" />
                                    Aceitar Tudo
                                </button>
                                <button
                                    onClick={handleDecline}
                                    className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                    Personalizar
                                </button>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
