"use client";

import React, { useState } from "react";
import { 
  listModulesAction, 
  listLessonsAction, 
  listLessonResourcesAction 
} from "@/app/actions/academic-actions";
import { 
  startOrUpdateLessonProgressAction,
  completeLessonProgressAction,
  getStudentDeliveryDataAction
} from "@/app/actions/delivery-actions";
import { 
  Building, 
  GraduationCap, 
  BookOpen, 
  Award, 
  CheckCircle,
  Circle,
  Play,
  ArrowRight, 
  ChevronRight, 
  Clock, 
  File, 
  ExternalLink,
  ChevronLeft,
  BookOpenCheck,
  CheckCircle2
} from "lucide-react";

interface StudentConsoleProps {
  studentEmail: string;
  fullName: string;
  primaryRole: string;
  institution: any;
  initialPrograms: any[];
  studentId: string;
}

export default function StudentConsole({ 
  studentEmail, 
  fullName, 
  primaryRole, 
  institution, 
  initialPrograms,
  studentId
}: StudentConsoleProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "academics">("overview");

  // Academics exploration state
  const [programs, setPrograms] = useState<any[]>(initialPrograms);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<string, any>>({});
  
  // Interactive lesson preview state
  const [activeLesson, setActiveLesson] = useState<any | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const refreshStudentData = async () => {
    const res = await getStudentDeliveryDataAction(studentId);
    if (res.programs) {
      setPrograms(res.programs);
      // Update currently selected program & course in state to reflect new progress percentages
      if (selectedProgram) {
        const updatedProg = res.programs.find(p => p.id === selectedProgram.id);
        if (updatedProg) {
          setSelectedProgram(updatedProg);
          if (selectedCourse) {
            const updatedCourse = updatedProg.courses.find((c: any) => c.id === selectedCourse.id);
            if (updatedCourse) {
              setSelectedCourse(updatedCourse);
            }
          }
        }
      }
    }
  };

  const handleSelectProgram = (program: any) => {
    setSelectedProgram(program);
    setSelectedCourse(null);
    setModules([]);
    setActiveLesson(null);
  };

  const handleSelectCourse = async (course: any) => {
    setSelectedCourse(course);
    setActiveLesson(null);
    setLoading(true);
    setError("");
    
    const mRes = await listModulesAction(course.id);
    if (mRes.error) {
      setError(mRes.error);
    } else if (mRes.modules) {
      const modulesWithLessons = await Promise.all(
        mRes.modules.map(async (m: any) => {
          const lRes = await listLessonsAction(m.id);
          const lessons = lRes.lessons || [];
          const lessonsWithResources = await Promise.all(
            lessons.map(async (l: any) => {
              const rRes = await listLessonResourcesAction(l.id);
              
              // Load lesson progress state
              const progRes = await startOrUpdateLessonProgressAction(studentId, l.id, course.id);
              const progressData = progRes.progress;
              if (progressData) {
                setLessonProgressMap(prev => ({
                  ...prev,
                  [l.id]: progressData
                }));
              }

              return { ...l, resources: rRes.resources || [] };
            })
          );
          return { ...m, lessons: lessonsWithResources };
        })
      );
      setModules(modulesWithLessons);
    }
    setLoading(false);
  };

  const handleStartLesson = async (lesson: any) => {
    setActiveLesson(lesson);
    if (!selectedCourse) return;
    
    setActionLoading(true);
    const res = await startOrUpdateLessonProgressAction(studentId, lesson.id, selectedCourse.id);
    if (res.progress) {
      setLessonProgressMap(prev => ({
        ...prev,
        [lesson.id]: res.progress
      }));
    }
    setActionLoading(false);
  };

  const handleCompleteLesson = async (lesson: any) => {
    if (!selectedCourse) return;
    setActionLoading(true);
    const res = await completeLessonProgressAction(studentId, lesson.id, selectedCourse.id);
    if (res.progress) {
      setLessonProgressMap(prev => ({
        ...prev,
        [lesson.id]: res.progress
      }));
      setSuccess(`Completed lesson: ${lesson.title}`);
      setTimeout(() => setSuccess(""), 3000);
      await refreshStudentData();
    }
    setActionLoading(false);
  };

  // Quick stats calculations
  const totalEnrolledCourses = programs.reduce((acc, prog) => acc + (prog.courses?.length || 0), 0);
  const inProgressCourses = programs.flatMap(p => p.courses || []).filter(c => c.progress?.status_code === "in_progress").length;
  const completedCourses = programs.flatMap(p => p.courses || []).filter(c => c.progress?.status_code === "completed").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start text-xs">
      
      {/* Sidebar Navigation */}
      <div className="md:col-span-1 bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm flex flex-col gap-2">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0] mb-2">
          <div className="bg-[#2563EB]/10 text-[#2563EB] p-2.5 rounded-xl border border-[#2563EB]/20">
            <GraduationCap size={16} />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-xs text-[#0F172A] truncate">{fullName}</h2>
            <p className="text-[10px] text-[#475569] font-mono truncate">{studentEmail}</p>
          </div>
        </div>

        <button
          onClick={() => {
            setActiveTab("overview");
            setSelectedProgram(null);
            setSelectedCourse(null);
            setActiveLesson(null);
          }}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
            activeTab === "overview" && !selectedProgram
              ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] shadow-sm"
              : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
          }`}
        >
          <Building size={16} />
          Overview Dashboard
        </button>

        <button
          onClick={() => {
            setActiveTab("academics");
            setSelectedProgram(null);
            setSelectedCourse(null);
            setActiveLesson(null);
          }}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
            activeTab === "academics" || selectedProgram
              ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] shadow-sm"
              : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
          }`}
        >
          <BookOpen size={16} />
          My Learning Programs ({programs.length})
        </button>
      </div>

      {/* Main Content Area */}
      <div className="md:col-span-3 flex flex-col gap-6">
        
        {error && (
          <div className="bg-[#DC2626]/5 border border-[#DC2626]/20 text-[#DC2626] rounded-xl p-4 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 text-[#16A34A] rounded-xl p-4 text-xs flex items-center gap-2">
            <CheckCircle2 size={14} />
            {success}
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && !selectedProgram && (
          <div className="space-y-6">
            
            {/* Quick Metrics Header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex items-center gap-3">
                <div className="bg-[#2563EB]/10 text-[#2563EB] p-2.5 rounded-xl">
                  <BookOpen size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-[#475569] block font-semibold uppercase tracking-wider">Total Courses</span>
                  <span className="text-sm font-bold text-[#0F172A]">{totalEnrolledCourses} Assigned</span>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex items-center gap-3">
                <div className="bg-[#F59E0B]/10 text-[#F59E0B] p-2.5 rounded-xl">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-[#475569] block font-semibold uppercase tracking-wider">In Progress</span>
                  <span className="text-sm font-bold text-[#0F172A]">{inProgressCourses} Courses</span>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex items-center gap-3">
                <div className="bg-[#16A34A]/10 text-[#16A34A] p-2.5 rounded-xl">
                  <Award size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-[#475569] block font-semibold uppercase tracking-wider">Completed</span>
                  <span className="text-sm font-bold text-[#0F172A]">{completedCourses} Courses</span>
                </div>
              </div>
            </div>

            {/* Enrolled Cohorts & Programs Section */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-3 flex items-center gap-1.5">
                <GraduationCap className="text-[#2563EB]" size={16} /> My Enrolled Batches (Cohorts)
              </h3>
              
              <div className="space-y-4">
                {programs.length > 0 ? (
                  programs.map((prog) => (
                    <div key={prog.id} className="border border-[#E2E8F0] rounded-xl p-4 bg-slate-50/30 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-[#0F172A] text-xs">{prog.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-[#475569]">
                          <span className="bg-[#2563EB]/15 text-[#2563EB] px-2 py-0.5 rounded font-bold">
                            Cohort: {prog.cohorts?.map((c: any) => c.code).join(", ") || "N/A"}
                          </span>
                          <span>•</span>
                          <span>{prog.courses?.length || 0} assigned courses</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleSelectProgram(prog)}
                        className="bg-white border border-[#E2E8F0] text-[#0F172A] px-3.5 py-1.5 rounded-lg shadow-sm font-semibold hover:border-[#2563EB]/30 hover:bg-[#2563EB]/5 transition-all self-start sm:self-center flex items-center gap-1.5"
                      >
                        Enter Program <ChevronRight size={13} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[#475569] font-medium bg-slate-50/20 rounded-xl border border-dashed border-[#E2E8F0]">
                    You are not currently enrolled in any active cohorts. Please contact your administrator.
                  </div>
                )}
              </div>
            </div>

            {/* Continue Learning Course Cards */}
            {totalEnrolledCourses > 0 && (
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-3 flex items-center gap-1.5">
                  <BookOpenCheck className="text-[#2563EB]" size={16} /> Continue Learning
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programs.flatMap(p => p.courses || []).map((course) => {
                    const percentage = course.progress?.progress_percentage || 0;
                    return (
                      <div key={course.id} className="border border-[#E2E8F0] rounded-xl p-4 hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-slate-100 text-[#475569] border-[#E2E8F0]">
                              {course.course_type}
                            </span>
                            <span className="font-bold text-[10px] text-[#2563EB]">{percentage}% Complete</span>
                          </div>
                          
                          <h4 className="font-bold text-[#0F172A] text-xs mb-1 truncate">{course.title}</h4>
                          <p className="text-[10px] text-[#475569] line-clamp-2 leading-relaxed mb-4">{course.description}</p>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
                          <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#2563EB] h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[#475569] font-mono">
                              {course.progress?.completed_lessons || 0} / {course.progress?.total_lessons || 0} Lessons
                            </span>
                            <button
                              onClick={async () => {
                                // Find program of this course
                                const prog = programs.find(p => p.courses.some((c: any) => c.id === course.id));
                                if (prog) {
                                  setSelectedProgram(prog);
                                  await handleSelectCourse(course);
                                  setActiveTab("academics");
                                }
                              }}
                              className="text-[#2563EB] hover:underline font-bold flex items-center gap-1"
                            >
                              Resume <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: ACADEMICS / SYLLABUS VIEWER */}
        {(activeTab === "academics" || selectedProgram) && (
          <div className="space-y-6">
            {!selectedProgram ? (
              // 1. Program list
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-3">Available Programs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programs.length > 0 ? (
                    programs.map((prog) => (
                      <div
                        key={prog.id}
                        onClick={() => handleSelectProgram(prog)}
                        className="bg-slate-50/50 border border-[#E2E8F0] hover:border-[#2563EB]/30 hover:bg-[#2563EB]/5 p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="font-bold text-[#0F172A] truncate">{prog.title}</h4>
                          <p className="text-[#475569] text-[10px] line-clamp-1 mt-1">{prog.description || "No description set."}</p>
                        </div>
                        <ChevronRight size={16} className="text-[#475569] shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-[#475569] font-medium bg-slate-50/20 rounded-xl">
                      No active academic programs assigned.
                    </div>
                  )}
                </div>
              </div>
            ) : !selectedCourse ? (
              // 2. Course list inside program
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs border-b border-[#E2E8F0] pb-3 mb-3">
                  <button
                    onClick={() => setSelectedProgram(null)}
                    className="text-[#2563EB] hover:underline flex items-center gap-1 font-bold"
                  >
                    <ChevronLeft size={14} /> Programs
                  </button>
                  <span className="text-slate-300">/</span>
                  <span className="font-semibold text-[#0F172A]">{selectedProgram.title}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedProgram.courses?.length > 0 ? (
                    selectedProgram.courses.map((course: any) => (
                      <div
                        key={course.id}
                        onClick={() => handleSelectCourse(course)}
                        className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#2563EB]/20 transition-all flex flex-col justify-between cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="bg-[#2563EB]/10 text-[#2563EB] p-2 rounded-lg">
                              <BookOpen size={16} />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-slate-50 text-[#475569] border-[#E2E8F0]">
                              {course.course_type}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-xs text-[#0F172A] mb-1">{course.title}</h3>
                          <p className="text-[10px] text-[#475569] line-clamp-2 leading-relaxed mb-4">
                            {course.description || "No course description provided."}
                          </p>
                        </div>

                        {/* Progress readout */}
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-[10px] text-[#475569]">
                            <span>Progress</span>
                            <span className="font-bold">{course.progress?.progress_percentage || 0}%</span>
                          </div>
                          <div className="w-full bg-[#E2E8F0] h-1 rounded-full overflow-hidden">
                            <div className="bg-[#2563EB] h-full rounded-full" style={{ width: `${course.progress?.progress_percentage || 0}%` }}></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] text-[10px] text-[#475569]">
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {course.duration_minutes || 0} mins
                          </span>
                          <span className="flex items-center gap-0.5 font-bold text-[#2563EB] hover:underline">
                            Start Learning <ArrowRight size={11} />
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-[#475569] font-medium bg-slate-50/20 rounded-xl">
                      No assigned courses registered under this program.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 3. Course space curriculum view & active lesson details
              <div className="space-y-6">
                
                {/* Course header */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 text-xs border-b border-[#E2E8F0] pb-3">
                    <button
                      onClick={() => {
                        setSelectedCourse(null);
                        setActiveLesson(null);
                      }}
                      className="text-[#2563EB] hover:underline flex items-center gap-1 font-bold"
                    >
                      <ChevronLeft size={14} /> Courses
                    </button>
                    <span className="text-slate-300">/</span>
                    <span className="font-semibold text-[#0F172A] truncate max-w-[200px]">{selectedCourse.title}</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 border border-[#E2E8F0] rounded-xl p-4">
                    <div>
                      <h4 className="font-bold text-[#0F172A]">{selectedCourse.title}</h4>
                      <p className="text-[#475569] text-[10px] mt-1">{selectedCourse.description || "No description set."}</p>
                    </div>
                    <div className="bg-white px-3 py-2 rounded-lg border border-[#E2E8F0] text-center shrink-0">
                      <p className="font-bold text-[#0F172A] text-xs font-mono">{selectedCourse.progress?.progress_percentage || 0}%</p>
                      <p className="text-[8px] text-[#475569] font-bold uppercase tracking-wider mt-0.5">COMPLETED</p>
                    </div>
                  </div>

                  {/* ACTIVE LESSON VIEW SECTION */}
                  {activeLesson && (
                    <div className="border border-[#2563EB]/20 bg-[#2563EB]/5 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wider">ACTIVE LESSON PLAYER</p>
                          <h4 className="font-bold text-sm text-[#0F172A] mt-0.5">{activeLesson.title}</h4>
                        </div>
                        <div className="flex gap-2">
                          {lessonProgressMap[activeLesson.id]?.status_code === "completed" ? (
                            <span className="bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle size={12} /> Completed
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCompleteLesson(activeLesson)}
                              disabled={actionLoading}
                              className="bg-[#2563EB] text-white px-3.5 py-1.5 rounded-lg shadow-sm font-semibold hover:bg-[#2563EB]/95 transition-all text-[10px] flex items-center gap-1 disabled:opacity-50"
                            >
                              Mark as Completed
                            </button>
                          )}
                        </div>
                      </div>

                      {activeLesson.video_url && (
                        <div className="bg-black aspect-video rounded-xl flex items-center justify-center text-white relative overflow-hidden border border-slate-800">
                          <p className="text-xs font-semibold flex items-center gap-2">
                            <Play fill="white" size={16} /> Playable Video Resource: {activeLesson.video_url}
                          </p>
                        </div>
                      )}

                      {activeLesson.content_json?.body && (
                        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl text-xs leading-relaxed text-[#0F172A]">
                          {activeLesson.content_json.body}
                        </div>
                      )}

                      {/* Active Lesson Resources */}
                      {activeLesson.resources && activeLesson.resources.length > 0 && (
                        <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 space-y-2">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-[#475569]">Attachments & Code Templates</p>
                          <div className="divide-y divide-[#E2E8F0]">
                            {activeLesson.resources.map((res: any) => (
                              <div key={res.id} className="py-2 flex items-center justify-between">
                                <span className="font-semibold text-[#0f172a]">{res.title}</span>
                                {res.external_url && (
                                  <a 
                                    href={res.external_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[#2563EB] font-bold flex items-center gap-0.5"
                                  >
                                    View <ExternalLink size={10} />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <h3 className="font-bold text-xs text-[#0F172A] uppercase tracking-wide pt-2">Course Syllabus & Curriculum</h3>
                  
                  {loading ? (
                    <div className="text-center py-6 text-[#475569] font-medium animate-pulse">Loading modules...</div>
                  ) : modules.length > 0 ? (
                    <div className="space-y-4">
                      {modules.map((mod) => (
                        <div key={mod.id} className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
                          {/* Module title */}
                          <div className="bg-slate-50 px-4 py-3 border-b border-[#E2E8F0]">
                            <p className="font-semibold text-xs text-[#0F172A]">
                              Module {mod.position}: {mod.title}
                            </p>
                            {mod.description && <p className="text-[10px] text-[#475569] mt-0.5 font-medium">{mod.description}</p>}
                          </div>

                          {/* Lessons */}
                          <div className="p-4 space-y-3 bg-white">
                            {mod.lessons && mod.lessons.length > 0 ? (
                              mod.lessons.map((les: any) => {
                                const progState = lessonProgressMap[les.id];
                                return (
                                  <div key={les.id} className="border border-[#E2E8F0] rounded-lg p-3 flex items-center justify-between gap-4">
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-xs text-[#0F172A]">{les.title}</span>
                                        <span className="text-[9px] bg-slate-100 text-[#475569] px-1.5 py-0.5 rounded font-bold capitalize">
                                          {les.lesson_type?.code || "lesson"}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-[#475569] font-mono mt-0.5">{les.duration || 0} mins</div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      {/* Status display */}
                                      {progState?.status_code === "completed" ? (
                                        <span className="text-[#16A34A]" title="Completed">
                                          <CheckCircle size={18} />
                                        </span>
                                      ) : progState?.status_code === "in_progress" ? (
                                        <span className="text-[#F59E0B]" title="In Progress">
                                          <Circle size={18} className="animate-pulse" />
                                        </span>
                                      ) : (
                                        <span className="text-slate-300" title="Not Started">
                                          <Circle size={18} />
                                        </span>
                                      )}

                                      <button
                                        onClick={() => handleStartLesson(les)}
                                        className="bg-white border border-[#E2E8F0] hover:bg-slate-50 px-2.5 py-1.5 rounded-md font-bold text-[#0F172A] text-[10px]"
                                      >
                                        Open Lesson
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-[10px] text-[#475569] font-medium text-center">No lessons in this module.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-[#475569] font-medium">No curriculum modules have been defined for this course.</div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
