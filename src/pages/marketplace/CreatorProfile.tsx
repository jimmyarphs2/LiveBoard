import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-zinc-800 border-t-zinc-400 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!creator) return null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-zinc-800 to-zinc-950"></div>
          <div className="px-8 pb-8 relative">
            <div className="absolute -top-16 left-8 w-32 h-32 bg-zinc-950 rounded-2xl border-4 border-zinc-900 flex items-center justify-center shadow-2xl">
              <span className="text-5xl font-bold text-zinc-50">{creator.tiktokHandle?.charAt(1).toUpperCase() || 'C'}</span>
            </div>
            <div className="pt-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-zinc-50">{creator.tiktokHandle}</h1>
                <p className="text-zinc-400 mt-1 capitalize">{creator.niche} • {creator.country}</p>
              </div>
              
              {role === 'advertiser' && (
                <Dialog>
                  <DialogTrigger>
                    <Button size="lg" className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200 font-semibold px-8">
                      Book Ad Space
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-50 sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Book {creator.tiktokHandle}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBook} className="space-y-6 pt-4">
                      <div className="space-y-2">
                        <Label>Select Ad Format</Label>
                        <Select value={selectedAd} onValueChange={setSelectedAd} required>
                          <SelectTrigger className="bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="Choose format" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-50">
                            {creator.adTypes?.map((type: string) => (
                              <SelectItem key={type} value={type} className="capitalize">
                                {type} - ${creator.pricing[type]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-zinc-400">Subtotal</span>
                          <span>${selectedAd ? creator.pricing[selectedAd] : 0}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                          <span className="text-zinc-400">Platform Fee (15%)</span>
                          <span>${selectedAd ? (creator.pricing[selectedAd] * 0.15).toFixed(2) : 0}</span>
                        </div>
                        <div className="h-px bg-zinc-800 mb-4"></div>
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>${selectedAd ? (creator.pricing[selectedAd] * 1.15).toFixed(2) : 0}</span>
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-zinc-50 text-zinc-950 hover:bg-zinc-200" disabled={!selectedAd || bookingLoading}>
                        {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                      </Button>
                      <p className="text-xs text-center text-zinc-500">Funds will be held in escrow until proof of delivery.</p>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Stats & Info */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-50">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {creator.bio || "This creator hasn't added a bio yet."}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-50">Available Ad Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {creator.adTypes?.map((type: string) => (
                    <div key={type} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                      <span className="capitalize font-medium text-zinc-300">{type}</span>
                      <span className="font-bold text-zinc-50">${creator.pricing[type]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-50">Live Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Followers</p>
                  <p className="text-2xl font-bold text-zinc-50">{(creator.followerCount / 1000).toFixed(1)}k</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Avg. Live Viewers</p>
                  <p className="text-2xl font-bold text-zinc-50">{creator.avgViewers}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Trust Score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-green-400">{creator.trustScore || 100}</p>
                    <Badge variant="outline" className="border-green-900 text-green-400 bg-green-950/30">Excellent</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
