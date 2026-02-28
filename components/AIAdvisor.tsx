'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Sparkles, Send, Loader2, Bot, User, Mic, Square, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type AIAdvisorHandle = {
  sendFromChip: (msg: string) => void;
  openChat: () => void;
};

export const AIAdvisor = forwardRef<AIAdvisorHandle, { initialMessage?: string }>(
  function AIAdvisor({ initialMessage }, ref) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Olá! Sou o **Cash**, seu consultor financeiro IA. Posso registrar seus gastos se você falar o valor e a categoria, ou apenas analisar suas finanças. Pergunte algo ou me envie um áudio!',
      },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const processedChips = useRef<Set<string>>(new Set());

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    useEffect(() => {
      if (isRecording) {
        timerRef.current = window.setInterval(() => setRecordingTime(t => t + 1), 1000) as any;
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setRecordingTime(0);
      }
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isRecording]);

    const sendMessage = async (text?: string, audioBlob?: Blob) => {
      const msg = (text || input).trim();
      if ((!msg && !audioBlob) || loading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: audioBlob ? '🎤 Mensagem de voz' : msg,
      };

      setMessages(prev => [...prev, userMessage]);
      if (!audioBlob) setInput('');
      setLoading(true);

      try {
        const formData = new FormData();
        if (msg) formData.append('message', msg);
        if (audioBlob) formData.append('audio', audioBlob, 'record.webm');

        const res = await fetch('/api/ai', {
          method: 'POST',
          body: formData,
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

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach(track => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          sendMessage('', audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone', err);
        alert('Permissão de microfone negada ou indisponível.');
      }
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    };

    useImperativeHandle(ref, () => ({
      sendFromChip: (msg: string) => {
        setIsOpen(true);
        sendMessage(msg);
      },
      openChat: () => setIsOpen(true),
    }));

    useEffect(() => {
      if (initialMessage && !processedChips.current.has(initialMessage)) {
        processedChips.current.add(initialMessage);
        setIsOpen(true);
        sendMessage(initialMessage);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialMessage]);

    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-zinc-200 shadow-2xl flex flex-col w-[340px] sm:w-[380px] h-[580px] mb-4 origin-bottom-right"
            >
              {/* Header */}
              <div className="bg-zinc-900 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-editorial font-bold text-sm">Cash — IA Advisor</h3>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Consultor financeiro</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
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
                        ? 'border border-zinc-200 text-zinc-500 rounded-full'
                        : 'bg-zinc-900 text-white rounded-full'
                        }`}>
                        {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>
                      <div className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === 'assistant'
                        ? 'bg-zinc-50 text-zinc-800 border border-zinc-100 rounded-lg rounded-tl-none'
                        : 'bg-zinc-900 text-white rounded-lg rounded-tr-none'
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-2">
                    <div className="w-7 h-7 border border-zinc-200 text-zinc-500 flex items-center justify-center rounded-full">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-lg rounded-tl-none">
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-zinc-200 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="flex items-center space-x-2"
                >
                  {isRecording ? (
                    <div className="flex-1 flex items-center justify-between px-4 py-2.5 bg-red-50 text-red-600 text-sm font-medium animate-pulse border border-red-200 rounded-full">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-600" />
                        <span>Gravando...</span>
                      </div>
                      <span>{formatTime(recordingTime)}</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Gastei 50 no Ifood..."
                      className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-full text-sm focus:outline-none focus:border-zinc-500 transition-all"
                      maxLength={500}
                      disabled={loading}
                    />
                  )}

                  {!input.trim() && !isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={loading}
                      className="p-3 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-all rounded-full disabled:opacity-40"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  ) : isRecording ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="p-3 bg-red-600 text-white hover:bg-red-700 transition-all rounded-full"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="p-3 bg-zinc-900 text-white hover:bg-zinc-800 transition-all rounded-full disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all border border-zinc-800 relative group"
        >
          {isOpen ? <X className="w-6 h-6" /> : (
            <>
              <MessageSquare className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
            </>
          )}
        </motion.button>
      </div>
    );
  }
);
