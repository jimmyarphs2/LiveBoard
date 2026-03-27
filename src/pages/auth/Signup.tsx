import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../lib/firebase';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { motion } from 'motion/react';
import { ArrowLeft, UserPlus, Mail, Lock, User, Briefcase } from 'lucide-react';

export default function Signup() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'advertiser' ? 'advertiser' : 'creator';
  
  const [role, setRoleState] = useState<'creator' | 'advertiser'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserDocument(userCredential.user.uid, userCredential.user.email!);
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await createUserDocument(result.user.uid, result.user.email!);
      } else {
        const data = userDoc.data();
        if (data.status === 'pending') {
          navigate(data.role === 'creator' ? '/onboarding/creator' : '/onboarding/advertiser');
        } else {
          navigate(`/dashboard/${data.role}`);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up with Google');
      setLoading(false);
    }
  };

  const createUserDocument = async (uid: string, userEmail: string) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        uid,
        email: userEmail,
        role,
        status: 'pending',
        createdAt: new Date(),
        cashBalance: 0,
        coinBalance: 0
      });
      
      toast.success('Account created successfully!');
      navigate(role === 'creator' ? '/onboarding/creator' : '/onboarding/advertiser');
    } catch (error: any) {
      console.error('Error creating user doc:', error);
      toast.error('Failed to initialize account');
      setLoading(false);
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
        className="w-full max-w-md relative z-10"
      >
        <Link 
          to="/" 
          className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white mb-4 transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Return to Protocol
        </Link>
 
        <div className="bg-[#0f172a]/40 border border-white/10 backdrop-blur-3xl rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="text-center mb-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-bold uppercase tracking-[0.2em] text-primary mb-1">
              <UserPlus className="w-2.5 h-2.5" />
              <span>Identity Protocol</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-heading">
              JOIN BOARDLY
            </h1>
            <p className="text-white/40 text-xs tracking-tight">
              Initialize your account to access the liquidity layer.
            </p>
          </div>
 
          <Tabs value={role} className="mb-6" onValueChange={(v) => setRoleState(v as any)}>
            <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 h-10 rounded-xl border border-white/10">
              <TabsTrigger 
                value="creator" 
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest"
              >
                <User className="w-3 h-3" />
                Creator
              </TabsTrigger>
              <TabsTrigger 
                value="advertiser" 
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest"
              >
                <Briefcase className="w-3 h-3" />
                Advertiser
              </TabsTrigger>
            </TabsList>
          </Tabs>
 
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-1">Identity (Email)</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white pl-10 h-11 rounded-xl focus:ring-primary/30 focus:border-primary/50 transition-all text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-1">Access Key (Password)</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white pl-10 h-11 rounded-xl focus:ring-primary/30 focus:border-primary/50 transition-all text-sm"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] group relative overflow-hidden" 
              disabled={loading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Initializing...
                </div>
              ) : 'Create Account'}
            </Button>
          </form>
 
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-px bg-white/5 flex-1"></div>
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Secondary Auth</span>
            <div className="h-px bg-white/5 flex-1"></div>
          </div>
 
          <Button 
            variant="outline" 
            className="w-full h-11 mt-4 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl transition-all active:scale-[0.98] font-bold uppercase tracking-widest text-[9px]"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google Terminal
          </Button>
 
          <p className="mt-6 text-center text-xs text-white/30">
            Already have an account? <Link to="/login" className="text-primary font-bold uppercase tracking-widest text-[9px] ml-2 hover:underline">Log in</Link>
          </p>

        </div>
      </motion.div>
    </div>
  );
}
