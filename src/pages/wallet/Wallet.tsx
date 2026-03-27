import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Wallet as WalletIcon, Coins, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { toast } from 'sonner';

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

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-zinc-400 mt-1">Manage your funds and AI credits.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cash Wallet */}
          <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <WalletIcon className="w-32 h-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-zinc-400 font-medium">Cash Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="text-5xl font-bold text-zinc-50">${profile?.cashBalance?.toFixed(2) || '0.00'}</div>
              <div className="flex gap-4">
                {role === 'advertiser' ? (
                  <Button onClick={handleFund} className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200 flex-1">
                    <ArrowDownLeft className="w-4 h-4 mr-2" /> Fund Wallet
                  </Button>
                ) : (
                  <Button onClick={handleWithdraw} className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200 flex-1">
                    <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Coin Wallet */}
          <Card className="bg-zinc-950 border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Coins className="w-32 h-32 text-blue-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-zinc-400 font-medium flex items-center gap-2">
                <Coins className="w-4 h-4 text-blue-400" /> AI Coins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="text-5xl font-bold text-zinc-50">{profile?.coinBalance || 0}</div>
              <Button onClick={handleBuyCoins} variant="outline" className="w-full border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300">
                Buy More Coins
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="bg-zinc-900 border-zinc-800">
            <TabsTrigger value="transactions" className="data-[state=active]:bg-zinc-800">Transactions</TabsTrigger>
            <TabsTrigger value="escrow" className="data-[state=active]:bg-zinc-800">In Escrow</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-0">
                <div className="p-8 text-center text-zinc-500">
                  No recent transactions.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="escrow" className="mt-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-0">
                <div className="p-8 text-center text-zinc-500">
                  No funds currently in escrow.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
