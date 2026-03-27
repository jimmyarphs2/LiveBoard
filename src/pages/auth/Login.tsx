import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { motion } from 'motion/react';
import { ArrowLeft, LogIn, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setRole, setProfile } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await fetchProfileAndRedirect(userCredential.user.uid);
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await fetchProfileAndRedirect(result.user.uid);
    } catch (error: any) {
      toast.error(error.message || 'Failed to login with Google');
      setLoading(false);
    }
  };

  const fetchProfileAndRedirect = async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setRole(data.role);
      setProfile(data);
      
      if (data.status === 'pending') {
        navigate(data.role === 'creator' ? '/onboarding/creator' : '/onboarding/advertiser');
      } else if (data.role === 'creator') {
        navigate('/dashboard/creator');
      } else if (data.role === 'advertiser') {
        navigate('/dashboard/advertiser');
      } else if (data.role === 'admin') {
        navigate('/admin');
      }
    } else {
      toast.error('Account not found. Please sign up.');
      auth.signOut();
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden font-sans">
      {/* Background Elements - Matching Landing Page */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.15),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_120%,rgba(139,92,246,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Animated Glows */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 -left-64 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl relative z-10"
      >
        <Link 
          to="/" 
          className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white mb-12 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 mr-3 group-hover:-translate-x-2 transition-transform" />
          Return to Protocol
        </Link>

        <div className="bg-[#0f172a]/40 border border-white/10 backdrop-blur-3xl rounded-[3rem] p-12 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">
              <LogIn className="w-3 h-3" />
              <span>Security Terminal</span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter font-heading">
              WELCOME BACK
            </h1>
            <p className="text-white/40 font-medium text-lg tracking-tight">
              Initialize your session to access the liquidity layer.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Identity (Email)</Label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white pl-14 h-16 rounded-2xl focus:ring-primary/30 focus:border-primary/50 transition-all text-lg font-medium"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Access Key (Password)</Label>
                <Link to="#" className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">Recovery</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white pl-14 h-16 rounded-2xl focus:ring-primary/30 focus:border-primary/50 transition-all text-lg font-medium"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-20 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xl uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] group relative overflow-hidden" 
              disabled={loading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : 'Initialize Session'}
            </Button>
          </form>

          <div className="mt-12 flex items-center justify-center gap-6">
            <div className="h-px bg-white/5 flex-1"></div>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Secondary Auth</span>
            <div className="h-px bg-white/5 flex-1"></div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-16 mt-8 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl transition-all active:scale-[0.98] font-black uppercase tracking-widest text-xs"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google Terminal
          </Button>

          <p className="mt-12 text-center text-sm font-medium text-white/30">
            New to the protocol? <Link to="/signup" className="text-primary font-black uppercase tracking-widest text-xs ml-2 hover:underline">Create Account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
