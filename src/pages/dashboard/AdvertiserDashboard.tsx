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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { doc, updateDoc, increment, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Sparkles, Users, Star, ArrowRight, Zap, Wallet, TrendingUp, Activity, Building, Plus, Send } from 'lucide-react';
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
  const [topUpAmount, setTopUpAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferEmail, setTransferEmail] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topUpAmount) return;
    setProcessing(true);
    try {
      const amount = parseFloat(topUpAmount);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        cashBalance: increment(amount)
      });

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'deposit',
        amount,
        currency: 'USD',
        status: 'completed',
        reference: 'Manual Top Up',
        createdAt: serverTimestamp()
      });

      toast.success(`Successfully topped up $${amount}`);
      setTopUpAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to top up');
    } finally {
      setProcessing(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !transferAmount || !transferEmail) return;
    if (transferEmail === user.email) {
      toast.error("You cannot transfer to yourself");
      return;
    }
    
    setProcessing(true);
    try {
      const amount = parseFloat(transferAmount);
      const commission = amount * 0.05; // 5% commission
      const totalDeduct = amount + commission;

      if ((profile?.cashBalance || 0) < totalDeduct) {
        throw new Error('Insufficient funds (including 5% commission)');
      }

      // Find recipient
      const recipientQuery = query(collection(db, 'users'), where('email', '==', transferEmail));
      const recipientSnap = await getDocs(recipientQuery);
      
      if (recipientSnap.empty) {
        throw new Error('Recipient not found');
      }

      const recipientDoc = recipientSnap.docs[0];
      const recipientId = recipientDoc.id;

      // Atomic-ish update (should use transaction but for simplicity here)
      const senderRef = doc(db, 'users', user.uid);
      const recipientRef = doc(db, 'users', recipientId);

      await updateDoc(senderRef, {
        cashBalance: increment(-totalDeduct)
      });

      await updateDoc(recipientRef, {
        cashBalance: increment(amount)
      });

      // Log transactions
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'payment',
        amount: -totalDeduct,
        currency: 'USD',
        status: 'completed',
        reference: `Transfer to ${transferEmail}`,
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, 'transactions'), {
        userId: recipientId,
        type: 'earning',
        amount: amount,
        currency: 'USD',
        status: 'completed',
        reference: `Transfer from ${user.email}`,
        createdAt: serverTimestamp()
      });

      toast.success(`Successfully transferred $${amount} to ${transferEmail}`);
      setTransferAmount('');
      setTransferEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Transfer failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveProof = async (booking: any) => {
    setProcessing(true);
    try {
      // 1. Update booking status
      await updateDoc(doc(db, 'bookings', booking.id), {
        status: 'completed',
        completedAt: serverTimestamp()
      });

      // 2. Add funds to creator
      const creatorRef = doc(db, 'users', booking.creatorId);
      await updateDoc(creatorRef, {
        cashBalance: increment(booking.price)
      });

      // 3. Log transaction for creator
      await addDoc(collection(db, 'transactions'), {
        userId: booking.creatorId,
        type: 'earning',
        amount: booking.price,
        currency: 'USD',
        status: 'completed',
        reference: `Campaign Completed: ${booking.adType} Ad`,
        createdAt: serverTimestamp()
      });

      toast.success('Proof approved and funds released to creator');
      
      // Update local state
      setCampaigns(campaigns.map(c => c.id === booking.id ? { ...c, status: 'completed' } : c));
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve proof');
    } finally {
      setProcessing(false);
    }
  };

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
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-heading bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent drop-shadow-2xl leading-none">
              Advertiser Terminal
            </h1>
            <p className="text-white/40 text-base font-medium tracking-tight">Manage your global ad inventory and discovery engine.</p>
          </div>
          <Link to="/marketplace">
            <Button className="rounded-full px-8 h-12 bg-primary text-white hover:bg-primary/90 shadow-[0_0_30px_rgba(59,130,246,0.3)] font-bold text-xs uppercase tracking-widest group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              Browse Global Creators
              <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
            </Button>
          </Link>
        </motion.div>
 
        <div className="grid gap-6 md:grid-cols-3">
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
              <Card className={`relative overflow-hidden group fintech-card ${stat.glow} border-white/5 bg-[#0f172a]/40 backdrop-blur-3xl p-6 rounded-2xl`}>
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-125 duration-700">
                  <stat.icon className="w-16 h-16" />
                </div>
                <div className="space-y-4 relative z-10">
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{stat.label}</p>
                  <div className={`text-4xl font-bold tracking-tight font-heading ${stat.color}`}>
                    <AnimatedNumber value={stat.value} prefix={stat.prefix} />
                  </div>
                  {stat.label === 'Liquidity' && (
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger render={<Button size="sm" variant="outline" className="h-7 px-3 rounded-full border-white/10 bg-white/5 text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all" />}>
                          <Plus className="w-3 h-3 mr-1" /> Top Up
                        </DialogTrigger>
                        <DialogContent className="bg-[#020617] border-white/10 text-white rounded-[2rem]">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-black font-heading tracking-tighter">Add Liquidity</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleTopUp} className="space-y-6 pt-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Amount (USD)</Label>
                              <Input 
                                type="number" 
                                value={topUpAmount} 
                                onChange={(e) => setTopUpAmount(e.target.value)}
                                placeholder="0.00"
                                className="h-14 rounded-xl bg-white/5 border-white/10 text-lg font-bold"
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-xl bg-primary font-black uppercase tracking-widest" disabled={processing}>
                              {processing ? 'Processing...' : 'Confirm Deposit'}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger render={<Button size="sm" variant="outline" className="h-7 px-3 rounded-full border-white/10 bg-white/5 text-[8px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all" />}>
                          <Send className="w-3 h-3 mr-1" /> Transfer
                        </DialogTrigger>
                        <DialogContent className="bg-[#020617] border-white/10 text-white rounded-[2rem]">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-black font-heading tracking-tighter">Transfer Funds</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleTransfer} className="space-y-6 pt-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Recipient Email</Label>
                              <Input 
                                type="email" 
                                value={transferEmail} 
                                onChange={(e) => setTransferEmail(e.target.value)}
                                placeholder="user@example.com"
                                className="h-14 rounded-xl bg-white/5 border-white/10 font-bold"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Amount (USD)</Label>
                              <Input 
                                type="number" 
                                value={transferAmount} 
                                onChange={(e) => setTransferAmount(e.target.value)}
                                placeholder="0.00"
                                className="h-14 rounded-xl bg-white/5 border-white/10 text-lg font-bold"
                                required
                              />
                              <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">A 5% commission will be applied to this transfer.</p>
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-xl bg-amber-500 hover:bg-amber-600 font-black uppercase tracking-widest" disabled={processing}>
                              {processing ? 'Processing...' : 'Send Funds'}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
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
 
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-heading flex items-center gap-3 tracking-tight text-white">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                AI Discovery Engine
              </h2>
              <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Proprietary matching based on historical performance</p>
            </div>
            <Link to="/marketplace" className="text-[9px] text-primary font-bold uppercase tracking-widest hover:text-white transition-colors group">
              Explore All <span className="group-hover:translate-x-2 inline-block transition-transform">→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedCreators.length === 0 ? (
              <Card className="md:col-span-3 p-20 text-center border-dashed border-white/10 bg-white/5 rounded-3xl">
                <Zap className="w-16 h-16 text-white/5 mx-auto mb-6" />
                <p className="text-white/40 text-lg font-medium">No recommendations available yet. Try updating your profile.</p>
              </Card>
            ) : (
              recommendedCreators.map((creator, i) => (
                <motion.div
                  key={creator.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="fintech-card hover:border-primary/50 transition-all group cursor-pointer h-full flex flex-col bg-[#0f172a]/40 backdrop-blur-3xl border-white/10 rounded-2xl overflow-hidden p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/30 transition-all duration-700 shadow-inner">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-white group-hover:text-primary transition-colors tracking-tight">@{creator.tiktokHandle}</h4>
                        <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{creator.niche}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-6 mt-auto">
                      <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                        <span className="text-white/40">Discovery Match</span>
                        <span className="text-primary glow-primary">{Math.round(creator.score)}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, creator.score)}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="bg-primary h-full glow-primary" 
                        />
                      </div>
                    </div>
 
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center text-amber-400 text-[9px] font-bold bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/20 glow-amber">
                        <Star className="w-3 h-3 fill-current mr-2" />
                        {creator.trustScore || 100}
                      </div>
                      <div className="text-[9px] text-white/40 font-bold uppercase tracking-widest">
                        {(creator.followerCount / 1000).toFixed(1)}k followers
                      </div>
                    </div>
 
                    <Link to={`/creator/${creator.userId}`}>
                      <Button className="w-full h-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-primary hover:text-white hover:border-primary transition-all duration-700 font-bold text-[9px] uppercase tracking-widest shadow-2xl">
                        View Terminal
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-500" />
                      </Button>
                    </Link>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
 
        <div className="space-y-8">
          <h2 className="text-2xl font-bold font-heading flex items-center gap-3 tracking-tight text-white">
            <Activity className="w-6 h-6 text-primary" />
            Recent Deployments
          </h2>
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <Card className="p-20 text-center border-dashed border-white/10 bg-white/5 rounded-3xl">
              <Building className="w-16 h-16 text-white/5 mx-auto mb-6" />
              <p className="text-white/40 text-lg font-medium">No deployments yet. Head to the marketplace to book your first ad!</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign, i) => (
                <motion.div 
                  key={campaign.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center justify-between p-6 bg-[#0f172a]/40 border border-white/10 rounded-2xl hover:bg-white/5 hover:border-primary/30 transition-all duration-700 shadow-2xl backdrop-blur-3xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-700 group-hover:bg-primary/20 shadow-inner">
                      <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <div className="flex items-center gap-4 mb-1.5">
                        <span className="font-bold text-xl tracking-tight text-white capitalize">{campaign.adType.replace('_', ' ')} Ad</span>
                        <Badge className="rounded-full bg-primary/10 text-primary border-primary/20 px-4 py-1 font-bold text-[9px] uppercase tracking-widest glow-primary">
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-white/40 font-bold text-[9px] uppercase tracking-widest">Price: <span className="text-primary">${campaign.price}</span></p>
                    </div>
                  </div>
                  
                  {campaign.status === 'proof_submitted' && (
                    <Button onClick={() => handleApproveProof(campaign)} className="rounded-full px-8 h-10 bg-primary text-white hover:bg-primary/90 shadow-[0_0_30px_rgba(59,130,246,0.3)] font-bold text-[9px] uppercase tracking-widest group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      Approve Proof
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
