import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Sparkles, Image as ImageIcon, Download, ShieldCheck, Key } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { toast } from 'sonner';
import { SafetyScanner } from '../../components/SafetyScanner';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function AiAdStudio() {
  const { profile } = useAuthStore();
  const [prompt, setPrompt] = useState('');
  const [format, setFormat] = useState('backboard');
  const [loading, setLoading] = useState(false);
  const [isPromptSafe, setIsPromptSafe] = useState(true);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback for local dev or if aistudio is not available
        setHasKey(!!process.env.GEMINI_API_KEY);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (!isPromptSafe) {
      toast.error('Please provide a safe and valid ad prompt.');
      return;
    }

    if (!hasKey) {
      toast.error('Please select an API key first.');
      return;
    }

    setLoading(true);
    setGeneratedImage(null);

    try {
      // Create a new instance right before making the call to ensure it uses the latest key
      const apiKey = (process.env.API_KEY || process.env.GEMINI_API_KEY) as string;
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [
            { text: `A professional, high-quality ad design for a live stream ${format}. It should be clean, readable from a distance, and feature: ${prompt}` }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: format === 'backboard' ? '16:9' : '1:1',
            imageSize: '1K'
          }
        }
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        toast.error('Failed to generate image. Please try a different prompt.');
      } else {
        toast.success('Ad creative generated successfully!');
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      toast.error(error.message || 'Error generating creative.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            AI Ad Studio
          </h1>
          <p className="text-zinc-400 mt-0.5 text-xs">Generate high-converting physical and digital ad assets instantly.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-zinc-900 border-zinc-800 rounded-xl">
            <CardHeader className="p-4">
              <CardTitle className="text-zinc-50 text-base">Create New Asset</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Ad Format</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={format === 'backboard' ? 'default' : 'outline'}
                      onClick={() => setFormat('backboard')}
                      className={`h-9 text-xs ${format === 'backboard' ? 'bg-zinc-50 text-zinc-950' : 'bg-transparent border-zinc-800 text-zinc-400'}`}
                    >
                      Physical Backboard
                    </Button>
                    <Button
                      type="button"
                      variant={format === 'overlay' ? 'default' : 'outline'}
                      onClick={() => setFormat('overlay')}
                      className={`h-9 text-xs ${format === 'overlay' ? 'bg-zinc-50 text-zinc-950' : 'bg-transparent border-zinc-800 text-zinc-400'}`}
                    >
                      Digital Overlay
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Brand & Offer Details</Label>
                  <Textarea 
                    placeholder="e.g., A bold neon sign for 'Acme Shoes' with a 20% off promo code 'LIVE20'..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 min-h-[100px] text-xs"
                    required
                  />
                  <SafetyScanner 
                    content={prompt} 
                    type="text" 
                    onScanComplete={setIsPromptSafe} 
                  />
                </div>

                {!hasKey && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                    <div className="flex items-start gap-3">
                      <Key className="w-4 h-4 text-amber-400 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">API Key Required</p>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                          To generate high-quality ad creatives, you must select a paid Gemini API key. 
                          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline ml-1">
                            Learn about billing
                          </a>
                        </p>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleSelectKey}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 h-9 font-bold text-xs rounded-lg"
                    >
                      Select API Key
                    </Button>
                  </div>
                )}

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white h-10 font-bold text-xs" disabled={loading || !prompt.trim() || !isPromptSafe || !hasKey}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Generate Creative (5 Coins)
                    </span>
                  )}
                </Button>
                <p className="text-[10px] text-center text-zinc-500">
                  You have {profile?.coinBalance || 0} AI Coins remaining.
                </p>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 flex flex-col rounded-xl">
            <CardHeader className="p-4">
              <CardTitle className="text-zinc-50 text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[200px] p-4 pt-0">
              {loading ? (
                <div className="flex flex-col items-center gap-3 text-zinc-500">
                  <div className="w-8 h-8 border-3 border-zinc-800 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="text-xs animate-pulse">Designing your ad...</p>
                </div>
              ) : generatedImage ? (
                <div className="w-full space-y-3">
                  <div className="relative rounded-lg overflow-hidden border border-zinc-800 shadow-2xl">
                    <img src={generatedImage} alt="Generated Ad" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <Button variant="outline" className="w-full border-zinc-800 bg-zinc-950 hover:bg-zinc-800 h-9 text-xs">
                    <Download className="w-3.5 h-3.5 mr-2" /> Download High-Res
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-zinc-600">
                  <ImageIcon className="w-10 h-10 opacity-50" />
                  <p className="text-xs text-center max-w-[150px]">Your generated creative will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
