'use client';

import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Percent, Gift, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AffiliateTermsPage() {
    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--bg-cream)', color: 'var(--text-primary)' }}>
            <nav className="border-b sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'var(--bg-cream)', borderColor: 'var(--border-color)', opacity: 0.9 }}>
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Voltar</span>
                    </Link>
                    <div className="flex items-center space-x-2">
                        <Logo className="w-8 h-8" />
                        <span className="font-editorial font-bold text-lg">WealthCash</span>
                    </div>
                </div>
            </nav>

            <header className="pt-20 pb-12 text-center max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center space-x-2 px-3 py-1 rounded-full mb-6"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <Users className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Programa de Afiliados</span>
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-5xl font-editorial font-bold tracking-tight"
                >
                    Termos do Programa de Indicações
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-sm uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}
                >
                    Última atualização: 11 de Março de 2026
                </motion.p>
            </header>

            <main className="max-w-3xl mx-auto px-6 space-y-12">
                <section className="prose prose-zinc max-w-none">
                    <div className="rounded-2xl p-8 space-y-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div>
                            <h2 className="text-xl font-editorial font-bold flex items-center gap-2">
                                <Gift className="w-5 h-5 text-emerald-600" />
                                1. Elegibilidade
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                Qualquer usuário ativo do WealthCash pode participar do programa de indicações. Para gerar ganhos, o usuário indicado deve ser um novo usuário e assinar um dos planos pagos (Pro ou Premium).
                            </p>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div>
                            <h2 className="text-xl font-editorial font-bold flex items-center gap-2">
                                <Percent className="w-5 h-5 text-emerald-600" />
                                2. Comissões e Benefícios
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                Por cada indicação bem-sucedida, você receberá um crédito ou cashback (conforme regra vigente exibida no dashboard) após a confirmação do primeiro pagamento da assinatura do indicado.
                            </p>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div>
                            <h2 className="text-xl font-editorial font-bold flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                3. Práticas Proibidas
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                É expressamente proibido:
                            </p>
                            <ul className="mt-3 space-y-2 text-sm text-zinc-600 ml-4 list-disc">
                                <li>Criar contas fakes para autoindicação.</li>
                                <li>Realizar SPAM em redes sociais ou e-mails.</li>
                                <li>Utilizar anúncios pagos (Google Ads/FB Ads) usando o nome da marca WealthCash.</li>
                            </ul>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div>
                            <h2 className="text-xl font-editorial font-bold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                4. Verificação e Pagamento
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                Todas as indicações passam por uma análise antifraude de 30 dias. Créditos aprovados serão disponibilizados em sua carteira digital no app ou descontados de sua próxima fatura.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="text-center">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Reservamo-nos o direito de alterar as regras ou encerrar o programa a qualquer momento, honrando as indicações válidas feitas até a data da alteração.
                    </p>
                </div>
            </main>
        </div>
    );
}
