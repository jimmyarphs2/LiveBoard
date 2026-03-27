import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Sparkles, Users, Star, ArrowRight, Zap, Wallet, TrendingUp, Activity, Building } from 'lucide-react';
import { calculateCreatorScore } from '../../services/discoveryService';

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

export default function AdvertiserDashboard() {
  const { user, profile } = useAuthStore();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'bookings'), where('advertiserId', '==', user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCampaigns(data.sort((a: any, b: any) => b.createdAt.toMillis() - a.createdAt.toMillis()));

        // Fetch creators for discovery
        const cSnapshot = await getDocs(query(collection(db, 'creators'), where('isEligible', '==', true)));
        const cData = cSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCreators(cData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const recommendedCreators = useMemo(() => {
    if (!profile || creators.length === 0) return [];
    return [...creators]
      .map(creator => ({ ...creator, score: calculateCreatorScore(creator, profile) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [creators, profile]);

  const totalSpent = campaigns.filter(c => c.status === 'completed').reduce((acc, curr) => acc + curr.price, 0);
  const activeCampaigns = campaigns.filter(c => ['pending', 'accepted', 'active'].includes(c.status)).length;

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-8"
        >
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter font-heading bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent drop-shadow-2xl leading-none">
              Advertiser Terminal
            </h1>
            <p className="text-white/40 text-xl font-medium tracking-tight">Manage your global ad inventory and discovery engine.</p>
          </div>
          <Link to="/marketplace">
            <Button className="rounded-full px-12 h-20 bg-primary text-white hover:bg-primary/90 shadow-[0_0_50px_rgba(59,130,246,0.3)] font-black text-lg uppercase tracking-widest group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              Browse Global Creators
              <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            { label: 'Total Volume', value: totalSpent, prefix: '$', icon: TrendingUp, color: 'text-emerald-400', glow: 'glow-emerald', bg: 'bg-emerald-500/5' },
            { label: 'Active Nodes', value: activeCampaigns, icon: Activity, color: 'text-blue-400', glow: 'glow-primary', bg: 'bg-primary/5' },
            { label: 'Liquidity', value: profile?.cashBalance || 0, prefix: '$', icon: Wallet, color: 'text-amber-400', glow: 'glow-amber', bg: 'bg-amber-500/5' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`relative overflow-hidden group fintech-card ${stat.glow} border-white/5 bg-[#0f172a]/40 backdrop-blur-3xl p-10 rounded-[3rem]`}>
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-125 duration-700">
                  <stat.icon className="w-32 h-32" />
                </div>
                <div className="space-y-6 relative z-10">
                  <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em]">{stat.label}</p>
                  <div className={`text-6xl font-black tracking-tighter font-heading ${stat.color}`}>
                    <AnimatedNumber value={stat.value} prefix={stat.prefix} />
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

        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-4xl font-black font-heading flex items-center gap-4 tracking-tighter text-white">
                <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                AI Discovery Engine
              </h2>
              <p className="text-white/40 text-sm font-black uppercase tracking-[0.3em]">Proprietary matching based on historical performance</p>
            </div>
            <Link to="/marketplace" className="text-[11px] text-primary font-black uppercase tracking-[0.4em] hover:text-white transition-colors group">
              Explore All <span className="group-hover:translate-x-2 inline-block transition-transform">→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {recommendedCreators.length === 0 ? (
              <Card className="md:col-span-3 p-40 text-center border-dashed border-white/10 bg-white/5 rounded-[4rem]">
                <Zap className="w-32 h-32 text-white/5 mx-auto mb-10" />
                <p className="text-white/40 text-2xl font-medium">No recommendations available yet. Try updating your profile.</p>
              </Card>
            ) : (
              recommendedCreators.map((creator, i) => (
                <motion.div
                  key={creator.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="fintech-card hover:border-primary/50 transition-all group cursor-pointer h-full flex flex-col bg-[#0f172a]/40 backdrop-blur-3xl border-white/10 rounded-[4rem] overflow-hidden p-10">
                    <div className="flex items-center gap-6 mb-10">
                      <div className="w-20 h-20 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/30 transition-all duration-700 shadow-inner">
                        <Users className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="font-black text-3xl text-white group-hover:text-primary transition-colors tracking-tighter">@{creator.tiktokHandle}</h4>
                        <p className="text-[11px] text-white/30 uppercase tracking-[0.3em] font-black">{creator.niche}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6 mb-10 mt-auto">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em]">
                        <span className="text-white/40">Discovery Match</span>
                        <span className="text-primary glow-primary">{Math.round(creator.score)}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, creator.score)}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="bg-primary h-full glow-primary" 
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center text-amber-400 text-[11px] font-black bg-amber-400/10 px-6 py-2 rounded-full border border-amber-400/20 glow-amber">
                        <Star className="w-4 h-4 fill-current mr-3" />
                        {creator.trustScore || 100}
                      </div>
                      <div className="text-[11px] text-white/40 font-black uppercase tracking-[0.2em]">
                        {(creator.followerCount / 1000).toFixed(1)}k followers
                      </div>
                    </div>

                    <Link to={`/creator/${creator.userId}`}>
                      <Button className="w-full h-16 rounded-full bg-white/5 border border-white/10 text-white hover:bg-primary hover:text-white hover:border-primary transition-all duration-700 font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl">
                        View Terminal
                        <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform duration-500" />
                      </Button>
                    </Link>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-10">
          <h2 className="text-4xl font-black font-heading flex items-center gap-4 tracking-tighter text-white">
            <Activity className="w-10 h-10 text-primary" />
            Recent Deployments
          </h2>
          {loading ? (
            <div className="grid gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white/5 rounded-[3rem] animate-pulse" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <Card className="p-40 text-center border-dashed border-white/10 bg-white/5 rounded-[4rem]">
              <Building className="w-32 h-32 text-white/5 mx-auto mb-10" />
              <p className="text-white/40 text-2xl font-medium">No deployments yet. Head to the marketplace to book your first ad!</p>
            </Card>
          ) : (
            <div className="grid gap-8">
              {campaigns.map((campaign, i) => (
                <motion.div 
                  key={campaign.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center justify-between p-10 bg-[#0f172a]/40 border border-white/10 rounded-[3.5rem] hover:bg-white/5 hover:border-primary/30 transition-all duration-700 shadow-2xl backdrop-blur-3xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                  <div className="flex items-center gap-10">
                    <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-700 group-hover:bg-primary/20 shadow-inner">
                      <Zap className="w-10 h-10 fill-current" />
                    </div>
                    <div>
                      <div className="flex items-center gap-6 mb-3">
                        <span className="font-black text-3xl tracking-tighter text-white capitalize">{campaign.adType.replace('_', ' ')} Ad</span>
                        <Badge className="rounded-full bg-primary/10 text-primary border-primary/20 px-6 py-2 font-black text-[11px] uppercase tracking-[0.3em] glow-primary">
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-white/40 font-black text-[11px] uppercase tracking-[0.4em]">Price: <span className="text-primary">${campaign.price}</span></p>
                    </div>
                  </div>
                  
                  {campaign.status === 'proof_submitted' && (
                    <Button className="rounded-full px-12 h-16 bg-primary text-white hover:bg-primary/90 shadow-[0_0_30px_rgba(59,130,246,0.3)] font-black text-[11px] uppercase tracking-[0.3em] group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      Review Proof
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
