import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, ShieldCheck, Sparkles, TrendingUp, Wallet, CheckCircle2, Zap, Globe, Shield } from 'lucide-react';

export default function Landing() {
  const [viewers, setViewers] = useState(15000);
  const [hours, setHours] = useState(10);
  const [price, setPrice] = useState(50);
  
  const weeklyEarnings = (hours * 2) * price; // Assuming 2 slots per hour
  const monthlyEarnings = weeklyEarnings * 4;

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/30 overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.2),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_120%,rgba(139,92,246,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Animated Glows */}
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/4 -left-64 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[160px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.3, 1, 1.3],
            opacity: [0.05, 0.2, 0.05],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-1/4 -right-64 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[160px]"
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-5 h-5 bg-gradient-to-br from-primary to-blue-600 rounded flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-500">
              <span className="text-white font-black text-xs font-heading">B</span>
            </div>
            <span className="font-black text-sm tracking-tighter font-heading text-white">Boardly</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/login" className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
              Login
            </Link>
            <Link to="/signup" className="h-7 px-4 flex items-center bg-white text-[#020617] rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 hover:scale-105 active:scale-95 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-10 px-6 z-10">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-[0.3em] text-primary glow-primary shadow-xl backdrop-blur-2xl">
              <Sparkles className="w-2.5 h-2.5 animate-pulse" />
              <span>The Liquidity Layer for Ad Space</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.85] drop-shadow-2xl">
              Monetize your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">Pixels.</span><br />
              <span className="text-white/10">Scale your Brand.</span>
            </h1>
            
            <p className="text-xs md:text-sm text-white/40 max-w-md mx-auto font-medium leading-relaxed tracking-tight">
              Boardly connects elite creators with forward-thinking brands through a high-frequency background placement engine. <span className="text-white/80">Secure, automated, and high-yield.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/signup?role=creator" className="w-full sm:w-auto h-9 px-7 bg-primary text-white rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Creator Portal
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-500" />
              </Link>
              <Link to="/signup?role=advertiser" className="w-full sm:w-auto h-9 px-7 bg-white/5 text-white rounded-full font-black text-[9px] uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 backdrop-blur-2xl">
                Advertiser Terminal
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Marquee */}
      <section className="relative py-10 z-10 overflow-hidden">
        <div className="flex flex-col gap-6">
          <p className="text-center text-micro text-white/20">Trusted by the world's most innovative brands</p>
          <div className="flex overflow-hidden group">
            <motion.div 
              animate={{ x: [0, -1920] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="flex items-center gap-20 whitespace-nowrap px-8"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-center gap-4 opacity-20 hover:opacity-100 transition-opacity cursor-default">
                  <div className="w-5 h-5 bg-white rounded-sm" />
                  <span className="text-lg font-black tracking-tighter font-heading text-white">BRAND_{i}</span>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={`dup-${i}`} className="flex items-center gap-4 opacity-20 hover:opacity-100 transition-opacity cursor-default">
                  <div className="w-5 h-5 bg-white rounded-sm" />
                  <span className="text-lg font-black tracking-tighter font-heading text-white">BRAND_{i}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto text-center"
          >
            {[
              { label: 'Total Volume', value: '$12.4M+' },
              { label: 'Active Nodes', value: '8.2k+' },
              { label: 'Daily Placements', value: '45k+' },
              { label: 'Avg. ROI', value: '340%' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-2 group cursor-default">
                <p className="text-2xl font-black font-heading tracking-tighter text-white group-hover:text-primary transition-all duration-500 group-hover:scale-105">{stat.value}</p>
                <div className="h-0.5 w-6 bg-white/10 mx-auto group-hover:w-full group-hover:bg-primary transition-all duration-500 rounded-full" />
                <p className="text-micro text-white/30 group-hover:text-white/60 transition-colors">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="relative py-20 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tighter text-white">Yield Calculator</h2>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-primary/50" />
              <p className="text-micro text-white/40">Project your monthly revenue potential</p>
              <div className="h-px w-8 bg-primary/50" />
            </div>
          </div>
          
          <div className="grid lg:grid-cols-5 gap-8 items-stretch">
            <div className="lg:col-span-3 space-y-10 p-8 rounded-2xl bg-[#0f172a]/40 border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-micro text-white/40">Average Live Viewers</label>
                  <span className="text-2xl font-black font-heading text-primary tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{viewers.toLocaleString()}</span>
                </div>
                <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-300" 
                    style={{ width: `${(viewers / 100000) * 100}%` }}
                  />
                  <input 
                    type="range" 
                    min="1000" 
                    max="100000" 
                    step="1000"
                    value={viewers}
                    onChange={(e) => setViewers(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-micro text-white/40">Hours Live / Week</label>
                  <span className="text-2xl font-black font-heading text-primary tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{hours}h</span>
                </div>
                <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-300" 
                    style={{ width: `${(hours / 40) * 100}%` }}
                  />
                  <input 
                    type="range" 
                    min="1" 
                    max="40" 
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-micro text-white/40">Price / Ad Slot ($)</label>
                  <span className="text-2xl font-black font-heading text-primary tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">${price}</span>
                </div>
                <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-300" 
                    style={{ width: `${(price / 500) * 100}%` }}
                  />
                  <input 
                    type="range" 
                    min="10" 
                    max="500" 
                    step="10"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2 rounded-2xl p-8 bg-primary relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-primary/30 group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                <TrendingUp className="w-24 h-24 text-white" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="space-y-1">
                  <p className="text-micro text-white/60">Estimated Monthly Yield</p>
                  <div className="text-5xl font-black tracking-tighter font-heading text-white drop-shadow-xl leading-none">
                    <span className="text-2xl align-top mr-1 font-black">$</span>
                    {monthlyEarnings.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-2xl shadow-inner">
                  <p className="text-[9px] text-white/80 font-black uppercase tracking-[0.1em] leading-relaxed">
                    Calculation based on 2 high-frequency ad slots per hour at 100% fill rate.
                  </p>
                </div>
              </div>
              <Link to="/signup?role=creator" className="relative z-10 w-full h-11 flex items-center justify-center bg-white text-primary rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-xl mt-8 group/btn overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                Claim Your Space
                <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-500" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-6 z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tighter text-white">The Protocol</h2>
            <p className="text-micro text-white/40">Engineered for the elite creator economy</p>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Bento Grid Layout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-7 p-8 rounded-2xl bg-[#0f172a]/40 border border-white/10 backdrop-blur-3xl hover:border-primary/50 transition-all group shadow-2xl relative overflow-hidden min-h-[300px] flex flex-col justify-end"
            >
              <div className="absolute top-4 right-4 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
              <div className="relative z-10 space-y-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <ShieldCheck className="w-5 h-5 text-primary glow-primary" />
                </div>
                <h3 className="text-2xl font-black font-heading tracking-tighter text-white">Escrow Protocol</h3>
                <p className="text-white/40 text-sm font-medium leading-relaxed max-w-md">
                  Funds are locked in a secure smart-contract style escrow until proof of delivery is verified. Zero counterparty risk, guaranteed settlement.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-5 p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-white/10 backdrop-blur-3xl hover:border-amber-500/50 transition-all group shadow-2xl relative overflow-hidden min-h-[300px] flex flex-col justify-end"
            >
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-amber-500/10 rounded-full blur-[70px]" />
              <div className="relative z-10 space-y-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Zap className="w-5 h-5 text-amber-500 glow-amber" />
                </div>
                <h3 className="text-2xl font-black font-heading tracking-tighter text-white">AI Growth</h3>
                <p className="text-white/40 text-sm font-medium leading-relaxed">
                  Proprietary algorithms analyze your niche and audience to provide real-time growth milestones and brand matching.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-5 p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-white/10 backdrop-blur-3xl hover:border-emerald-500/50 transition-all group shadow-2xl relative overflow-hidden min-h-[300px] flex flex-col justify-end"
            >
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-[70px]" />
              <div className="relative z-10 space-y-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Globe className="w-5 h-5 text-emerald-500 glow-emerald" />
                </div>
                <h3 className="text-2xl font-black font-heading tracking-tighter text-white">Global Settlement</h3>
                <p className="text-white/40 text-sm font-medium leading-relaxed">
                  Instant cross-border settlements with our dual-wallet system. Withdraw cash or convert to AI Credits seamlessly.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-7 p-8 rounded-2xl bg-[#0f172a]/40 border border-white/10 backdrop-blur-3xl hover:border-purple-500/50 transition-all group shadow-2xl relative overflow-hidden min-h-[300px] flex flex-col justify-center text-center items-center"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent)]" />
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mx-auto">
                  <BarChart3 className="w-6 h-6 text-purple-500 glow-purple" />
                </div>
                <h3 className="text-3xl font-black font-heading tracking-tighter text-white">Real-time Analytics</h3>
                <p className="text-white/40 text-sm font-medium leading-relaxed max-w-xl mx-auto">
                  Track every impression, click, and conversion with millisecond precision. Our dashboard provides the transparency you deserve.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6 z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-br from-primary via-blue-600 to-purple-700 p-12 text-center space-y-8 relative overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.3)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:30px_30px]" />
          
          <h2 className="text-4xl md:text-6xl font-black font-heading tracking-tighter text-white leading-[0.85] relative z-10 drop-shadow-xl">
            Ready to join the<br />liquidity layer?
          </h2>
          <p className="text-base md:text-lg text-white/90 max-w-lg mx-auto font-medium relative z-10 leading-relaxed">
            Initialize your account in seconds and start scaling your revenue today. Join the elite.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 relative z-10">
            <Link to="/signup" className="w-full sm:w-auto h-12 px-10 bg-white text-primary rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-xl hover:scale-105 active:scale-95 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              Get Started Now
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 border-t border-white/5 z-10 bg-[#020617]/90 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-6 h-6 bg-white/5 rounded flex items-center justify-center border border-white/10 group-hover:bg-primary/10 transition-all duration-500">
                <span className="text-white font-black text-sm font-heading">B</span>
              </div>
              <span className="font-black text-base tracking-tighter font-heading text-white">Boardly</span>
            </div>
            <p className="text-white/30 text-sm font-medium max-w-sm leading-relaxed">
              The premier financial infrastructure for the creator economy. Powered by AI, secured by smart protocols.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-micro text-white">Protocol</h4>
            <div className="flex flex-col gap-4 text-micro text-white/30">
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">AI Discovery</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">Escrow Engine</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">Yield Terminal</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">Liquidity Layer</a>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-micro text-white">Legal</h4>
            <div className="flex flex-col gap-4 text-micro text-white/30">
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">Security Audit</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-1">Compliance</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-micro text-white/20">
            © 2026 Boardly Labs. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
            <span className="text-micro text-emerald-500/50">All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
