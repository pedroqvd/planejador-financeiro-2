'use client';

import Link from 'next/link';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowRight, Shield, Zap, Brain, Upload, BarChart3, Target,
    ChevronRight, Check, Sparkles, TrendingUp, CreditCard, Wallet,
    RefreshCcw, PieChart, Lock, Eye, Star, Users, ArrowUpRight
} from 'lucide-react';

/* ====== Animation presets ====== */
const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6 },
};

const stagger = (i: number) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { delay: i * 0.1, duration: 0.5 },
});

/* ====== Animated counter ====== */
function Counter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasAnimated) {
                setHasAnimated(true);
                let start = 0;
                const duration = 1800;
                const startTime = performance.now();
                const step = (now: number) => {
                    const progress = Math.min((now - startTime) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    start = Math.floor(eased * target);
                    el.textContent = `${prefix}${start.toLocaleString('pt-BR')}${suffix}`;
                    if (progress < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            }
        }, { threshold: 0.3 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [target, suffix, prefix, hasAnimated]);

    return <span ref={ref}>{prefix}0{suffix}</span>;
}

/* ====== Animated bar chart for hero ====== */
function HeroChart() {
    const bars = [
        { h: 45, color: '#10b981', label: 'Jan' },
        { h: 65, color: '#10b981', label: 'Fev' },
        { h: 35, color: '#fb7185', label: 'Mar' },
        { h: 80, color: '#10b981', label: 'Abr' },
        { h: 55, color: '#10b981', label: 'Mai' },
        { h: 90, color: '#10b981', label: 'Jun' },
    ];
    return (
        <div className="flex items-end justify-between gap-2 sm:gap-3 h-full px-2">
            {bars.map((bar, i) => (
                <div key={bar.label} className="flex flex-col items-center flex-1 gap-1.5">
                    <motion.div
                        className="w-full rounded-t-sm"
                        style={{ backgroundColor: bar.color }}
                        initial={{ height: 0 }}
                        animate={{ height: `${bar.h}%` }}
                        transition={{ delay: 0.8 + i * 0.12, duration: 0.7, ease: 'easeOut' }}
                    />
                    <span className="text-[9px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{bar.label}</span>
                </div>
            ))}
        </div>
    );
}

export default function LandingPage() {
    return (
        <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--bg-cream)', color: 'var(--text-primary)' }}>
            {/* ===== NAVBAR ===== */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b" style={{ backgroundColor: 'var(--bg-cream)', borderColor: 'var(--border-color)', opacity: 0.97 }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                            <span className="font-editorial text-base font-bold" style={{ color: 'var(--accent-ink)' }}>W</span>
                        </div>
                        <span className="font-editorial font-bold text-lg tracking-tight">WealthCash</span>
                    </div>
                    <div className="hidden sm:flex items-center space-x-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <a href="#features" className="hover:opacity-80 transition-opacity">Funcionalidades</a>
                        <a href="#pricing" className="hover:opacity-80 transition-opacity">Preços</a>
                        <a href="#security" className="hover:opacity-80 transition-opacity">Segurança</a>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link href="/login" className="text-sm font-medium hover:opacity-80 transition-opacity hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
                            Entrar
                        </Link>
                        <Link
                            href="/register"
                            className="px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all hover:opacity-90 shadow-sm"
                            style={{ backgroundColor: 'var(--accent-ink)', color: '#fff' }}
                        >
                            Começar Grátis
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ===== HERO ===== */}
            <section className="pt-32 pb-16 sm:pt-40 sm:pb-24 relative">
                {/* Ambient glow */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: 'linear-gradient(135deg, var(--accent-ink), var(--accent-gold))' }} />

                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full mb-8"
                        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                    >
                        <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-gold)' }} />
                        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Novo — IA Advisor para suas finanças</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-editorial font-bold tracking-tight leading-[1.08]"
                    >
                        Seu dinheiro merece{' '}
                        <span className="italic" style={{ color: 'var(--accent-ink)' }}>inteligência</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Conecte seu banco, receba análises com IA e tome decisões financeiras
                        mais inteligentes — tudo em um dashboard premium.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            href="/register"
                            className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl text-sm font-semibold tracking-wide uppercase transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                            style={{ backgroundColor: 'var(--accent-ink)', color: '#fff' }}
                        >
                            Criar Conta Grátis
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/login"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl border text-sm font-medium transition-all hover:opacity-80"
                            style={{ borderColor: 'var(--border-color)' }}
                        >
                            Já tenho conta
                        </Link>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-5 text-xs uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Sem cartão de crédito · Free para sempre no plano básico
                    </motion.p>

                    {/* Hero Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-16 mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-2xl"
                        style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                    >
                        <div className="p-5 sm:p-7">
                            {/* KPI row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Patrimônio', value: 'R$ 47.250', icon: Wallet, change: '+12%', positive: true },
                                    { label: 'Receitas', value: 'R$ 8.500', icon: TrendingUp, change: '+8%', positive: true },
                                    { label: 'Despesas', value: 'R$ 3.420', icon: CreditCard, change: '-5%', positive: true },
                                    { label: 'Investimentos', value: 'R$ 12.800', icon: BarChart3, change: '+3.2%', positive: true },
                                ].map((card, i) => (
                                    <motion.div
                                        key={card.label}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 + i * 0.1 }}
                                        className="rounded-xl p-4"
                                        style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-cream)' }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <card.icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                                                <ArrowUpRight className="w-3 h-3" />{card.change}
                                            </span>
                                        </div>
                                        <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{card.label}</p>
                                        <p className="text-base font-editorial font-bold mt-0.5">{card.value}</p>
                                    </motion.div>
                                ))}
                            </div>
                            {/* Chart area */}
                            <div className="mt-4 h-36 sm:h-44 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-cream)' }}>
                                <HeroChart />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ===== SOCIAL PROOF ===== */}
            <section className="py-12 border-t border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
                        {[
                            { value: 2400, suffix: '+', label: 'Usuários ativos' },
                            { value: 850, suffix: 'K', prefix: 'R$ ', label: 'Sob gestão' },
                            { value: 98, suffix: '%', label: 'Satisfação' },
                            { value: 4, suffix: '.9', label: 'Avaliação média' },
                        ].map((stat, i) => (
                            <motion.div key={stat.label} {...stagger(i)}>
                                <p className="text-2xl sm:text-3xl font-editorial font-bold tracking-tight">
                                    <Counter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                                </p>
                                <p className="text-xs uppercase tracking-wider mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section id="features" className="py-20 sm:py-28">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--accent-ink)' }}>Funcionalidades</p>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-editorial font-bold tracking-tight">
                            Tudo que você precisa para dominar suas finanças
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            { icon: Brain, title: 'IA Advisor', desc: 'Consultor inteligente que analisa seus gastos reais e dá conselhos personalizados com base no seu perfil.', color: '#8b5cf6' },
                            { icon: RefreshCcw, title: 'Open Finance', desc: 'Conecte seu banco automaticamente e veja todas as transações em tempo real, sem digitar nada.', color: '#10b981' },
                            { icon: BarChart3, title: 'Relatórios Premium', desc: 'Gráficos interativos, análise de categorias, evolução patrimonial e exportação em PDF.', color: '#3b82f6' },
                            { icon: Target, title: 'Metas Financeiras', desc: 'Defina objetivos com prazos, acompanhe o progresso visual e receba motivação da IA.', color: '#f59e0b' },
                            { icon: PieChart, title: 'Orçamento Inteligente', desc: 'Classifique despesas automaticamente, defina limites por categoria e receba alertas.', color: '#ec4899' },
                            { icon: Shield, title: 'Segurança Bancária', desc: 'Criptografia de ponta, HSTS, CSP, rate limiting. Seus dados mais seguros que em muitos bancos.', color: '#06b6d4' },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                {...stagger(i)}
                                className="group rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-default"
                                style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                            >
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${feature.color}18` }}>
                                    <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                                </div>
                                <h3 className="text-base font-editorial font-bold">{feature.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== DIFERENCIAL IA ===== */}
            <section className="py-20 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[150px] opacity-10 pointer-events-none" style={{ background: 'var(--accent-ink)' }} />
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div {...fadeUp}>
                            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--accent-ink)' }}>Diferencial</p>
                            <h2 className="mt-3 text-3xl sm:text-4xl font-editorial font-bold tracking-tight">
                                Um consultor financeiro no seu bolso
                            </h2>
                            <p className="mt-5 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                O Cash, nosso IA Advisor, analisa suas transações reais e dá conselhos específicos
                                para o seu perfil. Nenhum concorrente brasileiro oferece isso.
                            </p>
                            <div className="mt-8 space-y-4">
                                {[
                                    { text: '\"Você gastou 35% mais em delivery este mês. Quer criar um orçamento?\"', icon: '💡' },
                                    { text: '\"Se mantiver essa economia, alcançará sua meta de viagem em agosto.\"', icon: '🎯' },
                                    { text: '\"Seus investimentos renderam 2.1% acima da Selic este trimestre.\"', icon: '📈' },
                                ].map((quote, i) => (
                                    <motion.div
                                        key={i}
                                        {...stagger(i)}
                                        className="flex items-start space-x-3 rounded-xl p-4"
                                        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                                    >
                                        <span className="text-lg mt-0.5">{quote.icon}</span>
                                        <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{quote.text}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div {...fadeUp} className="relative">
                            <div className="rounded-2xl p-5 space-y-4" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--accent-ink)', opacity: 0.15 }}>
                                        <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-ink)' }} />
                                    </div>
                                    <div>
                                        <p className="font-editorial font-semibold text-sm">Cash — IA Advisor</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Online agora</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-cream)', border: '1px solid var(--border-color)' }}>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        Analisei suas finanças de fevereiro: você está gastando <strong style={{ color: 'var(--text-primary)' }}>R$ 1.240</strong> em alimentação,
                                        o que representa <strong style={{ color: 'var(--text-primary)' }}>36% das suas despesas</strong>. Recomendo definir um orçamento de R$ 900 —
                                        isso te economizaria <strong className="text-emerald-600">R$ 340/mês</strong>.
                                    </p>
                                </div>
                                <div className="rounded-xl px-4 py-3 ml-auto max-w-[75%]" style={{ backgroundColor: 'var(--accent-ink)', color: '#fff' }}>
                                    <p className="text-sm">Como faço para criar esse orçamento?</p>
                                </div>
                                <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-cream)', border: '1px solid var(--border-color)' }}>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        Vá em <strong style={{ color: 'var(--text-primary)' }}>Orçamento → Novo</strong>, selecione &quot;Alimentação&quot; e defina R$ 900.
                                        Vou acompanhar e te avisar se ultrapassar 80% do limite! 🎯
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="py-20 sm:py-28">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--accent-ink)' }}>Como funciona</p>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-editorial font-bold tracking-tight">
                            3 passos para o controle total
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Crie sua conta', desc: 'Cadastro gratuito em 30 segundos. Sem cartão de crédito, sem pegadinhas.', icon: Users },
                            { step: '02', title: 'Conecte seu banco', desc: 'Via Open Finance, importe transações automaticamente. Sem planilhas manuais.', icon: RefreshCcw },
                            { step: '03', title: 'Receba insights', desc: 'A IA analisa seus gastos e te dá recomendações personalizadas todo mês.', icon: Brain },
                        ].map((item, i) => (
                            <motion.div key={item.step} {...stagger(i)} className="text-center">
                                <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                                    <item.icon className="w-6 h-6" style={{ color: 'var(--accent-ink)' }} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent-ink)' }}>Passo {item.step}</span>
                                <h3 className="mt-2 text-lg font-editorial font-bold">{item.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className="py-20 border-t border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <motion.div {...fadeUp} className="text-center mb-14">
                        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--accent-ink)' }}>Depoimentos</p>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-editorial font-bold tracking-tight">
                            Quem usa, aprova
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {[
                            { name: 'Ana Silva', role: 'Designer', text: 'Nunca tive tanto controle das minhas finanças. A IA me ajudou a economizar R$ 1.200 em 3 meses!', stars: 5 },
                            { name: 'Carlos Mendes', role: 'Desenvolvedor', text: 'A conexão com Open Finance é incrível. Todas as minhas transações aparecem automaticamente.', stars: 5 },
                            { name: 'Juliana Costa', role: 'Empresária', text: 'Os relatórios são profissionais e me ajudam a tomar decisões melhores para o meu negócio.', stars: 5 },
                        ].map((t, i) => (
                            <motion.div
                                key={t.name}
                                {...stagger(i)}
                                className="rounded-2xl p-6"
                                style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                            >
                                <div className="flex items-center gap-1 mb-4">
                                    {Array.from({ length: t.stars }).map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--accent-ink)', color: '#fff' }}>
                                        {t.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{t.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== PRICING ===== */}
            <section id="pricing" className="py-20 sm:py-28">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--accent-ink)' }}>Preços</p>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-editorial font-bold tracking-tight">
                            Simples e transparente
                        </h2>
                        <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>Comece grátis, faça upgrade quando precisar.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
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
                                {...stagger(i)}
                                className={`rounded-2xl p-7 flex flex-col transition-all relative ${plan.highlight ? 'ring-2 scale-[1.03] shadow-xl' : ''}`}
                                style={{
                                    border: plan.highlight ? 'none' : '1px solid var(--border-color)',
                                    backgroundColor: plan.highlight ? 'var(--accent-ink)' : 'var(--bg-card)',
                                    color: plan.highlight ? '#fff' : undefined,
                                    ...(plan.highlight ? { '--tw-ring-color': 'var(--accent-ink)' } as any : {}),
                                }}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full" style={{ backgroundColor: 'var(--accent-gold)', color: '#1a1a1a' }}>
                                        Mais Popular
                                    </div>
                                )}
                                <h3 className="text-lg font-editorial font-bold">{plan.name}</h3>
                                <div className="mt-3 flex items-baseline space-x-1">
                                    <span className="text-4xl font-editorial font-bold tracking-tight">{plan.price}</span>
                                    <span className="text-sm" style={plan.highlight ? { color: 'rgba(255,255,255,0.6)' } : { color: 'var(--text-secondary)' }}>{plan.period}</span>
                                </div>
                                <p className="mt-2 text-sm" style={plan.highlight ? { color: 'rgba(255,255,255,0.7)' } : { color: 'var(--text-secondary)' }}>{plan.desc}</p>

                                <ul className="mt-6 space-y-3 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start space-x-2.5 text-sm">
                                            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={plan.highlight ? { color: 'rgba(255,255,255,0.5)' } : { color: 'var(--accent-ink)' }} />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href="/register"
                                    className={`mt-6 w-full py-3 text-center text-sm font-semibold uppercase tracking-wider block rounded-xl transition-all hover:scale-[1.02] ${plan.highlight
                                        ? 'bg-white text-zinc-900 hover:bg-zinc-100 shadow-md'
                                        : ''
                                        }`}
                                    style={!plan.highlight ? { backgroundColor: 'var(--bg-cream)', border: '1px solid var(--border-color)' } : undefined}
                                >
                                    {plan.cta}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SECURITY ===== */}
            <section id="security" className="py-20 sm:py-28" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <motion.div {...fadeUp} className="text-center mb-14">
                        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--accent-ink)' }}>Segurança</p>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-editorial font-bold tracking-tight">
                            Seus dados protegidos como em um banco
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { icon: Shield, label: 'HSTS + CSP', desc: 'Headers de segurança enterprise' },
                            { icon: Zap, label: 'Rate Limiting', desc: 'Proteção contra ataques brutos' },
                            { icon: Lock, label: 'Criptografia', desc: 'bcrypt + PostgreSQL com SSL' },
                            { icon: Eye, label: 'Validação', desc: 'Sanitização e whitelists em tudo' },
                        ].map((item, i) => (
                            <motion.div
                                key={item.label}
                                {...stagger(i)}
                                className="text-center rounded-2xl p-6"
                                style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                            >
                                <div className="mx-auto w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--bg-cream)', border: '1px solid var(--border-color)' }}>
                                    <item.icon className="w-5 h-5" style={{ color: 'var(--accent-ink)' }} />
                                </div>
                                <p className="font-editorial font-bold text-sm">{item.label}</p>
                                <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA FINAL ===== */}
            <section className="py-24 sm:py-32 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, color-mix(in srgb, var(--accent-ink) 8%, transparent), transparent 70%)` }} />
                <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <motion.div {...fadeUp}>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-bold tracking-tight">
                            Comece a transformar suas finanças <span className="italic" style={{ color: 'var(--accent-ink)' }}>hoje</span>
                        </h2>
                        <p className="mt-5 text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            Junte-se a milhares de brasileiros que já usam IA para tomar decisões financeiras mais inteligentes.
                        </p>
                        <div className="mt-8">
                            <Link
                                href="/register"
                                className="group inline-flex items-center justify-center px-10 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                                style={{ backgroundColor: 'var(--accent-ink)', color: '#fff' }}
                            >
                                Criar Conta Grátis
                                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <p className="mt-5 text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                            Sem compromisso · Cancele quando quiser · Seus dados são seus
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="border-t py-12" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-sidebar)' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                        <div className="col-span-2 sm:col-span-1">
                            <div className="flex items-center space-x-2.5 mb-4">
                                <div className="w-7 h-7 rounded-lg border flex items-center justify-center" style={{ borderColor: 'var(--border-color)' }}>
                                    <span className="font-editorial text-xs font-bold" style={{ color: 'var(--accent-ink)' }}>W</span>
                                </div>
                                <span className="font-editorial font-bold text-sm">WealthCash</span>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                Planejamento financeiro inteligente para brasileiros que levam dinheiro a sério.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Produto</h4>
                            <ul className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                <li><a href="#features" className="hover:opacity-80 transition-opacity">Funcionalidades</a></li>
                                <li><a href="#pricing" className="hover:opacity-80 transition-opacity">Preços</a></li>
                                <li><a href="#security" className="hover:opacity-80 transition-opacity">Segurança</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Legal</h4>
                            <ul className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                <li><a href="#" className="hover:opacity-80 transition-opacity">Termos de Uso</a></li>
                                <li><a href="#" className="hover:opacity-80 transition-opacity">Privacidade</a></li>
                                <li><a href="#" className="hover:opacity-80 transition-opacity">LGPD</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Suporte</h4>
                            <ul className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                <li><a href="#" className="hover:opacity-80 transition-opacity">Central de Ajuda</a></li>
                                <li><a href="#" className="hover:opacity-80 transition-opacity">Contato</a></li>
                                <li><a href="#" className="hover:opacity-80 transition-opacity">Status</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-10 pt-6 border-t text-xs text-center" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                        <p>© 2026 WealthCash. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
