'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { useTheme } from '@/components/ThemeProvider';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, LineChart, Line,
} from 'recharts';
import {
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
    Wallet, DollarSign, PiggyBank, ShoppingCart, Car, Home,
    Coffee, Briefcase, CreditCard, Loader2
} from 'lucide-react';

type TimelineEntry = { label: string; key: string; income: number; expenses: number; balance: number };
type CategoryEntry = { category: string; total: number; percentage: number };
type KPI = { value: number; variation: number };
type TopExpense = { name: string; category: string; amount: number };

type AnalyticsData = {
    timeline: TimelineEntry[];
    categoryBreakdown: CategoryEntry[];
    kpis: { income: KPI; expenses: KPI; balance: KPI; savingsRate: KPI };
    topExpenses: TopExpense[];
    currentMonth: string;
};

function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const CATEGORY_COLORS: Record<string, string> = {
    'Alimentação': '#f59e0b',
    'Transporte': '#3b82f6',
    'Moradia': '#8b5cf6',
    'Lazer': '#ec4899',
    'Salário': '#10b981',
    'Outros': '#6b7280',
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    'Alimentação': ShoppingCart,
    'Transporte': Car,
    'Moradia': Home,
    'Lazer': Coffee,
    'Salário': Briefcase,
    'Outros': CreditCard,
};

const PIE_COLORS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899', '#10b981', '#6b7280', '#ef4444', '#14b8a6'];

function AnimatedPieChart({ data }: { data: CategoryEntry[] }) {
    const [animated, setAnimated] = useState(false);
    useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

    const total = data.reduce((s, d) => s + d.total, 0);
    if (total === 0) return <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">Sem dados</div>;

    const size = 200;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 75;
    const innerRadius = 50;

    // Pre-compute angles without mutable variable in render
    const sliceAngles = data.reduce<{ startAngle: number; endAngle: number }[]>((acc, entry, i) => {
        const prevEnd = i === 0 ? -90 : acc[i - 1].endAngle;
        const angle = (entry.total / total) * 360;
        acc.push({ startAngle: prevEnd, endAngle: prevEnd + angle });
        return acc;
    }, []);

    const slices = data.map((entry, i) => {
        const { startAngle, endAngle } = sliceAngles[i];
        const angle = endAngle - startAngle;

        const startRad = (Math.PI / 180) * startAngle;
        const endRad = (Math.PI / 180) * endAngle;

        const x1 = cx + radius * Math.cos(startRad);
        const y1 = cy + radius * Math.sin(startRad);
        const x2 = cx + radius * Math.cos(endRad);
        const y2 = cy + radius * Math.sin(endRad);

        const ix1 = cx + innerRadius * Math.cos(endRad);
        const iy1 = cy + innerRadius * Math.sin(endRad);
        const ix2 = cx + innerRadius * Math.cos(startRad);
        const iy2 = cy + innerRadius * Math.sin(startRad);

        const largeArc = angle > 180 ? 1 : 0;

        const d = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${ix1} ${iy1}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}`,
            'Z'
        ].join(' ');

        return (
            <motion.path
                key={entry.category}
                d={d}
                fill={PIE_COLORS[i % PIE_COLORS.length]}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={animated ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="hover:opacity-80 transition-opacity cursor-pointer"
            />
        );
    });

    return (
        <div className="flex flex-col items-center">
            <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
                {slices}
                <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontSize: '16px', fontWeight: 700, fill: 'var(--text-primary)' }}>
                    {formatCurrency(total)}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: '10px', fill: 'var(--text-secondary)' }}>
                    Total Gasto
                </text>
            </svg>
        </div>
    );
}

function KPICard({ title, value, variation, icon: Icon, color, delay }: {
    title: string; value: string; variation: number; icon: React.ComponentType<{ className?: string }>;
    color: string; delay: number;
}) {
    const isPositive = variation >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md hover:border-zinc-300 transition-all duration-300 group"
        >
            <div className="flex items-start justify-between">
                <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300', color)}>
                    <Icon className="w-5 h-5" />
                </div>
                {variation !== 0 && (
                    <div className={clsx(
                        'flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-full',
                        isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                    )}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{Math.abs(variation)}%</span>
                    </div>
                )}
            </div>
            <p className="text-[11px] uppercase tracking-wider font-medium text-zinc-400 mt-3">{title}</p>
            <p className="text-xl font-editorial font-bold tracking-tight text-zinc-900 mt-1">{value}</p>
        </motion.div>
    );
}

const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="rounded-lg px-4 py-3 shadow-xl" style={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }}>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">{label}</p>
                {payload.map((item: any) => (
                    <div key={item.dataKey} className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-zinc-500 capitalize">{item.dataKey === 'income' ? 'Receitas' : 'Despesas'}</span>
                        <span className="text-sm font-bold text-zinc-900">{formatCurrency(item.value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="rounded-lg px-4 py-3 shadow-xl" style={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)' }}>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-bold text-zinc-900">{formatCurrency(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

export default function RelatoriosPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    const gridColor = theme === 'dark' ? '#1e293b' : '#f4f4f5';
    const tickColor = theme === 'dark' ? '#64748b' : '#a1a1aa';
    const cursorColor = theme === 'dark' ? '#334155' : '#f4f4f5';
    const dotStroke = theme === 'dark' ? '#1e293b' : '#fff';

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const res = await fetch('/api/analytics/compare?months=6');
                if (res.ok) setData(await res.json());
            } catch (err) {
                console.error('Error fetching analytics:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
            </DashboardLayout>
        );
    }

    if (!data) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh] text-zinc-400">
                    Erro ao carregar relatório.
                </div>
            </DashboardLayout>
        );
    }

    const barData = data.timeline.map(t => ({
        name: t.label,
        income: t.income,
        expenses: t.expenses,
    }));

    const lineData = data.timeline.map(t => ({
        name: t.label,
        saldo: t.balance,
    }));

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                    <div>
                        <h1 className="text-2xl font-editorial font-bold tracking-tight text-zinc-900">Relatórios</h1>
                        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">
                            Análise financeira dos últimos 6 meses
                        </p>
                    </div>
                    <div className="flex items-center space-x-1 bg-zinc-100 rounded-lg p-1">
                        {data.timeline.map((m, i) => (
                            <div
                                key={m.key}
                                className={clsx(
                                    'px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all',
                                    i === data.timeline.length - 1
                                        ? 'bg-zinc-900 text-white shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-700'
                                )}
                            >
                                {m.label}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        title="Receitas"
                        value={formatCurrency(data.kpis.income.value)}
                        variation={data.kpis.income.variation}
                        icon={TrendingUp}
                        color="bg-emerald-50 text-emerald-600"
                        delay={0.1}
                    />
                    <KPICard
                        title="Despesas"
                        value={formatCurrency(data.kpis.expenses.value)}
                        variation={data.kpis.expenses.variation}
                        icon={TrendingDown}
                        color="bg-rose-50 text-rose-600"
                        delay={0.15}
                    />
                    <KPICard
                        title="Saldo"
                        value={formatCurrency(data.kpis.balance.value)}
                        variation={data.kpis.balance.variation}
                        icon={Wallet}
                        color="bg-sky-50 text-sky-600"
                        delay={0.2}
                    />
                    <KPICard
                        title="Taxa de Economia"
                        value={`${data.kpis.savingsRate.value}%`}
                        variation={data.kpis.savingsRate.variation}
                        icon={PiggyBank}
                        color="bg-violet-50 text-violet-600"
                        delay={0.25}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Bar Chart — Receitas vs Despesas */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-3 bg-white border border-zinc-200 rounded-xl p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-editorial font-bold text-zinc-900">Receitas vs Despesas</h2>
                                <p className="text-[11px] text-zinc-400 uppercase tracking-wider mt-0.5">Últimos 6 meses</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] text-zinc-400 font-medium">Receitas</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                                    <span className="text-[10px] text-zinc-400 font-medium">Despesas</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }} barGap={4}>
                                    <CartesianGrid strokeDasharray="0" vertical={false} stroke={gridColor} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: cursorColor, radius: 4 }} />
                                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                    <Bar dataKey="expenses" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Pie Chart — Category Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6"
                    >
                        <h2 className="text-lg font-editorial font-bold text-zinc-900">Por Categoria</h2>
                        <p className="text-[11px] text-zinc-400 uppercase tracking-wider mt-0.5 mb-4">Distribuição do mês</p>

                        <AnimatedPieChart data={data.categoryBreakdown} />

                        <div className="mt-5 space-y-2.5">
                            {data.categoryBreakdown.slice(0, 5).map((cat, i) => {
                                const IconComp = CATEGORY_ICONS[cat.category] || CreditCard;
                                return (
                                    <div key={cat.category} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                                            />
                                            <IconComp className="w-3.5 h-3.5 text-zinc-400" />
                                            <span className="text-xs text-zinc-600 font-medium">{cat.category}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-bold text-zinc-900">{formatCurrency(cat.total)}</span>
                                            <span className="text-[10px] text-zinc-400">{cat.percentage}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Line Chart — Balance Evolution */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-3 bg-white border border-zinc-200 rounded-xl p-6"
                    >
                        <h2 className="text-lg font-editorial font-bold text-zinc-900">Evolução do Saldo</h2>
                        <p className="text-[11px] text-zinc-400 uppercase tracking-wider mt-0.5 mb-6">Tendência mensal</p>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={lineData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="0" vertical={false} stroke={gridColor} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip content={<CustomLineTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="saldo"
                                        stroke="#8b5cf6"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#colorSaldo)"
                                        dot={{ r: 4, fill: '#8b5cf6', stroke: dotStroke, strokeWidth: 2 }}
                                        activeDot={{ r: 6, fill: '#8b5cf6', stroke: dotStroke, strokeWidth: 3 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Top Expenses */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6"
                    >
                        <h2 className="text-lg font-editorial font-bold text-zinc-900">Maiores Gastos</h2>
                        <p className="text-[11px] text-zinc-400 uppercase tracking-wider mt-0.5 mb-4">Top 5 do mês</p>

                        {data.topExpenses.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-zinc-400 text-sm">Sem gastos registrados</div>
                        ) : (
                            <div className="space-y-3">
                                {data.topExpenses.map((expense, i) => {
                                    const IconComp = CATEGORY_ICONS[expense.category] || CreditCard;
                                    return (
                                        <motion.div
                                            key={`${expense.name}-${i}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + i * 0.06 }}
                                            className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-white border border-zinc-200 rounded-lg flex items-center justify-center">
                                                    <IconComp className="w-4 h-4 text-zinc-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-zinc-800 truncate max-w-[140px]">{expense.name}</p>
                                                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{expense.category}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-rose-600">{formatCurrency(expense.amount)}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
