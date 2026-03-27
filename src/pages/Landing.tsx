import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, ShieldCheck, Sparkles, TrendingUp, Wallet } from 'lucide-react';

export default function Landing() {
  const [viewers, setViewers] = useState(15000);
  const [hours, setHours] = useState(10);
  const [price, setPrice] = useState(50);
  
  const weeklyEarnings = (hours * 2) * price; // Assuming 2 slots per hour
  const monthlyEarnings = weeklyEarnings * 4;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-zinc-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-900/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center">
              <span className="text-zinc-950 font-bold text-xl">B</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Boardly</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-zinc-50 transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="text-sm font-medium bg-zinc-50 text-zinc-950 px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 mb-8">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              <span>The premier marketplace for live-stream ad space</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Monetize your space.<br />
              <span className="text-zinc-500">Amplify your brand.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
              Boardly connects top live creators with brands looking for high-impact, authentic background placements. Don't leave money on the table.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup?role=creator" className="w-full sm:w-auto px-8 py-4 bg-zinc-50 text-zinc-950 rounded-full font-semibold text-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                I'm a Creator
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/signup?role=advertiser" className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-zinc-50 rounded-full font-semibold text-lg border border-zinc-800 hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
                I'm an Advertiser
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-24 px-6 bg-zinc-900/30 border-y border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Calculate Your Potential</h2>
            <p className="text-zinc-400">See how much you're leaving on the table by not monetizing your background.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center bg-zinc-950 p-8 rounded-3xl border border-zinc-800">
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-zinc-400">Average Live Viewers</label>
                  <span className="text-sm font-medium">{viewers.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="100000" 
                  step="1000"
                  value={viewers}
                  onChange={(e) => setViewers(Number(e.target.value))}
                  className="w-full accent-zinc-50"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-zinc-400">Hours Live per Week</label>
                  <span className="text-sm font-medium">{hours}h</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="40" 
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full accent-zinc-50"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-zinc-400">Avg. Price per Slot ($)</label>
                  <span className="text-sm font-medium">${price}</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="500" 
                  step="10"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full accent-zinc-50"
                />
              </div>
            </div>
            
            <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 text-center">
              <p className="text-sm font-medium text-zinc-400 mb-2">Estimated Monthly Earnings</p>
              <div className="text-6xl font-bold tracking-tight mb-4 text-zinc-50">
                ${monthlyEarnings.toLocaleString()}
              </div>
              <p className="text-sm text-zinc-500 mb-6">Based on 2 ad slots per hour at 100% fill rate.</p>
              <Link to="/signup?role=creator" className="w-full block py-3 bg-zinc-50 text-zinc-950 rounded-xl font-semibold hover:bg-zinc-200 transition-colors">
                Claim Your Space
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-zinc-50" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Escrow</h3>
              <p className="text-zinc-400 leading-relaxed">
                Funds are held safely in escrow until proof of delivery is verified. Zero risk for advertisers, guaranteed payouts for creators.
              </p>
            </div>
            <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-zinc-50" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Growth Coach</h3>
              <p className="text-zinc-400 leading-relaxed">
                Under 10k followers? Our AI coach guides you with personalized milestones to reach marketplace eligibility faster.
              </p>
            </div>
            <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6">
                <Wallet className="w-6 h-6 text-zinc-50" />
              </div>
              <h3 className="text-xl font-bold mb-3">Dual Wallet System</h3>
              <p className="text-zinc-400 leading-relaxed">
                Manage your cash earnings for withdrawal, and use AI Coins for premium ad generation and growth coaching.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
