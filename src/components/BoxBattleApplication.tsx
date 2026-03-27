import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Trophy, 
  Zap, 
  Target, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/geminiService';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

export function BoxBattleApplication() {
  const { user, profile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    tiktokHandle: profile?.tiktokHandle || '',
    followerCount: profile?.followerCount || 0,
    giftingLevel: '',
    pastCoins: 0,
    leagueLevel: '',
    category: '',
    availability: '',
    expectedTarget: 0,
  });

  const handleApply = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // AI Evaluation
      const evaluation = await geminiService.evaluateBoxBattle(formData) as any;
      
      // Save to Firestore
      await addDoc(collection(db, 'box_battle_apps'), {
        ...formData,
        userId: user.uid,
        status: 'pending',
        aiScore: Number(evaluation?.score) || 0,
        aiFeedback: String(evaluation?.feedback) || '',
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="bg-[#0f172a]/40 border-white/10 rounded-3xl overflow-hidden relative backdrop-blur-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />
        <CardContent className="p-10 text-center space-y-6 relative">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black font-heading tracking-tighter text-white">Application Received</h2>
            <p className="text-white/40 text-base font-medium max-w-md mx-auto leading-relaxed">
              Our AI scouts are reviewing your profile. You'll receive a notification within 24 hours regarding your eligibility.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-full px-8 h-10 border-white/10 bg-white/5 text-white hover:bg-white/10 font-black text-[9px] uppercase tracking-[0.3em] transition-all"
            onClick={() => setSubmitted(false)}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0f172a]/40 border-white/10 rounded-3xl overflow-hidden relative group backdrop-blur-3xl shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none group-hover:opacity-100 transition-opacity opacity-50" />
      
      <CardHeader className="p-6 pb-3 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black font-heading flex items-center gap-3 tracking-tighter text-white">
              <Trophy className="w-7 h-7 text-amber-400 glow-amber" />
              Box Battle Sponsorship
            </CardTitle>
            <p className="text-white/40 font-black text-[9px] uppercase tracking-[0.3em]">Apply for premium sponsored slots in high-stakes battles</p>
          </div>
          <Badge className="rounded-full bg-amber-500/10 text-amber-400 border-amber-500/20 px-4 py-1 font-black text-[9px] uppercase tracking-[0.3em] glow-amber">
            <Sparkles className="w-3 h-3 mr-1.5 animate-pulse" />
            Premium Feature
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0 relative space-y-8">
        <div className="flex items-center gap-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
                step >= i ? 'bg-primary glow-primary' : 'bg-white/5'
              }`} 
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">TikTok Username</Label>
                  <Input 
                    value={formData.tiktokHandle}
                    onChange={(e) => setFormData({ ...formData, tiktokHandle: e.target.value })}
                    className="bg-white/5 border-white/10 h-10 rounded-xl px-4 text-sm font-black tracking-tighter focus-visible:ring-primary/50"
                    placeholder="@username"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Current Followers</Label>
                  <Input 
                    type="number"
                    value={formData.followerCount}
                    onChange={(e) => setFormData({ ...formData, followerCount: Number(e.target.value) })}
                    className="bg-white/5 border-white/10 h-10 rounded-xl px-4 text-sm font-black tracking-tighter focus-visible:ring-primary/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Battle Category</Label>
                <Select onValueChange={(val: string) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-10 rounded-xl px-4 text-sm font-black tracking-tighter focus:ring-primary/50">
                    <SelectValue placeholder="Select battle type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-white/10 rounded-xl">
                    <SelectItem value="competition" className="py-2.5 font-black tracking-tighter text-sm">High Competition</SelectItem>
                    <SelectItem value="entertainment" className="py-2.5 font-black tracking-tighter text-sm">Entertainment / Fun</SelectItem>
                    <SelectItem value="educational" className="py-2.5 font-black tracking-tighter text-sm">Educational / Quiz</SelectItem>
                    <SelectItem value="charity" className="py-2.5 font-black tracking-tighter text-sm">Charity / Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Gifting Level</Label>
                  <Select onValueChange={(val: string) => setFormData({ ...formData, giftingLevel: val })}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-10 rounded-xl px-4 text-sm font-black tracking-tighter focus:ring-primary/50">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f172a] border-white/10 rounded-xl">
                      <SelectItem value="low" className="py-2.5 font-black tracking-tighter text-sm">Level 1-10</SelectItem>
                      <SelectItem value="medium" className="py-2.5 font-black tracking-tighter text-sm">Level 11-30</SelectItem>
                      <SelectItem value="high" className="py-2.5 font-black tracking-tighter text-sm">Level 31-50</SelectItem>
                      <SelectItem value="whale" className="py-2.5 font-black tracking-tighter text-sm">Level 50+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Avg Battle Coins (Last 30d)</Label>
                  <Input 
                    type="number"
                    value={formData.pastCoins}
                    onChange={(e) => setFormData({ ...formData, pastCoins: Number(e.target.value) })}
                    className="bg-white/5 border-white/10 h-10 rounded-xl px-4 text-sm font-black tracking-tighter focus-visible:ring-primary/50"
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Current League Level</Label>
                <Input 
                  value={formData.leagueLevel}
                  onChange={(e) => setFormData({ ...formData, leagueLevel: e.target.value })}
                  className="bg-white/5 border-white/10 h-10 rounded-xl px-4 text-sm font-black tracking-tighter focus-visible:ring-primary/50"
                  placeholder="e.g. Gold III"
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 space-y-4 shadow-inner">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-primary glow-primary" />
                  <h4 className="text-lg font-black font-heading tracking-tighter text-white">Sponsorship Terms</h4>
                </div>
                <ul className="space-y-3">
                  <li className="text-[13px] text-white/60 flex gap-3 group">
                    <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-medium leading-relaxed">Brand must be visible for the entire duration of the battle.</span>
                  </li>
                  <li className="text-[13px] text-white/60 flex gap-3 group">
                    <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-medium leading-relaxed">Minimum 3 shoutouts per hour are required.</span>
                  </li>
                  <li className="text-[13px] text-white/60 flex gap-3 group">
                    <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-medium leading-relaxed">Proof of battle performance must be uploaded within 24h.</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Expected Coin Target</Label>
                <Input 
                  type="number"
                  value={formData.expectedTarget}
                  onChange={(e) => setFormData({ ...formData, expectedTarget: Number(e.target.value) })}
                  className="bg-white/5 border-white/10 h-10 rounded-xl px-4 text-sm font-black tracking-tighter focus-visible:ring-primary/50"
                  placeholder="e.g. 100000"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4 pt-4">
          {step > 1 && (
            <Button 
              variant="outline" 
              className="flex-1 rounded-full h-10 border-white/10 bg-white/5 text-white hover:bg-white/10 font-black text-[9px] uppercase tracking-[0.3em] transition-all"
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          )}
          <Button 
            className="flex-[2] rounded-full h-10 bg-primary text-white hover:bg-primary/90 shadow-[0_0_50px_rgba(59,130,246,0.2)] font-black text-[9px] uppercase tracking-[0.3em] relative overflow-hidden group/btn"
            onClick={() => step < 3 ? setStep(step + 1) : handleApply()}
            disabled={loading}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === 3 ? 'Submit Application' : 'Next Step'}
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1.5 transition-transform duration-500" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
