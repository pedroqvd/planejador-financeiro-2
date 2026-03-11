'use client';

import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--bg-cream)', color: 'var(--text-primary)' }}>
            <nav className="border-b sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'var(--bg-cream)', borderColor: 'var(--border-color)', opacity: 0.9 }}>
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Voltar</span>
                    </Link>
                    <Link href="/landing" className="flex items-center space-x-2 group transition-all hover:opacity-80">
                        <Logo className="w-8 h-8 transition-transform group-hover:scale-110" />
                        <span className="font-editorial font-bold text-lg">WealthCash</span>
                    </Link>
                </div>
            </nav>

            <header className="pt-20 pb-12 text-center max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center space-x-2 px-3 py-1 rounded-full mb-6"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <Shield className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Segurança Garantida</span>
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-5xl font-editorial font-bold tracking-tight"
                >
                    Política de Privacidade
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
                                <Eye className="w-5 h-5 text-emerald-600" />
                                1. Introdução
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                No WealthCash, sua privacidade é nossa prioridade absoluta. Esta política detalha como coletamos, usamos, protegemos e tratamos seus dados pessoais, em conformidade total com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                            </p>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div>
                            <h2 className="text-xl font-editorial font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-600" />
                                2. Dados que Coletamos
                            </h2>
                            <ul className="mt-4 space-y-3 text-sm text-zinc-600">
                                <li className="flex gap-2">
                                    <span className="font-bold text-zinc-900">•</span>
                                    <span><strong>Identificação:</strong> Nome, e-mail e foto de perfil fornecidos no cadastro.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold text-zinc-900">•</span>
                                    <span><strong>Dados Financeiros:</strong> Transações, contas, orçamentos e metas que você insere ou sincroniza via Open Finance.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold text-zinc-900">•</span>
                                    <span><strong>Dados de Navegação:</strong> Endereço IP, tipo de dispositivo e métricas de uso para melhoria de desempenho.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold text-zinc-900">•</span>
                                    <span><strong>Open Finance:</strong> Quando autorizado por você, coletamos dados de instituições financeiras parceiras exclusivamente para agregação no dashboard.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div>
                            <h2 className="text-xl font-editorial font-bold flex items-center gap-2">
                                <Lock className="w-5 h-5 text-emerald-600" />
                                3. Como Usamos seus Dados
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                Seus dados são utilizados exclusivamente para as seguintes finalidades:
                            </p>
                            <ul className="mt-3 space-y-2 text-sm text-zinc-600 ml-4 list-disc">
                                <li>Prestação de serviços de planejamento financeiro e agregação de contas.</li>
                                <li>Processamento via Inteligência Artificial (Gemini 2.0 Flash) para fornecer insights e dicas personalizadas.</li>
                                <li>Personalização da sua experiência no dashboard.</li>
                                <li>Gestão de assinaturas (via Mercado Pago).</li>
                                <li>Cumprimento de obrigações legais e segurança cibernética.</li>
                            </ul>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div>
                            <h2 className="text-xl font-editorial font-bold">4. Segurança dos Dados</h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                Implementamos medidas de segurança de nível bancário, incluindo:
                            </p>
                            <ul className="mt-3 space-y-2 text-sm text-zinc-600 ml-4 list-disc">
                                <li>Criptografia SSL em todas as comunicações.</li>
                                <li>Hashing de senhas via bcrypt.</li>
                                <li>Proteção HSTS e Content Security Policy (CSP).</li>
                                <li>Ambiente de banco de dados isolado com criptografia em repouso.</li>
                            </ul>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div>
                            <h2 className="text-xl font-editorial font-bold">5. Seus Direitos (LGPD)</h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                Você tem total controle sobre seus dados. A qualquer momento, através das configurações de perfil, você pode:
                            </p>
                            <ul className="mt-3 space-y-2 text-sm text-zinc-600 ml-4 list-disc">
                                <li>Acessar e atualizar seus dados pessoais.</li>
                                <li>Exportar todos os seus dados em formato JSON.</li>
                                <li>Revogar consentimentos de Open Finance.</li>
                                <li><strong>Excluir permanentemente sua conta e todos os dados associados.</strong></li>
                            </ul>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div>
                            <h2 className="text-xl font-editorial font-bold">6. Compartilhamento com Terceiros</h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                O WealthCash <strong className="text-zinc-900 text-base">não vende seus dados em hipótese alguma</strong>. Compartilhamos informações apenas com parceiros essenciais para o funcionamento do app: Google Gemini (Processamento de IA), Mercado Pago (Pagamentos) e Pluggy (Conexão Bancária), todos operando sob rígidos contratos de confidencialidade e segurança.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="text-center">
                    <p className="text-xs text-zinc-400">
                        Se tiver dúvidas sobre nossa política, entre em contato através de nossa <Link href="/suporte" className="underline underline-offset-4 hover:text-zinc-900 transition-colors">Central de Suporte</Link>.
                    </p>
                </div>
            </main>
        </div>
    );
}
