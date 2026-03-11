'use client';

import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
    ArrowLeft, HelpCircle, Mail, MessageSquare, 
    BookOpen, Send, Loader2, CheckCircle2 
} from 'lucide-react';
import { useState } from 'react';

const faqs = [
    {
        q: "Como conectar minha conta bancária?",
        a: "Vá em Configurações > Open Finance. Clique em 'Conectar Novo Banco' e siga as instruções seguras do nosso parceiro Pluggy."
    },
    {
        q: "O plano Pro é cobrado mensalmente?",
        a: "Sim, os planos Pro e Premium são assinaturas mensais recorrentes via Mercado Pago. Você pode cancelar a qualquer momento sem taxas extras."
    },
    {
        q: "Meus dados estão seguros?",
        a: "Sim, utilizamos criptografia de padrão bancário e não vendemos seus dados para terceiros. Nossas operações seguem rigorosamente a LGPD."
    },
    {
        q: "Posso exportar meus lançamentos?",
        a: "Com certeza. Em Configurações > Preferências e Dados, você encontra o botão para exportar todo o seu histórico em formato JSON."
    }
];

export default function SupportPage() {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', message: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSent(true);
        setLoading(false);
    };

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

            <header className="pt-16 pb-12 text-center max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center space-x-2 px-3 py-1 rounded-full mb-6"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <HelpCircle className="w-3 h-3 text-indigo-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Suporte ao Cliente</span>
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-5xl font-editorial font-bold tracking-tight"
                >
                    Como podemos ajudar?
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-base text-zinc-500 max-w-xl mx-auto"
                >
                    Encontre respostas rápidas ou fale diretamente com nosso time de especialistas.
                </motion.p>
            </header>

            <main className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* FAQ */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-xl font-editorial font-bold">Perguntas Frequentes</h2>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((f, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-5 rounded-2xl border bg-white shadow-sm"
                                    style={{ borderColor: 'var(--border-color)' }}
                                >
                                    <h3 className="text-sm font-bold text-zinc-900">{f.q}</h3>
                                    <p className="mt-2 text-xs text-zinc-500 leading-relaxed">{f.a}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* CONTACT FORM */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Mail className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-xl font-editorial font-bold">Contato Direto</h2>
                        </div>
                        
                        <div className="rounded-3xl p-8 border bg-zinc-900 text-white shadow-2xl overflow-hidden relative" style={{ borderColor: 'var(--border-color)' }}>
                            {/* Ambient glow in card */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none" />

                            {!sent ? (
                                <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-2">Nome Completo</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={form.name}
                                            onChange={e => setForm({...form, name: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                            placeholder="Ex: Pedro Quevedo"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-2">Seu E-mail</label>
                                        <input 
                                            required
                                            type="email" 
                                            value={form.email}
                                            onChange={e => setForm({...form, email: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-2">Mensagem</label>
                                        <textarea 
                                            required
                                            rows={4}
                                            value={form.message}
                                            onChange={e => setForm({...form, message: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                                            placeholder="Como podemos ajudar?"
                                        />
                                    </div>
                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="w-full bg-white text-zinc-900 rounded-xl py-4 text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
                                        Enviar Mensagem
                                    </button>
                                </form>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative z-10 py-12 text-center space-y-4"
                                >
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-editorial font-bold">Mensagem Enviada!</h3>
                                    <p className="text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
                                        Recebemos sua solicitação. Nosso time responderá em até 24 horas úteis no seu e-mail.
                                    </p>
                                    <button 
                                        onClick={() => setSent(false)} 
                                        className="text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors pt-4"
                                    >
                                        Enviar outra mensagem
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </section>
                </div>
                
                {/* ALTERNATIVE CHANNELS */}
                <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl border text-center space-y-2 hover:bg-white transition-colors">
                        <MessageSquare className="w-6 h-6 mx-auto text-indigo-500" />
                        <h4 className="font-bold text-sm">Comunidade</h4>
                        <p className="text-xs text-zinc-500">Acesse nosso fórum e troque ideias com outros usuários.</p>
                    </div>
                    <div className="p-6 rounded-2xl border text-center space-y-2 hover:bg-white transition-colors">
                        <Mail className="w-6 h-6 mx-auto text-indigo-500" />
                        <h4 className="font-bold text-sm">E-mail</h4>
                        <p className="text-xs text-zinc-500">atendimento@wealthcash.com.br</p>
                    </div>
                    <div className="p-6 rounded-2xl border text-center space-y-2 hover:bg-white transition-colors">
                        <Logo className="w-6 h-6 mx-auto" />
                        <h4 className="font-bold text-sm">Status</h4>
                        <p className="text-xs text-zinc-500">Sistemas operando normalmente.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
