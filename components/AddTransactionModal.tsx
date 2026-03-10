'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, CreditCard, Landmark } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

const categories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Salário', 'Outros'];

type Transaction = {
    id: string;
    name: string;
    category: string;
    amount: number;
    type: string;
    date: string;
    paymentMethod?: string;
    installments?: number;
};

export function AddTransactionModal({
    onClose,
    onSuccess,
    editTransaction,
}: {
    onClose: () => void;
    onSuccess: () => void;
    editTransaction?: Transaction | null;
}) {
    const isEditing = !!editTransaction;
    const [name, setName] = useState(editTransaction?.name || '');
    const [category, setCategory] = useState(editTransaction?.category || 'Alimentação');
    const [amount, setAmount] = useState(editTransaction ? String(editTransaction.amount) : '');
    const [type, setType] = useState<'expense' | 'income'>(
        (editTransaction?.type as 'expense' | 'income') || 'expense'
    );
    const [paymentMethod, setPaymentMethod] = useState<'account' | 'credit_card'>(
        (editTransaction?.paymentMethod as 'account' | 'credit_card') || 'account'
    );
    const [installments, setInstallments] = useState<number>(editTransaction?.installments || 1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (editTransaction) {
            setName(editTransaction.name);
            setCategory(editTransaction.category);
            setAmount(String(editTransaction.amount));
            setType(editTransaction.type as 'expense' | 'income');
            setPaymentMethod((editTransaction.paymentMethod as 'account' | 'credit_card') || 'account');
            setInstallments(editTransaction.installments || 1);
        }
    }, [editTransaction]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/transactions', {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(isEditing ? { id: editTransaction!.id } : {}),
                    name,
                    category,
                    amount,
                    type,
                    paymentMethod,
                    installments,
                }),
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
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="relative bg-white border border-zinc-200 rounded-xl p-6 w-full max-w-md shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-editorial font-bold text-zinc-900">
                        {isEditing ? 'Editar Transação' : 'Nova Transação'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors">
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Type selector */}
                    <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => { setType('expense'); if (!isEditing) setCategory('Alimentação'); }}
                            className={clsx(
                                'flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200',
                                type === 'expense' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-50'
                            )}
                        >
                            Despesa
                        </button>
                        <button
                            type="button"
                            onClick={() => { setType('income'); if (!isEditing) setCategory('Salário'); }}
                            className={clsx(
                                'flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200',
                                type === 'income' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-50'
                            )}
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
                            className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all bg-white"
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
                            className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all bg-white"
                            placeholder="0,00"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Categoria</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all bg-white"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Method (only for expenses) */}
                    {type === 'expense' && (
                        <div className="space-y-3">
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Método de Pagamento</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setPaymentMethod('account'); setInstallments(1); }}
                                    className={clsx(
                                        'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 group',
                                        paymentMethod === 'account'
                                            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm shadow-emerald-500/10'
                                            : 'border-zinc-200 hover:border-zinc-300 bg-white'
                                    )}
                                >
                                    <div className={clsx(
                                        'w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors',
                                        paymentMethod === 'account' ? 'bg-emerald-100' : 'bg-zinc-100 group-hover:bg-zinc-200'
                                    )}>
                                        <Landmark className={clsx('w-5 h-5', paymentMethod === 'account' ? 'text-emerald-600' : 'text-zinc-400')} />
                                    </div>
                                    <span className={clsx(
                                        'text-xs font-bold uppercase tracking-wider',
                                        paymentMethod === 'account' ? 'text-emerald-700' : 'text-zinc-500'
                                    )}>
                                        Débito / Pix
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('credit_card')}
                                    className={clsx(
                                        'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 group',
                                        paymentMethod === 'credit_card'
                                            ? 'border-violet-500 bg-violet-50/50 shadow-sm shadow-violet-500/10'
                                            : 'border-zinc-200 hover:border-zinc-300 bg-white'
                                    )}
                                >
                                    <div className={clsx(
                                        'w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors',
                                        paymentMethod === 'credit_card' ? 'bg-violet-100' : 'bg-zinc-100 group-hover:bg-zinc-200'
                                    )}>
                                        <CreditCard className={clsx('w-5 h-5', paymentMethod === 'credit_card' ? 'text-violet-600' : 'text-zinc-400')} />
                                    </div>
                                    <span className={clsx(
                                        'text-xs font-bold uppercase tracking-wider',
                                        paymentMethod === 'credit_card' ? 'text-violet-700' : 'text-zinc-500'
                                    )}>
                                        Cartão
                                    </span>
                                </button>
                            </div>

                            {/* Installments selector (animated) */}
                            {paymentMethod === 'credit_card' && !isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Parcelas</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setInstallments(n)}
                                                className={clsx(
                                                    'w-10 h-10 rounded-lg text-xs font-bold transition-all duration-150',
                                                    installments === n
                                                        ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                                                        : 'border border-zinc-200 text-zinc-500 hover:border-violet-300 hover:text-violet-600'
                                                )}
                                            >
                                                {n}x
                                            </button>
                                        ))}
                                    </div>
                                    {installments > 1 && amount && (
                                        <p className="text-xs text-violet-600 mt-2 font-medium">
                                            {installments}x de R$ {(parseFloat(amount) / installments).toFixed(2)}
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="p-3 border border-rose-200 rounded-lg text-sm text-rose-700 text-center bg-rose-50">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-800 transition-all duration-200 disabled:opacity-60 flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <span>{isEditing ? 'Salvar Alterações' : 'Salvar Transação'}</span>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
