import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { 
  ExternalLink, 
  Copy, 
  Zap, 
  TrendingUp, 
  Users, 
  Star, 
  Clock, 
  Trophy, 
  DollarSign, 
  LayoutDashboard,
  Sparkles,
  Building,
  ArrowRight,
  Wallet,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { PricingAssistant } from '../../components/PricingAssistant';
import { BoxBattleApplication } from '../../components/BoxBattleApplication';
import { calculateAdvertiserScore } from '../../services/discoveryService';

const AnimatedNumber = ({ value, prefix = "" }: { value: number; prefix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString()}</span>;
};

export default function CreatorDashboard() {
  const { user, profile, setProfile } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [advertisers, setAdvertisers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const bQuery = query(collection(db, 'bookings'), where('creatorId', '==', user.uid));
        const bSnapshot = await getDocs(bQuery);
        const bData = bSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBookings(bData.sort((a: any, b: any) => b.createdAt.toMillis() - a.createdAt.toMillis()));

        const aSnapshot = await getDocs(collection(db, 'advertisers'));
        const aData = aSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAdvertisers(aData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const recommendedAdvertisers = useMemo(() => {
    if (!profile || advertisers.length === 0) return [];
    return [...advertisers]
      .map(adv => ({ ...adv, score: calculateAdvertiserScore(adv, profile) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [advertisers, profile]);

  const handleAccept = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: 'accepted' });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'accepted' } : b));
      toast.success('Booking accepted');
    } catch (error) {
      toast.error('Failed to accept booking');
    }
  };

  const handleDecline = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: 'declined' });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'declined' } : b));
      toast.success('Booking declined');
    } catch (error) {
      toast.error('Failed to decline booking');
    }
  };

  const handleUpdatePrice = async (price: number) => {
    if (!user || !profile) return;
    try {
      const newPricing = { ...profile.pricing, base: price };
      await updateDoc(doc(db, 'creators', user.uid), { pricing: newPricing });
      setProfile({ ...profile, pricing: newPricing });
      toast.success('Pricing updated successfully');
    } catch (error) {
      toast.error('Failed to update pricing');
    }
  };

  const copyProfileLink = () => {
    const link = profile?.username 
      ? `${window.location.origin}/c/${profile.username}`
      : `${window.location.origin}/p/${user?.uid}`;
    navigator.clipboard.writeText(link);
    toast.success('Profile link copied to clipboard!');
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'elite': return 'text-purple-400 border-purple-500/20 bg-purple-500/10 glow-purple';
      case 'premium': return 'text-amber-400 border-amber-500/20 bg-amber-500/10 glow-amber';
      case 'growth': return 'text-blue-400 border-blue-500/20 bg-blue-500/10 glow-primary';
      default: return 'text-zinc-400 border-zinc-500/20 bg-zinc-500/10';
    }
  };

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-8"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-6 mb-2">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter font-heading bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent drop-shadow-2xl leading-none">
                Welcome, {profile?.tiktokHandle}
              </h1>
              <Badge className={`px-6 py-2 rounded-full font-black text-[11px] uppercase tracking-[0.3em] border-2 shadow-lg ${getTierColor(profile?.tier)}`}>
                {profile?.tier || 'Starter'}
              </Badge>
            </div>
            <p className="text-white/40 text-xl font-medium tracking-tight">Your ad space is performing at <span className="text-primary font-black glow-primary">120%</span> capacity.</p>
          </div>
          <div className="flex gap-6">
            <Button variant="outline" onClick={copyProfileLink} className="rounded-full px-10 h-16 bg-white/5 border-white/10 text-white hover:bg-white/10 font-black text-[11px] uppercase tracking-[0.3em] transition-all">
              <Copy className="w-5 h-5 mr-3" />
              Copy Link
            </Button>
            <Button className="rounded-full px-10 h-16 bg-primary text-white hover:bg-primary/90 shadow-[0_0_50px_rgba(59,130,246,0.3)] font-black text-[11px] uppercase tracking-[0.3em] group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Link 
                to={profile?.username ? `/c/${profile.username}` : `/p/${user?.uid}`} 
                target="_blank" 
                className="flex items-center"
              >
                <ExternalLink className="w-5 h-5 mr-3" />
                View Terminal
              </Link>
            </Button>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <TabsList className="bg-[#0f172a]/40 backdrop-blur-3xl border border-white/10 p-3 rounded-[2.5rem] h-auto inline-flex">
            <TabsTrigger value="overview" className="rounded-2xl px-12 py-4 flex items-center gap-3 font-black text-[11px] uppercase tracking-[0.3em] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all">
              <LayoutDashboard className="w-5 h-5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="monetization" className="rounded-2xl px-12 py-4 flex items-center gap-3 font-black text-[11px] uppercase tracking-[0.3em] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all">
              <DollarSign className="w-5 h-5" />
              Monetization
            </TabsTrigger>
            <TabsTrigger value="battles" className="rounded-2xl px-12 py-4 flex items-center gap-3 font-black text-[11px] uppercase tracking-[0.3em] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all">
              <Trophy className="w-5 h-5" />
              Box Battles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-12 outline-none">
            {/* Discovery Signals & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {[
                { label: 'Total Volume', value: profile?.cashBalance || 0, prefix: '$', icon: Wallet, color: 'text-emerald-400', glow: 'glow-emerald' },
                { label: 'Trust Score', value: profile?.trustScore || 100, icon: ShieldCheck, color: 'text-amber-400', glow: 'glow-amber' },
                { label: 'Response Time', value: profile?.discoverySignals?.responseTime || '< 1h', icon: Clock, color: 'text-blue-400', glow: 'glow-primary', isString: true },
                { label: 'Node Views', value: profile?.discoverySignals?.views || 0, icon: Activity, color: 'text-purple-400', glow: 'glow-purple' },
                { label: 'Followers', value: profile?.followerCount || 0, icon: Users, color: 'text-cyan-400', glow: 'glow-cyan', isK: true },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`relative overflow-hidden group fintech-card ${stat.glow} border-white/5 bg-[#0f172a]/40 backdrop-blur-3xl p-8 rounded-[3rem]`}>
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-125 duration-700">
                      <stat.icon className="w-20 h-20" />
                    </div>
                    <div className="space-y-4 relative z-10">
                      <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">{stat.label}</p>
                      <div className={`text-5xl font-black tracking-tighter font-heading ${stat.color}`}>
                        {stat.isString ? stat.value : (
                          <AnimatedNumber 
                            value={stat.isK ? stat.value / 1000 : stat.value} 
                            prefix={stat.prefix} 
                          />
                        )}
                        {stat.isK && "k"}
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '70%' }}
                          className={`h-full bg-current ${stat.color} ${stat.glow}`}
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-4xl font-black font-heading flex items-center gap-4 tracking-tighter text-white">
                    <TrendingUp className="w-10 h-10 text-primary" />
                    Incoming Bookings
                  </h2>
                  <Button variant="ghost" className="text-primary font-black uppercase tracking-[0.3em] text-[11px] hover:bg-primary/10 rounded-full px-6">
                    View Terminal History
                  </Button>
                </div>

                {loading ? (
                  <div className="grid gap-8">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-32 bg-white/5 rounded-[3rem] animate-pulse" />
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <Card className="p-40 text-center border-dashed border-white/10 bg-white/5 rounded-[4rem]">
                    <Zap className="w-32 h-32 text-white/5 mx-auto mb-10" />
                    <p className="text-white/40 text-2xl font-medium">No bookings yet. Share your profile to start earning.</p>
                  </Card>
                ) : (
                  <div className="grid gap-8">
                    {bookings.map((booking, i) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative flex items-center justify-between p-10 bg-[#0f172a]/40 border border-white/10 rounded-[3.5rem] hover:bg-white/5 hover:border-primary/30 transition-all duration-700 shadow-2xl backdrop-blur-3xl overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                        <div className="flex items-center gap-10">
                          <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-700 group-hover:bg-primary/20 shadow-inner">
                            <Zap className="w-10 h-10 fill-current" />
                          </div>
                          <div>
                            <div className="flex items-center gap-6 mb-3">
                              <span className="font-black text-3xl tracking-tighter text-white capitalize">{booking.adType.replace('_', ' ')} Ad</span>
                              <Badge className={`rounded-full px-6 py-2 font-black text-[11px] uppercase tracking-[0.3em] ${booking.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-400/20 glow-amber' : 'bg-primary/10 text-primary border-primary/20 glow-primary'}`}>
                                {booking.status}
                              </Badge>
                            </div>
                            <p className="text-white/40 font-black text-[11px] uppercase tracking-[0.4em]">
                              Payout: <span className="text-primary font-black glow-primary">${booking.price}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          {booking.status === 'pending' && (
                            <>
                              <Button variant="ghost" onClick={() => handleDecline(booking.id)} className="rounded-full px-10 h-16 font-black text-[11px] uppercase tracking-[0.3em] hover:bg-white/5 text-white/40 hover:text-white transition-all">
                                Decline
                              </Button>
                              <Button onClick={() => handleAccept(booking.id)} className="rounded-full px-12 h-16 bg-primary text-white hover:bg-primary/90 shadow-[0_0_30px_rgba(59,130,246,0.3)] font-black text-[11px] uppercase tracking-[0.3em] relative overflow-hidden group/btn">
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                Accept
                              </Button>
                            </>
                          )}
                          {booking.status === 'accepted' && (
                            <Button variant="outline" className="rounded-full px-12 h-16 border-primary/30 text-primary hover:bg-primary/10 font-black text-[11px] uppercase tracking-[0.3em] transition-all">
                              Submit Proof
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Recommended Advertisers Section */}
                <div className="space-y-10 pt-16">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black font-heading flex items-center gap-4 tracking-tighter text-white">
                        <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                        AI Discovery Engine
                      </h2>
                      <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.3em]">Proprietary matching based on historical performance</p>
                    </div>
                    <Badge className="rounded-full bg-primary/10 text-primary border-primary/20 px-6 py-2 font-black text-[11px] uppercase tracking-[0.3em] glow-primary">
                      Active Matching
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {recommendedAdvertisers.map((adv, i) => (
                      <motion.div
                        key={adv.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="fintech-card hover:border-primary/50 transition-all group cursor-pointer h-full flex flex-col bg-[#0f172a]/40 backdrop-blur-3xl border-white/10 rounded-[4rem] overflow-hidden p-10">
                          <div className="flex items-center gap-6 mb-10">
                            <div className="w-20 h-20 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/30 transition-all duration-700 shadow-inner">
                              <Building className="w-10 h-10" />
                            </div>
                            <div>
                              <h4 className="font-black text-3xl text-white group-hover:text-primary transition-colors tracking-tighter">{adv.brandName}</h4>
                              <p className="text-[11px] text-white/30 uppercase tracking-[0.3em] font-black">{adv.industry}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-6 mb-10 mt-auto">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em]">
                              <span className="text-white/40">Match Score</span>
                              <span className="text-primary glow-primary">{Math.round(adv.score)}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, adv.score)}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="bg-primary h-full glow-primary" 
                              />
                            </div>
                          </div>

                          <Button className="w-full h-16 rounded-full bg-white/5 border border-white/10 text-white hover:bg-primary hover:text-white hover:border-primary transition-all duration-700 font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl">
                            View Campaigns
                            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform duration-500" />
                          </Button>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 rounded-[4rem] overflow-hidden fintech-card p-12">
                  <div className="space-y-10">
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Global Terminal Link</p>
                    <div className="p-10 bg-black/40 rounded-[3rem] border border-white/5 text-center backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <div className="text-[11px] text-white/20 mb-6 font-black uppercase tracking-[0.3em]">Your Boardly Endpoint</div>
                      <div className="text-2xl font-mono text-primary break-all mb-10 font-black tracking-tighter">
                        boardly.com/c/{profile?.username || '...'}
                      </div>
                      <Button 
                        onClick={copyProfileLink} 
                        className="w-full h-16 rounded-full bg-primary text-white hover:bg-primary/90 shadow-[0_0_30px_rgba(59,130,246,0.3)] font-black text-[11px] uppercase tracking-[0.3em] transition-all"
                      >
                        <Copy className="w-5 h-5 mr-3" />
                        Copy Endpoint
                      </Button>
                    </div>
                    <p className="text-[11px] text-white/30 text-center leading-relaxed font-black uppercase tracking-[0.3em] opacity-60">
                      Add this to your bio to increase booking rates by up to <span className="text-primary">40%</span>.
                    </p>
                  </div>
                </Card>

                <Card className="relative overflow-hidden rounded-[4rem] fintech-card p-12 bg-[#0f172a]/40 backdrop-blur-3xl border-white/10">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                    <Sparkles className="w-32 h-32" />
                  </div>
                  <div className="space-y-10 relative z-10">
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40">Growth Intelligence</p>
                    <div className="space-y-8">
                      <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2.5rem] group hover:bg-primary/10 transition-all cursor-pointer">
                        <h4 className="text-[11px] font-black text-primary mb-4 flex items-center gap-3 uppercase tracking-[0.3em]">
                          <Zap className="w-5 h-5 fill-current" />
                          Visibility Boost
                        </h4>
                        <p className="text-sm text-white/40 leading-relaxed font-medium">
                          Creators in <span className="text-primary font-black">{profile?.tier}</span> who respond within 15 mins see a <span className="text-white font-black">2.5x increase</span> in repeat bookings.
                        </p>
                      </div>
                      <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] group hover:bg-white/10 transition-all">
                        <h4 className="text-[11px] font-black text-white mb-4 uppercase tracking-[0.3em]">Smart Yield</h4>
                        <p className="text-sm text-white/40 leading-relaxed font-medium">
                          Your current base is <span className="text-white font-black">${Math.min(...Object.values(profile?.pricing || { d: 50 }) as number[])}</span>. AI suggests a <span className="text-primary font-black">15% increase</span> for peak hours.
                        </p>
                      </div>
                    </div>
                    <Button variant="link" className="text-primary p-0 h-auto text-[11px] font-black uppercase tracking-[0.4em] hover:no-underline group hover:text-white transition-colors">
                      <Link to="/growth-coach" className="flex items-center">
                        Open Growth Coach 
                        <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform duration-500" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monetization" className="outline-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <PricingAssistant 
                stats={{
                  followerCount: profile?.followerCount || 0,
                  avgViewers: profile?.avgViewers || 0,
                  niche: profile?.niche || 'entertainment',
                  country: profile?.country || 'US',
                  adType: 'base'
                }}
                onPriceSelect={handleUpdatePrice}
                currentPrice={profile?.pricing?.base}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="battles" className="outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <BoxBattleApplication />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
