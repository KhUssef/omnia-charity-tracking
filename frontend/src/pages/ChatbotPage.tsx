import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Bonjour ! Je suis l'assistant virtuel d'Omnia. Je peux vous répondre sur la traçabilité des dons, les familles accompagnées, comment faire un don, ou comment devenir bénévole. Que souhaitez-vous savoir ?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const res = await api.sendChatMessage(userMsg, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6 text-center">
        <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">Intelligence artificielle</span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold text-stone-900">Assistant Omnia</h1>
        <p className="mt-2 text-stone-500 text-sm">Posez vos questions sur l'association, les dons et l'impact.</p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl bg-white border border-stone-100 p-4 space-y-4 shadow-sm">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-brand-600 text-white' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-brand-600 text-white rounded-br-md'
                : 'bg-stone-50 text-stone-700 rounded-bl-md border border-stone-100'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-stone-50 rounded-2xl rounded-bl-md px-4 py-2.5 border border-stone-100">
              <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Écrivez votre message..."
          className="flex-1 rounded-xl bg-white px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-shadow"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="rounded-xl bg-brand-700 text-white px-4 py-3 hover:bg-brand-800 disabled:opacity-50 transition-colors shadow-lg shadow-brand-700/10"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
