'use client';

import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Scale, Gavel, FileText, CheckCircle2 } from 'lucide-react';

export default function TermsOfServicePage() {
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
                    <Scale className="w-3 h-3 text-zinc-900" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Contrato de Uso</span>
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-5xl font-editorial font-bold tracking-tight"
                >
                    Termos de Uso
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
                                <Gavel className="w-5 h-5" />
                                1. Aceitação dos Termos
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                Ao acessar ou usar o WealthCash, você concorda em cumprir estes termos e condições na íntegra. Se você não concordar com qualquer parte deste contrato, não deverá utilizar nossa plataforma.
                            </p>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div>
                            <h2 className="text-xl font-editorial font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                2. Descrição do Serviço
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                O WealthCash fornece ferramentas de planejamento financeiro, agregação de contas, consultoria via IA e gestão de metas. O serviço é oferecido em modalidades "Free" (Grátis), "Pro" e "Premium", com diferentes níveis de funcionalidades conforme detalhado em nossa página de preços.
                            </p>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div>
                            <h2 className="text-xl font-editorial font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                3. Responsabilidade do Usuário
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                Você é o único responsável por:
                            </p>
                            <ul className="mt-3 space-y-2 text-sm text-zinc-600 ml-4 list-disc">
                                <li>Manter a confidencialidade de sua senha.</li>
                                <li>Garantir a veracidade das informações inseridas.</li>
                                <li>O uso que faz dos conselhos gerados pela IA (que são apenas informativos e não constituem recomendação oficial de investimento).</li>
                            </ul>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div>
                            <h2 className="text-xl font-editorial font-bold">4. Pagamentos e Assinaturas</h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                As assinaturas pagas são processadas pelo Mercado Pago. O cancelamento pode ser feito a qualquer momento e entrará em vigor ao final do período de faturamento atual. Não realizamos reembolsos parciais de períodos já utilizados.
                            </p>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div>
                            <h2 className="text-xl font-editorial font-bold">5. Propriedade Intelectual</h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                Todos os logotipos, interfaces, códigos e algoritmos de IA do WealthCash são propriedade intelectual protegida por lei. O uso comercial ou redistribuição de qualquer parte do serviço sem autorização prévia por escrito é estritamente proibido.
                            </p>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div>
                            <h2 className="text-xl font-editorial font-bold">6. Modificações</h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                Reservamo-nos o direito de modificar o serviço ou estes termos a qualquer momento. Mudanças significativas serão notificadas através do e-mail cadastrado ou banners internos no aplicativo.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="text-center">
                    <p className="text-xs text-zinc-400">
                        O uso continuado do serviço após qualquer alteração constitui sua aceitação dos novos termos.
                    </p>
                </div>
            </main>
        </div>
    );
}
