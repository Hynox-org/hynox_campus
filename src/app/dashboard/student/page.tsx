'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  BookOpen, 
  Award, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  PlayCircle,
  FileText,
  User,
  GraduationCap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function StudentDashboard() {
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

  const activeCourses = [
    { id: 1, title: 'Advanced Web Engineering', code: 'CS-402', instructor: 'Dr. Evelyn Carter', progress: 75, nextClass: 'Tomorrow, 10:00 AM' },
    { id: 2, title: 'Data Structures & Algorithms', code: 'CS-201', instructor: 'Prof. Marcus Vance', progress: 40, nextClass: 'Today, 2:00 PM' },
    { id: 3, title: 'Artificial Intelligence Basics', code: 'CS-310', instructor: 'Dr. Sarah Jenkins', progress: 90, nextClass: 'Wednesday, 9:00 AM' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* Top Navigation */}
      <nav className="border-b border-slate-900 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <GraduationCap className="text-slate-950 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase">Hynox Campus</h1>
              <p className="text-[10px] font-bold text-cyan-400 tracking-[0.2em] uppercase">Student Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-300 truncate max-w-[200px]">
                {user?.email || 'Student Account'}
              </span>
            </div>
            
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="px-4 py-2 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-300 disabled:opacity-50 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoading ? 'SIGNING OUT...' : 'SIGN OUT'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        
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
              Your academic records are isolated and protected. Access your registered modules, project details, and submit homework directly from this console.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <button className="px-6 py-4 bg-cyan-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs tracking-wider flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4" /> VIEW MY CLASSES
            </button>
            <button className="px-6 py-4 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-2xl hover:bg-slate-800 transition-all text-xs flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" /> SUBMIT PROJECT
            </button>
          </div>
        </motion.div>

        {/* Quick Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Registered Courses', value: '3 Modules', icon: BookOpen, color: 'cyan' },
            { label: 'Attendance Average', value: '94.2%', icon: Clock, color: 'emerald' },
            { label: 'Current GPA Score', value: '9.0 / 10', icon: Award, color: 'indigo' },
            { label: 'Pending Assignments', value: '2 Overdue', icon: AlertCircle, color: 'rose' },
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

        {/* Academic Modules */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Registered Courses</h3>
              <p className="text-xs text-slate-500 mt-0.5">Your active enrolled modules for this semester.</p>
            </div>
            <span className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer flex items-center gap-1">
              Semester Schedule <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-900/40 border border-slate-850 hover:border-cyan-500/30 rounded-3xl p-6 space-y-6 transition-all duration-300 hover:bg-slate-900/60 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-300" />
                
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400 rounded-md font-mono">
                      {course.code}
                    </span>
                    <h4 className="text-base font-bold text-white mt-3 leading-snug group-hover:text-cyan-400 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{course.instructor}</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-slate-950 hover:bg-cyan-500 hover:text-slate-950 flex items-center justify-center text-slate-400 transition-all active:scale-90">
                    <PlayCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/40">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Course Progress</span>
                    <span className="text-white">{course.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full bg-cyan-400 transition-all duration-500" 
                      style={{ width: `${course.progress}%` }} 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-[10px] font-bold text-cyan-400/80 bg-cyan-500/5 border border-cyan-500/10 rounded-xl px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Next Class: {course.nextClass}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
