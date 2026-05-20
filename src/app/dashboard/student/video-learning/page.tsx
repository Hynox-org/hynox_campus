'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Search, 
  Clock, 
  User, 
  Tv, 
  Bookmark,
  CheckCircle,
  PlayCircle
} from 'lucide-react';

export default function VideoLearningPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const lectures = [
    { id: 1, title: 'Session 10: Server Actions and Mutating Data', course: 'Advanced Web Engineering', code: 'CS-402', instructor: 'Dr. Evelyn Carter', duration: '48:20', date: 'May 14, 2026', progress: 100, thumbnail: 'https://images.unsplash.com/photo-1516116211223-5c359a36298a?w=400&auto=format&fit=crop&q=60' },
    { id: 2, title: 'Session 11: Optimistic UI Updates in Next.js', course: 'Advanced Web Engineering', code: 'CS-402', instructor: 'Dr. Evelyn Carter', duration: '52:10', date: 'May 16, 2026', progress: 40, thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&auto=format&fit=crop&q=60' },
    { id: 3, title: 'Lecture 12: Graph Representational Models', course: 'Data Structures & Algorithms', code: 'CS-201', instructor: 'Prof. Marcus Vance', duration: '1:05:40', date: 'May 15, 2026', progress: 10, thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=60' },
    { id: 4, title: 'Session 8: Supervised vs Unsupervised AI Models', course: 'Artificial Intelligence Basics', code: 'CS-310', instructor: 'Dr. Sarah Jenkins', duration: '42:15', date: 'May 08, 2026', progress: 100, thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=60' },
  ];

  const filteredLectures = lectures.filter(lec => 
    lec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lec.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lec.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Video Learning</h2>
          <p className="text-slate-400 text-xs mt-1">Review lecture recordings, supplementary courses, and tech bootcamps.</p>
        </div>

        {/* Search */}
        <div className="flex items-center bg-slate-900 rounded-xl px-4 py-2.5 border border-slate-800 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Search classes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full text-slate-300 placeholder:text-slate-650 font-medium"
          />
        </div>
      </div>

      {/* Lectures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {filteredLectures.map((lec, idx) => (
          <motion.div
            key={lec.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-slate-900/40 border border-slate-850 hover:border-cyan-500/30 rounded-[2rem] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:bg-slate-900/60 group"
          >
            {/* Mock Video Frame */}
            <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-500" 
                style={{ backgroundImage: `url(${lec.thumbnail})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
              
              {/* Play Button overlay */}
              <button className="w-14 h-14 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-10">
                <Play className="w-6 h-6 fill-slate-950 ml-1" />
              </button>

              {/* Progress bar overlay at bottom of frame */}
              <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-900">
                <div 
                  className="h-full bg-cyan-400" 
                  style={{ width: `${lec.progress}%` }}
                />
              </div>

              <span className="absolute bottom-3 right-4 px-2 py-1 bg-slate-950/80 border border-slate-800/80 text-[10px] font-black font-mono text-white rounded-md">
                {lec.duration}
              </span>
            </div>

            {/* Video Meta Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400 rounded font-mono">
                  {lec.code}
                </span>
                {lec.progress === 100 ? (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-450 uppercase tracking-widest">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Finished
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {lec.progress}% watched
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white tracking-tight leading-snug group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {lec.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium">{lec.instructor}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/40 text-[10px] font-bold text-slate-500">
                <span>Recorded: {lec.date}</span>
                <button className="text-slate-550 hover:text-white transition-colors">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>

          </motion.div>
        ))}

        {filteredLectures.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-slate-800/60 rounded-[2rem] bg-slate-900/10">
            <Tv className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h4 className="text-slate-400 font-bold">No Videos Found</h4>
            <p className="text-slate-655 text-xs mt-1">Try refining your search query.</p>
          </div>
        )}
      </div>

    </div>
  );
}
