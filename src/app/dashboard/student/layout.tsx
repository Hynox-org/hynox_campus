'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart2, 
  BookOpen, 
  Brain, 
  FileText, 
  Briefcase, 
  Video, 
  Code2, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search, 
  GraduationCap,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: activeUser } } = await supabase.auth.getUser();
      if (activeUser) {
        setUser(activeUser);
      }
    }
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
    setIsLoading(false);
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard/student', icon: BarChart2 },
    { label: 'Study Materials', path: '/dashboard/student/study-materials', icon: BookOpen },
    { label: 'Quizzes', path: '/dashboard/student/quizzes', icon: Brain },
    { label: 'Resume Scanner', path: '/dashboard/student/resume-scanner', icon: FileText },
    { label: 'Projects', path: '/dashboard/student/projects', icon: Briefcase },
    { label: 'Job Guidance', path: '/dashboard/student/job-guidance', icon: Briefcase },
    { label: 'Video Learning', path: '/dashboard/student/video-learning', icon: Video },
    { label: 'Programming', path: '/dashboard/student/programming', icon: Code2 },
    { label: 'AI Assistant', path: '/dashboard/student/ai-assistant', icon: Brain },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans antialiased selection:bg-cyan-500/30">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0038A8] shrink-0 border-r border-[#002f9c] text-white">
        {/* Brand / Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase leading-none">Hynox</h1>
            <span className="text-[9px] font-bold text-blue-200 tracking-widest uppercase">Campus</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#2b6cb0] text-white shadow-lg shadow-blue-900/20' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom / Settings Section */}
        <div className="p-4 border-t border-[#002f9c]">
          <Link
            href="/dashboard/student/settings"
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              pathname === '/dashboard/student/settings'
                ? 'bg-[#2b6cb0] text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5 shrink-0" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Panel Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-20 border-b border-slate-900 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-6">
          {/* Left: Mobile Menu toggle + Search */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden md:flex items-center bg-slate-950/60 rounded-xl px-4 py-2 border border-slate-800/80 w-72">
              <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search courses, documents..." 
                className="bg-transparent border-none outline-none text-xs w-full text-slate-300 placeholder:text-slate-600 font-medium"
              />
            </div>
          </div>

          {/* Right: Notifications, Profile, Sign Out */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all border border-slate-800/40">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full border border-slate-900 animate-pulse"></span>
            </button>

            {/* Profile Info */}
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-xs text-slate-950">
                {user?.email?.[0].toUpperCase() || 'S'}
              </div>
              <span className="text-xs font-bold text-slate-300 truncate max-w-[140px]">
                {user?.email || 'Student Account'}
              </span>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="px-4 py-2.5 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-300 disabled:opacity-50 active:scale-95 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{isLoading ? 'EXITING...' : 'SIGN OUT'}</span>
            </button>
          </div>
        </header>

        {/* Content Page Outlet */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 lg:hidden"
            />
            {/* Sidebar Drawer */}
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#0038A8] text-white z-50 flex flex-col lg:hidden border-r border-[#002f9c]"
            >
              <div className="p-6 flex items-center justify-between border-b border-[#002f9c]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <GraduationCap className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-lg font-black uppercase leading-none">Hynox</h1>
                    <span className="text-[9px] font-bold text-blue-200 tracking-widest uppercase">Campus</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive 
                          ? 'bg-[#2b6cb0] text-white shadow-lg shadow-blue-900/20' 
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-[#002f9c]">
                <Link
                  href="/dashboard/student/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    pathname === '/dashboard/student/settings'
                      ? 'bg-[#2b6cb0] text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Settings className="w-5 h-5 shrink-0" />
                  <span>Settings</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
