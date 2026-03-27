import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Star, Users, MapPin, Zap, CheckCircle2, Share2, ExternalLink, Calendar, QrCode, TrendingUp, Award, MessageSquare, Sparkles, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto">
            <Users className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">Creator Not Found</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">The creator profile you're looking for doesn't exist or has been moved.</p>
          <Button render={<Link to="/">Return to Home</Link>} size="lg" className="rounded-full px-10 h-14 bg-primary text-white hover:bg-primary/90 font-bold" />
        </motion.div>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'elite': return 'text-purple-400 border-purple-500/20 bg-purple-500/10 glow-purple';
      case 'premium': return 'text-amber-400 border-amber-500/20 bg-amber-500/10 glow-amber';
      case 'growth': return 'text-blue-400 border-blue-500/20 bg-blue-500/10 glow-primary';
      default: return 'text-zinc-400 border-zinc-500/20 bg-zinc-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/30 font-sans">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#3b82f6 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      
      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
            onClick={() => setShowQR(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-900 border border-white/10 p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-3xl font-black mb-2">Creator QR</h3>
              <p className="text-muted-foreground text-sm mb-8 font-medium">Scan to view {creator.tiktokHandle}'s profile</p>
              <div className="bg-white p-6 rounded-[2.5rem] inline-block mb-8 shadow-2xl">
                <QRCodeCanvas 
                  value={window.location.href} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <Button onClick={() => setShowQR(false)} className="w-full h-14 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10">
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative h-[45vh] md:h-[55vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F1A] via-[#0F172A] to-[#020617]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.25),transparent)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
          
          {/* Animated Glow Orbs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-purple-500/20 blur-[100px] rounded-full" 
          />
        </div>
        
        <div className="max-w-6xl mx-auto px-8 h-full flex items-end pb-16 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row items-center md:items-end gap-10 text-center md:text-left w-full"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[3.2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-44 h-44 bg-[#020617] rounded-[3rem] border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                  <span className="text-7xl font-black text-white text-glow">{creator.tiktokHandle?.charAt(1).toUpperCase()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h1 className="text-6xl md:text-7xl font-heading font-black tracking-tighter text-white drop-shadow-2xl">
                  {creator.tiktokHandle}
                </h1>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-primary fill-primary/10" />
                  <Badge variant="outline" className={`rounded-full px-5 py-2 font-black uppercase tracking-widest text-[11px] border-white/10 ${getTierColor(creator.tier)}`}>
                    {creator.tier || 'Starter'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-muted-foreground font-bold uppercase tracking-[0.25em] text-[10px]">
                <div className="flex items-center gap-3 group cursor-default">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="group-hover:text-white transition-colors">{creator.country}</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                    <Zap className="w-3.5 h-3.5 text-primary fill-current" />
                  </div>
                  <span className="group-hover:text-white transition-colors">{creator.niche}</span>
                </div>
                <div className="flex items-center gap-3 group cursor-default">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-amber-500/10 transition-colors">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  </div>
                  <span className="text-white font-black">{creator.trustScore || 100} Trust Score</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 p-0 transition-all duration-300 hover:scale-110 active:scale-95"
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    toast.success('Profile link copied!');
                  }}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 p-0 transition-all duration-300 hover:scale-110 active:scale-95"
                  onClick={() => setShowQR(true)}
                >
                  <QrCode className="w-5 h-5" />
                </Button>
              </div>
              <Button className="h-14 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/20 font-black text-lg group transition-all duration-300 hover:scale-105 active:scale-95">
                Book Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Stats & Bio */}
          <div className="lg:col-span-2 space-y-12">
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-heading font-black mb-8 flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                Performance Metrics
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <Card className="fintech-card rounded-[2.5rem]">
                  <CardContent className="p-8">
                    <p className="text-muted-foreground text-[10px] uppercase tracking-[0.25em] font-black mb-3">Followers</p>
                    <p className="text-4xl font-heading font-black text-white">{(creator.followerCount / 1000).toFixed(1)}k</p>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-bold">
                      <TrendingUp className="w-3 h-3" />
                      <span>+12% this month</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="fintech-card rounded-[2.5rem]">
                  <CardContent className="p-8">
                    <p className="text-muted-foreground text-[10px] uppercase tracking-[0.25em] font-black mb-3">Avg Viewers</p>
                    <p className="text-4xl font-heading font-black text-white">{creator.avgViewers.toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2 text-primary text-[10px] font-bold">
                      <Users className="w-3 h-3" />
                      <span>Live Engagement</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="fintech-card rounded-[2.5rem]">
                  <CardContent className="p-8">
                    <p className="text-muted-foreground text-[10px] uppercase tracking-[0.25em] font-black mb-3">Success Rate</p>
                    <p className="text-4xl font-heading font-black text-primary text-glow">{Math.round((creator.discoverySignals?.successRate || 0.98) * 100)}%</p>
                    <div className="mt-4 flex items-center gap-2 text-primary/60 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Delivery</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-heading font-black mb-8 flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                About the Creator
              </h2>
              <div className="fintech-card rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Zap className="w-32 h-32 text-primary fill-current" />
                </div>
                <p className="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap font-medium relative z-10">
                  {creator.bio || "This creator hasn't added a bio yet, but they're ready to help you grow your brand during their TikTok Live sessions!"}
                </p>
                <div className="mt-10 flex items-center gap-4 relative z-10">
                  <Button variant="link" className="text-primary p-0 h-auto font-black text-lg group" render={
                    <a href={`https://tiktok.com/@${creator.tiktokHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-5 h-5 mr-3" />
                      View TikTok Profile
                      <ArrowRight className="ml-2 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </a>
                  } />
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-heading font-black mb-8 flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                Available Ad Formats
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {creator.adTypes?.map((type: string) => (
                  <Card key={type} className="fintech-card rounded-[2.5rem] group hover:scale-[1.02] active:scale-[0.98]">
                    <CardHeader className="p-8 pb-2">
                      <CardTitle className="text-2xl font-heading font-black capitalize group-hover:text-primary transition-colors flex items-center justify-between">
                        {type.replace('_', ' ')}
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Zap className="w-5 h-5 text-primary" />
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-2">
                      <p className="text-sm text-zinc-400 mb-8 font-medium leading-relaxed">
                        {type === 'physical_board' && "A high-quality physical board placed directly behind the creator during live sessions."}
                        {type === 'digital_overlay' && "A custom digital graphic overlay visible to all viewers during the live stream."}
                        {type === 'pin_comment' && "Your message pinned at the top of the live chat for maximum visibility and clicks."}
                        {type === 'shoutout' && "A verbal shoutout and call-to-action during the stream by the creator."}
                      </p>
                      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Starting at</span>
                          <span className="text-3xl font-heading font-black text-white">${creator.pricing?.[type] || 50}</span>
                        </div>
                        <Button size="sm" className="rounded-xl px-6 bg-primary text-white font-black hover:bg-primary/90 shadow-lg shadow-primary/20">Book</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Right Column: Booking Preview */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky top-24"
            >
              <Card className="fintech-card rounded-[3rem] overflow-hidden border-primary/20">
                <div className="h-2 bg-gradient-to-r from-primary to-purple-600" />
                <CardHeader className="p-10">
                  <CardTitle className="text-3xl font-heading font-black">Quick Reservation</CardTitle>
                </CardHeader>
                <CardContent className="p-10 pt-0 space-y-10">
                  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-8">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground font-black uppercase tracking-widest">Response</span>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-4 py-1.5 font-black text-[10px] glow-primary">
                        {creator.discoverySignals?.responseTime || '< 1h'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Calendar className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-xs text-muted-foreground font-black uppercase tracking-widest">Next Slot</span>
                      </div>
                      <span className="text-xs font-black text-white">Today, 8:00 PM</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button className="w-full h-16 rounded-2xl bg-primary text-white hover:bg-primary/90 font-black text-lg shadow-2xl shadow-primary/20 group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                      Reserve Ad Space
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button variant="outline" className="w-full h-16 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                      Message Creator
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 justify-center text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] text-center">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Secure Escrow Protection
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 p-10 bg-primary/5 border border-primary/10 rounded-[3rem] space-y-8 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                <h4 className="font-heading font-black text-primary text-xl flex items-center gap-4">
                  <Zap className="w-6 h-6 fill-current" />
                  Why book {creator.tiktokHandle}?
                </h4>
                <ul className="space-y-6 text-sm text-zinc-400 font-bold">
                  <li className="flex items-start gap-4 group/item">
                    <div className="w-6 h-6 rounded-xl bg-primary/20 flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-transform">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="group-hover/item:text-white transition-colors">High engagement in the {creator.niche} niche.</span>
                  </li>
                  <li className="flex items-start gap-4 group/item">
                    <div className="w-6 h-6 rounded-xl bg-primary/20 flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-transform">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="group-hover/item:text-white transition-colors">Fast response time and reliable delivery.</span>
                  </li>
                  <li className="flex items-start gap-4 group/item">
                    <div className="w-6 h-6 rounded-xl bg-primary/20 flex items-center justify-center mt-0.5 group-hover/item:scale-110 transition-transform">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="group-hover/item:text-white transition-colors">Verified {creator.tier} status.</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
