import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, MessageSquare, ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useAuthStore } from '../store/useAuthStore';
import { GoogleGenAI } from "@google/genai";

export function GlobalAiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hi! I'm your Boardly Guide. How can I help you monetize or grow today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { role, profile } = useAuthStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: `You are the Boardly Global Assistant. 
            User Role: ${role || 'Guest'}
            User Profile: ${JSON.stringify(profile || {})}
            
            Context: Boardly is a marketplace connecting TikTok creators with advertisers for "Backboard Ad Space".
            Creators sell space behind them in lives. Advertisers buy it.
            We have a dual wallet (Cash & AI Coins).
            Sub-2k creators go to Growth Coach.
            2k+ are eligible for Marketplace.
            
            User Question: ${userMsg}` }]
          }
        ],
        config: {
          systemInstruction: "Be professional, concise, and helpful. Guide users through the platform features. If they are confused about a form, explain the fields. If they want to earn more, suggest optimizing their profile or ad types."
        }
      });

      const response = await model;
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting right now. Try again in a moment!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] sm:w-[400px]"
          >
            <Card className="bg-zinc-950 border-zinc-800 shadow-2xl overflow-hidden flex flex-col h-[500px]">
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">Boardly AI Guide</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Always Active</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800"
              >
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl rounded-tl-none animate-pulse">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <Input 
                    placeholder="Ask anything..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-indigo-500"
                  />
                  <Button type="submit" size="icon" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-xl transition-all duration-300 ${
          isOpen ? 'bg-zinc-800 rotate-90' : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-110'
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>
    </div>
  );
}
