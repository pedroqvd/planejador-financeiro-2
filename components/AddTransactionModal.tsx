'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, CreditCard, Landmark, Plus, Minus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { addToSyncQueue } from '@/lib/sync';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/currency';

const expenseCategories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros'];
const incomeCategories = ['Salário', 'Investimento', 'Presente', 'Venda', 'Outros'];

type Transaction = {
    id: string;
    name: string;
    category: string;
    amount: number;
    type: string;
    date: string;
    paymentMethod?: string;
    installments?: number;
    currency?: string;
};

export function AddTransactionModal({
    onClose,
    onSuccess,
    editTransaction,
    preferredCurrency = 'BRL',
}: {
    onClose: () => void;
    onSuccess: () => void;
    editTransaction?: Transaction | null;
    preferredCurrency?: string;
}) {
    const isEditing = !!editTransaction;
    const [name, setName] = useState(editTransaction?.name || '');
    const [type, setType] = useState<'expense' | 'income'>(
        (editTransaction?.type as 'expense' | 'income') || 'expense'
    );
    const [category, setCategory] = useState(editTransaction?.category || (type === 'expense' ? 'Alimentação' : 'Salário'));
    const [amount, setAmount] = useState(editTransaction ? String(editTransaction.amount) : '');
    const [paymentMethod, setPaymentMethod] = useState<'account' | 'credit_card'>(
        (editTransaction?.paymentMethod as 'account' | 'credit_card') || 'account'
    );
    const [installments, setInstallments] = useState<number>(editTransaction?.installments || 1);
    const [currency, setCurrency] = useState(editTransaction?.currency || preferredCurrency);
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
            setCurrency(editTransaction.currency || preferredCurrency);
        }
    }, [editTransaction, preferredCurrency]);

    // Handle type change to update category defaults
    const handleTypeChange = (newType: 'expense' | 'income') => {
        if (newType === type) return;
        setType(newType);
        if (!isEditing) {
            setCategory(newType === 'expense' ? 'Alimentação' : 'Salário');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const txData = {
            ...(isEditing ? { id: editTransaction!.id } : {}),
            name,
            category,
            amount: parseFloat(amount),
            type,
            paymentMethod,
            installments,
            currency,
        };

        try {
            const res = await fetch('/api/transactions', {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(txData),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Erro ao salvar.');
                return;
            }

            toast.success(isEditing ? 'Alterado com sucesso!' : 'Salvo com sucesso!');
            onSuccess();
        } catch (error) {
            if (!navigator.onLine) {
                // @ts-ignore
                addToSyncQueue(isEditing ? 'PUT' : 'POST', txData);
                toast.success('Offline: Transação salva na fila de sincronização.');
                onSuccess();
            } else {
                setError('Erro de conexão ao servidor.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isExpense = type === 'expense';
    const accentColor = isExpense ? 'rose' : 'emerald';
    const categories = isExpense ? expenseCategories : incomeCategories;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className={clsx(
                    "relative border rounded-2xl p-6 w-full max-w-md shadow-2xl transition-colors duration-500",
                    isExpense ? "bg-rose-50/5 border-rose-200/20" : "bg-emerald-50/5 border-emerald-200/20",
                    "bg-[#fdf9f0] shadow-black/20" // Matching dashboard theme
                )}
            >
                <div className={clsx(
                    "flex items-center justify-between p-6 -mx-6 -mt-6 mb-6 rounded-t-2xl transition-colors duration-500",
                    isExpense ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                )}>
                    <div>
                        <h2 className="text-xl font-editorial font-bold">
                            {isEditing ? 'Editar Transação' : 'Nova Transação'}
                        </h2>
                        <p className="text-[10px] opacity-80 uppercase tracking-widest mt-1">
                            {isExpense ? 'Registrar Saída de Capital' : 'Registrar Entrada de Capital'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type selector - SEMANTIC REDESIGN */}
                    <div className="p-1 bg-zinc-200/50 rounded-xl flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => handleTypeChange('expense')}
                            className={clsx(
                                'flex-1 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2',
                                isExpense ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30' : 'text-zinc-500 hover:bg-white/50'
                            )}
                        >
                            <Minus className={clsx("w-3.5 h-3.5", isExpense ? "text-white" : "text-rose-400")} />
                            Despesa
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('income')}
                            className={clsx(
                                'flex-1 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2',
                                !isExpense ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'text-zinc-500 hover:bg-white/50'
                            )}
                        >
                            <Plus className={clsx("w-3.5 h-3.5", !isExpense ? "text-white" : "text-emerald-400")} />
                            Receita
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="relative group">
                            <label className={clsx(
                                "block text-[10px] font-bold uppercase tracking-widest mb-2 transition-colors",
                                isExpense ? "text-rose-700/70" : "text-emerald-700/70"
                            )}>Descrição</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={clsx(
                                    "w-full px-4 py-3 border bg-white rounded-xl text-sm text-zinc-900 focus:outline-none transition-all",
                                    isExpense ? "border-rose-100 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400" : "border-emerald-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400"
                                )}
                                placeholder={isExpense ? "Ex: Mercado, Uber, Netflix..." : "Ex: Salário, Freelance, Dividendos..."}
                                required
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className={clsx(
                                    "block text-[10px] font-bold uppercase tracking-widest mb-2 transition-colors",
                                    isExpense ? "text-rose-700/70" : "text-emerald-700/70"
                                )}>Valor e Moeda</label>
                                <div className="flex gap-2 relative">
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className={clsx(
                                                "w-full px-4 py-3 border bg-white rounded-xl text-sm font-bold text-zinc-900 focus:outline-none transition-all",
                                                isExpense ? "border-rose-100 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400" : "border-emerald-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400"
                                            )}
                                            placeholder="0,00"
                                            required
                                        />
                                    </div>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className={clsx(
                                            "px-3 py-3 w-28 border bg-white rounded-xl text-sm font-bold text-zinc-900 focus:outline-none transition-all appearance-none cursor-pointer",
                                            isExpense ? "border-rose-100 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400" : "border-emerald-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400"
                                        )}
                                    >
                                        <option value="BRL">BRL (R$)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="CAD">CAD (C$)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex-1">
                                <label className={clsx(
                                    "block text-[10px] font-bold uppercase tracking-widest mb-2 transition-colors",
                                    isExpense ? "text-rose-700/70" : "text-emerald-700/70"
                                )}>Categoria</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className={clsx(
                                        "w-full px-4 py-3 border bg-white rounded-xl text-sm text-zinc-900 focus:outline-none transition-all appearance-none cursor-pointer",
                                        isExpense ? "border-rose-100 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400" : "border-emerald-100 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400"
                                    )}
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method (enhanced visuals) */}
                    {type === 'expense' && (
                        <div className="space-y-3">
                            <label className="block text-[10px] font-bold text-rose-700/70 uppercase tracking-widest">Método de Pagamento</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setPaymentMethod('account'); setInstallments(1); }}
                                    className={clsx(
                                        'flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 group relative overflow-hidden',
                                        paymentMethod === 'account'
                                            ? 'border-emerald-500 bg-emerald-500/5'
                                            : 'border-zinc-100 bg-white hover:border-zinc-200'
                                    )}
                                >
                                    <div className={clsx(
                                        'w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform duration-300',
                                        paymentMethod === 'account' ? 'bg-emerald-500 text-white scale-110' : 'bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200'
                                    )}>
                                        <Landmark className="w-5 h-5" />
                                    </div>
                                    <span className={clsx(
                                        'text-[9px] font-bold uppercase tracking-widest',
                                        paymentMethod === 'account' ? 'text-emerald-700' : 'text-zinc-500'
                                    )}>
                                        Conta / Pix
                                    </span>
                                    {paymentMethod === 'account' && (
                                        <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                                            <Check className="w-2.5 h-2.5" />
                                        </div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('credit_card')}
                                    className={clsx(
                                        'flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 group relative overflow-hidden',
                                        paymentMethod === 'credit_card'
                                            ? 'border-violet-500 bg-violet-500/5'
                                            : 'border-zinc-100 bg-white hover:border-zinc-200'
                                    )}
                                >
                                    <div className={clsx(
                                        'w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform duration-300',
                                        paymentMethod === 'credit_card' ? 'bg-violet-500 text-white scale-110' : 'bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200'
                                    )}>
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <span className={clsx(
                                        'text-[9px] font-bold uppercase tracking-widest',
                                        paymentMethod === 'credit_card' ? 'text-violet-700' : 'text-zinc-500'
                                    )}>
                                        Cartão
                                    </span>
                                    {paymentMethod === 'credit_card' && (
                                        <div className="absolute top-1 right-1 bg-violet-500 text-white rounded-full p-0.5 shadow-sm">
                                            <Check className="w-2.5 h-2.5" />
                                        </div>
                                    )}
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {paymentMethod === 'credit_card' && !isEditing && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="pt-2"
                                    >
                                        <label className="block text-[10px] font-bold text-violet-700/70 uppercase tracking-widest mb-3">Parcelamento</label>
                                        <div className="flex flex-wrap gap-2">
                                            {[1, 2, 3, 4, 6, 10, 12].map(n => (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    onClick={() => setInstallments(n)}
                                                    className={clsx(
                                                        'w-10 h-10 rounded-xl text-[10px] font-bold transition-all duration-150',
                                                        installments === n
                                                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                                            : 'bg-white border border-zinc-200 text-zinc-500 hover:border-violet-300 hover:text-violet-600'
                                                    )}
                                                >
                                                    {n}x
                                                </button>
                                            ))}
                                        </div>
                                        {installments > 1 && amount && (
                                            <p className="text-[10px] text-violet-600 mt-3 font-bold uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-10 h-1 rounded-full" />
                                                {installments} parcelas de {formatCurrency(parseFloat(amount) / installments, preferredCurrency)}
                                            </p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3 border border-rose-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-rose-700 text-center bg-rose-50"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={clsx(
                            "w-full py-4 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-60 flex items-center justify-center space-x-2 text-white",
                            isExpense ? "bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-900/10" : "bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-900/10"
                        )}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                {isEditing ? 'Atualizar Transação' : 'Salvar Transação'}
                            </span>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
