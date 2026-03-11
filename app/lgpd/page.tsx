'use client';

import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldCheck, Database, UserCheck, Trash2, Download } from 'lucide-react';

export default function LGPDPage() {
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
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Compliance LGPD</span>
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-5xl font-editorial font-bold tracking-tight"
                >
                    Portal da Privacidade (LGPD)
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}
                >
                    Como exercemos seu direito à proteção de dados conforme a Lei 13.709/2018.
                </motion.p>
            </header>

            <main className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="rounded-2xl p-8 space-y-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div>
                            <h2 className="text-xl font-editorial font-bold flex items-center gap-2">
                                <Database className="w-5 h-5 text-indigo-600" />
                                Nosso Compromisso
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                No WealthCash, entendemos que dados financeiros são sensíveis. Por isso, adotamos o princípio de <strong>Privacy by Design</strong> e <strong>Privacy by Default</strong>. Cada nova funcionalidade, desde o AI Advisor até a sincronização bancária, é construída pensando primeiro em como proteger sua identidade.
                            </p>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div>
                            <h2 className="text-xl font-editorial font-bold flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-indigo-600" />
                                Seus Direitos Fundamentais
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                Sob a LGPD, você possui os seguintes direitos, todos respeitados pelo nosso sistema:
                            </p>
                            <ul className="mt-4 space-y-4">
                                <li className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                    <p className="text-sm font-bold text-zinc-900">Confirmação e Acesso</p>
                                    <p className="text-xs text-zinc-500 mt-1">Saber se tratamos seus dados e acessá-los a qualquer momento no dashboard.</p>
                                </li>
                                <li className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                    <p className="text-sm font-bold text-zinc-900">Portabilidade</p>
                                    <p className="text-xs text-zinc-500 mt-1">Exportar seu histórico financeiro completo em formato legível.</p>
                                </li>
                                <li className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                    <p className="text-sm font-bold text-zinc-900">Eliminação (Esquecimento)</p>
                                    <p className="text-xs text-zinc-500 mt-1">Solicitar a exclusão definitiva de seus dados de nossos servidores.</p>
                                </li>
                            </ul>
                        </div>

                        <div className="h-px bg-zinc-100" />

                        <div>
                            <h2 className="text-xl font-editorial font-bold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                Nossos Parceiros e DPAs
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                                Operamos apenas com parceiros (sub-processadores) que possuem Acordos de Processamento de Dados (DPAs) rigorosos. Seus dados são compartilhados apenas para fins operacionais:
                            </p>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3 border rounded-xl bg-zinc-50">
                                    <p className="text-xs font-bold">Google & Gemini</p>
                                    <p className="text-[10px] text-zinc-500">Inteligência Artificial & Insights</p>
                                </div>
                                <div className="p-3 border rounded-xl bg-zinc-50">
                                    <p className="text-xs font-bold">Pluggy</p>
                                    <p className="text-[10px] text-zinc-500">Conexão Open Finance (Bacen)</p>
                                </div>
                                <div className="p-3 border rounded-xl bg-zinc-50">
                                    <p className="text-xs font-bold">Mercado Pago</p>
                                    <p className="text-[10px] text-zinc-500">Pagamentos e Assinaturas</p>
                                </div>
                                <div className="p-3 border rounded-xl bg-zinc-50">
                                    <p className="text-xs font-bold">Neon & Vercel</p>
                                    <p className="text-[10px] text-zinc-500">Banco de Dados e Hospedagem</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="space-y-6">
                    <div className="rounded-2xl p-6 space-y-6" style={{ backgroundColor: 'var(--accent-ink)', color: '#fff' }}>
                        <h3 className="font-editorial font-bold text-lg">Autoatendimento</h3>
                        <p className="text-xs opacity-70 leading-relaxed">
                            Você não precisa enviar e-mails para exercer seus principais direitos. Utilize as ferramentas abaixo:
                        </p>
                        <div className="space-y-3">
                            <Link 
                                href="/settings" 
                                className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                <span className="text-xs font-medium">Exportar Meus Dados</span>
                                <Download className="w-4 h-4" />
                            </Link>
                            <Link 
                                href="/settings" 
                                className="flex items-center justify-between p-3 bg-red-500/20 rounded-xl border border-red-500/30 hover:bg-red-500/30 transition-colors text-red-100"
                            >
                                <span className="text-xs font-medium">Excluir Minha Conta</span>
                                <Trash2 className="w-4 h-4 text-red-400" />
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-2xl p-6 border border-zinc-200 bg-white shadow-sm">
                        <h3 className="font-editorial font-bold text-lg text-zinc-900">DPO (Encarregado)</h3>
                        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                            Para requisições complexas ou dúvidas específicas sobre tratamento de dados, entre em contato com nosso Encarregado de Dados:
                        </p>
                        <div className="mt-4 pt-4 border-t border-zinc-100">
                            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Email para LGPD</p>
                            <p className="text-sm font-medium text-zinc-900 mt-0.5">dpo@wealthcash.com.br</p>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}
