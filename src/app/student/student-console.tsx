"use client";

import React, { useState } from "react";
import { 
  listCoursesAction, 
  listModulesAction, 
  listLessonsAction, 
  listLessonResourcesAction 
} from "@/app/actions/academic-actions";
import { 
  Building, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Folder, 
  ArrowRight, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  File, 
  ExternalLink,
  ChevronLeft
} from "lucide-react";

interface StudentConsoleProps {
  studentEmail: string;
  fullName: string;
  primaryRole: string;
  institution: any;
  initialPrograms: any[];
}

export default function StudentConsole({ 
  studentEmail, 
  fullName, 
  primaryRole, 
  institution, 
  initialPrograms 
}: StudentConsoleProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "academics">("overview");

  // Academics exploration state
  const [programs] = useState<any[]>(initialPrograms);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelectProgram = async (program: any) => {
    setSelectedProgram(program);
    setSelectedCourse(null);
    setModules([]);
    setLoading(true);
    setError("");
    const res = await listCoursesAction(program.id);
    if (res.error) {
      setError(res.error);
    } else if (res.courses) {
      setCourses(res.courses);
    }
    setLoading(false);
  };

  const handleSelectCourse = async (course: any) => {
    setSelectedCourse(course);
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
            <p className="text-[10px] text-[#475569] font-mono truncate">Student Profile</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
            activeTab === "overview"
              ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] shadow-sm"
              : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
          }`}
        >
          <Building size={16} />
          Overview
        </button>

        <button
          onClick={() => setActiveTab("academics")}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
            activeTab === "academics"
              ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] shadow-sm"
              : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
          }`}
        >
          <BookOpen size={16} />
          My Programs Hub
        </button>
      </div>

      {/* Main Content Area */}
      <div className="md:col-span-3 flex flex-col gap-6">
        
        {error && (
          <div className="bg-[#DC2626]/5 border border-[#DC2626]/20 text-[#DC2626] rounded-xl p-4 text-xs">
            {error}
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#2563EB]/10 text-[#2563EB] p-2.5 rounded-xl border border-[#2563EB]/20">
                <BookOpen size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">Student Hub & Console</h2>
                <p className="text-xs text-[#475569]">Interactive coding roadmaps and placement status</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5">
              <div>
                <span className="text-[10px] font-bold text-[#475569] block uppercase tracking-wide">Student Email</span>
                <span className="font-semibold text-[#0F172A]">{studentEmail}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#475569] block uppercase tracking-wide">Resolved Role</span>
                <span className="font-semibold inline-flex px-2 py-0.5 rounded bg-[#2563EB]/15 text-[#2563EB] font-bold mt-1 text-[10px] capitalize">
                  {primaryRole}
                </span>
              </div>
              <div className="md:col-span-2 border-t border-[#E2E8F0] pt-3 mt-1">
                <span className="text-[10px] font-bold text-[#475569] block uppercase tracking-wide">Linked Tenant Institution</span>
                <span className="font-semibold text-sm text-[#0F172A] block mt-1">
                  {institution ? `${institution.name} (${institution.institution_code})` : "Public Cohort"}
                </span>
              </div>
            </div>

            <div className="border border-dashed border-[#E2E8F0] rounded-xl p-6 text-center text-xs text-[#475569]">
              <Award className="mx-auto mb-2 text-[#475569]/60" size={30} />
              <p className="font-medium text-[#0F172A]">My Assignments & Skill Badges</p>
              <p className="mt-1">View active syllabuses and learn new courses to earn verification badges for your resume.</p>
            </div>
          </div>
        )}

        {/* TAB 2: ACADEMICS */}
        {activeTab === "academics" && (
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
                      No active academic programs linked to this institution.
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
                  {loading ? (
                    <div className="col-span-2 text-center py-6 text-[#475569] font-medium animate-pulse">Loading program courses...</div>
                  ) : courses.length > 0 ? (
                    courses.map((course) => (
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
                              {course.course_type?.code || "Theory"}
                            </span>
                          </div>
                          <h3 className="font-bold text-xs text-[#0F172A] mb-1">{course.title}</h3>
                          <p className="text-[10px] text-[#475569] line-clamp-2 leading-relaxed mb-4">
                            {course.description || "No course description provided."}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] text-[10px] text-[#475569]">
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {course.duration_minutes || 0} mins
                          </span>
                          <span className="flex items-center gap-0.5 font-bold text-[#2563EB] hover:underline">
                            Explore Curriculum <ArrowRight size={11} />
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-[#475569] font-medium bg-slate-50/20 rounded-xl">
                      No courses registered under this program.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 3. Course space curriculum view
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-xs border-b border-[#E2E8F0] pb-3">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="text-[#2563EB] hover:underline flex items-center gap-1 font-bold"
                  >
                    <ChevronLeft size={14} /> Courses
                  </button>
                  <span className="text-slate-300">/</span>
                  <span className="font-semibold text-[#0F172A] truncate max-w-[200px]">{selectedCourse.title}</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 border border-[#E2E8F0] rounded-xl p-4">
                    <div>
                      <h4 className="font-bold text-[#0F172A]">{selectedCourse.title}</h4>
                      <p className="text-[#475569] text-[10px] mt-1">{selectedCourse.description || "No description set."}</p>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-lg border border-[#E2E8F0] font-semibold text-[#0F172A] text-[10px] shrink-0 font-mono">
                      {selectedCourse.duration_minutes || 0} mins
                    </div>
                  </div>

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
                              mod.lessons.map((les: any) => (
                                <div key={les.id} className="border border-[#E2E8F0] rounded-lg p-3 space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-xs text-[#0F172A]">{les.title}</span>
                                        <span className="text-[9px] bg-slate-100 text-[#475569] px-1.5 py-0.5 rounded font-bold capitalize">
                                          {les.lesson_type?.code || "lesson"}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-[#475569] font-mono mt-0.5">{les.duration || 0} mins</div>
                                    </div>
                                  </div>

                                  {/* Resources list */}
                                  {les.resources && les.resources.length > 0 && (
                                    <div className="bg-slate-50 border border-[#E2E8F0] rounded-lg p-2 space-y-1.5 text-[11px]">
                                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#475569] px-0.5">Attachments & Resources</p>
                                      <div className="divide-y divide-[#E2E8F0] bg-white rounded-md border border-[#E2E8F0]">
                                        {les.resources.map((res: any) => (
                                          <div key={res.id} className="px-2 py-1.5 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                              <File size={11} className="text-[#475569] shrink-0" />
                                              <span className="font-semibold text-[#0F172A] truncate">{res.title}</span>
                                              <span className="text-[8px] bg-slate-100 text-[#475569] px-1 rounded-sm">{res.resource_type}</span>
                                            </div>
                                            {res.external_url && (
                                              <a 
                                                href={res.external_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-[#2563EB] hover:text-[#2563EB]/80 font-bold shrink-0 flex items-center gap-0.5 ml-2"
                                              >
                                                Open <ExternalLink size={10} />
                                              </a>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))
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
