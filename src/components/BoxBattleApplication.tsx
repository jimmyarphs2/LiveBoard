import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
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
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
        <CardContent className="p-12 text-center space-y-6 relative">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Application Received</h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              Our AI scouts are reviewing your profile. You'll receive a notification within 24 hours regarding your eligibility for the next sponsored Box Battle.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-zinc-700 hover:bg-zinc-800"
            onClick={() => setSubmitted(false)}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none group-hover:opacity-100 transition-opacity opacity-50" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Trophy className="w-7 h-7 text-amber-400" />
              Box Battle Sponsorship
            </CardTitle>
            <p className="text-zinc-400 text-sm">Apply for premium sponsored slots in high-stakes battles.</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Premium Feature</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-8">
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                step >= i ? 'bg-blue-500' : 'bg-zinc-800'
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
                  <Label className="text-zinc-400">TikTok Username</Label>
                  <Input 
                    value={formData.tiktokHandle}
                    onChange={(e) => setFormData({ ...formData, tiktokHandle: e.target.value })}
                    className="bg-zinc-950 border-zinc-800 h-12"
                    placeholder="@username"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">Current Followers</Label>
                  <Input 
                    type="number"
                    value={formData.followerCount}
                    onChange={(e) => setFormData({ ...formData, followerCount: Number(e.target.value) })}
                    className="bg-zinc-950 border-zinc-800 h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Battle Category</Label>
                <Select onValueChange={(val: string) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 h-12">
                    <SelectValue placeholder="Select battle type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="competition">High Competition</SelectItem>
                    <SelectItem value="entertainment">Entertainment / Fun</SelectItem>
                    <SelectItem value="educational">Educational / Quiz</SelectItem>
                    <SelectItem value="charity">Charity / Community</SelectItem>
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
                  <Label className="text-zinc-400">Gifting Level</Label>
                  <Select onValueChange={(val: string) => setFormData({ ...formData, giftingLevel: val })}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 h-12">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="low">Level 1-10</SelectItem>
                      <SelectItem value="medium">Level 11-30</SelectItem>
                      <SelectItem value="high">Level 31-50</SelectItem>
                      <SelectItem value="whale">Level 50+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">Avg Battle Coins (Last 30d)</Label>
                  <Input 
                    type="number"
                    value={formData.pastCoins}
                    onChange={(e) => setFormData({ ...formData, pastCoins: Number(e.target.value) })}
                    className="bg-zinc-950 border-zinc-800 h-12"
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Current League Level</Label>
                <Input 
                  value={formData.leagueLevel}
                  onChange={(e) => setFormData({ ...formData, leagueLevel: e.target.value })}
                  className="bg-zinc-950 border-zinc-800 h-12"
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
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                  <h4 className="font-bold text-white">Sponsorship Terms</h4>
                </div>
                <ul className="space-y-3">
                  <li className="text-sm text-zinc-400 flex gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                    Brand must be visible for the entire duration of the battle.
                  </li>
                  <li className="text-sm text-zinc-400 flex gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                    Minimum 3 shoutouts per hour are required.
                  </li>
                  <li className="text-sm text-zinc-400 flex gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                    Proof of battle performance must be uploaded within 24h.
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Expected Coin Target</Label>
                <Input 
                  type="number"
                  value={formData.expectedTarget}
                  onChange={(e) => setFormData({ ...formData, expectedTarget: Number(e.target.value) })}
                  className="bg-zinc-950 border-zinc-800 h-12"
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
              className="flex-1 border-zinc-800 h-12"
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          )}
          <Button 
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white h-12 font-bold group"
            onClick={() => step < 3 ? setStep(step + 1) : handleApply()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === 3 ? 'Submit Application' : 'Next Step'}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
