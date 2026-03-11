'use client';

import { useState, useRef } from 'react';
import {
    Camera,
    Upload,
    Loader2,
    X,
    Check,
    Scan,
    Sparkles,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

type ScanResult = {
    name: string;
    amount: number;
    category: string;
    date: string;
};

export function ReceiptScanner({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleScan = async () => {
        if (!preview) return;
        setScanning(true);
        setResult(null);

        try {
            const res = await fetch('/api/ai/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: preview }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Erro ao escanear');
            }

            const data = await res.json();
            setResult(data);
            toast.success('Leitura concluída!');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Falha na leitura por IA');
        } finally {
            setScanning(false);
        }
    };

    const handleSave = async () => {
        if (!result) return;
        setSaving(true);
        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: result.name,
                    amount: result.amount,
                    category: result.category,
                    type: 'expense',
                    date: result.date,
                    paymentMethod: 'account'
                }),
            });

            if (res.ok) {
                toast.success('Transação cadastrada com sucesso!');
                onSuccess();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Erro ao salvar');
            }
        } catch (error) {
            toast.error('Erro ao conectar com o servidor');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                            <Scan className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-editorial font-bold text-zinc-900 dark:text-zinc-100">Scan IA de Recibo</h3>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Gemini 2.0 Flash Vision</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                <div className="p-6">
                    {!preview ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center space-y-4 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all cursor-pointer group"
                        >
                            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-zinc-400 group-hover:text-indigo-500" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Selecione uma foto do recibo</p>
                                <p className="text-xs text-zinc-400 mt-1">PNG, JPG ou WEBP (Max 5MB)</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Image Preview & Scan Progress */}
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={preview} alt="Receipt Preview" className="w-full h-full object-contain" />

                                <AnimatePresence>
                                    {scanning && (
                                        <motion.div
                                            initial={{ top: '-10%' }}
                                            animate={{ top: '110%' }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)] z-10"
                                        />
                                    )}
                                </AnimatePresence>

                                {scanning && (
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                                        <div className="bg-white/90 dark:bg-zinc-900/90 px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Analisando com IA...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {!result && !scanning && (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleScan}
                                        className="flex-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-2 hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-lg"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        <span>Iniciar Leitura</span>
                                    </button>
                                    <button
                                        onClick={() => { setFile(null); setPreview(null); }}
                                        className="px-6 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all font-bold uppercase text-xs"
                                    >
                                        Trocar
                                    </button>
                                </div>
                            )}

                            {/* Scan Results */}
                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-5 space-y-4"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Dados Extraídos</span>
                                            <button onClick={() => setResult(null)} className="text-zinc-400 hover:text-zinc-600">
                                                <PencilIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] uppercase text-zinc-400 font-bold mb-1">Local</p>
                                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{result.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase text-zinc-400 font-bold mb-1">Valor</p>
                                                <p className="text-lg font-editorial font-bold text-zinc-900 dark:text-zinc-100">R$ {result.amount.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase text-zinc-400 font-bold mb-1">Categoria</p>
                                                <span className="inline-block px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold rounded uppercase">
                                                    {result.category}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase text-zinc-400 font-bold mb-1">Data</p>
                                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{new Date(result.date).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-2 hover:bg-emerald-500 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            <span>Confirmar e Salvar</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                {/* Info Footer */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 flex items-center space-x-2">
                    <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                    <p className="text-[10px] text-zinc-500 leading-none">Dados processados localmente. Imagens não são armazenadas permanentemente.</p>
                </div>
            </motion.div>
        </div>
    );
}

function PencilIcon({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
    )
}
