import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../lib/firebase';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';

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
      
      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await createUserDocument(result.user.uid, result.user.email!);
      } else {
        // Redirect existing user
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-zinc-950 font-bold text-2xl">B</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-50">Create an account</h1>
          <p className="text-zinc-400 mt-2">Join Boardly to get started</p>
        </div>

        <Tabs defaultValue={role} className="mb-6" onValueChange={(v) => setRoleState(v as any)}>
          <TabsList className="grid w-full grid-cols-2 bg-zinc-950">
            <TabsTrigger value="creator" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">Creator</TabsTrigger>
            <TabsTrigger value="advertiser" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">Advertiser</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-950 border-zinc-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-zinc-950 border-zinc-800"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="h-px bg-zinc-800 flex-1"></div>
          <span className="text-sm text-zinc-500">or</span>
          <div className="h-px bg-zinc-800 flex-1"></div>
        </div>

        <Button 
          variant="outline" 
          className="w-full mt-6 bg-transparent border-zinc-800 hover:bg-zinc-800 hover:text-zinc-50"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign up with Google
        </Button>

        <p className="mt-8 text-center text-sm text-zinc-400">
          Already have an account? <Link to="/login" className="text-zinc-50 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
