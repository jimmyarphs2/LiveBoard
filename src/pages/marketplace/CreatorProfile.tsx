import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { logInteraction, InteractionType } from '../../services/discoveryService';
import { Star, MapPin, Clock, CheckCircle2, Zap, ShieldCheck, TrendingUp, Users, DollarSign, ArrowRight, Sparkles } from 'lucide-react';

export default function CreatorProfile() {
  const { id } = useParams();
  const { user, role } = useAuthStore();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  const [selectedAd, setSelectedAd] = useState('');

  useEffect(() => {
    const fetchCreator = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'creators', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCreator({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error('Creator not found');
          navigate('/marketplace');
        }
      } catch (error) {
        console.error('Error fetching creator:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCreator();
  }, [id, navigate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !creator || !selectedAd) return;
    
    setBookingLoading(true);
    try {
      const price = creator.pricing[selectedAd];
      
      const bookingData = {
        advertiserId: user.uid,
        creatorId: creator.userId,
        adType: selectedAd,
        price,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      
      // Log interaction for discovery engine
      await logInteraction(user.uid, creator.id, InteractionType.BOOKING);
      
      toast.success('Booking request sent successfully!');
      navigate('/dashboard/advertiser');
    } catch (error: any) {
      toast.error(error.message || 'Failed to book ad space');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!creator) return null;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10 relative">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-[#0f172a]/40 backdrop-blur-3xl shadow-2xl group"
        >
          <div className="h-72 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.2),transparent)]" />
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, 50, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"
            />
            <div className="absolute top-8 right-8 flex gap-4">
              <Badge className="bg-primary text-white border-none shadow-xl shadow-primary/40 rounded-full px-5 py-2 font-black uppercase tracking-[0.2em] text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 mr-2 fill-current" />
                Verified Creator
              </Badge>
              <Badge className="bg-amber-500 text-white border-none shadow-xl shadow-amber-500/40 rounded-full px-5 py-2 font-black uppercase tracking-[0.2em] text-[10px]">
                <Star className="w-3.5 h-3.5 mr-2 fill-current" />
                Top Rated
              </Badge>
            </div>
          </div>
          
          <div className="px-12 pb-12 relative">
            <div className="absolute -top-24 left-12 w-48 h-48 bg-[#020617] rounded-[3rem] border-[12px] border-[#020617] flex items-center justify-center shadow-2xl overflow-hidden group/avatar">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover/avatar:scale-110 transition-transform duration-700">
                <span className="text-7xl font-black text-primary drop-shadow-2xl">{creator.tiktokHandle?.charAt(1).toUpperCase() || 'C'}</span>
              </div>
            </div>
            
            <div className="pt-28 flex flex-col md:flex-row md:items-end justify-between gap-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <h1 className="text-6xl font-black text-white tracking-tighter font-heading drop-shadow-2xl">{creator.tiktokHandle}</h1>
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-8 text-white/50 font-black uppercase tracking-[0.2em] text-xs">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {creator.niche}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    {creator.country}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Now
                  </div>
                </div>
              </div>
              
              {role === 'advertiser' && (
                <Dialog>
                  <DialogTrigger render={<Button size="lg" className="h-20 px-12 rounded-full bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/30 font-black text-xl uppercase tracking-widest group">
                      Book Campaign
                      <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </Button>} />
                  <DialogContent className="bg-[#020617] border-white/10 text-white sm:max-w-lg rounded-[3rem] p-10 backdrop-blur-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-4xl font-black font-heading tracking-tighter mb-6">Book {creator.tiktokHandle}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBook} className="space-y-10 pt-4">
                      <div className="space-y-5">
                        <Label className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-2">Select Ad Format</Label>
                        <Select value={selectedAd} onValueChange={setSelectedAd} required>
                          <SelectTrigger className="h-16 rounded-[1.5rem] bg-white/5 border-white/10 focus:ring-primary/20 text-lg font-bold">
                            <SelectValue placeholder="Choose campaign format" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#020617] border-white/10 text-white rounded-[1.5rem] p-2">
                            {creator.adTypes?.map((type: string) => (
                              <SelectItem key={type} value={type} className="capitalize rounded-xl focus:bg-primary/20 focus:text-primary py-3 px-4 font-bold">
                                {type.replace('_', ' ')} — ${creator.pricing[type]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 space-y-5 shadow-2xl">
                        <div className="flex justify-between text-sm font-black">
                          <span className="text-white/40 uppercase tracking-[0.2em]">Campaign Subtotal</span>
                          <span className="text-white">${selectedAd ? creator.pricing[selectedAd] : 0}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black">
                          <span className="text-white/40 uppercase tracking-[0.2em]">Platform Fee (15%)</span>
                          <span className="text-white">${selectedAd ? (creator.pricing[selectedAd] * 0.15).toFixed(2) : 0}</span>
                        </div>
                        <div className="h-px bg-white/10 my-6"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-black text-white uppercase tracking-[0.2em]">Total Amount</span>
                          <span className="text-4xl font-black text-primary drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">${selectedAd ? (creator.pricing[selectedAd] * 1.15).toFixed(2) : 0}</span>
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-20 rounded-full bg-primary text-white hover:bg-primary/90 font-black text-xl uppercase tracking-widest shadow-2xl shadow-primary/30" disabled={!selectedAd || bookingLoading}>
                        {bookingLoading ? 'Processing Secure Payment...' : 'Confirm & Pay Securely'}
                      </Button>
                      <div className="flex items-center justify-center gap-2 text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Secure Escrow Protection Enabled
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-10 relative z-10">
          <div className="lg:col-span-2 space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="rounded-[3rem] shadow-2xl fintech-card border-white/10 bg-[#0f172a]/40 backdrop-blur-3xl">
                <CardHeader className="px-12 pt-12">
                  <CardTitle className="text-3xl font-black font-heading flex items-center gap-4 tracking-tighter text-white">
                    <TrendingUp className="w-8 h-8 text-primary" />
                    Creator Bio & Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-12 pb-12">
                  <p className="text-white/60 text-xl leading-relaxed whitespace-pre-wrap font-medium">
                    {creator.bio || "This creator hasn't added a bio yet. They specialize in high-engagement content and authentic audience connection."}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="rounded-[3rem] shadow-2xl fintech-card border-white/10 bg-[#0f172a]/40 backdrop-blur-3xl">
                <CardHeader className="px-12 pt-12">
                  <CardTitle className="text-3xl font-black font-heading flex items-center gap-4 tracking-tighter text-white">
                    <DollarSign className="w-8 h-8 text-primary" />
                    Campaign Packages
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-12 pb-12">
                  <div className="grid sm:grid-cols-2 gap-8">
                    {creator.adTypes?.map((type: string) => (
                      <div key={type} className="p-10 rounded-[2.5rem] border border-white/10 bg-white/5 flex flex-col gap-6 hover:border-primary/50 transition-all group shadow-xl hover:bg-white/10">
                        <div className="flex justify-between items-center">
                          <span className="capitalize font-black text-2xl text-white group-hover:text-primary transition-colors">{type.replace('_', ' ')}</span>
                          <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">Popular</Badge>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-white tracking-tighter">${creator.pricing[type]}</span>
                          <span className="text-white/40 text-sm font-black uppercase tracking-widest">/ campaign</span>
                        </div>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">Includes full production, editing, and 30-day usage rights.</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="rounded-[3rem] shadow-2xl overflow-hidden fintech-card border-white/10 bg-[#0f172a]/40 backdrop-blur-3xl">
                <div className="h-3 bg-primary glow-primary" />
                <CardHeader className="px-12 pt-12">
                  <CardTitle className="text-3xl font-black font-heading flex items-center gap-4 tracking-tighter text-white">
                    <Users className="w-8 h-8 text-primary" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-12 pb-12 space-y-12">
                  <div className="space-y-4">
                    <p className="text-xs text-white/40 font-black uppercase tracking-[0.2em]">Total Followers</p>
                    <p className="text-5xl font-black text-white tracking-tighter">{(creator.followerCount / 1000).toFixed(1)}k</p>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        className="h-full bg-primary glow-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-xs text-white/40 font-black uppercase tracking-[0.2em]">Avg. Live Viewers</p>
                    <p className="text-5xl font-black text-white tracking-tighter">{creator.avgViewers.toLocaleString()}</p>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '70%' }}
                        className="h-full bg-primary glow-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <p className="text-xs text-white/40 font-black uppercase tracking-[0.2em]">Trust & Reliability</p>
                    <div className="flex items-center justify-between p-8 rounded-[2rem] bg-white/5 border border-white/10 shadow-xl">
                      <div>
                        <p className="text-5xl font-black text-primary tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{creator.trustScore || 100}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mt-2">Global Score</p>
                      </div>
                      <Badge className="bg-primary/20 text-primary border-primary/30 rounded-full px-5 py-2 font-black text-[10px] uppercase tracking-widest glow-primary">
                        EXCELLENT
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-6 p-8 rounded-[2rem] bg-primary/5 border border-primary/10 shadow-inner">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center shadow-lg">
                        <Zap className="w-8 h-8 text-primary fill-current" />
                      </div>
                      <div>
                        <p className="text-white font-black text-lg">High Response Rate</p>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Typically replies in &lt; 1 hour</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
