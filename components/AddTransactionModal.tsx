'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const categories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Salário', 'Outros'];

export function AddTransactionModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Alimentação');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, category, amount, type }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Erro ao salvar.');
                return;
            }

            onSuccess();
        } catch {
            setError('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="relative bg-white border border-zinc-200 p-6 w-full max-w-md shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-editorial font-bold text-zinc-900">Nova Transação</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 transition-colors">
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type selector */}
                    <div className="flex border border-zinc-200">
                        <button
                            type="button"
                            onClick={() => { setType('expense'); setCategory('Alimentação'); }}
                            className={`flex-1 py-2.5 text-xs font-medium uppercase tracking-wider transition-all duration-200 ${type === 'expense' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-50'
                                }`}
                        >
                            Despesa
                        </button>
                        <button
                            type="button"
                            onClick={() => { setType('income'); setCategory('Salário'); }}
                            className={`flex-1 py-2.5 text-xs font-medium uppercase tracking-wider transition-all duration-200 ${type === 'income' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-50'
                                }`}
                        >
                            Receita
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Descrição</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 border-0 border-b border-zinc-200 rounded-none text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all bg-transparent"
                            placeholder="Ex: Supermercado, Salário..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Valor (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-2.5 border-0 border-b border-zinc-200 rounded-none text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all bg-transparent"
                            placeholder="0,00"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Categoria</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2.5 border-0 border-b border-zinc-200 rounded-none text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 transition-all bg-white"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="p-3 border border-zinc-200 text-sm text-zinc-700 text-center bg-zinc-50">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all duration-200 disabled:opacity-60 flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <span>Salvar Transação</span>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
