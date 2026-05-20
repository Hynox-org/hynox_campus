'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Clock, 
  HelpCircle, 
  Play, 
  CheckCircle2, 
  XCircle,
  TrendingUp
} from 'lucide-react';

export default function QuizzesPage() {
  const [activeTab, setActiveTab] = useState('pending');

  const quizzes = [
    { id: 1, title: 'Quiz 4: Async Patterns & React Hooks', course: 'Advanced Web Engineering', code: 'CS-402', questions: 15, duration: '20 mins', status: 'pending', deadline: 'May 22, 2026' },
    { id: 2, title: 'Quiz 3: Graphs & BFS/DFS Traversal', course: 'Data Structures & Algorithms', code: 'CS-201', questions: 10, duration: '15 mins', status: 'pending', deadline: 'May 20, 2026' },
    { id: 3, title: 'Quiz 2: Tree Data Structures', course: 'Data Structures & Algorithms', code: 'CS-201', questions: 12, duration: '15 mins', status: 'completed', score: '90%', date: 'May 10, 2026' },
    { id: 4, title: 'Quiz 1: Arrays, Linked Lists & Complexity', course: 'Data Structures & Algorithms', code: 'CS-201', questions: 20, duration: '30 mins', status: 'completed', score: '85%', date: 'May 01, 2026' },
    { id: 5, title: 'Quiz 1: Intelligent Agents & Heuristic Search', course: 'Artificial Intelligence Basics', code: 'CS-310', questions: 15, duration: '25 mins', status: 'completed', score: '100%', date: 'Apr 25, 2026' },
  ];

  const filteredQuizzes = quizzes.filter(quiz => quiz.status === activeTab);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Quizzes & Assessments</h2>
          <p className="text-slate-400 text-xs mt-1">Review your score reports, attempt tests, and track performance.</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2">
            <Award className="text-amber-500 w-5 h-5" />
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Average Grade</p>
              <p className="text-sm font-black text-white mt-1">91.6%</p>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="flex items-center gap-2">
            <TrendingUp className="text-cyan-400 w-5 h-5" />
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Rank</p>
              <p className="text-sm font-black text-white mt-1">Top 5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-900/60 border border-slate-900 rounded-2xl w-fit">
        {[
          { id: 'pending', label: 'Pending Quizzes' },
          { id: 'completed', label: 'Completed Quiz Records' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quiz list */}
      <div className="space-y-4">
        {filteredQuizzes.map((quiz, idx) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-200"
          >
            <div className="flex items-start md:items-center gap-4">
              <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center border ${
                quiz.status === 'completed'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
              }`}>
                {quiz.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <HelpCircle className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[9px] font-bold text-slate-400 rounded font-mono">
                  {quiz.code}
                </span>
                <h4 className="text-base font-bold text-white tracking-tight mt-1">{quiz.title}</h4>
                <p className="text-xs text-slate-500 font-medium">{quiz.course}</p>
              </div>
            </div>

            {/* Quiz Info / Action */}
            <div className="flex flex-wrap items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800/40">
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-1">
                  <HelpCircle className="w-4 h-4 text-slate-650" />
                  <span>{quiz.questions} Qs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-650" />
                  <span>{quiz.duration}</span>
                </div>
              </div>

              {quiz.status === 'completed' ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Grade</p>
                    <p className="text-base font-black text-emerald-400 mt-1">{quiz.score}</p>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-right hidden xs:block">
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none">Deadline</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">{quiz.deadline}</p>
                  </div>
                  <button className="px-5 py-3 bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-black rounded-xl text-xs flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-cyan-500/10">
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>START TEST</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {filteredQuizzes.length === 0 && (
          <div className="py-16 text-center border border-dashed border-slate-800/60 rounded-[2rem] bg-slate-900/10">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
            <h4 className="text-slate-400 font-bold">All Caught Up!</h4>
            <p className="text-slate-650 text-xs mt-1">There are no pending quizzes at this time.</p>
          </div>
        )}
      </div>

    </div>
  );
}
