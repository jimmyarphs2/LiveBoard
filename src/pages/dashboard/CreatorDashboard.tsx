import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
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
  ArrowRight
} from 'lucide-react';
import { PricingAssistant } from '../../components/PricingAssistant';
import { BoxBattleApplication } from '../../components/BoxBattleApplication';
import { calculateAdvertiserScore } from '../../services/discoveryService';

export default function CreatorDashboard() {
  const { user, profile, setProfile } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [advertisers, setAdvertisers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        // Fetch bookings
        const bQuery = query(collection(db, 'bookings'), where('creatorId', '==', user.uid));
        const bSnapshot = await getDocs(bQuery);
        const bData = bSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBookings(bData.sort((a: any, b: any) => b.createdAt.toMillis() - a.createdAt.toMillis()));

        // Fetch advertisers for discovery
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
      case 'elite': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'premium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'growth': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.tiktokHandle}</h1>
              <Badge variant="outline" className={`text-[10px] uppercase tracking-widest font-bold ${getTierColor(profile?.tier)}`}>
                {profile?.tier || 'Starter'}
              </Badge>
            </div>
            <p className="text-zinc-400">Here's what's happening with your ad space.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyProfileLink} className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800">
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Link 
                to={profile?.username ? `/c/${profile.username}` : `/p/${user?.uid}`} 
                target="_blank" 
                className="flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Profile
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg px-6 py-2 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="monetization" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg px-6 py-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Monetization
            </TabsTrigger>
            <TabsTrigger value="battles" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg px-6 py-2 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Box Battles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Discovery Signals & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Earnings</CardTitle>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-zinc-50">${profile?.cashBalance || 0}</div>
                  <p className="text-[10px] text-zinc-500 mt-1">Available for withdrawal</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Trust Score</CardTitle>
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-zinc-50">{profile?.trustScore || 100}</div>
                  <p className="text-[10px] text-zinc-500 mt-1">Based on delivery & behavior</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Response Time</CardTitle>
                  <Clock className="w-4 h-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-zinc-50">{profile?.discoverySignals?.responseTime || '< 1h'}</div>
                  <p className="text-[10px] text-zinc-500 mt-1">Avg time to accept bookings</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Profile Views</CardTitle>
                  <Users className="w-4 h-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-zinc-50">{profile?.discoverySignals?.views || 0}</div>
                  <p className="text-[10px] text-zinc-500 mt-1">Total page visits</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Followers</CardTitle>
                  <Users className="w-4 h-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-zinc-50">{(profile?.followerCount / 1000).toFixed(1)}k</div>
                  <p className="text-[10px] text-zinc-500 mt-1">TikTok Live Audience</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-semibold">Recent Bookings</h2>
                {loading ? (
                  <div className="text-zinc-500">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                  <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl text-zinc-400">
                    <Zap className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                    <p>No bookings yet. Share your profile link to get started!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-zinc-50 capitalize">{booking.adType.replace('_', ' ')} Ad</span>
                            <Badge variant="outline" className="bg-zinc-950 text-zinc-400 border-zinc-800 text-[10px] uppercase tracking-widest">
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-zinc-500">Price: <span className="text-indigo-400 font-bold">${booking.price}</span></p>
                        </div>
                        
                        {booking.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleDecline(booking.id)} className="border-zinc-800 bg-transparent hover:bg-zinc-800 text-xs">
                              Decline
                            </Button>
                            <Button size="sm" onClick={() => handleAccept(booking.id)} className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200 text-xs font-bold">
                              Accept
                            </Button>
                          </div>
                        )}
                        {booking.status === 'accepted' && (
                          <Button size="sm" variant="outline" className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs">
                            Submit Proof
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommended Advertisers Section */}
                <div className="space-y-4 pt-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-zinc-50">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                      Recommended Advertisers
                    </h2>
                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                      AI Discovery Engine
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendedAdvertisers.length === 0 ? (
                      <div className="md:col-span-3 p-8 text-center bg-zinc-900/50 border border-zinc-800 rounded-2xl text-zinc-500">
                        No recommendations available yet.
                      </div>
                    ) : (
                      recommendedAdvertisers.map((adv) => (
                        <Card key={adv.id} className="bg-zinc-900 border-zinc-800 hover:border-indigo-500/50 transition-all group">
                          <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                                <Building className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-zinc-50">{adv.brandName}</h4>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{adv.industry}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-3 mb-4">
                              <div className="flex justify-between text-xs">
                                <span className="text-zinc-500">Match Score</span>
                                <span className="text-indigo-400 font-bold">{Math.round(adv.score)}%</span>
                              </div>
                              <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                <div 
                                  className="bg-indigo-500 h-full transition-all duration-1000" 
                                  style={{ width: `${Math.min(100, adv.score)}%` }}
                                />
                              </div>
                            </div>

                            <Button variant="outline" size="sm" className="w-full border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest">
                              View Campaigns
                              <ArrowRight className="w-3 h-3 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">Share Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-center">
                      <div className="text-xs text-zinc-500 mb-2">Your unique Boardly URL:</div>
                      <div className="text-sm font-mono text-indigo-400 break-all mb-4">
                        boardly.com/c/{profile?.username || '...'}
                      </div>
                      <Button 
                        onClick={copyProfileLink} 
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-50 text-xs font-bold"
                      >
                        <Copy className="w-3 h-3 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                    <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
                      Share this link on your TikTok bio or socials to attract more advertisers.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">Growth Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                      <h4 className="text-sm font-bold text-indigo-400 mb-1 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Boost Visibility
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Creators in the <span className="text-indigo-300 font-bold">{profile?.tier}</span> tier who respond in under 30 mins get 3x more bookings.
                      </p>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                      <h4 className="text-sm font-bold text-zinc-300 mb-1">Update Pricing</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Your current starting price is <span className="text-zinc-300 font-bold">${Math.min(...Object.values(profile?.pricing || { d: 50 }) as number[])}</span>. AI suggests increasing it by 10% based on your growth.
                      </p>
                    </div>
                    <Button variant="link" className="text-indigo-400 p-0 h-auto text-xs font-bold">
                      <Link to="/growth-coach">Open Growth Coach →</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monetization" className="space-y-8">
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
          </TabsContent>

          <TabsContent value="battles" className="space-y-8">
            <div className="max-w-3xl mx-auto">
              <BoxBattleApplication />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
