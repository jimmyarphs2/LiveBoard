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
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="rounded-full bg-primary/20 text-primary border-primary/30 glow-primary px-4 py-1.5 font-bold text-[9px] uppercase tracking-widest">
                <Sparkles className="w-3 h-3 mr-2 animate-pulse fill-current" />
                AI Discovery Engine v2.4
              </Badge>
              <div className="h-px w-8 bg-white/10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-white drop-shadow-2xl leading-none">
              Creator Marketplace
            </h1>
            <p className="text-white/40 text-base max-w-2xl leading-relaxed font-medium tracking-tight">
              Our proprietary discovery engine matches you with high-performance creators based on niche, engagement, and historical delivery success.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-all duration-500" />
              <Input 
                placeholder="Search creators, niches, or handles..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 rounded-xl bg-[#0f172a]/40 border-white/10 focus:border-primary/50 transition-all text-sm font-bold backdrop-blur-3xl shadow-2xl"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl bg-[#0f172a]/40 border-white/10 focus:ring-primary/20 text-sm font-bold backdrop-blur-3xl shadow-2xl">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#020617] border-white/10 text-white rounded-xl p-1 backdrop-blur-3xl">
                <SelectItem value="recommended" className="rounded-lg focus:bg-primary/20 focus:text-primary py-2 px-3 text-xs font-bold">Recommended</SelectItem>
                <SelectItem value="followers" className="rounded-lg focus:bg-primary/20 focus:text-primary py-2 px-3 text-xs font-bold">Followers</SelectItem>
                <SelectItem value="price_low" className="rounded-lg focus:bg-primary/20 focus:text-primary py-2 px-3 text-xs font-bold">Lowest Price</SelectItem>
                <SelectItem value="newest" className="rounded-lg focus:bg-primary/20 focus:text-primary py-2 px-3 text-xs font-bold">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] bg-white/5 rounded-2xl animate-pulse border border-white/5 shadow-2xl" />
            ))}
          </div>
        ) : sortedCreators.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 text-center bg-[#0f172a]/20 border border-dashed border-white/10 rounded-3xl backdrop-blur-3xl"
          >
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/5">
              <Search className="w-8 h-8 text-white/10" />
            </div>
            <h3 className="text-xl font-black text-white mb-2 font-heading tracking-tight">No creators found</h3>
            <p className="text-white/40 text-sm font-medium max-w-md mx-auto">Try adjusting your search terms or filters to find your match.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
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
                    <Card className="fintech-card rounded-2xl h-full flex flex-col group border-white/10 bg-[#0f172a]/40 backdrop-blur-3xl shadow-2xl hover:shadow-primary/20 transition-all duration-700 overflow-hidden">
                      <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.2),transparent)]" />
                        <div className="absolute -bottom-8 left-6 w-16 h-16 bg-[#020617] rounded-xl border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-black text-primary drop-shadow-2xl">{creator.tiktokHandle?.charAt(1).toUpperCase() || 'C'}</span>
                          </div>
                        </div>
                        {sortBy === 'recommended' && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-primary text-white border-none shadow-xl shadow-primary/40 rounded-full px-3 py-1 font-black uppercase tracking-widest text-[8px] glow-primary">
                              <Zap className="w-2.5 h-2.5 mr-1.5 fill-current" />
                              Best Match
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardHeader className="pt-12 pb-4 px-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-xl font-heading font-bold text-white group-hover:text-primary transition-colors tracking-tight">{creator.tiktokHandle}</CardTitle>
                              <div className="w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-2.5 h-2.5 text-primary" />
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className={`rounded-full px-3 py-1 border-white/10 font-bold text-[9px] uppercase tracking-widest ${getTierColor(creator.tier)}`}>
                                {creator.tier || 'Starter'}
                              </Badge>
                              <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{creator.niche}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end text-amber-500 mb-1 font-bold text-xl tracking-tight">
                              <Star className="w-4 h-4 fill-current mr-2" />
                              {creator.trustScore || 100}
                            </div>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Global Score</p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="px-6 pb-6 flex-1 flex flex-col">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div className="space-y-1">
                            <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Followers</p>
                            <p className="text-lg font-heading font-bold text-white tracking-tight">{(creator.followerCount / 1000).toFixed(1)}k</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Avg Viewers</p>
                            <p className="text-lg font-heading font-bold text-white tracking-tight">{creator.avgViewers.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Response</p>
                            <div className="flex items-center text-white font-bold text-base tracking-tight">
                              <Clock className="w-4 h-4 mr-2 text-primary" />
                              {creator.discoverySignals?.responseTime || '< 1h'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Starting at</p>
                            <p className="text-xl font-heading font-bold text-primary glow-primary tracking-tight">${Math.min(...Object.values(creator.pricing || { d: 50 }) as number[])}</p>
                          </div>
                        </div>

                        <div className="mt-auto space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {creator.adTypes?.slice(0, 3).map((type: string) => (
                              <Badge key={type} variant="outline" className="bg-white/5 border-white/10 text-white/60 text-[9px] py-1.5 px-4 rounded-xl capitalize font-bold tracking-widest">
                                {type.replace('_', ' ')}
                              </Badge>
                            ))}
                            {creator.adTypes?.length > 3 && (
                              <span className="text-[9px] text-white/20 font-bold self-center">+{creator.adTypes.length - 3}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2 text-[9px] text-white/40 font-bold uppercase tracking-widest">
                              <MapPin className="w-4 h-4 text-primary" />
                              {creator.country}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 group-hover:translate-x-1.5 shadow-xl">
                              <ArrowRight className="w-5 h-5" />
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
