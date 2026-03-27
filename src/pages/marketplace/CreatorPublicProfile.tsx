import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Star, Users, MapPin, Zap, CheckCircle2, Share2, ExternalLink, Calendar, QrCode, TrendingUp, Award, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useAuthStore';
import { logInteraction, InteractionType } from '../../services/discoveryService';

export default function CreatorPublicProfile() {
  const { userId, username } = useParams();
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        let q;
        if (userId) {
          q = query(collection(db, 'creators'), where('userId', '==', userId));
        } else if (username) {
          q = query(collection(db, 'creators'), where('username', '==', username));
        } else {
          return;
        }

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = { id: snapshot.docs[0].id, ...(snapshot.docs[0].data() as any) };
          setCreator(data);
          
          // Track view analytics via discovery engine
          if (user?.uid) {
            logInteraction(user.uid, data.id, InteractionType.VIEW);
          } else {
            // Anonymous view tracking
            await updateDoc(doc(db, 'creators', data.id), {
              'discoverySignals.views': increment(1)
            });
          }
        }
      } catch (error) {
        console.error('Error fetching creator:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCreator();
  }, [userId, username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold text-zinc-50 mb-4">Creator Not Found</h1>
        <p className="text-zinc-400 mb-8">The creator profile you're looking for doesn't exist or has been moved.</p>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'elite': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'premium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'growth': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-indigo-500/30">
      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowQR(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full text-center"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-2">Creator QR Code</h3>
              <p className="text-zinc-400 text-sm mb-6">Scan to view {creator.tiktokHandle}'s profile on Boardly</p>
              <div className="bg-white p-4 rounded-2xl inline-block mb-6">
                <QRCodeCanvas 
                  value={window.location.href} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <Button onClick={() => setShowQR(false)} className="w-full bg-zinc-800 hover:bg-zinc-700">
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-indigo-900 via-zinc-900 to-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
        
        <div className="max-w-5xl mx-auto px-6 h-full flex items-end pb-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left w-full"
          >
            <div className="w-32 h-32 bg-zinc-900 rounded-3xl border-4 border-zinc-950 flex items-center justify-center shadow-2xl overflow-hidden">
              <span className="text-5xl font-bold text-indigo-500">{creator.tiktokHandle?.charAt(1).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl font-bold tracking-tight">{creator.tiktokHandle}</h1>
                <CheckCircle2 className="w-6 h-6 text-indigo-500" />
                <Badge variant="outline" className={`text-xs uppercase tracking-widest font-bold px-3 py-1 ${getTierColor(creator.tier)}`}>
                  {creator.tier || 'Starter'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{creator.country}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span className="capitalize">{creator.niche} Creator</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{creator.trustScore || 100} Trust Score</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  toast.success('Profile link copied!');
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800"
                onClick={() => setShowQR(true)}
              >
                <QrCode className="w-4 h-4 mr-2" />
                QR Code
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
                <Calendar className="w-4 h-4 mr-2" />
                Book Now
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Bio */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Live Stats
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="pt-6">
                    <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-1">Followers</p>
                    <p className="text-2xl font-bold">{(creator.followerCount / 1000).toFixed(1)}k</p>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="pt-6">
                    <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-1">Avg Viewers</p>
                    <p className="text-2xl font-bold">{creator.avgViewers.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="pt-6">
                    <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-1">Success Rate</p>
                    <p className="text-2xl font-bold">{Math.round((creator.discoverySignals?.successRate || 0.98) * 100)}%</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">About the Creator</h2>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {creator.bio || "This creator hasn't added a bio yet, but they're ready to help you grow your brand during their TikTok Live sessions!"}
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <Button variant="link" className="text-indigo-400 p-0 h-auto">
                    <a href={`https://tiktok.com/@${creator.tiktokHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View TikTok Profile
                    </a>
                  </Button>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">Available Ad Formats</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {creator.adTypes?.map((type: string) => (
                  <Card key={type} className="bg-zinc-900 border-zinc-800 hover:border-indigo-500/30 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base capitalize">{type.replace('_', ' ')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-zinc-400 mb-4">
                        {type === 'physical_board' && "A high-quality physical board placed directly behind the creator."}
                        {type === 'digital_overlay' && "A digital graphic overlay visible to all viewers during the live."}
                        {type === 'pin_comment' && "Your message pinned at the top of the live chat for maximum visibility."}
                        {type === 'shoutout' && "A verbal shoutout and call-to-action during the stream."}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-400 font-bold">${creator.pricing?.[type] || 50}</span>
                        <Button size="sm" variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-xs">Book This</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Performance Highlights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase font-bold">Audience Growth</p>
                    <p className="text-lg font-bold text-zinc-200">+12% this month</p>
                  </div>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase font-bold">Campaigns Run</p>
                    <p className="text-lg font-bold text-zinc-200">24 Successful Ads</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                Testimonials
              </h2>
              <div className="space-y-4">
                {[
                  { name: "TechGear Pro", text: "Working with this creator was seamless. The backboard placement was perfect and we saw a direct spike in traffic.", rating: 5 },
                  { name: "FitLife App", text: "Great communication and delivered exactly what was promised. Highly recommend for fitness brands.", rating: 5 }
                ].map((t, i) => (
                  <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-zinc-200">{t.name}</h4>
                      <div className="flex gap-0.5">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm italic">"{t.text}"</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Booking Preview */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 sticky top-24">
              <CardHeader>
                <CardTitle>Quick Book</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-zinc-400">Response Time</span>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                      {creator.discoverySignals?.responseTime || '< 1h'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Next Available</span>
                    <span className="text-sm font-medium text-zinc-200">Today, 8:00 PM</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-bold shadow-lg shadow-indigo-600/20">
                    Reserve Ad Space
                  </Button>
                  <Button variant="outline" className="w-full border-zinc-800 bg-zinc-900 hover:bg-zinc-800 h-12">
                    Message Creator
                  </Button>
                </div>

                <p className="text-[10px] text-center text-zinc-500 uppercase tracking-widest leading-relaxed">
                  Secure payment via Boardly Escrow.<br />
                  Funds released only after proof of delivery.
                </p>
              </CardContent>
            </Card>

            <div className="p-6 bg-indigo-600/5 border border-indigo-500/10 rounded-3xl">
              <h4 className="font-bold text-indigo-400 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Why book {creator.tiktokHandle}?
              </h4>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-indigo-500 mt-0.5" />
                  High engagement in the {creator.niche} niche.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-indigo-500 mt-0.5" />
                  Fast response time and reliable delivery.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-indigo-500 mt-0.5" />
                  Verified {creator.tier} status.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
