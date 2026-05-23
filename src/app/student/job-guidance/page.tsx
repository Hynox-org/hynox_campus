'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  User, 
  Calendar, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function JobGuidancePage() {
  const matchingJobs = [
    { id: 1, title: 'Frontend Developer Intern', company: 'DevsTech Solutions', location: 'Remote / Bangalore', salary: '₹25,000 - ₹35,500 / month', match: '95%', type: 'Internship' },
    { id: 2, title: 'Junior Software Engineer (React/Node)', company: 'Hynox Labs', location: 'Mumbai Office', salary: '₹6L - ₹8L LPA', match: '88%', type: 'Full-time' },
    { id: 3, title: 'Next.js Frontend Consultant', company: 'Synthetix Corp', location: 'Remote (US/India)', salary: '₹40,000 / month', match: '80%', type: 'Part-time' },
  ];

  const upcomingSessions = [
    { id: 1, mentor: 'Dr. Evelyn Carter', role: 'Engineering Lead at Hynox', topic: 'Portfolio Audit & Resume Reviews', date: 'Tomorrow, 4:00 PM', duration: '30 mins' },
    { id: 2, mentor: 'Prof. Marcus Vance', role: 'Staff Scientist', topic: 'Mock Technical System Design Interview', date: 'May 24, 2026, 2:00 PM', duration: '60 mins' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Job Guidance & Mentorship</h2>
        <p className="text-slate-400 text-xs mt-1">Get placement training, personalized mentorship, and apply for verified partner jobs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Mentor and Scheduling Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 rounded-[2rem] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Booked Sessions</h3>
              <Calendar className="text-cyan-400 w-4 h-4" />
            </div>

            <div className="space-y-4">
              {upcomingSessions.map((session, idx) => (
                <div key={session.id} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-black text-white">{session.topic}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">{session.mentor}</p>
                    <p className="text-[9px] text-slate-550">{session.role}</p>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold text-cyan-400/80 bg-cyan-500/5 border border-cyan-500/10 rounded-lg px-3 py-1.5">
                    <span>{session.date}</span>
                    <span>• {session.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 font-bold rounded-xl text-xs tracking-wider flex items-center justify-center gap-2 transition-all">
              <span>SCHEDULE NEW SESSION</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Guidelines / Placement Prep */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-[2rem] p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Placement Toolkit</h3>
            
            <div className="space-y-3">
              {[
                { title: 'Technical Interview Cheatsheet', category: 'DSA & Dev' },
                { title: 'Behavioral Questions Guide', category: 'HR Prep' },
                { title: 'System Design Fundamentals', category: 'High-Level Design' },
              ].map((kit, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl hover:border-slate-800 border border-transparent transition-all cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h4 className="text-[10px] font-bold text-white leading-tight">{kit.title}</h4>
                      <span className="text-[8px] font-black text-slate-550 uppercase tracking-widest">{kit.category}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Job Matches Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 rounded-[2rem] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Recommended Job Matches</h3>
              <span className="px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-cyan-400" />
                Profile Match Powered
              </span>
            </div>

            <div className="space-y-4">
              {matchingJobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-950/50 hover:bg-slate-950/80 border border-slate-850 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-400 rounded font-mono">
                        {job.type}
                      </span>
                      <span className="text-[9px] font-black text-emerald-450 uppercase tracking-widest">
                        {job.match} ATS Match
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white tracking-tight">{job.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">{job.company}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-bold">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-600" />
                        <span>{job.location}</span>
                      </div>
                      <div>
                        <span>{job.salary}</span>
                      </div>
                    </div>
                  </div>

                  <button className="px-4 py-2.5 bg-cyan-500 text-slate-950 font-black rounded-xl text-[10px] tracking-wider active:scale-95 transition-all shadow-lg shadow-cyan-500/10 shrink-0 self-start sm:self-center">
                    APPLY NOW
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
