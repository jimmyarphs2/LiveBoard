import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/firebase';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Link } from 'react-router-dom';
import { Search, Users, MapPin, Star, Zap, TrendingUp, Clock, CheckCircle2, Filter, Sparkles, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { calculateCreatorScore, logInteraction, InteractionType } from '../../services/discoveryService';

export default function Marketplace() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const { profile } = useAuthStore();

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const q = query(collection(db, 'creators'), where('isEligible', '==', true));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCreators(data);
      } catch (error) {
        console.error('Error fetching creators:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

  const sortedCreators = useMemo(() => {
    let list = [...creators];

    // Search filter
    if (searchTerm) {
      list = list.filter(c => 
        c.tiktokHandle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.niche?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Discovery Engine Logic
    if (sortBy === 'recommended' && profile) {
      list.sort((a, b) => {
        const scoreA = calculateCreatorScore(a, profile);
        const scoreB = calculateCreatorScore(b, profile);
        return scoreB - scoreA;
      });
    } else if (sortBy === 'followers') {
      list.sort((a, b) => b.followerCount - a.followerCount);
    } else if (sortBy === 'price_low') {
      list.sort((a, b) => {
        const minA = Math.min(...Object.values(a.pricing || { d: 999 }) as number[]);
        const minB = Math.min(...Object.values(b.pricing || { d: 999 }) as number[]);
        return minA - minB;
      });
    }

    return list;
  }, [creators, searchTerm, sortBy, profile]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'elite': return 'text-purple-400 border-purple-500/20 bg-purple-500/10 glow-purple';
      case 'premium': return 'text-amber-400 border-amber-500/20 bg-amber-500/10 glow-amber';
      case 'growth': return 'text-blue-400 border-blue-500/20 bg-blue-500/10 glow-primary';
      default: return 'text-zinc-400 border-zinc-500/20 bg-zinc-500/10';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-12 max-w-7xl mx-auto relative">
        {/* Background Glows */}
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 relative z-10"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Badge className="rounded-full bg-primary/20 text-primary border-primary/30 glow-primary px-6 py-2 font-black text-[10px] uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 mr-2 animate-pulse fill-current" />
                AI Discovery Engine v2.4
              </Badge>
              <div className="h-px w-12 bg-white/10" />
            </div>
            <h1 className="text-7xl md:text-8xl font-heading font-black tracking-tighter text-white drop-shadow-2xl leading-[0.9]">
              Creator<br />Marketplace
            </h1>
            <p className="text-white/40 text-xl max-w-2xl leading-relaxed font-medium tracking-tight">
              Our proprietary discovery engine matches you with high-performance creators based on niche, engagement, and historical delivery success.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-primary transition-all duration-500" />
              <Input 
                placeholder="Search creators, niches, or handles..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 h-20 rounded-[2rem] bg-[#0f172a]/40 border-white/10 focus:border-primary/50 transition-all text-lg font-bold backdrop-blur-3xl shadow-2xl"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-64 h-20 rounded-[2rem] bg-[#0f172a]/40 border-white/10 focus:ring-primary/20 text-lg font-bold backdrop-blur-3xl shadow-2xl">
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-primary" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#020617] border-white/10 text-white rounded-[2rem] p-2 backdrop-blur-3xl">
                <SelectItem value="recommended" className="rounded-xl focus:bg-primary/20 focus:text-primary py-3 px-4 font-bold">Recommended</SelectItem>
                <SelectItem value="followers" className="rounded-xl focus:bg-primary/20 focus:text-primary py-3 px-4 font-bold">Followers</SelectItem>
                <SelectItem value="price_low" className="rounded-xl focus:bg-primary/20 focus:text-primary py-3 px-4 font-bold">Lowest Price</SelectItem>
                <SelectItem value="newest" className="rounded-xl focus:bg-primary/20 focus:text-primary py-3 px-4 font-bold">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[500px] bg-white/5 rounded-[3rem] animate-pulse border border-white/5 shadow-2xl" />
            ))}
          </div>
        ) : sortedCreators.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-32 text-center bg-[#0f172a]/20 border border-dashed border-white/10 rounded-[4rem] backdrop-blur-3xl"
          >
            <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner border border-white/5">
              <Search className="w-12 h-12 text-white/10" />
            </div>
            <h3 className="text-4xl font-black text-white mb-4 font-heading tracking-tight">No creators found</h3>
            <p className="text-white/40 text-xl font-medium max-w-md mx-auto">Try adjusting your search terms or filters to find your match.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
            <AnimatePresence mode="popLayout">
              {sortedCreators.map((creator, i) => (
                <motion.div
                  layout
                  key={creator.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                >
                  <Link 
                    to={`/creator/${creator.userId}`}
                    onClick={() => profile?.uid && logInteraction(profile.uid, creator.id, InteractionType.CLICK)}
                  >
                    <Card className="fintech-card rounded-[3rem] h-full flex flex-col group border-white/10 bg-[#0f172a]/40 backdrop-blur-3xl shadow-2xl hover:shadow-primary/20 transition-all duration-700 overflow-hidden">
                      <div className="h-48 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.2),transparent)]" />
                        <div className="absolute -bottom-12 left-10 w-28 h-28 bg-[#020617] rounded-[2rem] border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-[1.5rem] flex items-center justify-center">
                            <span className="text-5xl font-black text-primary drop-shadow-2xl">{creator.tiktokHandle?.charAt(1).toUpperCase() || 'C'}</span>
                          </div>
                        </div>
                        {sortBy === 'recommended' && (
                          <div className="absolute top-8 right-8">
                            <Badge className="bg-primary text-white border-none shadow-xl shadow-primary/40 rounded-full px-5 py-2 font-black uppercase tracking-widest text-[10px] glow-primary">
                              <Zap className="w-3.5 h-3.5 mr-2 fill-current" />
                              Best Match
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardHeader className="pt-20 pb-8 px-10">
                        <div className="flex justify-between items-start">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-3xl font-heading font-black text-white group-hover:text-primary transition-colors tracking-tighter">{creator.tiktokHandle}</CardTitle>
                              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className={`rounded-full px-4 py-1 border-white/10 font-black text-[10px] uppercase tracking-widest ${getTierColor(creator.tier)}`}>
                                {creator.tier || 'Starter'}
                              </Badge>
                              <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">{creator.niche}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end text-amber-500 mb-2 font-black text-2xl tracking-tighter">
                              <Star className="w-5 h-5 fill-current mr-2" />
                              {creator.trustScore || 100}
                            </div>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Global Score</p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="px-10 pb-10 flex-1 flex flex-col">
                        <div className="grid grid-cols-2 gap-10 mb-10">
                          <div className="space-y-2">
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black">Followers</p>
                            <p className="text-2xl font-heading font-black text-white tracking-tighter">{(creator.followerCount / 1000).toFixed(1)}k</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black">Avg Viewers</p>
                            <p className="text-2xl font-heading font-black text-white tracking-tighter">{creator.avgViewers.toLocaleString()}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black">Response</p>
                            <div className="flex items-center text-white font-black text-xl tracking-tighter">
                              <Clock className="w-4 h-4 mr-2 text-primary" />
                              {creator.discoverySignals?.responseTime || '< 1h'}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black">Starting at</p>
                            <p className="text-3xl font-heading font-black text-primary glow-primary tracking-tighter">${Math.min(...Object.values(creator.pricing || { d: 50 }) as number[])}</p>
                          </div>
                        </div>

                        <div className="mt-auto space-y-8">
                          <div className="flex flex-wrap gap-3">
                            {creator.adTypes?.slice(0, 3).map((type: string) => (
                              <Badge key={type} variant="outline" className="bg-white/5 border-white/10 text-white/60 text-[10px] py-1.5 px-4 rounded-xl capitalize font-black tracking-widest">
                                {type.replace('_', ' ')}
                              </Badge>
                            ))}
                            {creator.adTypes?.length > 3 && (
                              <span className="text-[10px] text-white/20 font-black self-center">+{creator.adTypes.length - 3}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-6 border-t border-white/10">
                            <div className="flex items-center gap-3 text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">
                              <MapPin className="w-4 h-4 text-primary" />
                              {creator.country}
                            </div>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 group-hover:translate-x-2 shadow-xl">
                              <ArrowRight className="w-6 h-6" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
