import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Sparkles, Send, Bot } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function AiCoach() {
  const { profile } = useAuthStore();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${profile?.tiktokHandle || 'there'}! I'm your AI Growth Coach. I see you're currently at ${(profile?.followerCount / 1000).toFixed(1)}k followers. Let's build a strategy to hit 10k so you can unlock the main Boardly marketplace.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an expert TikTok growth coach helping a creator reach 10,000 followers. 
        Creator niche: ${profile?.niche || 'unknown'}. 
        Current followers: ${profile?.followerCount || 0}.
        User message: ${userMsg}
        Provide actionable, specific, and encouraging advice. Keep it concise.`,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || 'I encountered an error.' }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-400" />
            AI Growth Coach
          </h1>
          <p className="text-zinc-400 mt-1">Your personalized roadmap to 10k followers.</p>
        </div>

        <Card className="flex-1 bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
          <CardContent className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0 border border-blue-800">
                    <Bot className="w-4 h-4 text-blue-400" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user' 
                    ? 'bg-zinc-50 text-zinc-950 rounded-tr-sm' 
                    : 'bg-zinc-800 text-zinc-100 rounded-tl-sm border border-zinc-700'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center shrink-0 border border-blue-800">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div className="bg-zinc-800 rounded-2xl rounded-tl-sm p-4 border border-zinc-700 flex items-center gap-1">
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </CardContent>
          <div className="p-4 bg-zinc-950 border-t border-zinc-800">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for content ideas, hook strategies, or schedule tips..."
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-xs text-center text-zinc-500 mt-3">
              Uses 1 AI Coin per message. You have {profile?.coinBalance || 0} coins remaining.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
