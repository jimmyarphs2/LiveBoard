import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Sparkles, Users, Star, ArrowRight, Zap } from 'lucide-react';
import { calculateCreatorScore } from '../../services/discoveryService';

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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-zinc-400 mt-1">Manage your campaigns and ad spend.</p>
          </div>
          <Link to="/marketplace">
            <Button className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200">
              Browse Creators
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-50">
                ${campaigns.filter(c => c.status === 'completed').reduce((acc, curr) => acc + curr.price, 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-50">
                {campaigns.filter(c => ['pending', 'accepted', 'active'].includes(c.status)).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-50">${profile?.cashBalance || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-zinc-50">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Recommended Creators
            </h2>
            <Link to="/marketplace" className="text-xs text-indigo-400 font-bold hover:underline">
              View All Marketplace →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedCreators.length === 0 ? (
              <div className="md:col-span-3 p-8 text-center bg-zinc-900/50 border border-zinc-800 rounded-2xl text-zinc-500">
                No recommendations available yet.
              </div>
            ) : (
              recommendedCreators.map((creator) => (
                <Card key={creator.id} className="bg-zinc-900 border-zinc-800 hover:border-indigo-500/50 transition-all group">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-50">{creator.tiktokHandle}</h4>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{creator.niche}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Discovery Match</span>
                        <span className="text-indigo-400 font-bold">{Math.round(creator.score)}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full transition-all duration-1000" 
                          style={{ width: `${Math.min(100, creator.score)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-yellow-500 text-xs font-bold">
                        <Star className="w-3 h-3 fill-current mr-1" />
                        {creator.trustScore || 100}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {(creator.followerCount / 1000).toFixed(1)}k followers
                      </div>
                    </div>

                    <Link to={`/creator/${creator.userId}`}>
                      <Button variant="outline" size="sm" className="w-full border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest">
                        View Profile
                        <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Campaigns</h2>
          {loading ? (
            <div className="text-zinc-500">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400">
              No campaigns yet. Head to the marketplace to book your first ad!
            </div>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-zinc-50 capitalize">{campaign.adType} Ad</span>
                      <Badge variant="outline" className="bg-zinc-950 text-zinc-400 border-zinc-800 capitalize">
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-400">Price: ${campaign.price}</p>
                  </div>
                  
                  {campaign.status === 'proof_submitted' && (
                    <Button size="sm" className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200">
                      Review Proof
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
