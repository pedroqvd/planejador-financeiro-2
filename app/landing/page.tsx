'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
    ArrowRight, Shield, Zap, Brain, Upload, BarChart3, Target,
    ChevronRight, Star, Check, Sparkles, TrendingUp, CreditCard, Wallet
} from 'lucide-react';

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
};

const stagger = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
};

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#FCFCFA] overflow-x-hidden">
            {/* ===== NAVBAR ===== */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FCFCFA]/90 backdrop-blur-md border-b border-zinc-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full border border-zinc-200 bg-white flex items-center justify-center shadow-sm">
                            <span className="font-editorial text-base text-zinc-900 leading-none font-bold">W</span>
                        </div>
                        <span className="font-editorial font-bold text-lg text-zinc-900 tracking-tight">WealthCash</span>
                    </div>
                    <div className="hidden sm:flex items-center space-x-8 text-sm text-zinc-500">
                        <a href="#features" className="hover:text-zinc-900 transition-colors">Funcionalidades</a>
                        <a href="#pricing" className="hover:text-zinc-900 transition-colors">Preços</a>
                        <a href="#security" className="hover:text-zinc-900 transition-colors">Segurança</a>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link href="/login" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block">
                            Entrar
                        </Link>
                        <Link
                            href="/register"
                            className="button-editorial px-5 py-2.5 bg-zinc-900 text-white text-xs hover:bg-zinc-800 transition-all"
                        >
                            Começar Grátis
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ===== HERO ===== */}
            <section className="pt-36 pb-20 sm:pt-44 sm:pb-28 relative">
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center space-x-2 border border-zinc-200 px-4 py-1.5 mb-8"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider">Novo — IA Advisor para suas finanças</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-editorial font-bold tracking-tight text-zinc-900 leading-[1.1]"
                    >
                        Seu dinheiro merece{' '}
                        <span className="italic">inteligência</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-6 text-lg sm:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed"
                    >
                        Planejamento financeiro com IA que analisa seus gastos, sugere economias
                        e te ajuda a alcançar suas metas. Tudo em um dashboard premium.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            href="/register"
                            className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-zinc-900 text-white text-sm font-medium tracking-wide uppercase hover:bg-zinc-800 transition-all"
                        >
                            Criar Conta Grátis
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/login"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-all"
                        >
                            Já tenho conta
                        </Link>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-5 text-xs text-zinc-400 uppercase tracking-wider"
                    >
                        Sem cartão de crédito · Free para sempre no plano básico
                    </motion.p>

                    {/* Hero visual — editorial mock */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-16 mx-auto max-w-4xl overflow-hidden border border-zinc-200 shadow-lg"
                    >
                        <div className="bg-white p-6 sm:p-8">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: 'Patrimônio', value: 'R$ 47.250', icon: Wallet },
                                    { label: 'Receitas', value: 'R$ 8.500', icon: TrendingUp },
                                    { label: 'Despesas', value: 'R$ 3.420', icon: CreditCard },
                                    { label: 'Investimentos', value: 'R$ 12.800', icon: BarChart3 },
                                ].map((card, i) => (
                                    <motion.div
                                        key={card.label}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 + i * 0.1 }}
                                        className="border border-zinc-100 p-4"
                                    >
                                        <card.icon className="w-4 h-4 text-zinc-400 mb-3" />
                                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{card.label}</p>
                                        <p className="text-base font-editorial font-bold mt-1 text-zinc-900">{card.value}</p>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="mt-4 h-32 border border-zinc-100 flex items-center justify-center">
                                <BarChart3 className="w-8 h-8 text-zinc-200" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section id="features" className="py-20 sm:py-28 border-t border-zinc-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <p className="text-xs font-medium text-zinc-500 tracking-widest uppercase">Funcionalidades</p>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-editorial font-bold text-zinc-900 tracking-tight">
                            Tudo que você precisa para dominar suas finanças
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200">
                        {[
                            { icon: Brain, title: 'IA Advisor', desc: 'Consultor financeiro inteligente que analisa seus gastos reais e dá conselhos personalizados.' },
                            { icon: Upload, title: 'Import OFX/CSV', desc: 'Importe extratos bancários automaticamente. Compatível com todos os bancos brasileiros.' },
                            { icon: BarChart3, title: 'Relatórios PDF', desc: 'Exporte relatórios financeiros profissionais com gráficos e análises detalhadas.' },
                            { icon: Target, title: 'Metas Financeiras', desc: 'Defina objetivos e acompanhe seu progresso com visualizações claras.' },
                            { icon: Zap, title: 'Dashboard Tempo Real', desc: 'Visão completa do seu patrimônio, receitas e despesas atualizados instantaneamente.' },
                            { icon: Shield, title: 'Segurança de Banco', desc: 'Criptografia bcrypt, HSTS, CSP, rate limiting. Seus dados mais protegidos que em muitos bancos.' },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                {...stagger}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="bg-[#FCFCFA] p-8 hover:bg-white transition-colors duration-300"
                            >
                                <feature.icon className="w-5 h-5 text-zinc-900 mb-4" />
                                <h3 className="text-base font-editorial font-bold text-zinc-900">{feature.title}</h3>
                                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== DIFERENCIAL IA ===== */}
            <section className="py-20 bg-zinc-900 relative overflow-hidden">
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div {...fadeUp}>
                            <p className="text-xs font-medium text-zinc-500 tracking-widest uppercase">Diferencial</p>
                            <h2 className="mt-3 text-3xl sm:text-4xl font-editorial font-bold text-white tracking-tight">
                                Um consultor financeiro no seu bolso
                            </h2>
                            <p className="mt-5 text-base text-zinc-400 leading-relaxed">
                                O Cash, nosso IA Advisor, analisa suas transações reais e dá conselhos específicos
                                para o seu perfil. Nenhum concorrente brasileiro oferece isso.
                            </p>
                            <div className="mt-8 space-y-3">
                                {[
                                    '"Você gastou 35% mais em delivery este mês. Quer criar um orçamento?"',
                                    '"Se mantiver essa economia, alcançará sua meta de viagem em agosto."',
                                    '"Seus investimentos renderam 2.1% acima da Selic este trimestre."',
                                ].map((quote, i) => (
                                    <motion.div
                                        key={i}
                                        {...stagger}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                        className="flex items-start space-x-3 border-l-2 border-zinc-700 pl-4 py-2"
                                    >
                                        <p className="text-sm text-zinc-400 italic">{quote}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div {...fadeUp} className="relative">
                            <div className="border border-zinc-700 p-5 space-y-4">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-8 h-8 border border-zinc-600 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-editorial font-semibold text-sm">Cash — IA Advisor</p>
                                        <p className="text-zinc-500 text-xs">Online agora</p>
                                    </div>
                                </div>
                                <div className="border border-zinc-800 px-4 py-3">
                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                        Analisei suas finanças de fevereiro: você está gastando <strong className="text-white">R$ 1.240</strong> em alimentação,
                                        o que representa <strong className="text-zinc-100">36% das suas despesas</strong>. Recomendo definir um orçamento de R$ 900 para
                                        esta categoria — isso te economizaria <strong className="text-zinc-100">R$ 340/mês</strong>.
                                    </p>
                                </div>
                                <div className="bg-zinc-800 px-4 py-3 ml-auto max-w-[70%]">
                                    <p className="text-sm text-white">Como faço para criar esse orçamento?</p>
                                </div>
                                <div className="border border-zinc-800 px-4 py-3">
                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                        Vá em <strong className="text-white">Orçamento → Novo</strong>, selecione &quot;Alimentação&quot; e defina R$ 900.
                                        Vou acompanhar e te avisar se ultrapassar 80% do limite! 🎯
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ===== PRICING ===== */}
            <section id="pricing" className="py-20 sm:py-28 border-t border-zinc-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <p className="text-xs font-medium text-zinc-500 tracking-widest uppercase">Preços</p>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-editorial font-bold text-zinc-900 tracking-tight">
                            Simples e transparente
                        </h2>
                        <p className="mt-3 text-zinc-500">Comece grátis, faça upgrade quando precisar.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-200 max-w-4xl mx-auto border border-zinc-200">
                        {[
                            {
                                name: 'Free',
                                price: 'R$ 0',
                                period: 'para sempre',
                                desc: 'Para começar a organizar',
                                features: ['50 transações/mês', 'Dashboard completo', '3 metas financeiras', '1 orçamento'],
                                cta: 'Começar Grátis',
                                highlight: false,
                            },
                            {
                                name: 'Pro',
                                price: 'R$ 14,90',
                                period: '/mês',
                                desc: 'Para quem leva a sério',
                                features: ['Transações ilimitadas', 'IA Advisor ilimitado', 'Importação OFX/CSV', 'Relatórios PDF', 'Metas ilimitadas', 'Suporte por email'],
                                cta: 'Assinar Pro',
                                highlight: true,
                            },
                            {
                                name: 'Premium',
                                price: 'R$ 29,90',
                                period: '/mês',
                                desc: 'Para controle total',
                                features: ['Tudo do Pro', 'Conexão bancária automática', 'Alertas inteligentes', 'Relatórios avançados', 'API access', 'Suporte prioritário'],
                                cta: 'Assinar Premium',
                                highlight: false,
                            },
                        ].map((plan, i) => (
                            <motion.div
                                key={plan.name}
                                {...stagger}
                                transition={{ delay: i * 0.15, duration: 0.5 }}
                                className={`p-8 flex flex-col ${plan.highlight
                                    ? 'bg-zinc-900 text-white'
                                    : 'bg-white text-zinc-900'
                                    }`}
                            >
                                {plan.highlight && (
                                    <div className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 border border-zinc-700 px-3 py-1 w-fit mb-4">
                                        Mais Popular
                                    </div>
                                )}
                                <h3 className="text-lg font-editorial font-bold">{plan.name}</h3>
                                <div className="mt-3 flex items-baseline space-x-1">
                                    <span className="text-4xl font-editorial font-bold tracking-tight">{plan.price}</span>
                                    <span className={`text-sm ${plan.highlight ? 'text-zinc-500' : 'text-zinc-400'}`}>{plan.period}</span>
                                </div>
                                <p className={`mt-2 text-sm ${plan.highlight ? 'text-zinc-400' : 'text-zinc-500'}`}>{plan.desc}</p>

                                <ul className="mt-6 space-y-3 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start space-x-2.5 text-sm">
                                            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-zinc-500' : 'text-zinc-400'}`} />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href="/register"
                                    className={`mt-6 w-full py-3 text-center text-sm font-medium uppercase tracking-wider block transition-all ${plan.highlight
                                        ? 'bg-white text-zinc-900 hover:bg-zinc-100'
                                        : 'bg-zinc-900 text-white hover:bg-zinc-800'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SECURITY ===== */}
            <section id="security" className="py-20 sm:py-28 border-t border-zinc-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <motion.div {...fadeUp} className="text-center mb-14">
                        <p className="text-xs font-medium text-zinc-500 tracking-widest uppercase">Segurança</p>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-editorial font-bold text-zinc-900 tracking-tight">
                            Seus dados protegidos como em um banco
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200">
                        {[
                            { icon: Shield, label: 'HSTS + CSP', desc: 'Headers de segurança enterprise' },
                            { icon: Zap, label: 'Rate Limiting', desc: 'Proteção contra ataques brutos' },
                            { icon: Star, label: 'Criptografia', desc: 'bcrypt + PostgreSQL com SSL' },
                            { icon: Brain, label: 'Validação', desc: 'Sanitização e whitelists em tudo' },
                        ].map((item, i) => (
                            <motion.div
                                key={item.label}
                                {...stagger}
                                transition={{ delay: i * 0.1 }}
                                className="text-center p-6 bg-[#FCFCFA]"
                            >
                                <item.icon className="w-5 h-5 text-zinc-900 mx-auto" />
                                <p className="mt-3 font-editorial font-bold text-zinc-900 text-sm">{item.label}</p>
                                <p className="mt-1 text-xs text-zinc-500">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA FINAL ===== */}
            <section className="py-20 sm:py-28 bg-zinc-900">
                <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <motion.div {...fadeUp}>
                        <h2 className="text-3xl sm:text-4xl font-editorial font-bold text-white tracking-tight">
                            Comece a transformar suas finanças hoje
                        </h2>
                        <p className="mt-5 text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
                            Junte-se a milhares de brasileiros que já usam IA para tomar decisões financeiras mais inteligentes.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/register"
                                className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-zinc-900 text-sm font-medium uppercase tracking-wider hover:bg-zinc-100 transition-all"
                            >
                                Criar Conta Grátis
                                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <p className="mt-5 text-xs text-zinc-500 uppercase tracking-wider">
                            Sem compromisso · Cancele quando quiser · Seus dados são seus
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="bg-zinc-900 border-t border-zinc-800 text-zinc-500 py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                        <div className="col-span-2 sm:col-span-1">
                            <div className="flex items-center space-x-2.5 mb-4">
                                <div className="w-6 h-6 border border-zinc-700 flex items-center justify-center">
                                    <span className="font-editorial text-xs text-zinc-400 font-bold">W</span>
                                </div>
                                <span className="font-editorial font-bold text-white text-sm">WealthCash</span>
                            </div>
                            <p className="text-xs leading-relaxed">
                                Planejamento financeiro inteligente para brasileiros que levam dinheiro a sério.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mb-3">Produto</h4>
                            <ul className="space-y-2 text-xs">
                                <li><a href="#features" className="hover:text-white transition-colors">Funcionalidades</a></li>
                                <li><a href="#pricing" className="hover:text-white transition-colors">Preços</a></li>
                                <li><a href="#security" className="hover:text-white transition-colors">Segurança</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mb-3">Legal</h4>
                            <ul className="space-y-2 text-xs">
                                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mb-3">Suporte</h4>
                            <ul className="space-y-2 text-xs">
                                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-10 pt-6 border-t border-zinc-800 text-xs text-center">
                        <p>© 2026 WealthCash. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
