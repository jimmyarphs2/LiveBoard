import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { InfoTooltip } from '../../components/InfoTooltip';
import { PricingAssistant } from '../../components/PricingAssistant';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Globe, Users, Target, User } from 'lucide-react';

export default function CreatorOnboarding() {
  const { user, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [minFollowers, setMinFollowers] = useState(2000);
  
  const [formData, setFormData] = useState({
    tiktokHandle: '',
    username: '',
    followerCount: '',
    niche: '',
    country: '',
    avgViewers: '',
    bio: ''
  });

  const [pricing, setPricing] = useState({
    backboard: 50,
    overlay: 30,
    pin_comment: 15,
    shoutout: 100
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configSnap = await getDoc(doc(db, 'config', 'global'));
        if (configSnap.exists()) {
          setMinFollowers(configSnap.data().minFollowers || 2000);
        }
      } catch (e) {
        console.error("Config fetch error:", e);
      }
    };
    fetchConfig();
  }, []);

  const handleNext = async () => {
    if (step === 1) {
      const username = formData.username || formData.tiktokHandle.replace('@', '').toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (!username) {
        toast.error('Please enter a TikTok handle or username');
        return;
      }

      setLoading(true);
      try {
        const q = query(collection(db, 'creators'), where('username', '==', username));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          toast.error('This username is already taken. Please choose another one.');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setLoading(false);
      }
    }
    setStep(prev => prev + 1);
  };
  const handleBack = () => setStep(prev => prev - 1);

  const getTier = (followers: number) => {
    if (followers >= 100000) return 'elite';
    if (followers >= 50000) return 'premium';
    if (followers >= 10000) return 'growth';
    return 'starter';
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    const followers = parseInt(formData.followerCount);
    const isEligible = followers >= minFollowers;
    const growthStage = isEligible ? 'active' : 'growth_mode';
    const tier = getTier(followers);

    try {
      const creatorData = {
        userId: user.uid,
        tiktokHandle: formData.tiktokHandle,
        username: formData.username || formData.tiktokHandle.replace('@', '').toLowerCase().replace(/[^a-z0-9_]/g, ''),
        followerCount: followers,
        avgViewers: parseInt(formData.avgViewers) || 0,
        niche: formData.niche,
        country: formData.country,
        bio: formData.bio,
        isEligible,
        growthStage,
        tier,
        adTypes: ['backboard', 'overlay', 'pin_comment', 'shoutout'],
        pricing,
        trustScore: 100,
        discoverySignals: {
          responseTime: 0,
          successRate: 0,
          repeatBookings: 0,
          lastActive: new Date(),
          views: 0
        }
      };

      await setDoc(doc(db, 'creators', user.uid), creatorData);
      await updateDoc(doc(db, 'users', user.uid), { status: 'active' });
      
      setProfile({ ...creatorData, role: 'creator', status: 'active' });
      
      if (isEligible) {
        toast.success(`Welcome to Boardly! You are in the ${tier.toUpperCase()} tier.`);
        navigate('/dashboard/creator');
      } else {
        toast.info(`Welcome to Growth Mode! Reach ${minFollowers} followers to unlock the marketplace.`);
        navigate('/growth-coach');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-6 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Elements - Matching Landing Page */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.15),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_120%,rgba(139,92,246,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Animated Glows */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 -left-64 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full ${step === 3 ? 'max-w-5xl' : 'max-w-2xl'} relative z-10`}
      >
        <div className="bg-[#0f172a]/40 border border-white/10 backdrop-blur-3xl rounded-[3rem] p-12 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="mb-12">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <Sparkles className="text-primary w-7 h-7 glow-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tighter font-heading">
                    {step === 3 ? 'SMART PRICING' : 'CREATOR PROFILE'}
                  </h1>
                  <p className="text-white/40 text-lg font-medium tracking-tight">
                    {step === 3 ? 'Set your rates with AI-powered suggestions.' : "Let's set up your monetization space."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={`h-2 w-10 rounded-full transition-all duration-700 ${
                      step === s ? 'bg-primary w-16 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : step > s ? 'bg-primary/40' : 'bg-white/10'
                    }`} 
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 ml-1">
                      <Label htmlFor="tiktokHandle" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">TikTok Handle</Label>
                      <InfoTooltip 
                        content="Your public TikTok username starting with @" 
                        example="@creator_name"
                        whyItMatters="This is how advertisers will find and verify your profile."
                      />
                    </div>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="tiktokHandle" 
                        placeholder="@username" 
                        value={formData.tiktokHandle}
                        onChange={(e) => setFormData({...formData, tiktokHandle: e.target.value})}
                        required
                        className="bg-white/5 border-white/10 text-white pl-14 h-16 rounded-2xl focus:ring-primary/30 focus:border-primary/50 transition-all text-lg font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 ml-1">
                      <Label htmlFor="followerCount" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Follower Count</Label>
                      <InfoTooltip 
                        content="Your current total follower count on TikTok." 
                        example="15,400"
                        whyItMatters={`Reach ${minFollowers} followers to unlock the marketplace and start earning Cash.`}
                      />
                    </div>
                    <div className="relative group">
                      <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="followerCount" 
                        type="number"
                        placeholder="e.g. 15000" 
                        value={formData.followerCount}
                        onChange={(e) => setFormData({...formData, followerCount: e.target.value})}
                        required
                        className="bg-white/5 border-white/10 text-white pl-14 h-16 rounded-2xl focus:ring-primary/30 focus:border-primary/50 transition-all text-lg font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-4 px-1 pt-2">
                      <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((parseInt(formData.followerCount) || 0) / minFollowers * 100, 100)}%` }}
                          className="h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        />
                      </div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                        {minFollowers.toLocaleString()} REQUIRED
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 ml-1">
                      <Label htmlFor="niche" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Content Niche</Label>
                      <InfoTooltip 
                        content="The primary category of your content." 
                        example="Gaming / Lifestyle"
                        whyItMatters="Advertisers look for creators whose audience matches their brand niche."
                      />
                    </div>
                    <div className="relative group">
                      <Target className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors z-10" />
                      <Select value={formData.niche} onValueChange={(v) => setFormData({...formData, niche: v})}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white pl-14 h-16 rounded-2xl focus:ring-primary/30 focus:border-primary/50 transition-all text-lg font-medium">
                          <SelectValue placeholder="Select your primary niche" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl">
                          <SelectItem value="gaming">Gaming</SelectItem>
                          <SelectItem value="lifestyle">Lifestyle & Vlogs</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="music">Music & DJ</SelectItem>
                          <SelectItem value="fitness">Fitness</SelectItem>
                          <SelectItem value="beauty">Beauty & Fashion</SelectItem>
                          <SelectItem value="tech">Tech & Gadgets</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 ml-1">
                      <Label htmlFor="username" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Boardly Username</Label>
                      <InfoTooltip 
                        content="Your unique Boardly profile URL." 
                        example="boardly.com/c/yourname"
                        whyItMatters="This is your permanent shareable link for advertisers."
                      />
                    </div>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 text-sm font-black uppercase tracking-widest">boardly.com/c/</span>
                      <Input 
                        id="username" 
                        placeholder="username" 
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                        required
                        className="bg-white/5 border-white/10 text-white pl-[145px] h-16 rounded-2xl focus:ring-primary/30 focus:border-primary/50 transition-all text-lg font-medium"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleNext} 
                    className="w-full mt-10 bg-primary hover:bg-primary/90 h-20 rounded-2xl font-black text-xl uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    Continue
                    <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 ml-1">
                      <Label htmlFor="avgViewers" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Average Live Viewers</Label>
                      <InfoTooltip 
                        content="The typical number of concurrent viewers during your live sessions." 
                        example="450"
                        whyItMatters="This helps advertisers estimate the reach of their ad placement."
                      />
                    </div>
                    <div className="relative group">
                      <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="avgViewers" 
                        type="number"
                        placeholder="e.g. 500" 
                        value={formData.avgViewers}
                        onChange={(e) => setFormData({...formData, avgViewers: e.target.value})}
                        required
                        className="bg-white/5 border-white/10 text-white pl-14 h-16 rounded-2xl focus:ring-primary/30 focus:border-primary/50 transition-all text-lg font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 ml-1">
                      <Label htmlFor="country" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Country</Label>
                      <InfoTooltip 
                        content="Your primary location or audience base." 
                        example="United Kingdom"
                        whyItMatters="Advertisers often target specific geographic regions."
                      />
                    </div>
                    <div className="relative group">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="country" 
                        placeholder="e.g. United States" 
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        required
                        className="bg-white/5 border-white/10 text-white pl-14 h-16 rounded-2xl focus:ring-primary/30 focus:border-primary/50 transition-all text-lg font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 ml-1">
                      <Label htmlFor="bio" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Creator Bio</Label>
                      <InfoTooltip 
                        content="A short pitch about your channel and audience." 
                        example="I stream daily high-energy gaming sessions with a focus on RPGs."
                        whyItMatters="This is your first impression for advertisers. Make it count!"
                      />
                    </div>
                    <Textarea 
                      id="bio" 
                      placeholder="Tell advertisers about your audience and vibe..." 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="bg-white/5 border-white/10 text-white min-h-[160px] rounded-2xl focus:ring-primary/30 focus:border-primary/50 transition-all resize-none p-6 text-lg font-medium"
                    />
                  </div>
                  <div className="flex gap-6 mt-10">
                    <Button 
                      variant="outline" 
                      onClick={handleBack} 
                      className="flex-1 h-20 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-sm transition-all"
                    >
                      <ArrowLeft className="w-5 h-5 mr-3" />
                      Back
                    </Button>
                    <Button 
                      onClick={handleNext} 
                      className="flex-[2] h-20 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xl uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      Continue to Pricing
                      <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-2xl shadow-inner">
                    <PricingAssistant 
                      stats={{
                        followerCount: parseInt(formData.followerCount),
                        avgViewers: parseInt(formData.avgViewers),
                        niche: formData.niche,
                        country: formData.country,
                        adType: 'backboard'
                      }}
                      onPriceSelect={(price) => setPricing(prev => ({ ...prev, backboard: price }))}
                    />
                  </div>
                  
                  <div className="flex gap-6 mt-12">
                    <Button 
                      variant="outline" 
                      onClick={handleBack} 
                      className="flex-1 h-20 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-sm transition-all"
                    >
                      <ArrowLeft className="w-5 h-5 mr-3" />
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      className="flex-[2] h-20 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xl uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] group relative overflow-hidden" 
                      disabled={loading}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <>
                          Complete Profile
                          <CheckCircle2 className="w-6 h-6 ml-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
