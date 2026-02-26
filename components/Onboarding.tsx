'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Shield, Sparkles, ArrowRight, X } from 'lucide-react';

const OnboardingContext = createContext<{ showOnboarding: () => void }>({ showOnboarding: () => { } });
export const useOnboarding = () => useContext(OnboardingContext);

const steps = [
    {
        icon: TrendingUp,
        title: 'Controle suas finanças',
        description: 'Registre receitas e despesas, importe extratos OFX/CSV, e acompanhe tudo em tempo real.',
    },
    {
        icon: Shield,
        title: 'Orçamento inteligente',
        description: 'Defina limites por categoria e receba alertas quando estiver perto do limite.',
    },
    {
        icon: Sparkles,
        title: 'IA a seu favor',
        description: 'O Cash, seu consultor IA, analisa seus gastos e dá dicas personalizadas para economizar.',
    },
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [show, setShow] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const seen = localStorage.getItem('wealthcash-onboarding-done');
        if (!seen) {
            setTimeout(() => setShow(true), 800);
        }
    }, []);

    const finish = () => {
        setShow(false);
        localStorage.setItem('wealthcash-onboarding-done', 'true');
    };

    const showOnboarding = () => {
        setStep(0);
        setShow(true);
    };

    return (
        <OnboardingContext.Provider value={{ showOnboarding }}>
            {children}
            <AnimatePresence>
                {show && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={finish}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="relative bg-white border border-zinc-200 w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            <button
                                onClick={finish}
                                className="absolute top-4 right-4 p-1.5 hover:bg-zinc-100 transition-colors z-10"
                            >
                                <X className="w-4 h-4 text-zinc-400" />
                            </button>

                            <div className="p-8">
                                {/* Step indicator */}
                                <div className="flex items-center space-x-2 mb-8">
                                    {steps.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 transition-all duration-300 ${i <= step ? 'bg-zinc-900' : 'bg-zinc-200'}`}
                                        />
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={step}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="w-14 h-14 border border-zinc-200 flex items-center justify-center mb-6">
                                            {(() => {
                                                const Icon = steps[step].icon;
                                                return <Icon className="w-7 h-7 text-zinc-700" />;
                                            })()}
                                        </div>
                                        <h2 className="text-xl font-editorial font-bold text-zinc-900 mb-3">
                                            {steps[step].title}
                                        </h2>
                                        <p className="text-sm text-zinc-600 leading-relaxed">
                                            {steps[step].description}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="px-8 pb-8 flex items-center justify-between">
                                <button
                                    onClick={finish}
                                    className="text-xs text-zinc-400 uppercase tracking-wider hover:text-zinc-700 transition-colors"
                                >
                                    Pular
                                </button>
                                <button
                                    onClick={() => {
                                        if (step < steps.length - 1) setStep(step + 1);
                                        else finish();
                                    }}
                                    className="flex items-center space-x-2 px-5 py-2.5 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all"
                                >
                                    <span>{step < steps.length - 1 ? 'Próximo' : 'Começar'}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </OnboardingContext.Provider>
    );
}
