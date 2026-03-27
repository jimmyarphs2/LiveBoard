import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { InfoTooltip } from '../../components/InfoTooltip';
import { SafetyScanner } from '../../components/SafetyScanner';
import { motion } from 'motion/react';

export default function AdvertiserOnboarding() {
  const { user, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isUrlSafe, setIsUrlSafe] = useState(true);
  
  const [formData, setFormData] = useState({
    brandName: '',
    website: '',
    industry: '',
    campaignGoal: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!isUrlSafe) {
      toast.error('Please provide a safe and valid website URL.');
      return;
    }
    
    setLoading(true);
    try {
      const advertiserData = {
        userId: user.uid,
        brandName: formData.brandName,
        website: formData.website,
        industry: formData.industry,
        campaignGoal: formData.campaignGoal,
        targetCountries: ['Global'],
        discoverySignals: {
          totalSpend: 0,
          bookingsCount: 0,
          lastActive: new Date()
        }
      };

      await setDoc(doc(db, 'advertisers', user.uid), advertiserData);
      await updateDoc(doc(db, 'users', user.uid), { status: 'active' });
      
      setProfile({ ...advertiserData, role: 'advertiser', status: 'active' });
      
      toast.success('Welcome to Boardly!');
      navigate('/dashboard/advertiser');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-50">Advertiser Profile</h1>
          <p className="text-zinc-400 mt-2">Set up your brand to start booking ad space.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="brandName">Brand / Company Name</Label>
                <InfoTooltip 
                  content="The name of your brand or agency." 
                  example="Lumina Tech"
                  whyItMatters="This is how creators will identify your booking requests."
                />
              </div>
              <Input 
                id="brandName" 
                placeholder="Acme Corp" 
                value={formData.brandName}
                onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                required
                className="bg-zinc-950 border-zinc-800 h-12"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="website">Website URL</Label>
                <InfoTooltip 
                  content="Your official brand website or landing page." 
                  example="https://mylumina.com"
                  whyItMatters="Creators use this to verify your brand's legitimacy before accepting bookings."
                />
              </div>
              <Input 
                id="website" 
                type="url"
                placeholder="https://example.com" 
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                required
                className="bg-zinc-950 border-zinc-800 h-12"
              />
              <SafetyScanner 
                content={formData.website} 
                type="link" 
                onScanComplete={setIsUrlSafe} 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="industry">Industry</Label>
                <InfoTooltip 
                  content="The primary sector your brand operates in." 
                  example="E-commerce / SaaS"
                  whyItMatters="Our discovery engine uses this to match you with creators in relevant niches."
                />
              </div>
              <Select value={formData.industry} onValueChange={(v) => setFormData({...formData, industry: v})}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800 h-12">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="tech">Technology & SaaS</SelectItem>
                  <SelectItem value="finance">Finance & Crypto</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="beauty">Beauty & Wellness</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="campaignGoal">Primary Campaign Goal</Label>
                <InfoTooltip 
                  content="What you hope to achieve with your ad placements." 
                  example="Brand Awareness / Direct Sales"
                  whyItMatters="This helps us suggest the best ad formats and creators for your needs."
                />
              </div>
              <Select value={formData.campaignGoal} onValueChange={(v) => setFormData({...formData, campaignGoal: v})}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800 h-12">
                  <SelectValue placeholder="What is your main goal?" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                  <SelectItem value="traffic">Website Traffic</SelectItem>
                  <SelectItem value="conversions">Direct Conversions / Sales</SelectItem>
                  <SelectItem value="followers">Social Media Growth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 h-12 font-bold" disabled={loading || !isUrlSafe}>
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
