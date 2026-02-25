'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

export function AIAdvisor() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    {
      role: 'model',
      text: 'Olá! Sou seu consultor financeiro IA. Como posso ajudar com seu planejamento hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: 'Você é um consultor financeiro especializado em finanças pessoais, investimentos e planejamento 360 graus. Seja prestativo, claro, objetivo e use formatação markdown para destacar pontos importantes. Responda em português do Brasil.',
        }
      });

      if (response.text) {
        setMessages((prev) => [...prev, { role: 'model', text: response.text || '' }]);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="bg-white rounded-2xl border border-zinc-100/80 shadow-sm flex flex-col h-[600px] overflow-hidden"
    >
      <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center space-x-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">IA Advisor</h2>
          <p className="text-sm text-indigo-200">Consultoria financeira inteligente</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={clsx(
                'flex space-x-3',
                msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              )}
            >
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-slate-700 to-slate-900'
                    : 'bg-gradient-to-br from-indigo-100 to-purple-100'
                )}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-indigo-600" />
                )}
              </div>
              <div
                className={clsx(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-tr-sm'
                    : 'bg-zinc-50 text-zinc-800 rounded-tl-sm border border-zinc-100'
                )}
              >
                {msg.role === 'model' ? (
                  <div className="prose prose-sm prose-zinc max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex space-x-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-sm text-zinc-500">Analisando...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-100 shrink-0">
        <form onSubmit={handleSubmit} className="relative gradient-border rounded-xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre seus investimentos..."
            className="w-full pl-4 pr-12 py-3 bg-zinc-50/80 border border-zinc-200/70 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-200 transition-all duration-300"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-indigo-600 disabled:opacity-40 disabled:hover:text-zinc-400 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
