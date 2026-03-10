import React, { useState } from 'react';

export default function CreditCardOptionsMockup() {
    const [activeTab, setActiveTab] = useState('a');

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 font-sans bg-zinc-50 rounded-lg border border-zinc-200 shadow-sm mt-4 mb-4">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-zinc-900">Comparativo das Opções de Cartão de Crédito</h2>
                <p className="text-zinc-500 text-sm">Selecione abaixo para entender como cada opção ficaria na interface.</p>
            </div>

            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => setActiveTab('a')}
                    className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'a' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                        }`}
                >
                    Opção A: Toggle Simples no Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('b')}
                    className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'b' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                        }`}
                >
                    Opção B: UI Dedicada (Recomendado)
                </button>
            </div>

            <div className="bg-white border text-left border-zinc-200 rounded-lg p-6 shadow-sm overflow-hidden relative">
                {activeTab === 'a' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                            <h3 className="font-bold text-lg text-zinc-900">Dashboard (Opção A)</h3>
                            <div className="bg-zinc-100 rounded-lg p-1 flex items-center text-xs font-medium">
                                <span className="px-3 py-1.5 rounded-md text-zinc-500 cursor-pointer">Geral</span>
                                <span className="px-3 py-1.5 rounded-md bg-white shadow-sm text-zinc-900 cursor-pointer">Só Cartão</span>
                            </div>
                        </div>

                        <p className="text-sm text-zinc-600">
                            <strong>Como funciona:</strong> Adicionamos um botão (Toggle) no topo do seu Dashboard existente. Quando você clica em "Só Cartão", os blocos vermelhos e azuis mudam o significado. Não mexemos no banco de dados.
                        </p>

                        {/* Mockup Opção A */}
                        <div className="grid grid-cols-3 gap-4 pb-4">
                            <div className="border border-zinc-200 p-4 rounded-md bg-rose-50/50">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Fatura Atual (Março)</p>
                                <p className="text-2xl font-bold text-rose-600">R$ 2.450,00</p>
                                <div className="mt-2 h-1.5 w-full bg-rose-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500 w-[60%]"></div>
                                </div>
                                <p className="text-[10px] text-zinc-400 mt-1">Vence em 05/04</p>
                            </div>
                            <div className="border border-zinc-200 p-4 rounded-md bg-amber-50/50">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Próxima Fatura (Abril)</p>
                                <p className="text-2xl font-bold text-amber-600">R$ 850,00</p>
                            </div>
                            <div className="border border-zinc-200 p-4 rounded-md bg-emerald-50/50">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Disponível para Gastar</p>
                                <p className="text-2xl font-bold text-emerald-600">R$ 5.550,00</p>
                                <p className="text-[10px] text-zinc-400 mt-1">Considerando sua Receita Mensal de R$ 8.000</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-amber-800">
                            <strong>Limitações desta opção:</strong> Não suporta gerenciamento real de limite do cartão, múltiplos cartões, nem compras parceladas automáticas (você teria que lançar a despesa 12 vezes manualmente).
                        </div>
                    </div>
                )}

                {activeTab === 'b' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                            <h3 className="font-bold text-lg text-zinc-900">Menu Sidebar: Faturas (Opção B)</h3>
                            <button className="bg-zinc-900 text-white px-3 py-1.5 rounded text-xs font-medium">Novo Gasto no Cartão</button>
                        </div>

                        <p className="text-sm text-zinc-600">
                            <strong>Como funciona:</strong> Atualizamos o banco de dados do sistema para entender o conceito de `Cartão` e `Parcela`. Criamos uma página inteira dedicada a isso, separada da sua conta corrente.
                        </p>

                        {/* Mockup Opção B - Carrossel Funcional e Timeline */}
                        <div className="space-y-4">
                            {/* Timeline Horizontal */}
                            <div className="flex items-center space-x-2 text-sm overflow-x-auto pb-2">
                                <div className="flex-shrink-0 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md opacity-60">Fev: Paga</div>
                                <div className="text-zinc-300">→</div>
                                <div className="flex-shrink-0 px-4 py-2 bg-zinc-900 text-white rounded-md shadow-md relative">
                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-white"></div>
                                    Março: Aberta (R$ 2.450)
                                </div>
                                <div className="text-zinc-300">→</div>
                                <div className="flex-shrink-0 px-4 py-2 bg-zinc-50 border border-zinc-200 text-zinc-500 rounded-md">Abril: Próxima (R$ 850)</div>
                                <div className="text-zinc-300">→</div>
                                <div className="flex-shrink-0 px-4 py-2 bg-zinc-50 border border-zinc-200 text-zinc-500 rounded-md">Maio (R$ 250)</div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="border border-zinc-200 rounded-lg p-5">
                                    <h4 className="text-sm font-bold text-zinc-900 mb-4 tracking-tight">Evolução do Limite</h4>
                                    <div className="aspect-square w-40 mx-auto rounded-full border-[12px] border-zinc-100 flex items-center justify-center relative">
                                        {/* Fake Donut Chart */}
                                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                                            <circle cx="50%" cy="50%" r="42%" className="stroke-rose-500 fill-transparent stroke-[12px]" strokeDasharray="60 100"></circle>
                                        </svg>
                                        <div className="text-center absolute">
                                            <span className="text-xs text-zinc-500 uppercase">Usado</span>
                                            <p className="font-bold text-xl text-zinc-900">60%</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs mt-4 pt-4 border-t border-zinc-100">
                                        <span className="text-zinc-500">Limite Disp: <strong className="text-emerald-600">R$ 3.550</strong></span>
                                        <span className="text-zinc-500">Total: R$ 6.000</span>
                                    </div>
                                </div>

                                <div className="border border-zinc-200 rounded-lg p-0 overflow-hidden">
                                    <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200">
                                        <h4 className="text-sm font-bold text-zinc-900">Lançamentos da Fatura de Março</h4>
                                    </div>
                                    <div className="divide-y divide-zinc-100 text-sm">
                                        <div className="px-4 py-3 flex justify-between items-center hover:bg-zinc-50">
                                            <div>
                                                <p className="font-medium text-zinc-900">iPhone 14 Pro</p>
                                                <p className="text-[11px] text-zinc-500">Eletrônicos • Parcela 2/12</p>
                                            </div>
                                            <span className="font-medium">R$ 650,00</span>
                                        </div>
                                        <div className="px-4 py-3 flex justify-between items-center hover:bg-zinc-50">
                                            <div>
                                                <p className="font-medium text-zinc-900">Ifood (Pizza)</p>
                                                <p className="text-[11px] text-zinc-500">Alimentação • Única</p>
                                            </div>
                                            <span className="font-medium">R$ 85,00</span>
                                        </div>
                                        <div className="px-4 py-3 flex justify-between items-center hover:bg-zinc-50">
                                            <div>
                                                <p className="font-medium text-zinc-900">Seguro Auto</p>
                                                <p className="text-[11px] text-zinc-500">Transporte • Parcela 4/6</p>
                                            </div>
                                            <span className="font-medium">R$ 200,00</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded text-sm text-emerald-800">
                            <strong>Por que esta opção é melhor:</strong> Permite parcelamento real (lança a despesa `iPhone` em 12 vezes e a interface quebra mês a mês), separa o que sai da sua conta bancária (`Pix/Débito`) do que acumula no Cartão, e simula limite!
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
