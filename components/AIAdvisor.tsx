'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function AIAdvisor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Olá! Sou o **Cash**, seu consultor financeiro IA. Posso analisar suas finanças e dar conselhos personalizados. Pergunte algo como:\n\n• "Como estão meus gastos este mês?"\n• "Dicas para economizar mais"\n• "Análise meu orçamento"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.ok
            ? data.reply
            : data.error || 'Erro ao consultar IA.',
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Erro de conexão. Tente novamente.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 flex flex-col h-[500px]">
      {/* Header */}
      <div className="bg-zinc-900 px-5 py-4 flex items-center space-x-3">
        <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-zinc-400" />
        </div>
        <div>
          <h3 className="text-white font-editorial font-bold text-sm">Cash — IA Advisor</h3>
          <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Consultoria financeira inteligente</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`w-7 h-7 flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant'
                ? 'border border-zinc-200 text-zinc-500'
                : 'bg-zinc-900 text-white'
                }`}>
                {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <div className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === 'assistant'
                ? 'bg-zinc-50 text-zinc-800 border border-zinc-100'
                : 'bg-zinc-900 text-white'
                }`}>
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>
                    {line.split('**').map((part, j) =>
                      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                    )}
                    {i < msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <div className="w-7 h-7 border border-zinc-200 text-zinc-500 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-zinc-50 border border-zinc-100 px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-zinc-200">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre suas finanças..."
            className="flex-1 px-4 py-2.5 bg-zinc-50 border-0 border-b border-zinc-200 rounded-none text-sm focus:outline-none focus:border-zinc-900 transition-all"
            maxLength={500}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-zinc-900 text-white hover:bg-zinc-800 transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
