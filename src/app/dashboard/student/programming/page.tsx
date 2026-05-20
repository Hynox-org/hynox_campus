'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code2, 
  Terminal, 
  Play, 
  CheckCircle, 
  Award, 
  ExternalLink,
  Flame,
  BrainCircuit
} from 'lucide-react';

export default function ProgrammingPage() {
  const [filterLang, setFilterLang] = useState('all');

  const challenges = [
    { id: 1, title: 'Reverse a Linked List in Place', lang: 'JavaScript', difficulty: 'Medium', status: 'solved', xp: '150 XP' },
    { id: 2, title: 'Find the Minimum in a Rotated Sorted Array', lang: 'Python', difficulty: 'Hard', status: 'attempting', xp: '250 XP' },
    { id: 3, title: 'Implement a Binary Search Tree Visualizer', lang: 'JavaScript', difficulty: 'Medium', status: 'new', xp: '200 XP' },
    { id: 4, title: 'Two Sum Hashmap Solution', lang: 'C++', difficulty: 'Easy', status: 'solved', xp: '100 XP' },
    { id: 5, title: 'Valid Parentheses String Matcher', lang: 'Python', difficulty: 'Easy', status: 'solved', xp: '100 XP' },
  ];

  const filteredChallenges = filterLang === 'all' 
    ? challenges 
    : challenges.filter(c => c.lang === filterLang);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Programming Sandbox</h2>
          <p className="text-slate-400 text-xs mt-1">Practice coding challenges, run mock compilers, and compile your semester labs.</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500 w-5 h-5 animate-pulse" />
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Code Streak</p>
              <p className="text-sm font-black text-white mt-1">12 Days</p>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="flex items-center gap-2">
            <Award className="text-cyan-400 w-5 h-5" />
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Global Rank</p>
              <p className="text-sm font-black text-white mt-1">#458</p>
            </div>
          </div>
        </div>
      </div>

      {/* Language filter & code area wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Challenge List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 rounded-[2rem] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Active Challenges</h3>
              
              <div className="flex gap-2">
                {['all', 'JavaScript', 'Python', 'C++'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setFilterLang(lang)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      filterLang === lang
                        ? 'bg-cyan-500 text-slate-950 border-cyan-500'
                        : 'border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredChallenges.map((challenge, idx) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-850 rounded-xl p-4 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      challenge.status === 'solved'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450'
                        : challenge.status === 'attempting'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-450'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <Terminal className="w-4 h-4" />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight">{challenge.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-slate-500">{challenge.lang}</span>
                        <span className="text-[9px] text-slate-550">•</span>
                        <span className={`text-[9px] font-bold uppercase ${
                          challenge.difficulty === 'Hard'
                            ? 'text-rose-455'
                            : challenge.difficulty === 'Medium'
                            ? 'text-cyan-400'
                            : 'text-emerald-400'
                        }`}>{challenge.difficulty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-mono font-black text-cyan-400/80">{challenge.xp}</span>
                    <button className="p-2 bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 rounded-lg text-slate-400 transition-all">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sandbox Launcher Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-[2rem] p-6 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-12 h-12 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-center mx-auto shadow-inner text-cyan-400">
              <BrainCircuit className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Hynox IDE Sandbox</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Launch a clean terminal-scoped virtual code editor. Test node applications, python scripts or C/C++ builds instantly inside the browser sandbox.
              </p>
            </div>

            <button className="w-full py-3.5 bg-cyan-500 text-slate-950 font-black rounded-xl text-xs tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-cyan-500/10">
              <Code2 className="w-4 h-4" />
              <span>LAUNCH IDE CONSOLE</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
