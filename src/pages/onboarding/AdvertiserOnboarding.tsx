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
import { Briefcase, Globe, Target, Rocket, Building2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

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
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-[#0f172a]/40 border border-white/10 backdrop-blur-3xl rounded-[3rem] p-12 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="mb-12">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                <Building2 className="text-primary w-7 h-7 glow-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tighter font-heading">
                  BRAND PROFILE
                </h1>
                <p className="text-white/40 text-lg font-medium tracking-tight">
                  Tell us about your brand and campaign goals.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3 ml-1">
                  <Label htmlFor="brandName" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Brand / Company Name</Label>
                  <InfoTooltip 
                    content="The name of your brand or agency." 
                    example="Lumina Tech"
                    whyItMatters="This is how creators will identify your booking requests."
                  />
                </div>
                <div className="relative group">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="brandName" 
                    placeholder="Acme Corp" 
                    value={formData.brandName}
                    onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                    required
                    className="bg-white/5 border-white/10 text-white pl-14 h-16 rounded-2xl focus:ring-primary/30 focus:border-primary/50 transition-all text-lg font-medium"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 ml-1">
                  <Label htmlFor="website" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Website URL</Label>
                  <InfoTooltip 
                    content="Your official brand website or landing page." 
                    example="https://mylumina.com"
                    whyItMatters="Creators use this to verify your brand's legitimacy before accepting bookings."
                  />
                </div>
                <div className="relative group">
                  <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="website" 
                    type="url"
                    placeholder="https://example.com" 
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    required
                    className="bg-white/5 border-white/10 text-white pl-14 h-16 rounded-2xl focus:ring-primary/30 focus:border-primary/50 transition-all text-lg font-medium"
                  />
                </div>
                <div className="px-1">
                  <SafetyScanner 
                    content={formData.website} 
                    type="link" 
                    onScanComplete={setIsUrlSafe} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 ml-1">
                    <Label htmlFor="industry" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Industry</Label>
                    <InfoTooltip 
                      content="The primary sector your brand operates in." 
                      example="E-commerce / SaaS"
                      whyItMatters="Our discovery engine uses this to match you with creators in relevant niches."
                    />
                  </div>
                  <div className="relative group">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors z-10" />
                    <Select value={formData.industry} onValueChange={(v) => setFormData({...formData, industry: v})}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white pl-14 h-16 rounded-2xl focus:ring-primary/30 focus:border-primary/50 transition-all text-lg font-medium">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl">
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="tech">Technology & SaaS</SelectItem>
                        <SelectItem value="finance">Finance & Crypto</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="beauty">Beauty & Wellness</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 ml-1">
                    <Label htmlFor="campaignGoal" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Campaign Goal</Label>
                    <InfoTooltip 
                      content="What you hope to achieve with your ad placements." 
                      example="Brand Awareness / Direct Sales"
                      whyItMatters="This helps us suggest the best ad formats and creators for your needs."
                    />
                  </div>
                  <div className="relative group">
                    <Target className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors z-10" />
                    <Select value={formData.campaignGoal} onValueChange={(v) => setFormData({...formData, campaignGoal: v})}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white pl-14 h-16 rounded-2xl focus:ring-primary/30 focus:border-primary/50 transition-all text-lg font-medium">
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl">
                        <SelectItem value="awareness">Brand Awareness</SelectItem>
                        <SelectItem value="traffic">Website Traffic</SelectItem>
                        <SelectItem value="conversions">Direct Conversions</SelectItem>
                        <SelectItem value="followers">Social Growth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-10 bg-primary hover:bg-primary/90 h-20 rounded-2xl font-black text-xl uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] group relative overflow-hidden" 
              disabled={loading || !isUrlSafe}
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
                  <Rocket className="w-6 h-6 ml-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
