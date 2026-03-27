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
    <div className="min-h-screen bg-zinc-950 p-6 flex items-center justify-center">
      <div className={`w-full ${step === 3 ? 'max-w-4xl' : 'max-w-xl'} bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl transition-all duration-500`}>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-zinc-50">
              {step === 3 ? 'Smart Pricing' : 'Creator Profile'}
            </h1>
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 w-8 rounded-full transition-colors ${step >= s ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
              ))}
            </div>
          </div>
          <p className="text-zinc-400">
            {step === 3 ? 'Set your rates with AI-powered suggestions.' : "Let's set up your monetization space."}
          </p>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="tiktokHandle">TikTok Handle</Label>
                    <InfoTooltip 
                      content="Your public TikTok username starting with @" 
                      example="@creator_name"
                      whyItMatters="This is how advertisers will find and verify your profile."
                    />
                  </div>
                  <Input 
                    id="tiktokHandle" 
                    placeholder="@username" 
                    value={formData.tiktokHandle}
                    onChange={(e) => setFormData({...formData, tiktokHandle: e.target.value})}
                    required
                    className="bg-zinc-950 border-zinc-800 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="followerCount">Follower Count</Label>
                    <InfoTooltip 
                      content="Your current total follower count on TikTok." 
                      example="15,400"
                      whyItMatters={`Reach ${minFollowers} followers to unlock the marketplace and start earning Cash.`}
                    />
                  </div>
                  <Input 
                    id="followerCount" 
                    type="number"
                    placeholder="e.g. 15000" 
                    value={formData.followerCount}
                    onChange={(e) => setFormData({...formData, followerCount: e.target.value})}
                    required
                    className="bg-zinc-950 border-zinc-800 h-12"
                  />
                  <p className="text-xs text-zinc-500">Threshold: {minFollowers.toLocaleString()} followers for marketplace access.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="niche">Content Niche</Label>
                    <InfoTooltip 
                      content="The primary category of your content." 
                      example="Gaming / Lifestyle"
                      whyItMatters="Advertisers look for creators whose audience matches their brand niche."
                    />
                  </div>
                  <Select value={formData.niche} onValueChange={(v) => setFormData({...formData, niche: v})}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 h-12">
                      <SelectValue placeholder="Select your primary niche" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="username">Boardly Username</Label>
                    <InfoTooltip 
                      content="Your unique Boardly profile URL." 
                      example="boardly.com/c/yourname"
                      whyItMatters="This is your permanent shareable link for advertisers."
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">boardly.com/c/</span>
                    <Input 
                      id="username" 
                      placeholder="username" 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                      required
                      className="bg-zinc-950 border-zinc-800 h-12 pl-[105px]"
                    />
                  </div>
                </div>
                <Button onClick={handleNext} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 h-12 font-bold">Continue</Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="avgViewers">Average Live Viewers</Label>
                    <InfoTooltip 
                      content="The typical number of concurrent viewers during your live sessions." 
                      example="450"
                      whyItMatters="This helps advertisers estimate the reach of their ad placement."
                    />
                  </div>
                  <Input 
                    id="avgViewers" 
                    type="number"
                    placeholder="e.g. 500" 
                    value={formData.avgViewers}
                    onChange={(e) => setFormData({...formData, avgViewers: e.target.value})}
                    required
                    className="bg-zinc-950 border-zinc-800 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="country">Country</Label>
                    <InfoTooltip 
                      content="Your primary location or audience base." 
                      example="United Kingdom"
                      whyItMatters="Advertisers often target specific geographic regions."
                    />
                  </div>
                  <Input 
                    id="country" 
                    placeholder="e.g. United States" 
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    required
                    className="bg-zinc-950 border-zinc-800 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="bio">Creator Bio</Label>
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
                    className="bg-zinc-950 border-zinc-800 min-h-[100px]"
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={handleBack} className="w-full h-12 bg-transparent border-zinc-800 text-zinc-400">Back</Button>
                  <Button onClick={handleNext} className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 font-bold">Continue to Pricing</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
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
                
                <div className="flex gap-4 mt-8">
                  <Button variant="outline" onClick={handleBack} className="w-full h-12 bg-transparent border-zinc-800 text-zinc-400">Back</Button>
                  <Button onClick={handleSubmit} className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 font-bold" disabled={loading}>
                    {loading ? 'Saving...' : 'Complete Profile'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
