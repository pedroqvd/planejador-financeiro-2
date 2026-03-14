'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
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
        const lowestPoint = data.reduce((min, d) => d.balance < min ? d.balance : min, currentBalance);
        const hasDanger = lowestPoint < 500;

        return { trend, finalBalance, lowestPoint, hasDanger };
    }, [data, currentBalance]);

    const fmt = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: preferredCurrency, minimumFractionDigits: 2 }).format(v);

    if (loading) {
        return (
            <div className="card-editorial h-[380px] flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--accent-ink)' }} />
            </div>
        );
    }

    if (data.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-editorial p-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-editorial font-bold" style={{ color: 'var(--text-primary)' }}>
                            Projeção de Fluxo de Caixa
                        </h3>
                        <span
                            className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"
                            style={{ backgroundColor: 'var(--accent-ink)', color: 'var(--bg-cream)', opacity: 0.9 }}
                        >
                            <Sparkles className="w-2.5 h-2.5" />
                            IA
                        </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Saldo projetado para os próximos 90 dias baseado em recorrências.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Saldo Final
                        </p>
                        <p
                            className="text-lg font-editorial font-bold"
                            style={{ color: stats?.trend === 'up' ? '#10b981' : '#f43f5e' }}
                        >
                            {fmt(stats?.finalBalance || 0)}
                        </p>
                    </div>
                    <div
                        className="w-10 h-10 flex items-center justify-center"
                        style={{
                            backgroundColor: stats?.trend === 'up' ? '#10b98115' : '#f43f5e15',
                            color: stats?.trend === 'up' ? '#10b981' : '#f43f5e'
                        }}
                    >
                        {stats?.trend === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--accent-ink)" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="var(--accent-ink)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.5} vertical={false} />
                        <XAxis
                            dataKey="displayDate"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                            interval={14}
                        />
                        <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload as ForecastData;
                                    return (
                                        <div
                                            className="p-3"
                                            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}
                                        >
                                            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>
                                                {d.displayDate}
                                            </p>
                                            <p className="text-sm font-bold font-editorial" style={{ color: 'var(--text-primary)' }}>
                                                {fmt(d.balance)}
                                            </p>
                                            {d.events.length > 0 && (
                                                <div className="pt-2 mt-2 space-y-1" style={{ borderTop: '1px solid var(--border-color)' }}>
                                                    {d.events.map((e, i) => (
                                                        <div key={i} className="flex items-center justify-between gap-4">
                                                            <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{e.name}</span>
                                                            <span
                                                                className="text-[9px] font-bold"
                                                                style={{ color: e.type === 'income' ? '#10b981' : '#f43f5e' }}
                                                            >
                                                                {e.type === 'income' ? '+ ' : '- '}{fmt(e.amount)}
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
                        <ReferenceLine
                            y={0}
                            stroke="#f43f5e"
                            strokeDasharray="3 3"
                            label={{ position: 'right', value: 'Zero', fill: '#f43f5e', fontSize: 10 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            stroke="var(--accent-ink)"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorForecast)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Stats */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <CalendarDays className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                            Horizonte
                        </span>
                    </div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>90 dias projetados</p>
                </div>

                <div className="p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <Info className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                            Menor Saldo
                        </span>
                    </div>
                    <p
                        className="text-xs font-medium"
                        style={{ color: stats?.hasDanger ? '#f43f5e' : 'var(--text-primary)' }}
                    >
                        {fmt(stats?.lowestPoint || 0)}
                    </p>
                </div>

                {stats?.hasDanger && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 flex items-center gap-3"
                        style={{ backgroundColor: '#f43f5e10', border: '1px solid #f43f5e25' }}
                    >
                        <div
                            className="w-7 h-7 flex items-center justify-center shrink-0"
                            style={{ backgroundColor: '#f43f5e15', color: '#f43f5e' }}
                        >
                            <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#f43f5e' }}>
                                Alerta de Liquidez
                            </p>
                            <p className="text-[9px] mt-0.5 leading-tight" style={{ color: '#f43f5e', opacity: 0.8 }}>
                                Revise gastos recorrentes.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
