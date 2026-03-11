'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import {
    RefreshCcw, Plus, Trash2, Search, CheckCircle2, XCircle,
    Wifi, Home, Car, CreditCard, ShoppingCart, Coffee,
    Zap, Loader2, TrendingUp, TrendingDown, Calendar,
    Sparkles, ArrowRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatCurrency as globalFormatCurrency } from '@/lib/currency';

type Recurrence = {
    id: string;
    name: string;
    category: string;
    amount: number;
    type: string;
    frequency: string;
    nextDueDate: string;
    active: boolean;
    color: string;
    icon: string;
};

type Suggestion = {
    name: string;
    category: string;
    amount: number;
    type: string;
    frequency: string;
    confidence: number;
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    'Streaming': Wifi,
    'Moradia': Home,
    'Transporte': Car,
    'Alimentação': ShoppingCart,
    'Lazer': Coffee,
    'Serviços': Zap,
    'Outros': CreditCard,
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

const COLOR_MAP: Record<string, string> = {
    violet: '#8b5cf6',
    sky: '#0ea5e9',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    indigo: '#6366f1',
};

export default function RecorrenciasPage() {
    const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
    const [preferredCurrency, setPreferredCurrency] = useState('BRL');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [detecting, setDetecting] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const loadRecurrences = useCallback(async () => {
        try {
            const res = await fetch('/api/recurrences');
            if (res.ok) {
                const data = await res.json();
                setRecurrences(data.recurrences || []);
                setPreferredCurrency(data.preferredCurrency || 'BRL');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadRecurrences(); }, [loadRecurrences]);

    const handleDetect = async () => {
        setDetecting(true);
        try {
            const res = await fetch('/api/recurrences/detect', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setSuggestions(data.suggestions || []);
            }
        } finally {
            setDetecting(false);
        }
    };

    const handleConfirmSuggestion = async (suggestion: Suggestion) => {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const res = await fetch('/api/recurrences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: suggestion.name,
                category: suggestion.category,
                amount: suggestion.amount,
                type: suggestion.type,
                frequency: suggestion.frequency,
                nextDueDate: nextMonth.toISOString(),
            }),
        });

        if (res.ok) {
            setSuggestions(prev => prev.filter(s => s.name !== suggestion.name));
            loadRecurrences();
        }
    };

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/recurrences?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            setRecurrences(prev => prev.filter(r => r.id !== id));
        }
    };

    // Projection data — next 3 months
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const projectionData = [0, 1, 2].map(offset => {
        const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        const activeRecurrences = recurrences.filter(r => r.active);
        const fixedIncome = activeRecurrences.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
        const fixedExpenses = activeRecurrences.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
        return {
            name: `${monthNames[d.getMonth()]}/${String(d.getFullYear()).slice(-2)}`,
            receitas: fixedIncome,
            despesas: fixedExpenses,
        };
    });

    const totalFixedExpenses = recurrences.filter(r => r.active && r.type === 'expense').reduce((s, r) => s + r.amount, 0);
    const totalFixedIncome = recurrences.filter(r => r.active && r.type === 'income').reduce((s, r) => s + r.amount, 0);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
            </DashboardLayout>
        );
    }

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
                        <h1 className="text-2xl font-editorial font-bold tracking-tight text-zinc-900">Assinaturas & Fixos</h1>
                        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">
                            Gerencie suas despesas e receitas recorrentes
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDetect}
                            disabled={detecting}
                            className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all disabled:opacity-60"
                        >
                            {detecting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            <span>{detecting ? 'Analisando...' : 'Detectar Automaticamente'}</span>
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-zinc-800 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nova</span>
                        </button>
                    </div>
                </motion.div>

                {/* KPI Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-white border border-zinc-200 rounded-xl p-5"
                    >
                        <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center mb-3">
                            <TrendingDown className="w-5 h-5 text-rose-600" />
                        </div>
                        <p className="text-[11px] uppercase tracking-wider font-medium text-zinc-400">Despesas Fixas / mês</p>
                        <p className="text-xl font-editorial font-bold text-zinc-900 mt-1">{globalFormatCurrency(totalFixedExpenses, preferredCurrency)}</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white border border-zinc-200 rounded-xl p-5"
                    >
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-[11px] uppercase tracking-wider font-medium text-zinc-400">Receitas Fixas / mês</p>
                        <p className="text-xl font-editorial font-bold text-zinc-900 mt-1">{globalFormatCurrency(totalFixedIncome, preferredCurrency)}</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white border border-zinc-200 rounded-xl p-5 col-span-2 lg:col-span-1"
                    >
                        <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center mb-3">
                            <Calendar className="w-5 h-5 text-sky-600" />
                        </div>
                        <p className="text-[11px] uppercase tracking-wider font-medium text-zinc-400">Itens Ativos</p>
                        <p className="text-xl font-editorial font-bold text-zinc-900 mt-1">{recurrences.filter(r => r.active).length}</p>
                    </motion.div>
                </div>

                {/* Suggestions Banner */}
                <AnimatePresence>
                    {suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="bg-violet-50 border border-violet-200 rounded-xl p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-violet-600" />
                                <h3 className="text-sm font-bold text-violet-900">
                                    {suggestions.length} recorrência{suggestions.length > 1 ? 's' : ''} detectada{suggestions.length > 1 ? 's' : ''}
                                </h3>
                            </div>
                            <div className="space-y-2.5">
                                {suggestions.map((s, i) => (
                                    <motion.div
                                        key={`${s.name}-${i}`}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-center justify-between bg-white rounded-lg p-3 border border-violet-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                                                <RefreshCcw className="w-4 h-4 text-violet-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-zinc-900 truncate max-w-[200px]">{s.name}</p>
                                                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                                                    {s.type === 'income' ? 'Receita' : 'Despesa'} · {s.frequency === 'monthly' ? 'Mensal' : s.frequency === 'weekly' ? 'Semanal' : 'Anual'} · {s.confidence}% conf.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={clsx('text-sm font-bold', s.type === 'income' ? 'text-emerald-600' : 'text-rose-600')}>
                                                {globalFormatCurrency(s.amount, preferredCurrency)}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleConfirmSuggestion(s)}
                                                    className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                                                    title="Confirmar"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                </button>
                                                <button
                                                    onClick={() => setSuggestions(prev => prev.filter((_, idx) => idx !== i))}
                                                    className="w-8 h-8 rounded-lg bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center transition-colors"
                                                    title="Ignorar"
                                                >
                                                    <XCircle className="w-4 h-4 text-zinc-400" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Recurrences List */}
                    <div className="lg:col-span-3 space-y-3">
                        <h2 className="text-lg font-editorial font-bold text-zinc-900">Recorrências Ativas</h2>
                        {recurrences.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white border border-zinc-200 rounded-xl p-8 text-center"
                            >
                                <RefreshCcw className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
                                <p className="text-sm text-zinc-500 mb-1">Nenhuma recorrência cadastrada</p>
                                <p className="text-xs text-zinc-400">Use &quot;Detectar Automaticamente&quot; ou adicione manualmente.</p>
                            </motion.div>
                        ) : (
                            recurrences.map((rec, i) => {
                                const IconComp = CATEGORY_ICONS[rec.category] || RefreshCcw;
                                const borderColor = COLOR_MAP[rec.color] || '#8b5cf6';

                                return (
                                    <motion.div
                                        key={rec.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between hover:shadow-sm hover:border-zinc-300 transition-all group"
                                        style={{ borderLeftWidth: '3px', borderLeftColor: borderColor }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                                                <IconComp className="w-5 h-5 text-zinc-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-zinc-900">{rec.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{rec.category}</span>
                                                    <span className="text-zinc-300">·</span>
                                                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                                                        {rec.frequency === 'monthly' ? 'Mensal' : rec.frequency === 'weekly' ? 'Semanal' : 'Anual'}
                                                    </span>
                                                    <span className="text-zinc-300">·</span>
                                                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                                                        Próx: {formatDate(rec.nextDueDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={clsx('text-sm font-bold', rec.type === 'income' ? 'text-emerald-600' : 'text-rose-600')}>
                                                {rec.type === 'income' ? '+' : '-'}{globalFormatCurrency(rec.amount, preferredCurrency)}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(rec.id)}
                                                className="w-8 h-8 rounded-lg bg-zinc-50 hover:bg-rose-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                                title="Remover"
                                            >
                                                <Trash2 className="w-4 h-4 text-zinc-400 hover:text-rose-500" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>

                    {/* Projection Widget */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6"
                    >
                        <h2 className="text-lg font-editorial font-bold text-zinc-900">Projeção de Fixos</h2>
                        <p className="text-[11px] text-zinc-400 uppercase tracking-wider mt-0.5 mb-6">Próximos 3 meses</p>

                        {recurrences.length === 0 ? (
                            <div className="flex items-center justify-center h-40 text-zinc-300 text-sm">
                                Adicione recorrências para ver a projeção
                            </div>
                        ) : (
                            <>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={projectionData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barGap={4}>
                                            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f4f4f5" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                                            <Tooltip
                                                content={({ active, payload, label }) =>
                                                    active && payload?.length ? (
                                                        <div className="bg-white border border-zinc-200 rounded-lg px-4 py-3 shadow-xl">
                                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">{label}</p>
                                                            {payload.map((item: any) => (
                                                                <div key={item.dataKey} className="flex items-center gap-2 mb-1">
                                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                                    <span className="text-xs text-zinc-500">{item.dataKey === 'receitas' ? 'Receitas' : 'Despesas'}</span>
                                                                    <span className="text-sm font-bold text-zinc-900">{globalFormatCurrency(item.value, preferredCurrency)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : null
                                                }
                                            />
                                            <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                            <Bar dataKey="despesas" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 flex items-center justify-center gap-6">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] text-zinc-400 font-medium">Receitas</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                                        <span className="text-[10px] text-zinc-400 font-medium">Despesas</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <AddRecurrenceModal
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => { setShowAddModal(false); loadRecurrences(); }}
                    />
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}

function AddRecurrenceModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('Outros');
    const [frequency, setFrequency] = useState('monthly');
    const [nextDueDate, setNextDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/recurrences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, amount: parseFloat(amount), type, category, frequency, nextDueDate }),
            });
            const data = await res.json();
            if (res.ok) onSuccess();
            else setError(data.error || 'Erro ao criar.');
        } catch {
            setError('Erro de comunicação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-2xl border border-zinc-200 p-6 w-full max-w-md shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-editorial font-bold text-zinc-900">Nova Recorrência</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">Adicione uma despesa ou receita fixa</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Nome</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 placeholder:text-zinc-400"
                            placeholder="Ex: Netflix, Aluguel, Salário" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Valor</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">R$</span>
                                <input type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} required
                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                                    placeholder="49,90" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Tipo</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setType('expense')}
                                    className={clsx('flex-1 py-3 rounded-xl text-xs font-semibold border transition-all',
                                        type === 'expense' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-zinc-50 border-zinc-200 text-zinc-500')}>
                                    Despesa
                                </button>
                                <button type="button" onClick={() => setType('income')}
                                    className={clsx('flex-1 py-3 rounded-xl text-xs font-semibold border transition-all',
                                        type === 'income' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-zinc-50 border-zinc-200 text-zinc-500')}>
                                    Receita
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Frequência</label>
                            <select value={frequency} onChange={e => setFrequency(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400">
                                <option value="monthly">Mensal</option>
                                <option value="weekly">Semanal</option>
                                <option value="annual">Anual</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Próximo Vencimento</label>
                            <input type="date" value={nextDueDate} onChange={e => setNextDueDate(e.target.value)} required
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Categoria</label>
                        <select value={category} onChange={e => setCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400">
                            {['Streaming', 'Moradia', 'Transporte', 'Alimentação', 'Lazer', 'Serviços', 'Outros'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-700">{error}</div>
                    )}

                    <button type="submit" disabled={loading}
                        className="w-full py-3.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading ? (
                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
                        ) : (
                            'Adicionar Recorrência'
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
