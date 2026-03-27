import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, Store, Wallet, LogOut, User, Sparkles, ShieldAlert } from 'lucide-react';
import { auth } from '../lib/firebase';
import { GlobalAiAssistant } from './GlobalAiAssistant';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role, profile, logout } = useAuthStore();
  const location = useLocation();

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
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950/50 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center">
              <span className="text-zinc-950 font-bold text-xl">B</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Boardly</span>
          </div>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1">
          {navItems.filter(item => item.show).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-zinc-800 text-zinc-50" 
                    : "text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-zinc-900">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">
                {profile?.brandName || profile?.tiktokHandle || 'User'}
              </p>
              <p className="text-xs text-zinc-500 capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center">
              <span className="text-zinc-950 font-bold text-xl">B</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-zinc-400">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 p-6 lg:p-10">
          {children}
        </div>
      </main>

      <GlobalAiAssistant />
    </div>
  );
}
