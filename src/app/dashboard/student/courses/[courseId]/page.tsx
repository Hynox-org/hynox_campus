'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Code2, 
  Tv, 
  Activity, 
  Sparkles, 
  Clock, 
  Flame, 
  Award,
  ChevronRight,
  BookMarked
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchFullCourseFramework } from '@/lib/course-actions';

// Extract YouTube ID and format to secure embed URL
function getEmbedUrl(url?: string) {
  if (!url) return null;
  let videoId = '';
  try {
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0] || '';
    }
  } catch (err) {
    console.error('Error parsing video URL:', err);
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : null;
}

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<any>(null);
  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track selected topic
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  
  // Track completed topics (stored in local storage to simulate persistence)
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  
  // Toggle levels accordion state (all open by default)
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadCourseData() {
      try {
        // Fetch course info
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();
        
        if (courseError) throw courseError;
        setCourse(courseData);

        // Fetch syllabus structure (levels and topics)
        const res = await fetchFullCourseFramework(courseId);
        if (res.success && res.data) {
          setSyllabus(res.data);
          
          // Auto-select first topic
          const firstLevel = res.data[0];
          if (firstLevel && firstLevel.topics && firstLevel.topics.length > 0) {
            setSelectedTopic(firstLevel.topics[0]);
          }

          // Expand all levels initially
          const expandedState: Record<string, boolean> = {};
          res.data.forEach((level: any) => {
            expandedState[level.id] = true;
          });
          setExpandedLevels(expandedState);
        }
        
        // Load completion status from local storage
        const cachedCompletions = localStorage.getItem(`course_completions_${courseId}`);
        if (cachedCompletions) {
          setCompletedTopics(JSON.parse(cachedCompletions));
        }
      } catch (err) {
        console.error('Error loading course data:', err);
      } finally {
        setLoading(false);
      }
    }
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const handleToggleCompletion = (topicId: string) => {
    let updated;
    if (completedTopics.includes(topicId)) {
      updated = completedTopics.filter(id => id !== topicId);
    } else {
      updated = [...completedTopics, topicId];
    }
    setCompletedTopics(updated);
    localStorage.setItem(`course_completions_${courseId}`, JSON.stringify(updated));
  };

  const toggleLevelExpansion = (levelId: string) => {
    setExpandedLevels(prev => ({
      ...prev,
      [levelId]: !prev[levelId]
    }));
  };

  // Calculate syllabus stats
  const totalTopics = syllabus.reduce((acc, lvl) => acc + (lvl.topics?.length || 0), 0);
  const completedCount = syllabus.reduce(
    (acc, lvl) => acc + (lvl.topics?.filter((t: any) => completedTopics.includes(t.id)).length || 0), 
    0
  );
  
  const theoryTopics = syllabus.reduce((acc, lvl) => acc + (lvl.topics?.filter((t: any) => t.type === 'theory').length || 0), 0);
  const labTopics = syllabus.reduce((acc, lvl) => acc + (lvl.topics?.filter((t: any) => t.type === 'lab').length || 0), 0);

  const theoryRatioPercent = totalTopics > 0 ? Math.round((theoryTopics / totalTopics) * 100) : 30;
  const labRatioPercent = totalTopics > 0 ? Math.round((labTopics / totalTopics) * 100) : 70;

  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-200">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Lecture Records...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-200 space-y-4">
        <p className="text-slate-400 font-bold uppercase">Course Record Not Found</p>
        <Link 
          href="/dashboard/student"
          className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold text-white hover:bg-slate-850"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const embedUrl = selectedTopic ? getEmbedUrl(selectedTopic.video_url) : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link 
          href="/dashboard/student"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-wider group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Terminal Console
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span>Campus Modules</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-350">{course.code}</span>
        </div>
      </div>

      {/* Main Grid: Syllabus Explorer & Video Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Syllabus Accordion Roadmap & Metrics */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Course Details Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-850 rounded-[2rem] p-6 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 rounded text-[10px] font-black uppercase tracking-wider font-mono">
              {course.code}
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight leading-tight uppercase">
              {course.name}
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              {course.description || "Comprehensive hands-on study module tailored for industry placement and software development principles."}
            </p>

            {/* Course Progress */}
            <div className="space-y-2 pt-2 border-t border-slate-800/40">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <span>Overall Syllabus Progress</span>
                <span className="text-cyan-400">{progressPercent}% Completed</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-850">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
              <p className="text-[9px] text-slate-500 font-bold italic">
                {completedCount} of {totalTopics} lectures & practical labs marked verified.
              </p>
            </div>
          </div>

          {/* Curriculum Split Metrics Card */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-[2rem] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                Curriculum Design Standard
              </h3>
              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[9px] font-bold uppercase tracking-wider">
                Industry Ratio
              </span>
            </div>

            {/* Curriculum split graphic bar */}
            <div className="space-y-2">
              <div className="flex h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-850/80">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-450 transition-all duration-500" 
                  style={{ width: `${theoryRatioPercent}%` }} 
                  title={`Theory: ${theoryRatioPercent}%`}
                />
                <div className="w-1 bg-slate-950" />
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-450 transition-all duration-500" 
                  style={{ width: `${labRatioPercent}%` }}
                  title={`Practical Labs: ${labRatioPercent}%`}
                />
              </div>
              
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider pt-1">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2 h-2 rounded bg-cyan-400 shrink-0" />
                  <span>Theory ({theoryRatioPercent}%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2 h-2 rounded bg-rose-400 shrink-0" />
                  <span>Practical Labs ({labRatioPercent}%)</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center gap-3">
              <Flame className="w-5 h-5 text-rose-400 animate-pulse shrink-0" />
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                Designed to prioritize build efficiency: <strong>70% practical programming build challenges</strong> combined with <strong>30% theoretical computer science concepts</strong>.
              </p>
            </div>
          </div>

          {/* Syllabus Roadmap Tree */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Syllabus Roadmap ({syllabus.length} levels)
            </h3>
            
            <div className="space-y-3">
              {syllabus.map((level, lvlIdx) => {
                const isExpanded = expandedLevels[level.id];
                return (
                  <div 
                    key={level.id}
                    className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-900/10"
                  >
                    {/* Level Accordion Header */}
                    <button
                      onClick={() => toggleLevelExpansion(level.id)}
                      className="w-full px-5 py-4 flex items-center justify-between bg-slate-900/30 hover:bg-slate-900/60 transition-colors text-left border-b border-slate-850/60"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                          Level {lvlIdx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          {level.title}
                        </h4>
                      </div>
                      <ChevronRight 
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90' : ''}`} 
                      />
                    </button>

                    {/* Level Topics List */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 bg-slate-950/20 divide-y divide-slate-900/40">
                            {level.topics && level.topics.length > 0 ? (
                              level.topics.map((topic: any) => {
                                const isSelected = selectedTopic?.id === topic.id;
                                const isCompleted = completedTopics.includes(topic.id);
                                return (
                                  <div 
                                    key={topic.id}
                                    className={`py-3.5 px-4 flex gap-4 transition-all duration-300 ${
                                      isSelected 
                                        ? 'bg-cyan-500/5 rounded-xl border border-cyan-500/20 shadow-md shadow-cyan-500/5' 
                                        : 'border border-transparent hover:bg-slate-900/30 rounded-xl'
                                    }`}
                                  >
                                    {/* Completion Checkbox */}
                                    <button 
                                      onClick={() => handleToggleCompletion(topic.id)}
                                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                                        isCompleted 
                                          ? 'bg-cyan-500 border-cyan-500 text-slate-950' 
                                          : 'border-slate-800 hover:border-slate-650 hover:bg-slate-900 text-transparent'
                                      }`}
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                                    </button>

                                    {/* Topic Details Link */}
                                    <div 
                                      onClick={() => setSelectedTopic(topic)}
                                      className="flex-1 space-y-2 cursor-pointer"
                                    >
                                      <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider shrink-0 ${
                                            topic.type === 'theory'
                                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                          }`}>
                                            {topic.type === 'theory' ? 'Theory (30%)' : 'Practical Lab (70%)'}
                                          </span>
                                          <span className={`text-xs font-semibold leading-snug transition-colors ${
                                            isSelected ? 'text-cyan-400 font-bold' : 'text-slate-300 hover:text-white'
                                          }`}>
                                            {topic.title}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Tools */}
                                      {topic.tools && topic.tools.length > 0 && (
                                        <div className="flex gap-1 flex-wrap">
                                          {topic.tools.map((tool: string, idx: number) => (
                                            <span 
                                              key={idx} 
                                              className="bg-slate-900/80 border border-slate-850 text-[9px] text-slate-400 px-1.5 py-0.5 rounded-md font-mono"
                                            >
                                              {tool}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-[10px] text-slate-600 italic py-2 text-center">
                                No topics loaded for this level.
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Dynamic Video Player & Active Topic Instructions */}
        <div className="lg:col-span-7 space-y-6">
          
          {selectedTopic ? (
            <div className="space-y-6">
              
              {/* Responsive Video Frame */}
              <div className="bg-slate-900 border border-slate-850 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                {embedUrl ? (
                  <div className="aspect-video w-full bg-slate-950 border border-transparent rounded-[2.5rem] overflow-hidden">
                    <iframe
                      src={embedUrl}
                      title={selectedTopic.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-400 rounded-[2.5rem]">
                    <Tv className="w-16 h-16 text-slate-800 mb-4 animate-pulse" />
                    <h4 className="text-white font-bold text-sm">Lecture Video Recording Unavailable</h4>
                    <p className="text-slate-500 text-xs mt-1 max-w-sm">
                      This unit represents a specialized practical exercise. Review the details and submit code files below.
                    </p>
                  </div>
                )}

                {/* Quick Frame Controls Overlay */}
                <div className="px-6 py-4 bg-slate-900/60 backdrop-blur-xl border-t border-slate-850/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-450 animate-ping" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {selectedTopic.type === 'theory' ? 'Theory Unit Selected' : 'Lab Challenge Activated'}
                    </span>
                  </div>
                  
                  {/* Mark Completion */}
                  <button
                    onClick={() => handleToggleCompletion(selectedTopic.id)}
                    className={`px-4 py-2 border rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 active:scale-95 ${
                      completedTopics.includes(selectedTopic.id)
                        ? 'bg-cyan-500 border-cyan-500 text-slate-950'
                        : 'border-slate-800 text-slate-400 hover:text-white bg-slate-950/40 hover:border-slate-750'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {completedTopics.includes(selectedTopic.id) ? 'VERIFIED COMPLETED' : 'MARK UNIT COMPLETE'}
                  </button>
                </div>
              </div>

              {/* Active Topic Description & Notes */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-[2.5rem] p-8 space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800/40">
                  <div className="space-y-1">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider inline-block ${
                      selectedTopic.type === 'theory'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {selectedTopic.type === 'theory' ? 'Conceptual Study (30%)' : 'Practical Lab Build (70%)'}
                    </span>
                    <h2 className="text-xl font-black text-white tracking-tight uppercase">
                      {selectedTopic.title}
                    </h2>
                  </div>
                  
                  {/* Tech stack tools */}
                  {selectedTopic.tools && selectedTopic.tools.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap shrink-0">
                      {selectedTopic.tools.map((tool: string, idx: number) => (
                        <span 
                          key={idx} 
                          className="bg-slate-950 border border-slate-850 text-[10px] font-mono text-cyan-400/80 px-2.5 py-1 rounded-lg"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Detailed syllabus summary */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Syllabus Outline & Lab Instructions
                  </h3>
                  <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl">
                    <p className="text-slate-300 text-xs leading-relaxed font-semibold whitespace-pre-line">
                      {selectedTopic.content || "No content overview available for this topic. Review lecture materials or check external assets."}
                    </p>
                  </div>
                </div>

                {/* Helper Resources */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Lecture Resources</h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">Download cheat sheets, slides, and syllabus outlines associated with this class.</p>
                    </div>
                    <button className="w-fit text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1">
                      Download Handouts <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Submit Homework</h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">Submit GitHub link or code build archive files for grading and verification.</p>
                    </div>
                    <button className="w-fit text-[10px] font-bold text-rose-450 hover:underline flex items-center gap-1">
                      Upload Lab Repository <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* Welcome / Empty state */
            <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-[2.5rem] py-24 px-6 text-center space-y-6">
              <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-650 shadow-inner">
                <BookMarked className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">No Topic Selected</h3>
                <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                  Select a theory unit or practical coding lab in the syllabus roadmap to display lecture video recording and instructions.
                </p>
              </div>
              
              {/* Start Course Trigger */}
              {syllabus[0]?.topics?.[0] && (
                <button
                  onClick={() => setSelectedTopic(syllabus[0].topics[0])}
                  className="px-6 py-3 bg-cyan-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs tracking-wider uppercase inline-flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-slate-950" /> Start Learning Now
                </button>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
