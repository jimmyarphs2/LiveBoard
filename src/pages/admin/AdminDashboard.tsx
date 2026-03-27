import { useEffect, useState } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import DashboardLayout from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Users, Store, AlertTriangle, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    creators: 0,
    advertisers: 0,
    activeBookings: 0,
    totalGMV: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [creatorsSnap, advertisersSnap, bookingsSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), where('role', '==', 'creator'))),
          getDocs(query(collection(db, 'users'), where('role', '==', 'advertiser'))),
          getDocs(collection(db, 'bookings'))
        ]);

        const bookings = bookingsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        
        setStats({
          creators: creatorsSnap.size,
          advertisers: advertisersSnap.size,
          activeBookings: bookings.filter(b => b.status === 'active' || b.status === 'accepted').length,
          totalGMV: bookings.reduce((acc, curr) => acc + (curr.price || 0), 0)
        });

        setRecentBookings(bookings.sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis()).slice(0, 10));
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
          <p className="text-zinc-400 mt-1">Monitor marketplace health and resolve disputes.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Total GMV</CardTitle>
              <DollarSign className="w-4 h-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-50">${stats.totalGMV.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Active Creators</CardTitle>
              <Users className="w-4 h-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-50">{stats.creators}</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Advertisers</CardTitle>
              <Store className="w-4 h-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-50">{stats.advertisers}</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Active Bookings</CardTitle>
              <AlertTriangle className="w-4 h-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-50">{stats.activeBookings}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-50">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-zinc-500 text-center py-8">Loading data...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400">ID</TableHead>
                    <TableHead className="text-zinc-400">Type</TableHead>
                    <TableHead className="text-zinc-400">Price</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((booking) => (
                    <TableRow key={booking.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="font-mono text-xs text-zinc-500">{booking.id.slice(0, 8)}</TableCell>
                      <TableCell className="capitalize">{booking.adType}</TableCell>
                      <TableCell>${booking.price}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-zinc-700 text-zinc-300 capitalize">
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-50">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentBookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-zinc-500 py-8">No bookings found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
