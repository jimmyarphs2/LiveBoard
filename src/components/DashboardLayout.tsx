import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, Store, Wallet, LogOut, User, Sparkles, ShieldAlert, Bell, Search, Menu, X, ChevronRight } from 'lucide-react';
import { auth } from '../lib/firebase';
import { GlobalAiAssistant } from './GlobalAiAssistant';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role, profile, logout } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    auth.signOut();
    logout();
  };

  const navItems = [
    { name: 'Dashboard', href: `/dashboard/${role}`, icon: LayoutDashboard, show: true },
    { name: 'Marketplace', href: '/marketplace', icon: Store, show: true },
    { name: 'Wallet', href: '/wallet', icon: Wallet, show: true },
    { name: 'AI Ad Studio', href: '/ad-studio', icon: Sparkles, show: role === 'advertiser' },
    { name: 'AI Growth Coach', href: '/growth-coach', icon: Sparkles, show: role === 'creator' && profile?.growthStage === 'growth_mode' },
    { name: 'Admin', href: '/admin', icon: ShieldAlert, show: role === 'admin' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-foreground flex overflow-hidden relative">
      {/* Background Noise & Glows */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none z-0"></div>
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-glow [animation-delay:1s] z-0" />

      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r border-white/5 bg-[#020617]/80 backdrop-blur-3xl flex flex-col hidden lg:flex relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary to-purple-600 rounded-lg flex items-center justify-center shadow-xl shadow-primary/40 group-hover:scale-110 transition-all duration-500 group-hover:rotate-6">
              <span className="text-white font-black text-xl font-heading">B</span>
            </div>
            <span className="font-black text-xl tracking-tighter font-heading bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">Boardly</span>
          </Link>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-3 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Main Terminal</p>
          {navItems.filter(item => item.show).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-black transition-all duration-500 group relative overflow-hidden uppercase tracking-widest",
                  isActive 
                    ? "bg-primary/10 text-primary glow-primary shadow-lg shadow-primary/5" 
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-full glow-primary"
                  />
                )}
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-500",
                  isActive ? "bg-primary/20 scale-110 shadow-lg shadow-primary/20" : "bg-white/5 group-hover:bg-white/10 group-hover:scale-110"
                )}>
                  <Icon className={cn("w-4 h-4", isActive && "fill-current")} />
                </div>
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
              </Link>
            );
          })}
        </div>

        <div className="p-6 border-t border-white/5 bg-black/20 backdrop-blur-3xl">
          <div className="p-3 rounded-2xl mb-4 flex items-center gap-3 border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group shadow-xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
              <User className="w-4 h-4 text-white/40 group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[13px] font-black truncate text-white tracking-tight">
                {profile?.brandName || profile?.tiktokHandle || 'User'}
              </p>
              <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mt-0.5">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-black text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-500 group uppercase tracking-widest"
          >
            <div className="p-1.5 rounded-lg bg-red-500/5 group-hover:bg-red-500/10 transition-all group-hover:scale-110">
              <LogOut className="w-4 h-4" />
            </div>
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Header */}
        <header className="h-16 sticky top-0 z-30 border-b border-white/5 bg-[#020617]/60 backdrop-blur-3xl flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-black text-lg font-heading">B</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-all duration-500" />
              <input 
                type="text" 
                placeholder="Search global marketplace..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm font-medium text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all duration-500 placeholder:text-white/20 shadow-inner"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-black text-white/30 uppercase tracking-widest hidden lg:block">
                ⌘ K
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <button className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all relative group shadow-xl">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full glow-primary animate-pulse border-2 border-[#020617]" />
            </button>
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-4 pl-1 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-base font-black text-white leading-none mb-0.5 tracking-tighter">
                  {profile?.cashBalance ? `$${profile.cashBalance.toLocaleString()}` : '$0.00'}
                </p>
                <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em]">Available</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 border border-white/10 flex items-center justify-center p-0.5 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                <div className="w-full h-full rounded-[10px] bg-[#0f172a] flex items-center justify-center overflow-hidden">
                  <User className="w-4 h-4 text-white/40 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-4 lg:p-8 max-w-7xl mx-auto w-full relative z-10"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-background/95 backdrop-blur-2xl z-50 lg:hidden border-r border-white/5 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <Link to="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">B</span>
                  </div>
                  <span className="font-bold text-2xl tracking-tight">Boardly</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-muted-foreground">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                {navItems.filter(item => item.show).map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all",
                        isActive 
                          ? "bg-primary/10 text-primary glow-primary" 
                          : "text-muted-foreground hover:text-white"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-white/5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Log out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <GlobalAiAssistant />
    </div>
  );
}
