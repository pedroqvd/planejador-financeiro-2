'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Check, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function ImportModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ message: string; count: number } | null>(null);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (f: File) => {
        const name = f.name.toLowerCase();
        if (!name.endsWith('.ofx') && !name.endsWith('.qfx') && !name.endsWith('.csv') && !name.endsWith('.pdf')) {
            setError('Formato não suportado. Use .pdf, .ofx ou .csv');
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            setError('Arquivo muito grande (máx 5MB).');
            return;
        }
        setFile(f);
        setError('');
    };

    const handleSubmit = async () => {
        if (!file) return;
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/import', { method: 'POST', body: formData });
            const data = await res.json();

            if (res.ok) {
                setResult(data);
                setTimeout(() => onSuccess(), 2000);
            } else {
                setError(data.error || 'Erro ao importar.');
            }
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white border border-zinc-200 p-6 w-full max-w-md shadow-2xl"
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-editorial font-bold text-zinc-900">Importar Extrato</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 transition-colors">
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                {result ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                    >
                        <div className="w-16 h-16 mx-auto border border-zinc-200 flex items-center justify-center mb-4">
                            <Check className="w-8 h-8 text-zinc-700" />
                        </div>
                        <p className="text-lg font-editorial font-bold text-zinc-900">{result.count} transações importadas!</p>
                        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Categorias identificadas automaticamente</p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {/* Drop zone */}
                        <div
                            onClick={() => inputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                            className="border border-dashed border-zinc-300 p-8 text-center cursor-pointer hover:border-zinc-500 hover:bg-zinc-50/50 transition-all duration-200"
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                accept=".pdf,.ofx,.qfx,.csv"
                                className="hidden"
                                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                            />
                            {file ? (
                                <div className="flex items-center justify-center space-x-3">
                                    <FileSpreadsheet className="w-8 h-8 text-zinc-500" />
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-zinc-900">{file.name}</p>
                                        <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                                    <p className="text-sm text-zinc-600 font-medium">Arraste ou clique para selecionar</p>
                                    <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">Formatos: .pdf, .ofx, .csv (máx 5MB)</p>
                                </>
                            )}
                        </div>

                        {/* Info */}
                        <div className="bg-zinc-50 border border-zinc-200 p-3 text-xs text-zinc-600">
                            <p className="font-semibold mb-1">Dica de Importação com IA Mágica ✨</p>
                            <p>Envie a sua fatura em PDF do Nubank, Itaú ou Inter. A IA vai ler, categorizar e importar tudo sozinha em segundos.</p>
                        </div>

                        {error && (
                            <div className="flex items-center space-x-2 p-3 border border-zinc-200 bg-zinc-50 text-zinc-700 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={!file || loading}
                            className="w-full py-3 bg-zinc-900 text-white text-xs font-medium uppercase tracking-wider hover:bg-zinc-800 transition-all disabled:opacity-40 flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    <span>Importar Transações</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
