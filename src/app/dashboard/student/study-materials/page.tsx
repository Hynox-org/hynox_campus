'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Download, 
  BookOpen, 
  ExternalLink,
  Filter,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function StudyMaterialsPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const materials = [
    { id: 1, title: 'Lecture 12: React Server Components & SSR', type: 'slide', size: '4.8 MB', date: 'May 15, 2026', course: 'Advanced Web Engineering', code: 'CS-402' },
    { id: 2, title: 'Data Structures Cheat Sheet: Trees & Graphs', type: 'note', size: '1.2 MB', date: 'May 12, 2026', course: 'Data Structures & Algorithms', code: 'CS-201' },
    { id: 3, title: 'Introduction to Deep Learning E-Book', type: 'book', size: '18.5 MB', date: 'May 08, 2026', course: 'Artificial Intelligence Basics', code: 'CS-310' },
    { id: 4, title: 'Spring Semester Midterm Past Papers (2025)', type: 'exam', size: '840 KB', date: 'May 02, 2026', course: 'Data Structures & Algorithms', code: 'CS-201' },
    { id: 5, title: 'Lecture 11: Edge Middleware & Routing', type: 'slide', size: '3.9 MB', date: 'Apr 28, 2026', course: 'Advanced Web Engineering', code: 'CS-402' },
    { id: 6, title: 'Neural Networks Architecture Slides', type: 'slide', size: '11.2 MB', date: 'Apr 22, 2026', course: 'Artificial Intelligence Basics', code: 'CS-310' },
  ];

  const filteredMaterials = materials.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Study Materials</h2>
          <p className="text-slate-400 text-xs mt-1">Access lecture notes, slides, cheatsheets, and digital books.</p>
        </div>
        
        {/* Search */}
        <div className="flex items-center bg-slate-900 rounded-xl px-4 py-2.5 border border-slate-800 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Search materials..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full text-slate-300 placeholder:text-slate-650 font-medium"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-slate-900/60 border border-slate-900 rounded-2xl w-fit overflow-x-auto max-w-full">
        {[
          { id: 'all', label: 'All Resources' },
          { id: 'slide', label: 'Lecture Slides' },
          { id: 'note', label: 'Notes' },
          { id: 'book', label: 'E-Books' },
          { id: 'exam', label: 'Past Papers' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
              filter === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-slate-900/40 border border-slate-850 hover:border-cyan-500/30 rounded-3xl p-6 flex flex-col justify-between gap-6 transition-all duration-300 hover:bg-slate-900/60 group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400 rounded-md font-mono">
                  {item.code}
                </span>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  {item.type}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white leading-snug group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 mt-2 font-medium">{item.course}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/40">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{item.date}</span>
                <span>•</span>
                <span>{item.size}</span>
              </div>

              <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-cyan-500/30 text-slate-400 hover:text-white rounded-xl text-[10px] font-bold transition-all">
                <Download className="w-3.5 h-3.5" />
                <span>GET</span>
              </button>
            </div>
          </motion.div>
        ))}

        {filteredMaterials.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-slate-800/60 rounded-[2rem] bg-slate-900/10">
            <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h4 className="text-slate-400 font-bold">No Materials Found</h4>
            <p className="text-slate-650 text-xs mt-1">Try resetting your filter or search query.</p>
          </div>
        )}
      </div>

    </div>
  );
}
