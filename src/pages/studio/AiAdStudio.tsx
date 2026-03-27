import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Sparkles, Image as ImageIcon, Download, ShieldCheck } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { toast } from 'sonner';
import { SafetyScanner } from '../../components/SafetyScanner';

export default function AiAdStudio() {
  const { profile } = useAuthStore();
  const [prompt, setPrompt] = useState('');
  const [format, setFormat] = useState('backboard');
  const [loading, setLoading] = useState(false);
  const [isPromptSafe, setIsPromptSafe] = useState(true);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (!isPromptSafe) {
      toast.error('Please provide a safe and valid ad prompt.');
      return;
    }

    setLoading(true);
    setGeneratedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            AI Ad Studio
          </h1>
          <p className="text-zinc-400 mt-1">Generate high-converting physical and digital ad assets instantly.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-50">Create New Asset</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="space-y-2">
                  <Label>Ad Format</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={format === 'backboard' ? 'default' : 'outline'}
                      onClick={() => setFormat('backboard')}
                      className={format === 'backboard' ? 'bg-zinc-50 text-zinc-950' : 'bg-transparent border-zinc-800 text-zinc-400'}
                    >
                      Physical Backboard
                    </Button>
                    <Button
                      type="button"
                      variant={format === 'overlay' ? 'default' : 'outline'}
                      onClick={() => setFormat('overlay')}
                      className={format === 'overlay' ? 'bg-zinc-50 text-zinc-950' : 'bg-transparent border-zinc-800 text-zinc-400'}
                    >
                      Digital Overlay
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Brand & Offer Details</Label>
                  <Textarea 
                    placeholder="e.g., A bold neon sign for 'Acme Shoes' with a 20% off promo code 'LIVE20'..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 min-h-[120px]"
                    required
                  />
                  <SafetyScanner 
                    content={prompt} 
                    type="text" 
                    onScanComplete={setIsPromptSafe} 
                  />
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 font-bold" disabled={loading || !prompt.trim() || !isPromptSafe}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Generate Creative (5 Coins)
                    </span>
                  )}
                </Button>
                <p className="text-xs text-center text-zinc-500">
                  You have {profile?.coinBalance || 0} AI Coins remaining.
                </p>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 flex flex-col">
            <CardHeader>
              <CardTitle className="text-zinc-50">Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[300px] p-6">
              {loading ? (
                <div className="flex flex-col items-center gap-4 text-zinc-500">
                  <div className="w-12 h-12 border-4 border-zinc-800 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="text-sm animate-pulse">Designing your ad...</p>
                </div>
              ) : generatedImage ? (
                <div className="w-full space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
                    <img src={generatedImage} alt="Generated Ad" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <Button variant="outline" className="w-full border-zinc-800 bg-zinc-950 hover:bg-zinc-800">
                    <Download className="w-4 h-4 mr-2" /> Download High-Res
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-zinc-600">
                  <ImageIcon className="w-16 h-16 opacity-50" />
                  <p className="text-sm text-center max-w-[200px]">Your generated creative will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
