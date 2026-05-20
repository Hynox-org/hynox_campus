'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  PlusCircle, 
  ExternalLink, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', repoUrl: '', liveUrl: '', notes: '' });

  const projects = [
    { id: 1, title: 'Build a Next.js Netflix Clone', course: 'Advanced Web Engineering', code: 'CS-402', status: 'active', deadline: 'May 22, 2026', progress: 65, difficulty: 'Medium' },
    { id: 2, title: 'Graph Operations Visualizer', course: 'Data Structures & Algorithms', code: 'CS-201', status: 'active', deadline: 'May 28, 2026', progress: 20, difficulty: 'Hard' },
    { id: 3, title: 'Portfolio Website', course: 'Advanced Web Engineering', code: 'CS-402', status: 'completed', score: '95/100', date: 'May 05, 2026', repo: 'https://github.com/student/portfolio', live: 'https://student-portfolio.vercel.app' },
    { id: 4, title: 'Red-Black Tree Insertion Simulator', course: 'Data Structures & Algorithms', code: 'CS-201', status: 'completed', score: '90/100', date: 'Apr 20, 2026', repo: 'https://github.com/student/rbt-simulator' },
  ];

  const filteredProjects = projects.filter(proj => proj.status === activeTab);

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Project Submitted: ${formData.title}`);
    setIsSubmitOpen(false);
    setFormData({ title: '', repoUrl: '', liveUrl: '', notes: '' });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">My Projects</h2>
          <p className="text-slate-400 text-xs mt-1">Submit your coding assignments and view previous grades.</p>
        </div>

        <button 
          onClick={() => setIsSubmitOpen(true)}
          className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-3 rounded-xl font-black text-xs transition-all shadow-lg shadow-cyan-500/10 active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>SUBMIT WORK</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-900/60 border border-slate-900 rounded-2xl w-fit">
        {[
          { id: 'active', label: 'Active Projects' },
          { id: 'completed', label: 'Completed Submissions' },
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((proj, idx) => (
          <motion.div
            key={proj.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-3xl p-6 flex flex-col justify-between gap-6 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400 rounded font-mono">
                  {proj.code}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  proj.difficulty === 'Hard' ? 'text-rose-400' : 'text-cyan-400'
                }`}>
                  {proj.status === 'active' ? `${proj.difficulty} Level` : 'graded'}
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {proj.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">{proj.course}</p>
              </div>
            </div>

            {proj.status === 'active' ? (
              <div className="space-y-4 pt-4 border-t border-slate-800/40">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Task Progress</span>
                    <span className="text-white">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full bg-cyan-400 transition-all duration-500" 
                      style={{ width: `${proj.progress}%` }} 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due: {proj.deadline}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, title: proj.title }));
                      setIsSubmitOpen(true);
                    }}
                    className="px-4 py-2 bg-slate-950 hover:bg-cyan-500/10 hover:text-cyan-400 text-slate-450 border border-slate-800 rounded-xl transition-all"
                  >
                    SUBMIT
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-800/40 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs">
                  {proj.repo && (
                    <a href={proj.repo} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
                      <GithubIcon className="w-4.5 h-4.5" />
                    </a>
                  )}
                  {proj.live && (
                    <a href={proj.live} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
                      <ExternalLink className="w-4.5 h-4.5" />
                    </a>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-550 uppercase tracking-widest leading-none">Grade Report</p>
                  <p className="text-sm font-black text-emerald-400 mt-1">{proj.score}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Submission Overlay Dialog */}
      <AnimatePresence>
        {isSubmitOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSubmitOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 m-auto w-full max-w-lg h-fit bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 z-50 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <h3 className="text-base font-black text-white uppercase tracking-wider">Submit Project Files</h3>
                <button 
                  onClick={() => setIsSubmitOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitProject} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-cyan-500/50 focus:outline-none"
                    placeholder="Enter project name..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Git Repository URL</label>
                  <input 
                    type="url" 
                    required
                    value={formData.repoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, repoUrl: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-cyan-500/50 focus:outline-none"
                    placeholder="https://github.com/username/project"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Deployment Link (Optional)</label>
                  <input 
                    type="url" 
                    value={formData.liveUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-cyan-500/50 focus:outline-none"
                    placeholder="https://project.vercel.app"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Submission Notes / Comments</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-cyan-500/50 focus:outline-none resize-none"
                    placeholder="Provide details for grading..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-cyan-500 text-slate-950 font-black rounded-xl text-xs tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-cyan-500/10"
                >
                  <CheckCircle2 className="w-4 h-4 fill-slate-950" />
                  <span>CONFIRM SUBMISSION</span>
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
