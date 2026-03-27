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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-[350px] sm:w-[420px] origin-bottom-right"
          >
            <Card className="glass-glow border-white/10 shadow-2xl overflow-hidden flex flex-col h-[550px] rounded-[2rem]">
              <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Boardly AI Assistant</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Online & Ready</p>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-xl hover:bg-white/5 text-muted-foreground">
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </div>

              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
              >
                {messages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none glow-primary' 
                        : 'bg-white/5 text-zinc-200 border border-white/5 rounded-tl-none backdrop-blur-md'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/5 bg-white/5">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-3"
                >
                  <div className="relative flex-1 group">
                    <Input 
                      placeholder="Type your message..." 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="bg-white/5 border-white/5 rounded-2xl py-6 pl-4 pr-12 focus:border-primary/50 focus:bg-white/10 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-muted-foreground/30" />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={isLoading} 
                    className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/20 shrink-0 transition-all active:scale-95"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`h-16 w-16 rounded-[1.5rem] shadow-2xl transition-all duration-500 flex items-center justify-center relative group overflow-hidden ${
          isOpen ? 'bg-white/10 rotate-90' : 'bg-primary glow-primary'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X className="h-7 w-7 text-white" /> : <Sparkles className="h-7 w-7 text-white" />}
        
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full border-2 border-background animate-bounce" />
        )}
      </motion.button>
    </div>
  );
}
