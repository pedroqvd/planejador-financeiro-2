'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    ReferenceLine
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CalendarDays,
    Info,
    Loader2,
    Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface ForecastData {
    date: string;
    displayDate: string;
    balance: number;
    isCurrent: boolean;
    events: Array<{ name: string; amount: number; type: string }>;
}

export function CashFlowForecast({ preferredCurrency = 'BRL' }: { preferredCurrency?: string }) {
    const [data, setData] = useState<ForecastData[]>([]);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/analytics/forecast')
            .then(res => res.json())
            .then(d => {
                setData(d.projection || []);
                setCurrentBalance(d.currentBalance || 0);
            })
            .catch(err => console.error('Forecast fetch failed', err))
            .finally(() => setLoading(false));
    }, []);

    const stats = useMemo(() => {
        if (data.length === 0) return null;
        const finalBalance = data[data.length - 1].balance;
        const trend = finalBalance >= currentBalance ? 'up' : 'down';
        const percentChange = currentBalance !== 0 ? ((finalBalance - currentBalance) / Math.abs(currentBalance)) * 100 : 0;
        const lowestPoint = data.reduce((min, d) => d.balance < min ? d.balance : min, currentBalance);
        const hasDanger = lowestPoint < 500; // Warning threshold

        return { trend, percentChange, finalBalance, lowestPoint, hasDanger };
    }, [data, currentBalance]);

    if (loading) {
        return (
            <div className="h-[400px] w-full flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-2xl">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (data.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 overflow-hidden relative"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 relative z-10">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-editorial font-bold text-white">Projeção de Fluxo de Caixa</h3>
                        <div className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded text-[9px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            IA Forecast
                        </div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Saldo projetado para os próximos 90 dias baseado em recorrências.</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Saldo Final (90 dias)</p>
                        <p className={clsx(
                            "text-lg font-editorial font-bold",
                            stats?.trend === 'up' ? "text-emerald-400" : "text-rose-400"
                        )}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: preferredCurrency, minimumFractionDigits: 2 }).format(stats?.finalBalance || 0)}
                        </p>
                    </div>
                    <div className={clsx(
                        "w-12 h-12 flex items-center justify-center rounded-xl",
                        stats?.trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                        {stats?.trend === 'up' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>
                </div>
            </div>

            <div className="h-[250px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis
                            dataKey="displayDate"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 10 }}
                            interval={14}
                        />
                        <YAxis
                            hide
                            domain={['dataMin - 1000', 'dataMax + 1000']}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload as ForecastData;
                                    return (
                                        <div className="bg-zinc-800 border border-zinc-700 p-3 shadow-2xl rounded-lg">
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">{data.displayDate}</p>
                                            <p className="text-sm font-bold text-white mb-2">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: preferredCurrency, minimumFractionDigits: 2 }).format(data.balance)}
                                            </p>
                                            {data.events.length > 0 && (
                                                <div className="pt-2 border-t border-zinc-700/50 space-y-1">
                                                    {data.events.map((e, i) => (
                                                        <div key={i} className="flex items-center justify-between gap-4">
                                                            <span className="text-[9px] text-zinc-300">{e.name}</span>
                                                            <span className={clsx(
                                                                "text-[9px] font-bold",
                                                                e.type === 'income' ? "text-emerald-400" : "text-rose-400"
                                                            )}>
                                                                {e.type === 'income' ? '+ ' : '- '}
                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: preferredCurrency }).format(e.amount)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Zero', fill: '#ef4444', fontSize: 10 }} />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorBalance)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <CalendarDays className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Horizonte</span>
                    </div>
                    <p className="text-xs text-white font-medium">90 dias projetados</p>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Info className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Menor Saldo</span>
                    </div>
                    <p className={clsx(
                        "text-xs font-medium",
                        stats?.hasDanger ? "text-rose-400" : "text-white"
                    )}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: preferredCurrency, minimumFractionDigits: 2 }).format(stats?.lowestPoint || 0)}
                    </p>
                </div>

                {stats?.hasDanger && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Alerta de Liquidez</p>
                            <p className="text-[9px] text-rose-400/80 mt-0.5 leading-tight">Projeção indica saldo baixo nos próximos meses. Revise gastos recorrentes.</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div >
    );
}
