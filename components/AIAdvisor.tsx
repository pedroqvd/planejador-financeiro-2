'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Send, Loader2, Bot, User, Mic, Square, X, MessageSquare, Sparkles, Check, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

type PendingTransaction = {
  name: string;
  category: string;
  amount: number;
  type: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  pendingTransaction?: PendingTransaction | null;
  messageDbId?: string; // DB id for confirmation
};

export type AIAdvisorHandle = {
  sendFromChip: (msg: string) => void;
  openChat: () => void;
};

const QUICK_CHIPS = [
  'Como estão minhas finanças?',
  'Onde posso economizar?',
  'Resuma meus gastos da semana',
  'Sugestão de investimento',
];

export const AIAdvisor = forwardRef<AIAdvisorHandle, { initialMessage?: string }>(
  function AIAdvisor({ initialMessage }, ref) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Olá! Sou o **Cash**, seu consultor financeiro IA.\n\nPosso analisar suas finanças, registrar gastos por texto ou voz, e dar conselhos personalizados. Como posso ajudar?',
      },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showChips, setShowChips] = useState(true);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [streamingContent, setStreamingContent] = useState('');
    const [historyLoaded, setHistoryLoaded] = useState(false);

    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const processedChips = useRef<Set<string>>(new Set());

    // Load conversation history from DB on first open
    useEffect(() => {
      if (isOpen && !historyLoaded) {
        setHistoryLoaded(true);
        fetch('/api/ai/conversations')
          .then(res => res.json())
          .then(data => {
            if (data.conversation?.messages?.length > 0) {
              setConversationId(data.conversation.id);
              const dbMessages: Message[] = data.conversation.messages.map((m: any) => ({
                id: m.id,
                role: m.role as 'user' | 'assistant',
                content: m.content,
                messageDbId: m.id,
                pendingTransaction: m.metadata ? JSON.parse(m.metadata)?.pendingTransaction : null,
              }));
              setMessages(prev => [prev[0], ...dbMessages]); // Keep welcome + add history
              setShowChips(false);
            }
          })
          .catch(() => { /* ignore */ });
      }
    }, [isOpen, historyLoaded]);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen, streamingContent]);

    useEffect(() => {
      if (isRecording) {
        timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setRecordingTime(0);
      }
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isRecording]);

    const sendMessage = async (text?: string, audioBlob?: Blob) => {
      const msg = (text || input).trim();
      if ((!msg && !audioBlob) || loading) return;

      setShowChips(false);

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: audioBlob ? '🎤 Mensagem de voz' : msg,
      };

      setMessages(prev => [...prev, userMessage]);
      if (!audioBlob) setInput('');
      setLoading(true);
      setStreamingContent('');

      try {
        const formData = new FormData();
        if (msg) formData.append('message', msg);
        if (audioBlob) formData.append('audio', audioBlob, 'record.webm');
        if (conversationId) formData.append('conversationId', conversationId);

        const res = await fetch('/api/ai', { method: 'POST', body: formData });

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
          setMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: res.status === 429
                ? 'A IA está processando outras consultas. Tente novamente em alguns segundos.'
                : res.status === 403
                  ? (data.error || 'Você atingiu o limite diário. Faça **upgrade** para continuar!')
                  : 'Não consegui processar agora. Tente novamente.',
            },
          ]);
          setLoading(false);
          return;
        }

        // SSE streaming
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No reader');

        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';
        let finalData: any = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'chunk') {
                fullContent += data.content;
                setStreamingContent(fullContent);
              } else if (data.type === 'done') {
                finalData = data;
              } else if (data.type === 'error') {
                fullContent = data.error;
              }
            } catch { /* skip malformed */ }
          }
        }

        setStreamingContent('');

        // Find the last assistant message from DB to get its ID for confirmation
        let messageDbId: string | undefined;
        if (finalData?.conversationId) {
          setConversationId(finalData.conversationId);
          // Fetch the last message ID
          try {
            const convRes = await fetch('/api/ai/conversations');
            const convData = await convRes.json();
            if (convData.conversation?.messages?.length > 0) {
              const lastMsg = convData.conversation.messages[convData.conversation.messages.length - 1];
              if (lastMsg.role === 'assistant') {
                messageDbId = lastMsg.id;
              }
            }
          } catch { /* ignore */ }
        }

        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fullContent || 'Desculpe, não consegui processar.',
            pendingTransaction: finalData?.pendingTransaction || null,
            messageDbId,
          },
        ]);
      } catch {
        setStreamingContent('');
        setMessages(prev => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Erro de conexão. Verifique sua internet.' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    const confirmTransaction = useCallback(async (msgId: string, messageDbId?: string) => {
      if (!messageDbId) return;

      try {
        const res = await fetch('/api/ai/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId: messageDbId }),
        });
        const data = await res.json();

        if (res.ok) {
          toast.success(data.message || 'Transação registrada!');
          setMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, pendingTransaction: null, content: m.content + '\n\n✅ **Transação registrada com sucesso!**' } : m
          ));
          // Dispatch event to refresh dashboard
          window.dispatchEvent(new Event('sync-complete'));
        } else {
          toast.error(data.error || 'Erro ao confirmar');
        }
      } catch {
        toast.error('Erro de conexão');
      }
    }, []);

    const rejectTransaction = useCallback((msgId: string) => {
      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, pendingTransaction: null, content: m.content + '\n\n❌ Transação cancelada.' } : m
      ));
    }, []);

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
        toast.error('Permissão de microfone bloqueada pelo navegador.');
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

    const renderMessage = (content: string) => {
      return content.split('\n').map((line, i) => (
        <span key={i}>
          {line.split('**').map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
          {i < content.split('\n').length - 1 && <br />}
        </span>
      ));
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
              className="flex flex-col w-[360px] sm:w-[400px] h-[600px] mb-4 origin-bottom-right"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}
            >
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-9 h-9 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--accent-ink)', color: 'var(--bg-cream)' }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-editorial font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Cash — IA Advisor
                    </h3>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Consultor financeiro pessoal
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 transition-opacity opacity-40 hover:opacity-100"
                  style={{ color: 'var(--text-secondary)' }}
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
                      className={`flex items-start space-x-2.5 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                    >
                      <div
                        className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                        style={msg.role === 'assistant'
                          ? { border: '1px solid var(--border-color)', color: 'var(--accent-ink)' }
                          : { backgroundColor: 'var(--text-primary)', color: 'var(--bg-cream)' }
                        }
                      >
                        {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>
                      <div className="max-w-[80%]">
                        <div
                          className="px-3.5 py-2.5 text-sm leading-relaxed"
                          style={msg.role === 'assistant'
                            ? { backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }
                            : { backgroundColor: 'var(--text-primary)', color: 'var(--bg-cream)' }
                          }
                        >
                          {renderMessage(msg.content)}
                        </div>

                        {/* Transaction confirmation buttons */}
                        {msg.pendingTransaction && (
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => confirmTransaction(msg.id, msg.messageDbId)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80"
                              style={{ backgroundColor: 'var(--accent-ink)', color: 'var(--bg-cream)' }}
                            >
                              <Check className="w-3 h-3" /> Confirmar
                            </button>
                            <button
                              onClick={() => rejectTransaction(msg.id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80"
                              style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                            >
                              <XCircle className="w-3 h-3" /> Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Streaming content */}
                {streamingContent && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start space-x-2.5">
                    <div
                      className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                      style={{ border: '1px solid var(--border-color)', color: 'var(--accent-ink)' }}
                    >
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div
                      className="max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed"
                      style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                    >
                      {renderMessage(streamingContent)}
                    </div>
                  </motion.div>
                )}

                {/* Typing indicator */}
                {loading && !streamingContent && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start space-x-2.5">
                    <div
                      className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                      style={{ border: '1px solid var(--border-color)', color: 'var(--accent-ink)' }}
                    >
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div
                      className="px-4 py-3 flex items-center space-x-1.5"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-ink)', animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-ink)', animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-ink)', animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}

                {/* Quick Chips */}
                {showChips && !loading && messages.length <= 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-2 pt-2"
                  >
                    {QUICK_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => sendMessage(chip)}
                        className="text-[11px] font-medium px-3 py-1.5 transition-all hover:opacity-70"
                        style={{ border: '1px solid var(--border-color)', color: 'var(--accent-ink)', backgroundColor: 'transparent' }}
                      >
                        {chip}
                      </button>
                    ))}
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="flex items-center space-x-2"
                >
                  {isRecording ? (
                    <div
                      className="flex-1 flex items-center justify-between px-4 py-2.5 text-sm font-medium animate-pulse"
                      style={{ backgroundColor: '#f43f5e15', color: '#f43f5e', border: '1px solid #f43f5e30' }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f43f5e' }} />
                        <span>Gravando...</span>
                      </div>
                      <span className="font-mono text-xs">{formatTime(recordingTime)}</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Gastei 50 no Ifood..."
                      className="flex-1 px-4 py-2.5 text-sm focus:outline-none transition-all"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      maxLength={500}
                      disabled={loading}
                    />
                  )}

                  {!input.trim() && !isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={loading}
                      className="p-2.5 transition-all disabled:opacity-40"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  ) : isRecording ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="p-2.5 transition-all"
                      style={{ backgroundColor: '#f43f5e', color: 'white' }}
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="p-2.5 transition-all disabled:opacity-40"
                      style={{ backgroundColor: 'var(--accent-ink)', color: 'var(--bg-cream)' }}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all relative"
          style={{ backgroundColor: 'var(--accent-ink)', color: 'var(--bg-cream)' }}
        >
          {isOpen ? <X className="w-6 h-6" /> : (
            <>
              <MessageSquare className="w-6 h-6" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10b981', border: '2px solid var(--bg-card)' }} />
            </>
          )}
        </motion.button>
      </div>
    );
  }
);
