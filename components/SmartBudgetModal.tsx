'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

type Suggestion = {
    category: string;
    currentAverage: number;
    suggestedLimit: number;
    reasoning: string;
};

export function SmartBudgetModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

    const generateAIPlan = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/ai/budget-planner', { method: 'POST' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Falha ao analisar dados.');
            }
            const data = await res.json();
            if (data.suggestions && data.suggestions.length > 0) {
                setSuggestions(data.suggestions);
                // Select all by default
                setSelectedCategories(new Set(data.suggestions.map((s: Suggestion) => s.category)));
            } else {
                throw new Error('Nenhuma sugestão válida recebida da IA.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (category: string) => {
        const next = new Set(selectedCategories);
        if (next.has(category)) next.delete(category);
        else next.add(category);
        setSelectedCategories(next);
    };

    const handleApplyBudgets = async () => {
        if (!suggestions || selectedCategories.size === 0) return;
        setSaving(true);
        setError('');

        const toSave = suggestions.filter(s => selectedCategories.has(s.category));

        try {
            // Save each budget individually via API
            await Promise.all(
                toSave.map(s =>
                    fetch('/api/budget', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ category: s.category, limit: s.suggestedLimit })
                    })
                )
            );
            onSuccess();
        } catch (err) {
            setError('Erro ao salvar os orçamentos aplicados. Tente novamente.');
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative bg-white border border-zinc-200 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-lg font-editorial font-bold text-zinc-900">
                            Orçamento Inteligente com IA
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 transition-colors">
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                {!suggestions && !loading && (
                    <div className="text-center py-12 space-y-6">
                        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto">
                            <Sparkles className="w-8 h-8 text-indigo-500" />
                        </div>
                        <div className="space-y-2 max-w-sm mx-auto">
                            <h3 className="text-lg font-bold text-zinc-900">Seu Consultor Financeiro Automático</h3>
                            <p className="text-sm text-zinc-500">
                                A IA vai analisar seus últimos 3 meses de despesas, encontrar a média de gatos, e sugerir metas de economia agressivas, porém realistas para o próximo mês.
                            </p>
                        </div>
                        {error && (
                            <div className="flex items-center justify-center space-x-2 text-rose-600 bg-rose-50 p-3 rounded-md text-sm border border-rose-100">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}
                        <button
                            onClick={generateAIPlan}
                            className="bg-zinc-900 text-white px-6 py-3 text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center space-x-2 mx-auto"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Analisar e Sugerir Metas</span>
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-20 space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                        <p className="text-sm font-medium text-zinc-600 animate-pulse">
                            O Gemini está triturando seus números e construindo suas metas...
                        </p>
                    </div>
                )}

                {suggestions && !loading && (
                    <div className="space-y-6">
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-md">
                            <p className="text-sm text-indigo-900">
                                Análise concluída! Aqui estão suas metas de gastos recomendadas pro próximo mês. Selecione quais deseja aplicar:
                            </p>
                        </div>

                        {error && (
                            <div className="text-rose-600 bg-rose-50 p-3 rounded-md text-sm border border-rose-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            {suggestions.map((s) => {
                                const isSelected = selectedCategories.has(s.category);
                                const diff = s.suggestedLimit - s.currentAverage;
                                const diffPercent = ((diff / s.currentAverage) * 100).toFixed(0);

                                return (
                                    <div
                                        key={s.category}
                                        onClick={() => toggleSelection(s.category)}
                                        className={clsx(
                                            "border p-4 rounded-md cursor-pointer transition-all flex items-start space-x-4",
                                            isSelected ? "border-indigo-500 bg-indigo-50/30" : "border-zinc-200 hover:border-zinc-300"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-5 h-5 mt-0.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                                            isSelected ? "bg-indigo-500 border-indigo-500" : "border-zinc-300 bg-white"
                                        )}>
                                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-sm text-zinc-900">{s.category}</h4>
                                                <div className="text-right">
                                                    <span className="text-lg font-editorial font-bold text-zinc-900">R$ {s.suggestedLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 text-xs text-zinc-500">
                                                <span>Média Histórica: R$ {s.currentAverage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                <span>•</span>
                                                <span className={clsx("font-medium", diff <= 0 ? "text-emerald-600" : "text-rose-600")}>
                                                    {diff <= 0 ? "Economia de " : "Acréscimo de "} {Math.abs(Number(diffPercent))}%
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-zinc-600 bg-white/50 border border-zinc-100 p-2 rounded">
                                                💡 {s.reasoning}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-4 border-t border-zinc-200 mt-6 flex justify-end space-x-3">
                            <button
                                onClick={onClose}
                                disabled={saving}
                                className="px-4 py-2.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleApplyBudgets}
                                disabled={saving || selectedCategories.size === 0}
                                className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 text-xs font-medium uppercase tracking-wider hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                <span>Aplicar {selectedCategories.size} Meta(s)</span>
                            </button>
                        </div>
                    </div>
                )}

            </motion.div>
        </div>
    );
}
