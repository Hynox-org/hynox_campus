'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FileText,
  Briefcase,
  Brain,
  ChevronRight,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: activeUser } } = await supabase.auth.getUser();
      if (activeUser) {
        setUser(activeUser);
      }
    }
    fetchUser();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="space-y-2 max-w-xl">
          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Active Session Verified
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Scholar'}</span>!
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Your academic records are isolated and protected. Access your resume scanner, AI assistant, and job guidance tools directly from this console.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <Link href="/student/resume-scanner" className="px-6 py-4 bg-cyan-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs tracking-wider flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" /> SCAN RESUME
          </Link>
          <Link href="/student/ai-assistant" className="px-6 py-4 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-2xl hover:bg-slate-800 transition-all text-xs flex items-center justify-center gap-2">
            <Brain className="w-4 h-4" /> ASK AI ASSISTANT
          </Link>
        </div>
      </motion.div>

      {/* Quick Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Security Level', value: 'Isolated', icon: ShieldCheck, color: 'cyan' },
          { label: 'AI Scanner Limit', value: 'Unlimited', icon: Sparkles, color: 'emerald' },
          { label: 'System Status', value: 'Operational', icon: Zap, color: 'indigo' },
          { label: 'Last Login', value: 'Just Now', icon: Clock, color: 'rose' },
        ].map((stat, idx) => {
          const colors: any = {
            cyan: 'from-cyan-500/10 to-blue-500/5 border-cyan-500/20 text-cyan-400',
            emerald: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-400',
            indigo: 'from-indigo-500/10 to-violet-500/5 border-indigo-500/20 text-indigo-400',
            rose: 'from-rose-500/10 to-pink-500/5 border-rose-500/20 text-rose-400',
          };
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-gradient-to-br ${colors[stat.color]} border rounded-3xl p-6 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300`}
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-white tracking-tight">{stat.value}</h3>
              </div>
              <div className="w-10 h-10 bg-slate-950/40 rounded-xl flex items-center justify-center border border-slate-800/40">
                <stat.icon className="w-5 h-5" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Shortcuts */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Quick Shortcuts</h3>
          <p className="text-xs text-slate-500 mt-0.5">Quickly access the features configured for your Hynox Campus account.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Resume Scanner',
              description: 'Scan your resume against jobs to see details on gaps, formatting, and impact score.',
              href: '/student/resume-scanner',
              icon: FileText,
              tag: 'AI POWERED'
            },
            {
              title: 'Job Guidance',
              description: 'Search roles, get placement guidelines, and review recommended jobs.',
              href: '/student/job-guidance',
              icon: Briefcase,
              tag: 'PLACEMENTS'
            },
            {
              title: 'AI Assistant',
              description: 'Ask any doubt, write code snippet examples, and get personalized interview help.',
              href: '/student/ai-assistant',
              icon: Brain,
              tag: 'COPILOT'
            }
          ].map((card, idx) => (
            <Link href={card.href} key={card.title} className="block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-900/40 border border-slate-850 hover:border-cyan-500/30 rounded-3xl p-6 space-y-6 transition-all duration-300 hover:bg-slate-900/60 group relative overflow-hidden cursor-pointer h-full flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[10px] font-bold text-cyan-400 rounded-md font-mono">
                      {card.tag}
                    </span>
                    <card.icon className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <h4 className="text-lg font-bold text-white leading-snug group-hover:text-cyan-400 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {card.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-cyan-400 pt-4 border-t border-slate-850/60 group-hover:underline">
                  <span>Open Tool</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
