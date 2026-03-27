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
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/40 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-10 h-28 flex items-center justify-between">
          <div className="flex items-center gap-5 group cursor-pointer">
            <div className="w-14 h-14 bg-gradient-to-br from-primary via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
              <span className="text-white font-black text-4xl font-heading">B</span>
            </div>
            <span className="font-black text-4xl tracking-tighter font-heading bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">Boardly</span>
          </div>
          <div className="hidden md:flex items-center gap-14">
            <Link to="/login" className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 hover:text-white transition-all hover:tracking-[0.6em]">
              Terminal Login
            </Link>
            <Link to="/signup" className="h-16 px-12 flex items-center bg-white text-[#020617] rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-zinc-200 transition-all shadow-2xl shadow-white/10 hover:scale-105 active:scale-95 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              Initialize Account
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-72 pb-20 px-10 z-10">
        <div className="max-w-7xl mx-auto text-center space-y-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-16"
          >
            <div className="inline-flex items-center gap-5 px-10 py-4 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-[0.5em] text-primary glow-primary shadow-2xl backdrop-blur-2xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span>The Global Liquidity Layer for Ad Space</span>
            </div>
            
            <h1 className="text-9xl md:text-[13rem] font-black tracking-tighter font-heading leading-[0.75] drop-shadow-2xl">
              Monetize your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-500 drop-shadow-[0_0_50px_rgba(59,130,246,0.4)]">Pixels.</span><br />
              <span className="text-white/10">Scale your Brand.</span>
            </h1>
            
            <p className="text-2xl md:text-4xl text-white/40 max-w-5xl mx-auto font-medium leading-relaxed tracking-tight">
              Boardly connects elite live creators with forward-thinking brands through a high-frequency background placement engine. <span className="text-white/80">Secure, automated, and high-yield.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-16">
              <Link to="/signup?role=creator" className="w-full sm:w-auto h-28 px-20 bg-primary text-white rounded-full font-black text-3xl uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-8 shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Creator Portal
                <ArrowRight className="w-10 h-10 group-hover:translate-x-3 transition-transform duration-500" />
              </Link>
              <Link to="/signup?role=advertiser" className="w-full sm:w-auto h-28 px-20 bg-white/5 text-white rounded-full font-black text-3xl uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-8 shadow-2xl hover:scale-105 active:scale-95 backdrop-blur-2xl">
                Advertiser Terminal
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Marquee */}
      <section className="relative py-20 z-10 overflow-hidden">
        <div className="flex flex-col gap-10">
          <p className="text-center text-[11px] font-black uppercase tracking-[0.5em] text-white/20">Trusted by the world's most innovative brands</p>
          <div className="flex overflow-hidden group">
            <motion.div 
              animate={{ x: [0, -1920] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="flex items-center gap-40 whitespace-nowrap px-20"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-center gap-10 opacity-20 hover:opacity-100 transition-opacity cursor-default">
                  <div className="w-12 h-12 bg-white rounded-lg" />
                  <span className="text-4xl font-black tracking-tighter font-heading text-white">BRAND_{i}</span>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={`dup-${i}`} className="flex items-center gap-10 opacity-20 hover:opacity-100 transition-opacity cursor-default">
                  <div className="w-12 h-12 bg-white rounded-lg" />
                  <span className="text-4xl font-black tracking-tighter font-heading text-white">BRAND_{i}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-40 px-10 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-16 max-w-6xl mx-auto text-center"
          >
            {[
              { label: 'Total Volume', value: '$12.4M+' },
              { label: 'Active Nodes', value: '8.2k+' },
              { label: 'Daily Placements', value: '45k+' },
              { label: 'Avg. ROI', value: '340%' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-5 group cursor-default">
                <p className="text-5xl font-black font-heading tracking-tighter text-white group-hover:text-primary transition-all duration-700 group-hover:scale-110">{stat.value}</p>
                <div className="h-1 w-16 bg-white/10 mx-auto group-hover:w-full group-hover:bg-primary transition-all duration-700 rounded-full" />
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-white/60 transition-colors">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="relative py-60 px-10 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32 space-y-8">
            <h2 className="text-7xl md:text-9xl font-black font-heading tracking-tighter text-white">Yield Calculator</h2>
            <div className="flex items-center justify-center gap-6">
              <div className="h-1 w-16 bg-primary rounded-full" />
              <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.5em]">Project your monthly revenue potential</p>
              <div className="h-1 w-16 bg-primary rounded-full" />
            </div>
          </div>
          
          <div className="grid lg:grid-cols-5 gap-16 items-stretch">
            <div className="lg:col-span-3 space-y-20 p-20 rounded-[5rem] bg-[#0f172a]/40 border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              
              <div className="space-y-10">
                <div className="flex justify-between items-end">
                  <label className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40">Average Live Viewers</label>
                  <span className="text-6xl font-black font-heading text-primary tracking-tighter drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">{viewers.toLocaleString()}</span>
                </div>
                <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300" 
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

              <div className="space-y-10">
                <div className="flex justify-between items-end">
                  <label className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40">Hours Live / Week</label>
                  <span className="text-6xl font-black font-heading text-primary tracking-tighter drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">{hours}h</span>
                </div>
                <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300" 
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

              <div className="space-y-10">
                <div className="flex justify-between items-end">
                  <label className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40">Price / Ad Slot ($)</label>
                  <span className="text-6xl font-black font-heading text-primary tracking-tighter drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">${price}</span>
                </div>
                <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300" 
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
            
            <div className="lg:col-span-2 rounded-[5rem] p-20 bg-primary relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-primary/40 group">
              <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                <TrendingUp className="w-80 h-80 text-white" />
              </div>
              <div className="relative z-10 space-y-12">
                <div className="space-y-4">
                  <p className="text-[11px] font-black text-white/60 uppercase tracking-[0.5em]">Estimated Monthly Yield</p>
                  <div className="text-[10rem] font-black tracking-tighter font-heading text-white drop-shadow-2xl leading-none">
                    <span className="text-5xl align-top mr-3 font-black">$</span>
                    {monthlyEarnings.toLocaleString()}
                  </div>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-white/10 border border-white/10 backdrop-blur-2xl shadow-inner">
                  <p className="text-[11px] text-white/80 font-black uppercase tracking-[0.25em] leading-relaxed">
                    Calculation based on 2 high-frequency ad slots per hour at 100% fill rate.
                  </p>
                </div>
              </div>
              <Link to="/signup?role=creator" className="relative z-10 w-full h-28 flex items-center justify-center bg-white text-primary rounded-full font-black text-3xl uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-2xl mt-20 group/btn overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                Claim Your Space
                <ArrowRight className="ml-5 w-10 h-10 group-hover/btn:translate-x-3 transition-transform duration-500" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-60 px-10 z-10">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="text-center space-y-8">
            <h2 className="text-7xl md:text-9xl font-black font-heading tracking-tighter text-white">The Protocol</h2>
            <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.5em]">Engineered for the elite creator economy</p>
          </div>

          <div className="grid md:grid-cols-12 gap-10">
            {/* Bento Grid Layout */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-7 p-20 rounded-[5rem] bg-[#0f172a]/40 border border-white/10 backdrop-blur-3xl hover:border-primary/50 transition-all group shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-end"
            >
              <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
              <div className="relative z-10 space-y-8">
                <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <ShieldCheck className="w-12 h-12 text-primary glow-primary" />
                </div>
                <h3 className="text-6xl font-black font-heading tracking-tighter text-white">Escrow Protocol</h3>
                <p className="text-white/40 text-2xl font-medium leading-relaxed max-w-xl">
                  Funds are locked in a secure smart-contract style escrow until proof of delivery is verified. Zero counterparty risk, guaranteed settlement.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-5 p-20 rounded-[5rem] bg-gradient-to-br from-amber-500/10 to-transparent border border-white/10 backdrop-blur-3xl hover:border-amber-500/50 transition-all group shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-end"
            >
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px]" />
              <div className="relative z-10 space-y-8">
                <div className="w-24 h-24 rounded-3xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Zap className="w-12 h-12 text-amber-500 glow-amber" />
                </div>
                <h3 className="text-6xl font-black font-heading tracking-tighter text-white">AI Growth</h3>
                <p className="text-white/40 text-2xl font-medium leading-relaxed">
                  Proprietary algorithms analyze your niche and audience to provide real-time growth milestones and brand matching.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-5 p-20 rounded-[5rem] bg-gradient-to-br from-emerald-500/10 to-transparent border border-white/10 backdrop-blur-3xl hover:border-emerald-500/50 transition-all group shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-end"
            >
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px]" />
              <div className="relative z-10 space-y-8">
                <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Globe className="w-12 h-12 text-emerald-500 glow-emerald" />
                </div>
                <h3 className="text-6xl font-black font-heading tracking-tighter text-white">Global Settlement</h3>
                <p className="text-white/40 text-2xl font-medium leading-relaxed">
                  Instant cross-border settlements with our dual-wallet system. Withdraw cash or convert to AI Credits seamlessly.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-7 p-20 rounded-[5rem] bg-[#0f172a]/40 border border-white/10 backdrop-blur-3xl hover:border-purple-500/50 transition-all group shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-center text-center items-center"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent)]" />
              <div className="relative z-10 space-y-10">
                <div className="w-32 h-32 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mx-auto">
                  <BarChart3 className="w-16 h-16 text-purple-500 glow-purple" />
                </div>
                <h3 className="text-7xl font-black font-heading tracking-tighter text-white">Real-time Analytics</h3>
                <p className="text-white/40 text-2xl font-medium leading-relaxed max-w-2xl mx-auto">
                  Track every impression, click, and conversion with millisecond precision. Our dashboard provides the transparency you deserve.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-60 px-10 z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto rounded-[6rem] bg-gradient-to-br from-primary via-blue-600 to-purple-700 p-32 text-center space-y-16 relative overflow-hidden shadow-[0_0_150px_rgba(59,130,246,0.4)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent)]" />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          <h2 className="text-8xl md:text-[11rem] font-black font-heading tracking-tighter text-white leading-[0.75] relative z-10 drop-shadow-2xl">
            Ready to join the<br />liquidity layer?
          </h2>
          <p className="text-3xl md:text-4xl text-white/90 max-w-4xl mx-auto font-medium relative z-10 leading-relaxed">
            Initialize your account in seconds and start scaling your revenue today. Join the elite.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-12 relative z-10">
            <Link to="/signup" className="w-full sm:w-auto h-28 px-24 bg-white text-primary rounded-full font-black text-3xl uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-2xl hover:scale-105 active:scale-95 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              Get Started Now
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-40 px-10 border-t border-white/5 z-10 bg-[#020617]/90 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-24">
          <div className="col-span-2 space-y-12">
            <div className="flex items-center gap-5 group cursor-pointer">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary/10 transition-all duration-500">
                <span className="text-white font-black text-4xl font-heading">B</span>
              </div>
              <span className="font-black text-4xl tracking-tighter font-heading text-white">Boardly</span>
            </div>
            <p className="text-white/30 text-2xl font-medium max-w-md leading-relaxed">
              The premier financial infrastructure for the creator economy. Powered by AI, secured by smart protocols.
            </p>
          </div>
          <div className="space-y-10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-white">Protocol</h4>
            <div className="flex flex-col gap-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/30">
              <a href="#" className="hover:text-primary transition-all hover:translate-x-2">AI Discovery</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-2">Escrow Engine</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-2">Yield Terminal</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-2">Liquidity Layer</a>
            </div>
          </div>
          <div className="space-y-10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-white">Legal</h4>
            <div className="flex flex-col gap-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/30">
              <a href="#" className="hover:text-primary transition-all hover:translate-x-2">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-2">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-2">Security Audit</a>
              <a href="#" className="hover:text-primary transition-all hover:translate-x-2">Compliance</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-24 mt-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">
            © 2026 Boardly Labs. All rights reserved.
          </p>
          <div className="flex items-center gap-10">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-500/50">All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
