import { useEffect, useState } from 'react';
import { collection, query, getDocs, where, orderBy, limit, doc, updateDoc, increment, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Users, Store, AlertTriangle, DollarSign, ShieldAlert, History, UserCog, CheckCircle2, XCircle, Search, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    creators: 0,
    advertisers: 0,
    activeBookings: 0,
    totalGMV: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [marketplace, setMarketplace] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [safetyLogs, setSafetyLogs] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [creatorsSnap, advertisersSnap, bookingsSnap, usersSnap, txSnap, safetySnap, marketplaceSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'creator'))),
        getDocs(query(collection(db, 'users'), where('role', '==', 'advertiser'))),
        getDocs(collection(db, 'bookings')),
        getDocs(query(collection(db, 'users'), limit(50))),
        getDocs(query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(50))),
        getDocs(query(collection(db, 'safety_logs'), orderBy('timestamp', 'desc'), limit(50))),
        getDocs(query(collection(db, 'creators'), limit(50)))
      ]);

      const bookings = bookingsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      const users = usersSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      const txs = txSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      const logs = safetySnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      const marketplaceItems = marketplaceSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      
      setStats({
        creators: creatorsSnap.size,
        advertisers: advertisersSnap.size,
        activeBookings: bookings.filter(b => b.status === 'active' || b.status === 'accepted').length,
        totalGMV: bookings.reduce((acc, curr) => acc + (curr.price || 0), 0)
      });

      setRecentBookings(bookings.sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis()).slice(0, 10));
      setAllUsers(users);
      setMarketplace(marketplaceItems);
      setTransactions(txs);
      setSafetyLogs(logs);
      setDisputes(bookings.filter(b => b.status === 'disputed'));
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateUser = async (userId: string, data: any) => {
    setProcessing(true);
    try {
      await updateDoc(doc(db, 'users', userId), data);
      toast.success('User updated successfully');
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleAdjustBalance = async (userId: string, currentBalance: number) => {
    if (!adjustAmount) return;
    setProcessing(true);
    try {
      const amount = parseFloat(adjustAmount);
      await updateDoc(doc(db, 'users', userId), {
        cashBalance: increment(amount)
      });
      
      await addDoc(collection(db, 'transactions'), {
        userId,
        type: 'adjustment',
        amount,
        currency: 'USD',
        status: 'completed',
        reference: 'Admin Balance Adjustment',
        createdAt: serverTimestamp()
      });

      toast.success(`Adjusted balance by $${amount}`);
      setAdjustAmount('');
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || 'Adjustment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdrawalAction = async (tx: any, action: 'approve' | 'decline') => {
    setProcessing(true);
    try {
      const txRef = doc(db, 'transactions', tx.id);
      if (action === 'approve') {
        await updateDoc(txRef, { status: 'completed' });
        toast.success('Withdrawal approved');
      } else {
        // Refund the user if declined
        const userRef = doc(db, 'users', tx.userId);
        await updateDoc(userRef, {
          cashBalance: increment(Math.abs(tx.amount))
        });
        await updateDoc(txRef, { status: 'declined' });
        toast.success('Withdrawal declined and funds refunded');
      }
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleResolveDispute = async (bookingId: string, resolution: 'creator' | 'advertiser') => {
    setProcessing(true);
    try {
      // In a real app, this would involve complex logic to move funds
      // For now, we just mark it resolved
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'resolved',
        resolution
      });
      toast.success(`Dispute resolved in favor of ${resolution}`);
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || 'Resolution failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleVerification = async (id: string, currentStatus: boolean) => {
    setProcessing(true);
    try {
      await updateDoc(doc(db, 'creators', id), {
        isVerified: !currentStatus
      });
      toast.success(`Creator ${!currentStatus ? 'verified' : 'unverified'}`);
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update verification status');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    setProcessing(true);
    try {
      await deleteDoc(doc(db, 'creators', id));
      toast.success('Listing deleted successfully');
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete listing');
    } finally {
      setProcessing(false);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight font-heading">PLATFORM COMMAND CENTER</h1>
            <p className="text-zinc-400 text-sm mt-1">Full administrative control over users, finance, and safety.</p>
          </div>
          <Button onClick={fetchAdminData} disabled={loading} variant="outline" className="border-zinc-800 bg-zinc-900/50 text-xs font-bold uppercase tracking-widest h-9">
            Refresh Data
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-zinc-900 border-zinc-800 p-1 h-11 mb-6">
            <TabsTrigger value="overview" className="text-[10px] font-black uppercase tracking-widest px-6 data-[state=active]:bg-zinc-800">Overview</TabsTrigger>
            <TabsTrigger value="users" className="text-[10px] font-black uppercase tracking-widest px-6 data-[state=active]:bg-zinc-800">Users</TabsTrigger>
            <TabsTrigger value="transactions" className="text-[10px] font-black uppercase tracking-widest px-6 data-[state=active]:bg-zinc-800">Transactions</TabsTrigger>
            <TabsTrigger value="marketplace" className="text-[10px] font-black uppercase tracking-widest px-6 data-[state=active]:bg-zinc-800">Marketplace</TabsTrigger>
            <TabsTrigger value="safety" className="text-[10px] font-black uppercase tracking-widest px-6 data-[state=active]:bg-zinc-800">Safety Logs</TabsTrigger>
            <TabsTrigger value="disputes" className="text-[10px] font-black uppercase tracking-widest px-6 data-[state=active]:bg-zinc-800 flex items-center gap-2">
              Disputes
              {disputes.length > 0 && <Badge className="bg-red-500 text-white text-[8px] h-4 min-w-[16px] px-1 flex items-center justify-center">{disputes.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-3 md:grid-cols-4">
              <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total GMV</CardTitle>
                  <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                </CardHeader>
                <CardContent className="pb-4 px-4">
                  <div className="text-xl font-bold text-zinc-50 tracking-tight">${stats.totalGMV.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Active Creators</CardTitle>
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                </CardHeader>
                <CardContent className="pb-4 px-4">
                  <div className="text-xl font-bold text-zinc-50 tracking-tight">{stats.creators}</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Advertisers</CardTitle>
                  <Store className="w-3.5 h-3.5 text-zinc-500" />
                </CardHeader>
                <CardContent className="pb-4 px-4">
                  <div className="text-xl font-bold text-zinc-50 tracking-tight">{stats.advertisers}</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Active Bookings</CardTitle>
                  <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" />
                </CardHeader>
                <CardContent className="pb-4 px-4">
                  <div className="text-xl font-bold text-zinc-50 tracking-tight">{stats.activeBookings}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-zinc-800/50">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-50">Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="text-zinc-500 text-center py-12 text-sm">Loading data...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10 px-6">ID</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Type</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Price</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Status</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10 text-right px-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentBookings.map((booking) => (
                        <TableRow key={booking.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                          <TableCell className="font-mono text-[10px] text-zinc-500 px-6 py-3">{booking.id.slice(0, 8)}</TableCell>
                          <TableCell className="capitalize text-xs font-medium text-zinc-300 py-3">{booking.adType}</TableCell>
                          <TableCell className="text-xs font-bold text-zinc-100 py-3">${booking.price}</TableCell>
                          <TableCell className="py-3">
                            <Badge variant="outline" className="border-zinc-800 bg-zinc-900/50 text-[10px] font-bold text-zinc-400 capitalize px-2 py-0 h-5">
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right px-6 py-3">
                            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-50 h-7">View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {recentBookings.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-zinc-500 py-12 text-sm">No bookings found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2">
              <Search className="w-4 h-4 text-zinc-500" />
              <Input 
                placeholder="Search users by email or name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-sm focus-visible:ring-0 h-8"
              />
            </div>

            <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10 px-6">User</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Role</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Balance</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Status</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10 text-right px-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                        <TableCell className="px-6 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-zinc-100">{user.displayName || 'Anonymous'}</span>
                            <span className="text-[10px] text-zinc-500">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge className="bg-zinc-800 text-zinc-400 text-[9px] uppercase tracking-widest font-black h-5">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-zinc-100 py-3">${user.cashBalance?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell className="py-3">
                          <Badge variant="outline" className={`text-[9px] uppercase tracking-widest font-black h-5 ${user.status === 'active' ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400'}`}>
                            {user.status || 'active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-6 py-3 space-x-2">
                          <Dialog>
                            <DialogTrigger>
                              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-50 h-7">
                                <UserCog className="w-3 h-3 mr-1.5" /> Manage
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-black font-heading tracking-tighter">Manage User: {user.displayName}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6 py-4">
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Account Status</Label>
                                  <Select 
                                    defaultValue={user.status || 'active'} 
                                    onValueChange={(val) => handleUpdateUser(user.id, { status: val })}
                                  >
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800 h-10">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="suspended">Suspended</SelectItem>
                                      <SelectItem value="banned">Banned</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Adjust Balance (USD)</Label>
                                  <div className="flex gap-2">
                                    <Input 
                                      type="number" 
                                      placeholder="+/- 0.00" 
                                      value={adjustAmount}
                                      onChange={(e) => setAdjustAmount(e.target.value)}
                                      className="bg-zinc-900 border-zinc-800 h-10"
                                    />
                                    <Button 
                                      onClick={() => handleAdjustBalance(user.id, user.cashBalance || 0)}
                                      disabled={processing || !adjustAmount}
                                      className="bg-primary text-white font-black uppercase tracking-widest text-[10px]"
                                    >
                                      Apply
                                    </Button>
                                  </div>
                                  <p className="text-[9px] text-zinc-500 italic">Enter negative values to deduct funds.</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10 px-6">Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Type</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Amount</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Reference</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Status</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10 text-right px-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                        <TableCell className="text-[10px] text-zinc-500 px-6 py-3">
                          {tx.createdAt?.toDate().toLocaleDateString()}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge className={`text-[9px] uppercase tracking-widest font-black h-5 ${
                            tx.type === 'withdrawal' ? 'bg-amber-500/10 text-amber-400' :
                            tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-xs font-bold py-3 ${tx.amount > 0 ? 'text-emerald-400' : 'text-zinc-100'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-[10px] text-zinc-400 py-3">{tx.reference}</TableCell>
                        <TableCell className="py-3">
                          <Badge variant="outline" className={`text-[9px] uppercase tracking-widest font-black h-5 ${
                            tx.status === 'completed' ? 'border-emerald-500/50 text-emerald-400' :
                            tx.status === 'pending' ? 'border-amber-500/50 text-amber-400 animate-pulse' :
                            'border-zinc-800 text-zinc-500'
                          }`}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-6 py-3">
                          {tx.type === 'withdrawal' && tx.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleWithdrawalAction(tx, 'approve')}
                                disabled={processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 w-7 p-0 rounded-lg"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => handleWithdrawalAction(tx, 'decline')}
                                disabled={processing}
                                className="bg-red-600 hover:bg-red-700 text-white h-7 w-7 p-0 rounded-lg"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="marketplace" className="space-y-4">
            <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-zinc-800/50">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-100">Marketplace Listings</CardTitle>
                <CardDescription className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Manage creator profiles in the marketplace.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10 px-6">Creator</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Category</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Rate</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Status</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10 text-right px-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marketplace.map((item) => (
                      <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                        <TableCell className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                              {item.avatarUrl ? (
                                <img src={item.avatarUrl} alt={item.displayName} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-zinc-500" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-zinc-100">{item.displayName}</div>
                              <div className="text-[9px] text-zinc-500 uppercase tracking-tighter font-black">{item.platform}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] text-zinc-400 capitalize py-3">{item.category}</TableCell>
                        <TableCell className="text-xs font-mono text-zinc-100 py-3">${item.rate}</TableCell>
                        <TableCell className="py-3">
                          <Badge variant="outline" className={`text-[9px] uppercase tracking-widest font-black h-5 ${
                            item.isVerified ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' : 'border-zinc-800 text-zinc-500'
                          }`}>
                            {item.isVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-6 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[9px] font-black uppercase tracking-widest border-zinc-700 hover:bg-zinc-800 text-zinc-400"
                              onClick={() => handleToggleVerification(item.id, item.isVerified)}
                              disabled={processing}
                            >
                              {item.isVerified ? 'Unverify' : 'Verify'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 text-[9px] font-black uppercase tracking-widest bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600/20"
                              onClick={() => handleDeleteListing(item.id)}
                              disabled={processing}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety" className="space-y-4">
            <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10 px-6">Timestamp</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">User</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Type</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Status</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10 px-6">Content Preview</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safetyLogs.map((log) => (
                      <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                        <TableCell className="text-[10px] text-zinc-500 px-6 py-3">
                          {log.timestamp?.toDate().toLocaleString()}
                        </TableCell>
                        <TableCell className="text-[10px] text-zinc-300 py-3">{log.userEmail}</TableCell>
                        <TableCell className="py-3">
                          <Badge className="bg-zinc-800 text-zinc-400 text-[9px] uppercase tracking-widest font-black h-5">
                            {log.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge variant="outline" className={`text-[9px] uppercase tracking-widest font-black h-5 ${
                            log.status === 'safe' ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400'
                          }`}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] text-zinc-500 px-6 py-3 max-w-xs truncate">
                          {log.content}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disputes" className="space-y-4">
            {disputes.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
                <ShieldAlert className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-black text-zinc-500 font-heading tracking-tight uppercase">No Active Disputes</h3>
                <p className="text-zinc-600 text-xs mt-1">All marketplace transactions are currently healthy.</p>
              </div>
            ) : (
              <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10 px-6">Booking ID</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Creator</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Advertiser</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">Amount</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10 text-right px-6">Resolution</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {disputes.map((dispute) => (
                        <TableRow key={dispute.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                          <TableCell className="font-mono text-[10px] text-zinc-500 px-6 py-3">{dispute.id.slice(0, 8)}</TableCell>
                          <TableCell className="text-xs text-zinc-300 py-3">{dispute.creatorEmail}</TableCell>
                          <TableCell className="text-xs text-zinc-300 py-3">{dispute.advertiserEmail}</TableCell>
                          <TableCell className="text-xs font-bold text-zinc-100 py-3">${dispute.price}</TableCell>
                          <TableCell className="text-right px-6 py-3 space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleResolveDispute(dispute.id, 'creator')}
                              disabled={processing}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest h-7 px-3"
                            >
                              Favor Creator
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleResolveDispute(dispute.id, 'advertiser')}
                              disabled={processing}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black uppercase tracking-widest h-7 px-3"
                            >
                              Favor Advertiser
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
