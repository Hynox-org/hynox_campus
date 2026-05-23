'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Award, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  PlayCircle,
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    async function fetchUserAndCourses() {
      // Fetch user
      const { data: { user: activeUser } } = await supabase.auth.getUser();
      if (activeUser) {
        setUser(activeUser);
      }

      // Fetch courses
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('name', { ascending: true });
        
        if (data && data.length > 0) {
          const mapped = data.map((c: any, index: number) => {
            let instructor = 'Industry Expert';
            let progress = 0;
            let nextClass = 'Fridays, 5:00 PM';
            
            if (c.code === 'FSD-COLLEGE') {
              instructor = 'Hynox Engineering Lead';
              progress = 30; // 30% progress default
              nextClass = 'Today, 5:00 PM';
            } else {
              progress = [40, 75, 90][index % 3];
              instructor = ['Dr. Evelyn Carter', 'Prof. Marcus Vance', 'Dr. Sarah Jenkins'][index % 3];
              nextClass = ['Tomorrow, 10:00 AM', 'Today, 2:00 PM', 'Wednesday, 9:00 AM'][index % 3];
            }
            
            return {
              id: c.id,
              title: c.name,
              code: c.code,
              instructor,
              progress,
              nextClass,
              description: c.description
            };
          });
          setCourses(mapped);
        } else {
          setCourses([
            { id: '1', title: 'Advanced Web Engineering', code: 'CS-402', instructor: 'Dr. Evelyn Carter', progress: 75, nextClass: 'Tomorrow, 10:00 AM' },
            { id: '2', title: 'Data Structures & Algorithms', code: 'CS-201', instructor: 'Prof. Marcus Vance', progress: 40, nextClass: 'Today, 2:00 PM' },
            { id: '3', title: 'Artificial Intelligence Basics', code: 'CS-310', instructor: 'Dr. Sarah Jenkins', progress: 90, nextClass: 'Wednesday, 9:00 AM' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setIsLoadingCourses(false);
      }
    }
    fetchUserAndCourses();
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
          { label: 'Registered Courses', value: `${isLoadingCourses ? '...' : courses.length} Modules`, icon: BookOpen, color: 'cyan' },
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
          {isLoadingCourses ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900/20 border border-slate-900/80 rounded-3xl p-6 h-60 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-slate-850 rounded w-1/4" />
                  <div className="h-6 bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-850 rounded w-1/2" />
                </div>
                <div className="h-6 bg-slate-850 rounded w-full" />
              </div>
            ))
          ) : (
            courses.map((course, idx) => (
              <Link 
                href={`/dashboard/student/courses/${course.id}`} 
                key={course.id}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-900/40 border border-slate-850 hover:border-cyan-500/30 rounded-3xl p-6 space-y-6 transition-all duration-300 hover:bg-slate-900/60 group relative overflow-hidden cursor-pointer"
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
                    <button className="w-8 h-8 rounded-full bg-slate-950 group-hover:bg-cyan-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 transition-all group-hover:scale-105 active:scale-95 shrink-0">
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
              </Link>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
