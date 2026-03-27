import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Wallet as WalletIcon, Coins, ArrowUpRight, ArrowDownLeft, ShieldCheck, Zap, History, CreditCard, ArrowRight, Plus, Send, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, increment, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Wallet() {
  const { user, profile, role } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferEmail, setTransferEmail] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
    });

    return () => unsubscribe();
  }, [user]);

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

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !withdrawAmount) return;
    setProcessing(true);
    try {
      const amount = parseFloat(withdrawAmount);
      if ((profile?.cashBalance || 0) < amount) {
        throw new Error('Insufficient funds');
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        cashBalance: increment(-amount)
      });

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'withdrawal',
        amount: -amount,
        currency: 'USD',
        status: 'pending',
        reference: 'Withdrawal Request',
        createdAt: serverTimestamp()
      });

      toast.success(`Withdrawal request for $${amount} submitted`);
      setWithdrawAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Withdrawal failed');
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

      const recipientQuery = query(collection(db, 'users'), where('email', '==', transferEmail));
      const recipientSnap = await getDocs(recipientQuery);
      
      if (recipientSnap.empty) {
        throw new Error('Recipient not found');
      }

      const recipientDoc = recipientSnap.docs[0];
      const recipientId = recipientDoc.id;

      const senderRef = doc(db, 'users', user.uid);
      const recipientRef = doc(db, 'users', recipientId);

      await updateDoc(senderRef, {
        cashBalance: increment(-totalDeduct)
      });

      await updateDoc(recipientRef, {
        cashBalance: increment(amount)
      });

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

  const handleBuyCoins = () => {
    toast.info('AI Coin purchasing is currently being optimized.');
  };

  const [activeTab, setActiveTab] = useState('transactions');

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto relative pb-10">
        {/* Background Glows */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-8 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <p className="text-primary font-black uppercase tracking-[0.4em] text-[8px]">Capital Management System</p>
            </div>
            <h1 className="text-3xl font-black tracking-tighter font-heading drop-shadow-2xl text-white leading-none">
              Financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-500">Terminal</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-3 py-1.5 font-black text-[8px] uppercase tracking-[0.2em] glow-primary backdrop-blur-xl">
              <ShieldCheck className="w-3 h-3 mr-1.5" />
              Secure Node Active
            </Badge>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer shadow-2xl"
            >
              <Zap className="w-3 h-3 text-amber-500 fill-current animate-pulse" />
            </motion.div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 relative z-10">
          {/* Cash Wallet */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            <Card className="rounded-2xl shadow-2xl fintech-card border-white/10 bg-[#0f172a]/40 backdrop-blur-3xl relative overflow-hidden group h-full border-t-primary/20">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
                <WalletIcon className="w-32 h-32 group-hover:scale-110 transition-transform duration-1000 text-white" />
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-white/40 font-black uppercase tracking-[0.5em] text-[8px] flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-3 h-3 text-primary" />
                  </div>
                  Available Liquidity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6 relative z-10">
                <div className="space-y-1">
                  <div className="text-4xl font-black text-white tracking-tighter font-heading drop-shadow-2xl flex items-start">
                    <span className="text-lg text-primary mt-1 mr-1.5 font-black">$</span>
                    {profile?.cashBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded-full px-2 py-0.5 font-black text-[8px] uppercase tracking-widest flex items-center gap-1">
                      <ArrowUpRight className="w-2.5 h-2.5" />
                      +2.4% yield
                    </Badge>
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Last sync: Just now</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Dialog>
                    <DialogTrigger render={<Button className="h-10 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/40 font-black text-[10px] uppercase tracking-widest flex-1 group/btn transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]" />}>
                      <Plus className="w-4 h-4 mr-2" /> {role === 'advertiser' ? 'Fund Account' : 'Top Up'}
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
                    <DialogTrigger render={<Button variant="outline" className="h-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest flex-1 group/btn transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]" />}>
                      <Send className="w-4 h-4 mr-2" /> Transfer
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

                  {role === 'creator' && (
                    <Dialog>
                      <DialogTrigger render={<Button variant="outline" className="h-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest flex-1 group/btn transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]" />}>
                        <Landmark className="w-4 h-4 mr-2" /> Withdraw
                      </DialogTrigger>
                      <DialogContent className="bg-[#020617] border-white/10 text-white rounded-[2rem]">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black font-heading tracking-tighter">Withdraw Funds</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleWithdraw} className="space-y-6 pt-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Amount (USD)</Label>
                            <Input 
                              type="number" 
                              value={withdrawAmount} 
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              placeholder="0.00"
                              className="h-14 rounded-xl bg-white/5 border-white/10 text-lg font-bold"
                              required
                            />
                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Available: ${profile?.cashBalance?.toFixed(2) || '0.00'}</p>
                          </div>
                          <Button type="submit" className="w-full h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-black uppercase tracking-widest" disabled={processing}>
                            {processing ? 'Processing...' : 'Request Withdrawal'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Coin Wallet */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Card className="rounded-2xl shadow-2xl fintech-card border-white/10 bg-[#0f172a]/40 backdrop-blur-3xl relative overflow-hidden group h-full border-t-amber-500/20">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
                <Coins className="w-32 h-32 text-amber-500 group-hover:scale-110 transition-transform duration-1000" />
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-white/40 font-black uppercase tracking-[0.5em] text-[8px] flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-amber-500" />
                  </div>
                  AI Processing Credits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6 relative z-10">
                <div className="space-y-1">
                  <div className="text-4xl font-black text-white tracking-tighter font-heading drop-shadow-2xl flex items-center">
                    {profile?.coinBalance?.toLocaleString() || 0}
                    <span className="text-xl text-amber-500 ml-2 animate-pulse">⚡</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 rounded-full px-2 py-0.5 font-black text-[8px] uppercase tracking-widest">
                      Global Network Credits
                    </Badge>
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Real-time balance</p>
                  </div>
                </div>
                
                <Button onClick={handleBuyCoins} variant="outline" className="h-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest w-full shadow-xl group/btn transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]">
                  Top Up Credits
                  <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-2 transition-transform duration-500" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <TabsList className="h-10 p-1 bg-[#020617]/60 border border-white/10 rounded-xl backdrop-blur-3xl shadow-2xl">
              <TabsTrigger value="transactions" className="rounded-lg px-6 font-black uppercase tracking-[0.2em] text-[9px] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/40 transition-all duration-500 flex items-center gap-2 h-full">
                <History className="w-3.5 h-3.5" />
                History
              </TabsTrigger>
              <TabsTrigger value="escrow" className="rounded-lg px-6 font-black uppercase tracking-[0.2em] text-[9px] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/40 transition-all duration-500 flex items-center gap-2 h-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Escrow
              </TabsTrigger>
            </TabsList>
            
            <Button variant="ghost" className="text-white/40 hover:text-white font-black uppercase tracking-[0.3em] text-[9px] hover:bg-white/5 rounded-lg px-4 h-8 transition-all">
              Export Statement (PDF)
            </Button>
          </div>
          
          <AnimatePresence mode="wait">
            <TabsContent value="transactions" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {transactions.length === 0 ? (
                  <Card className="rounded-2xl shadow-2xl fintech-card border-dashed border-white/10 bg-[#0f172a]/20 backdrop-blur-xl">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center shadow-inner border border-white/5 relative group">
                        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <History className="w-6 h-6 text-white/10 relative z-10" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-white font-heading tracking-tight">No Transactions Detected</h3>
                        <p className="text-white/40 max-w-md mx-auto font-medium text-xs leading-relaxed">Your financial ledger is currently empty. Start a campaign or book a creator to see activity.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <Card key={tx.id} className="rounded-xl border-white/5 bg-white/5 p-4 flex items-center justify-between group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white capitalize">{tx.type} — {tx.reference}</p>
                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">
                              {tx.createdAt?.toDate().toLocaleDateString()} • {tx.status}
                            </p>
                          </div>
                        </div>
                        <div className={`text-lg font-black ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="escrow" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="rounded-2xl shadow-2xl fintech-card border-dashed border-white/10 bg-[#0f172a]/20 backdrop-blur-xl">
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center shadow-inner border border-white/5 relative group">
                      <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <ShieldCheck className="w-6 h-6 text-white/10 relative z-10" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-white font-heading tracking-tight">Escrow Vault Empty</h3>
                      <p className="text-white/40 max-w-md mx-auto font-medium text-xs leading-relaxed">Funds are locked securely in our smart-contract escrow during active bookings to ensure trust.</p>
                    </div>
                    <div className="flex items-center gap-2 text-[8px] text-primary font-black uppercase tracking-[0.3em] bg-primary/10 px-4 py-2 rounded-full border border-primary/20 shadow-2xl shadow-primary/10">
                      <Zap className="w-3 h-3 fill-current animate-pulse" />
                      Powered by SecureNode™ Technology
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
