import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Link } from 'react-router-dom';
import { Search, Users, MapPin, Star, Zap, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
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
      case 'elite': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'premium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'growth': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                <TrendingUp className="w-3 h-3 mr-1" />
                Discovery Engine Active
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-50">Marketplace</h1>
            <p className="text-zinc-400 mt-1 max-w-xl">
              Our AI discovery engine matches you with creators based on niche, performance, and audience engagement.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input 
                placeholder="Search creators or niches..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800 focus:ring-indigo-500"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="followers">Followers</SelectItem>
                <SelectItem value="price_low">Lowest Price</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-zinc-900 border border-zinc-800 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : sortedCreators.length === 0 ? (
          <div className="p-20 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">No creators found</h3>
            <p className="text-zinc-400">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCreators.map((creator) => (
              <Link 
                key={creator.id} 
                to={`/creator/${creator.userId}`}
                onClick={() => profile?.uid && logInteraction(profile.uid, creator.id, InteractionType.CLICK)}
              >
                <Card className="bg-zinc-900 border-zinc-800 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer overflow-hidden group h-full flex flex-col shadow-lg hover:shadow-indigo-500/5">
                  <div className="h-28 bg-gradient-to-br from-zinc-800 to-zinc-950 relative">
                    <div className="absolute -bottom-8 left-6 w-20 h-20 bg-zinc-950 rounded-2xl border-4 border-zinc-900 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                      <span className="text-3xl font-bold text-zinc-50">{creator.tiktokHandle?.charAt(1).toUpperCase() || 'C'}</span>
                    </div>
                    {sortBy === 'recommended' && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-indigo-500 text-white border-none shadow-lg shadow-indigo-500/20">
                          <Zap className="w-3 h-3 mr-1 fill-current" />
                          Best Match
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pt-12 pb-4 px-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-xl text-zinc-50 group-hover:text-indigo-400 transition-colors">{creator.tiktokHandle}</CardTitle>
                          <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-bold ${getTierColor(creator.tier)}`}>
                            {creator.tier || 'Starter'}
                          </Badge>
                          <span className="text-xs text-zinc-500 capitalize">{creator.niche}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end text-yellow-500 mb-1">
                          <Star className="w-3.5 h-3.5 fill-current mr-1" />
                          <span className="text-sm font-bold">{creator.trustScore || 100}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Trust Score</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 pb-6 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-6">
                      <div className="space-y-1">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Followers</p>
                        <p className="text-lg font-bold text-zinc-100">{(creator.followerCount / 1000).toFixed(1)}k</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Avg Viewers</p>
                        <p className="text-lg font-bold text-zinc-100">{creator.avgViewers.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Response</p>
                        <div className="flex items-center text-zinc-100 font-bold">
                          <Clock className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                          {creator.discoverySignals?.responseTime || '< 1h'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Starting at</p>
                        <p className="text-lg font-bold text-indigo-400">${Math.min(...Object.values(creator.pricing || { d: 50 }) as number[])}</p>
                      </div>
                    </div>

                    <div className="mt-auto space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {creator.adTypes?.slice(0, 3).map((type: string) => (
                          <Badge key={type} variant="outline" className="bg-zinc-950 border-zinc-800 text-zinc-500 text-[10px] py-0 px-2 capitalize">
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                        {creator.adTypes?.length > 3 && (
                          <span className="text-[10px] text-zinc-600 font-bold">+{creator.adTypes.length - 3} more</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                        <MapPin className="w-3 h-3" />
                        {creator.country}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
