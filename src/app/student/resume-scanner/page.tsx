'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  BadgeAlert, 
  FileSearch,
  Check
} from 'lucide-react';

export default function ResumeScannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setScanResult(null);
    }
  };

  const handleScan = () => {
    if (!file) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        score: 82,
        fileName: file.name,
        verdict: 'Good Match',
        summary: 'Your resume shows strong proficiency in frontend development technologies and software lifecycle. However, incorporating more quantified metrics and system design keywords will push your score higher.',
        strengths: [
          'Excellent structural layout and readability.',
          'Solid representation of React, TypeScript, and Next.js experience.',
          'No grammar or spellcheck errors detected.'
        ],
        weaknesses: [
          'Lacks numerical impact metrics (e.g., "improved load time by 30%").',
          'Database and backend keywords (SQL, Postgres, Node.js) are poorly highlighted.',
          'Summary section is slightly too long.'
        ],
        keywords: {
          matched: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Git', 'REST APIs'],
          missing: ['SQL', 'PostgreSQL', 'Docker', 'System Design', 'CI/CD Pipelines']
        }
      });
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Resume Scanner</h2>
        <p className="text-slate-400 text-xs mt-1">Check your resume against ATS tracking systems and optimize for tech jobs.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 rounded-[2rem] p-6 space-y-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Upload Resume</h3>
            
            <div className="border-2 border-dashed border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all bg-slate-950/40 relative group cursor-pointer">
              <input 
                type="file" 
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-850 group-hover:scale-110 transition-transform mb-4">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <p className="text-xs font-bold text-slate-350">
                {file ? file.name : 'Drag & drop or browse'}
              </p>
              <p className="text-[10px] text-slate-550 mt-1 font-medium">Supports PDF, DOCX (Max 5MB)</p>
            </div>

            {file && !isScanning && !scanResult && (
              <button 
                onClick={handleScan}
                className="w-full py-3.5 bg-cyan-500 text-slate-950 font-black rounded-xl text-xs tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-cyan-500/10"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>SCAN MY RESUME</span>
              </button>
            )}

            {isScanning && (
              <div className="space-y-4 py-4 text-center">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">Analyzing text & metrics...</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2">
          {scanResult ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Score Dashboard Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-[2rem] p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 rounded-md text-[9px] font-bold uppercase tracking-wider">
                      ATS Report Card
                    </span>
                    <span className="text-[10px] text-slate-550 font-mono">{scanResult.fileName}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight mt-2">{scanResult.verdict}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-md">{scanResult.summary}</p>
                </div>

                <div className="relative shrink-0 flex items-center justify-center w-24 h-24 rounded-full bg-slate-950 border border-slate-800 shadow-inner">
                  <div className="text-center">
                    <span className="text-2xl font-black text-cyan-400 leading-none">{scanResult.score}</span>
                    <p className="text-[8px] font-black text-slate-550 uppercase tracking-widest leading-none mt-1">Score</p>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Strengths */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-[2rem] p-6 space-y-4">
                  <h4 className="text-xs font-black text-emerald-450 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-3">
                    {scanResult.strengths.map((str: string, index: number) => (
                      <li key={index} className="flex gap-2.5 text-xs text-slate-350 leading-normal">
                        <Check className="w-4 h-4 text-emerald-450 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-[2rem] p-6 space-y-4">
                  <h4 className="text-xs font-black text-rose-455 uppercase tracking-widest flex items-center gap-1.5">
                    <BadgeAlert className="w-4 h-4 text-rose-500" />
                    Improvement Areas
                  </h4>
                  <ul className="space-y-3">
                    {scanResult.weaknesses.map((weak: string, index: number) => (
                      <li key={index} className="flex gap-2.5 text-xs text-slate-350 leading-normal">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Keywords Match Section */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-[2rem] p-6 space-y-4">
                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                  <FileSearch className="w-4 h-4 text-cyan-400" />
                  Target Keywords Match
                </h4>
                
                <div className="space-y-4 pt-2">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Matched Keywords</span>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.keywords.matched.map((kw: string) => (
                        <span key={kw} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Missing/Recommended Keywords</span>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.keywords.missing.map((kw: string) => (
                        <span key={kw} className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[10px] font-bold">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center border border-dashed border-slate-800/80 rounded-[2.5rem] bg-slate-900/10 px-6 py-12">
              <FileSearch className="w-12 h-12 text-slate-700 mb-4" />
              <h4 className="text-slate-400 font-bold">Awaiting Document Upload</h4>
              <p className="text-slate-650 text-xs max-w-xs mt-1">Upload your resume in PDF format and click scan to receive instant structure and keyword optimization analytics.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
