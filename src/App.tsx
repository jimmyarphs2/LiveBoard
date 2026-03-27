import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from './components/ui/sonner';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import CreatorOnboarding from './pages/onboarding/CreatorOnboarding';
import AdvertiserOnboarding from './pages/onboarding/AdvertiserOnboarding';
import CreatorDashboard from './pages/dashboard/CreatorDashboard';
import AdvertiserDashboard from './pages/dashboard/AdvertiserDashboard';
import Marketplace from './pages/marketplace/Marketplace';
import CreatorProfile from './pages/marketplace/CreatorProfile';
import CreatorPublicProfile from './pages/marketplace/CreatorPublicProfile';
import Wallet from './pages/wallet/Wallet';
import AiCoach from './pages/growth/AiCoach';
import AiAdStudio from './pages/studio/AiAdStudio';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  const { setUser, setRole, setProfile, setAuthReady, isAuthReady } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role);
            
            if (userData.role === 'creator') {
              const creatorDoc = await getDoc(doc(db, 'creators', firebaseUser.uid));
              if (creatorDoc.exists()) {
                setProfile({ ...userData, ...creatorDoc.data() });
              } else {
                setProfile(userData);
              }
            } else {
              setProfile(userData);
            }
          } else {
            setRole(null);
            setProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
        setRole(null);
        setProfile(null);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [setUser, setRole, setProfile, setAuthReady]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-zinc-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Onboarding */}
          <Route path="/onboarding/creator" element={<CreatorOnboarding />} />
          <Route path="/onboarding/advertiser" element={<AdvertiserOnboarding />} />
          
          {/* Dashboards */}
          <Route path="/dashboard/creator" element={<CreatorDashboard />} />
          <Route path="/dashboard/advertiser" element={<AdvertiserDashboard />} />
          
          {/* Marketplace */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/creator/:id" element={<CreatorProfile />} />
          <Route path="/p/:userId" element={<CreatorPublicProfile />} />
          <Route path="/c/:username" element={<CreatorPublicProfile />} />
          
          {/* Features */}
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/growth-coach" element={<AiCoach />} />
          <Route path="/ad-studio" element={<AiAdStudio />} />
          
          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster theme="dark" position="top-center" />
      </div>
    </Router>
  );
}
