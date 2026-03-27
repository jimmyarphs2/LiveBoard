import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Wallet as WalletIcon, Coins, ArrowUpRight, ArrowDownLeft, ShieldCheck, Zap, History, CreditCard, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Wallet() {
  const { profile, role } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleFund = () => {
    toast.info('Paystack integration would open here.');
  };

  const handleWithdraw = () => {
    toast.info('Withdrawal request submitted.');
  };

  const handleBuyCoins = () => {
    toast.info('Purchasing AI Coins...');
  };

  const [activeTab, setActiveTab] = useState('transactions');

  return (
    <DashboardLayout>
      <div className="space-y-16 max-w-7xl mx-auto relative pb-20">
        {/* Background Glows */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-10 relative z-10"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-1 w-24 bg-primary rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
              <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Capital Management System</p>
            </div>
            <h1 className="text-8xl font-black tracking-tighter font-heading drop-shadow-2xl text-white leading-none">
              Financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-500">Terminal</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-8 py-4 font-black text-[11px] uppercase tracking-[0.2em] glow-primary backdrop-blur-xl">
              <ShieldCheck className="w-4 h-4 mr-3" />
              Secure Node Active
            </Badge>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer shadow-2xl"
            >
              <Zap className="w-6 h-6 text-amber-500 fill-current animate-pulse" />
            </motion.div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 relative z-10">
          {/* Cash Wallet */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            <Card className="rounded-[4rem] shadow-2xl fintech-card border-white/10 bg-[#0f172a]/40 backdrop-blur-3xl relative overflow-hidden group h-full border-t-primary/20">
              <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
                <WalletIcon className="w-80 h-80 group-hover:scale-110 transition-transform duration-1000 text-white" />
              </div>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              
              <CardHeader className="p-16 pb-4">
                <CardTitle className="text-white/40 font-black uppercase tracking-[0.5em] text-[11px] flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  Available Liquidity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-16 pt-0 space-y-16 relative z-10">
                <div className="space-y-4">
                  <div className="text-9xl font-black text-white tracking-tighter font-heading drop-shadow-2xl flex items-start">
                    <span className="text-5xl text-primary mt-4 mr-3 font-black">$</span>
                    {profile?.cashBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +2.4% yield
                    </Badge>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Last sync: Just now</p>
                  </div>
                </div>
                
                <div className="flex gap-8">
                  {role === 'advertiser' ? (
                    <Button onClick={handleFund} className="h-24 rounded-[2rem] bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/40 font-black text-2xl uppercase tracking-widest flex-1 group/btn transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]">
                      <ArrowDownLeft className="w-8 h-8 mr-4 group-hover/btn:translate-y-2 transition-transform duration-500" /> Fund Account
                    </Button>
                  ) : (
                    <Button onClick={handleWithdraw} className="h-24 rounded-[2rem] bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/40 font-black text-2xl uppercase tracking-widest flex-1 group/btn transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]">
                      <ArrowUpRight className="w-8 h-8 mr-4 group-hover/btn:-translate-y-2 transition-transform duration-500" /> Withdraw
                    </Button>
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
            <Card className="rounded-[4rem] shadow-2xl fintech-card border-white/10 bg-[#0f172a]/40 backdrop-blur-3xl relative overflow-hidden group h-full border-t-amber-500/20">
              <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
                <Coins className="w-80 h-80 text-amber-500 group-hover:scale-110 transition-transform duration-1000" />
              </div>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

              <CardHeader className="p-16 pb-4">
                <CardTitle className="text-white/40 font-black uppercase tracking-[0.5em] text-[11px] flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-500" />
                  </div>
                  AI Processing Credits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-16 pt-0 space-y-16 relative z-10">
                <div className="space-y-4">
                  <div className="text-9xl font-black text-white tracking-tighter font-heading drop-shadow-2xl flex items-center">
                    {profile?.coinBalance?.toLocaleString() || 0}
                    <span className="text-5xl text-amber-500 ml-4 animate-pulse">⚡</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">
                      Global Network Credits
                    </Badge>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Real-time balance</p>
                  </div>
                </div>
                
                <Button onClick={handleBuyCoins} variant="outline" className="h-24 rounded-[2rem] border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-2xl uppercase tracking-widest w-full shadow-xl group/btn transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]">
                  Top Up Credits
                  <ArrowRight className="ml-4 w-8 h-8 group-hover/btn:translate-x-3 transition-transform duration-500" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <TabsList className="h-24 p-2 bg-[#020617]/60 border border-white/10 rounded-[3rem] backdrop-blur-3xl shadow-2xl">
              <TabsTrigger value="transactions" className="rounded-[2.5rem] px-16 font-black uppercase tracking-[0.2em] text-[11px] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/40 transition-all duration-500 flex items-center gap-4 h-full">
                <History className="w-5 h-5" />
                History
              </TabsTrigger>
              <TabsTrigger value="escrow" className="rounded-[2.5rem] px-16 font-black uppercase tracking-[0.2em] text-[11px] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/40 transition-all duration-500 flex items-center gap-4 h-full">
                <ShieldCheck className="w-5 h-5" />
                Escrow
              </TabsTrigger>
            </TabsList>
            
            <Button variant="ghost" className="text-white/40 hover:text-white font-black uppercase tracking-[0.3em] text-[11px] hover:bg-white/5 rounded-2xl px-8 h-16 transition-all">
              Export Statement (PDF)
            </Button>
          </div>
          
          <AnimatePresence mode="wait">
            <TabsContent value="transactions" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="rounded-[4rem] shadow-2xl fintech-card border-dashed border-white/10 bg-[#0f172a]/20 backdrop-blur-xl">
                  <CardContent className="p-40 flex flex-col items-center justify-center text-center space-y-10">
                    <div className="w-40 h-40 rounded-[3rem] bg-white/5 flex items-center justify-center shadow-inner border border-white/5 relative group">
                      <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <History className="w-16 h-16 text-white/10 relative z-10" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-4xl font-black text-white font-heading tracking-tight">No Transactions Detected</h3>
                      <p className="text-white/40 max-w-lg mx-auto font-medium text-xl leading-relaxed">Your financial ledger is currently empty. Start a campaign or book a creator to see activity.</p>
                    </div>
                    <Button variant="outline" className="rounded-full border-white/10 text-white font-black uppercase tracking-widest px-12 h-16 hover:bg-white/5 transition-all">
                      Refresh Ledger
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="escrow" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="rounded-[4rem] shadow-2xl fintech-card border-dashed border-white/10 bg-[#0f172a]/20 backdrop-blur-xl">
                  <CardContent className="p-40 flex flex-col items-center justify-center text-center space-y-10">
                    <div className="w-40 h-40 rounded-[3rem] bg-white/5 flex items-center justify-center shadow-inner border border-white/5 relative group">
                      <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <ShieldCheck className="w-16 h-16 text-white/10 relative z-10" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-4xl font-black text-white font-heading tracking-tight">Escrow Vault Empty</h3>
                      <p className="text-white/40 max-w-lg mx-auto font-medium text-xl leading-relaxed">Funds are locked securely in our smart-contract escrow during active bookings to ensure trust.</p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-primary font-black uppercase tracking-[0.3em] bg-primary/10 px-8 py-4 rounded-full border border-primary/20 shadow-2xl shadow-primary/10">
                      <Zap className="w-4 h-4 fill-current animate-pulse" />
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
