'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CreditCard, ShoppingBag, Loader2, ChevronRight, ChevronLeft, TrendingDown, CalendarDays } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

function DonutChart({ percent }: { percent: number }) {
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    const color = percent > 80 ? '#ef4444' : percent > 60 ? '#f59e0b' : '#10b981';

    return (
        <div className="relative w-40 h-40 mx-auto">
            <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r={radius} fill="none" stroke="#f4f4f5" strokeWidth="10" />
                <motion.circle
                    cx="64" cy="64" r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="text-2xl font-editorial font-bold text-zinc-900"
                >
                    {percent}%
                </motion.span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">utilizado</span>
            </div>
        </div>
    );
}

export default function FaturasPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [monthOffset, setMonthOffset] = useState(0);

    useEffect(() => {
        async function fetchTxs() {
            try {
                const res = await fetch('/api/transactions?limit=200');
                if (res.ok) {
                    const data = await res.json();
                    const ccTxs = (Array.isArray(data) ? data : data.transactions || []).filter(
                        (t: any) => t.paymentMethod === 'credit_card' && t.type === 'expense'
                    );
                    setTransactions(ccTxs);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchTxs();
    }, []);

    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() + monthOffset);
    const currentMonthYear = baseDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const currentMonthStr = baseDate.toISOString().slice(0, 7);

    const monthTxs = transactions.filter(t => t.date.startsWith(currentMonthStr));
    const totalFatura = monthTxs.reduce((acc, t) => acc + t.amount, 0);
    const mockLimit = 6000;
    const availableLimit = Math.max(0, mockLimit - totalFatura);
    const percentUsed = Math.min(100, Math.round((totalFatura / mockLimit) * 100));

    // Group by category
    const categoryBreakdown: Record<string, number> = {};
    monthTxs.forEach(tx => {
        categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;
    });
    const sortedCategories = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);

    // Month labels for the timeline
    const months = [-2, -1, 0, 1, 2].map(offset => {
        const d = new Date();
        d.setMonth(d.getMonth() + monthOffset + offset);
        return {
            offset: monthOffset + offset,
            label: d.toLocaleString('pt-BR', { month: 'short' }).replace('.', ''),
            isCurrent: offset === 0,
        };
    });

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                    <div>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-editorial font-bold tracking-tight text-zinc-900">
                                    Cartão de Crédito
                                </h1>
                                <p className="text-xs text-zinc-500 mt-0.5 uppercase tracking-wider">
                                    Gerencie suas faturas e limite
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                        <p className="text-sm text-zinc-400">Carregando faturas...</p>
                    </div>
                ) : (
                    <>
                        {/* Timeline Navigation */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center justify-between bg-white border border-zinc-200 p-1.5 rounded-lg"
                        >
                            <button
                                onClick={() => setMonthOffset(p => p - 1)}
                                className="p-2 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400 hover:text-zinc-700"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center space-x-1">
                                {months.map((m) => (
                                    <button
                                        key={m.offset}
                                        onClick={() => setMonthOffset(m.offset)}
                                        className={`px-4 py-2 rounded-md text-xs font-medium capitalize transition-all duration-200 ${m.isCurrent
                                                ? 'bg-zinc-900 text-white shadow-sm'
                                                : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50'
                                            }`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setMonthOffset(p => p + 1)}
                                className="p-2 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400 hover:text-zinc-700"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </motion.div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                            {/* Left Column: Fatura Hero + Donut */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="lg:col-span-1 space-y-5"
                            >
                                {/* Fatura Card */}
                                <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white p-6 rounded-xl relative overflow-hidden">
                                    <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/[0.03] rounded-full blur-2xl" />
                                    <div className="absolute -left-6 -bottom-10 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />

                                    <div className="relative z-10">
                                        <div className="flex items-center space-x-2 mb-4">
                                            <CalendarDays className="w-4 h-4 text-zinc-400" />
                                            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold capitalize">{currentMonthYear}</span>
                                        </div>
                                        <p className="text-xs uppercase tracking-wider text-zinc-400 mb-1">Total da Fatura</p>
                                        <motion.p
                                            key={currentMonthStr}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-4xl font-editorial font-bold tracking-tight"
                                        >
                                            {formatCurrency(totalFatura)}
                                        </motion.p>
                                    </div>
                                </div>

                                {/* Donut Chart */}
                                <div className="bg-white border border-zinc-200 p-6 rounded-xl">
                                    <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-5 text-center">Limite Utilizado</h3>
                                    <DonutChart percent={percentUsed} />
                                    <div className="flex justify-between text-xs mt-5 pt-4 border-t border-zinc-100">
                                        <span className="text-zinc-500">Disponível: <strong className="text-emerald-600">{formatCurrency(availableLimit)}</strong></span>
                                        <span className="text-zinc-500">Limite: <strong className="text-zinc-900">{formatCurrency(mockLimit)}</strong></span>
                                    </div>
                                </div>

                                {/* Category Breakdown */}
                                {sortedCategories.length > 0 && (
                                    <div className="bg-white border border-zinc-200 p-5 rounded-xl">
                                        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">Gastos por Categoria</h3>
                                        <div className="space-y-3">
                                            {sortedCategories.map(([cat, amount]) => {
                                                const catPercent = totalFatura > 0 ? Math.round((amount / totalFatura) * 100) : 0;
                                                return (
                                                    <div key={cat} className="space-y-1.5">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-zinc-700">{cat}</span>
                                                            <span className="text-xs text-zinc-500">{formatCurrency(amount)} ({catPercent}%)</span>
                                                        </div>
                                                        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${catPercent}%` }}
                                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                                className="h-full bg-violet-500 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Right Column: Transactions List */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="lg:col-span-2"
                            >
                                <div className="border border-zinc-200 bg-white rounded-xl overflow-hidden h-full">
                                    <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <ShoppingBag className="w-4 h-4 text-zinc-400" />
                                            <h3 className="font-bold text-sm text-zinc-900">Lançamentos</h3>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                                            {monthTxs.length} {monthTxs.length === 1 ? 'item' : 'itens'}
                                        </span>
                                    </div>
                                    <div className="divide-y divide-zinc-100 max-h-[600px] overflow-y-auto">
                                        {monthTxs.length === 0 ? (
                                            <div className="p-12 text-center space-y-3">
                                                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                                                    <TrendingDown className="w-6 h-6 text-zinc-300" />
                                                </div>
                                                <p className="text-sm text-zinc-400">Nenhum gasto no cartão neste mês.</p>
                                                <p className="text-xs text-zinc-300">Que ótima notícia! 🎉</p>
                                            </div>
                                        ) : (
                                            monthTxs.map((tx, i) => (
                                                <motion.div
                                                    key={tx.id}
                                                    initial={{ opacity: 0, x: -12 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.25 + i * 0.03, duration: 0.3 }}
                                                    className="p-4 flex justify-between items-center hover:bg-zinc-50/80 transition-colors group"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                                                            <CreditCard className="w-4 h-4 text-violet-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-zinc-900">{tx.name}</p>
                                                            <p className="text-[11px] text-zinc-400 mt-0.5">{tx.category} • {new Date(tx.date).toLocaleDateString('pt-BR')}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-sm text-zinc-900">{formatCurrency(tx.amount)}</span>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
