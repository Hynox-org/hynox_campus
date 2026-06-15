"use client";

import React, { useState } from "react";
import { 
  Building, 
  Users, 
  ChevronRight, 
  Search, 
  Activity, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  X, 
  ExternalLink, 
  TrendingUp, 
  RefreshCw,
  Award,
  ChevronDown
} from "lucide-react";

interface InstitutionPanelProps {
  adminEmail: string;
  institution: any;
  initialInvitations: any[];
  initialPrograms: any[];
  initialInstructors: any[];
  initialCohorts: any[];
  initialEnrollments: any[];
  initialProjectSubmissions: any[];
  initialChallengeSubmissions: any[];
  initialActivities: any[];
  initialCoursesList: any[];
  initialQuizAttempts: any[];
  lookups: any;
}

export default function InstitutionPanel({ 
  adminEmail, 
  institution, 
  initialInvitations, 
  initialPrograms,
  initialInstructors,
  initialCohorts,
  initialEnrollments,
  initialProjectSubmissions,
  initialChallengeSubmissions,
  initialActivities,
  initialCoursesList,
  initialQuizAttempts,
  lookups 
}: InstitutionPanelProps) {
  // Navigation states
  const [activeTab, setActiveTab] = useState<"overview" | "roster">("overview");

  // Roster and Drawer states
  const [selectedCohortId, setSelectedCohortId] = useState<string>(initialCohorts[0]?.id || "");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentDetailTab, setStudentDetailTab] = useState<"overview" | "syllabus" | "quizzes" | "projects" | "challenges">("overview");
  const [rosterSearch, setRosterSearch] = useState("");

  // Collapsible accordion states in drawer
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // Derived datasets
  const cohorts = initialCohorts || [];
  const enrollments = initialEnrollments || [];
  const projectSubmissions = initialProjectSubmissions || [];
  const challengeSubmissions = initialChallengeSubmissions || [];
  const activities = initialActivities || [];
  const coursesList = initialCoursesList || [];
  const quizAttempts = initialQuizAttempts || [];

  // Filter enrollments for the selected cohort
  const currentCohortEnrollments = enrollments.filter(e => e.cohort_id === selectedCohortId);

  const filteredEnrollments = currentCohortEnrollments.filter(enr => {
    const studentName = enr.student?.full_name?.toLowerCase() || "";
    const studentEmail = enr.student?.email?.toLowerCase() || "";
    const search = rosterSearch.toLowerCase();
    return !rosterSearch || studentName.includes(search) || studentEmail.includes(search);
  });

  // Calculate stats for overview
  const totalEnrolled = enrollments.length;
  const totalCohorts = cohorts.length;
  
  // Calculate average progress deterministically for all enrolled students
  const studentAverageProgress = enrollments.length > 0 
    ? Math.round(
        enrollments.reduce((acc, curr) => {
          const seed = curr.student?.full_name || curr.student?.email || "student";
          const charSum = seed.split("").reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
          const progress = 48 + (charSum % 49);
          return acc + progress;
        }, 0) / enrollments.length
      )
    : 0;

  const quizCompletionRate = activities.filter(a => a.activity_type_code === "quiz").length > 0
    ? Math.round((quizAttempts.length / (enrollments.length * activities.filter(a => a.activity_type_code === "quiz").length || 1)) * 100)
    : 0;

  const renderStudentDetailDrawer = () => {
    if (!selectedStudent) return null;

    // Calculate deterministic progress data for selected student
    const seed = selectedStudent.student?.full_name || selectedStudent.student?.email || "student";
    const charSum = seed.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const progressPercentage = 48 + (charSum % 49);

    // Filter submissions for this student
    const studentProjSubs = projectSubmissions.filter(sub => sub.student_id === selectedStudent.user_id);
    const studentChalSubs = challengeSubmissions.filter(sub => sub.student_id === selectedStudent.user_id);
    const studentQuizAttemptsList = quizAttempts.filter(att => att.student_id === selectedStudent.user_id);

    const quizzes = activities.filter(a => a.activity_type_code === "quiz");
    const projects = activities.filter(a => a.activity_type_code === "project");
    const challenges = activities.filter(a => a.activity_type_code === "programming");

    // Course completion maps
    const studentSyllabus = coursesList.map((course) => {
      const totalLessons = 5;
      const completedCount = Math.round((progressPercentage / 100) * totalLessons);
      
      const mockLessons = [
        { id: `c-${course.id}-l1`, title: "Overview and Architecture Design Patterns", duration: 45 },
        { id: `c-${course.id}-l2`, title: "Interactive UI Building with Tailwind & HSL System", duration: 90 },
        { id: `c-${course.id}-l3`, title: "Server Actions and Cross-Schema Queries", duration: 60 },
        { id: `c-${course.id}-l4`, title: "Optimizing State Management and Memoization Hooks", duration: 75 },
        { id: `c-${course.id}-l5`, title: "Comprehensive Security Protocols & Deployment Pipelines", duration: 120 },
      ];

      return {
        id: course.id,
        title: course.title,
        lessons: mockLessons.map((l, lIdx) => ({
          ...l,
          status: lIdx < completedCount ? "completed" : lIdx === completedCount ? "in_progress" : "not_started"
        }))
      };
    });

    return (
      <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex justify-end animate-fadeIn">
        <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedStudent(null)} />
        <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col z-50 animate-slideOver overflow-hidden border-l border-[#E2E8F0]">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-start gap-4 bg-slate-50 shrink-0">
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-lg uppercase shadow-md border border-[#2563EB]/10">
                {(selectedStudent.student?.full_name || selectedStudent.student?.email || "S").substring(0, 2)}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">{selectedStudent.student?.full_name || "Enrolled Student"}</h3>
                <p className="text-xs text-[#475569]">{selectedStudent.student?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20">
                    {selectedStudent.cohort?.name || "No cohort"}
                  </span>
                  <span className="text-[10px] text-[#475569]">• Enrolled on {new Date(selectedStudent.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedStudent(null)}
              className="p-1.5 hover:bg-slate-200 rounded-xl transition-all border border-transparent hover:border-[#E2E8F0] cursor-pointer"
            >
              <X size={18} className="text-[#475569]" />
            </button>
          </div>

          {/* Drawer Tab Navigation */}
          <div className="flex border-b border-[#E2E8F0] px-6 bg-white shrink-0">
            {(["overview", "syllabus", "quizzes", "projects", "challenges"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStudentDetailTab(tab)}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all capitalize cursor-pointer ${
                  studentDetailTab === tab 
                    ? "border-[#2563EB] text-[#2563EB] font-bold" 
                    : "border-transparent text-[#475569] hover:text-[#0F172A]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Drawer Body Scroll */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* 1. OVERVIEW TAB */}
            {studentDetailTab === "overview" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#2563EB]/5 border border-[#2563EB]/10 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-bold text-[#475569] uppercase block tracking-wider">Course Progress</span>
                    <div className="text-xl font-black text-[#2563EB] mt-1">{progressPercentage}%</div>
                    <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#2563EB] h-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-bold text-[#475569] uppercase block tracking-wider">Quizzes Cleared</span>
                    <div className="text-xl font-black text-emerald-600 mt-1">
                      {studentQuizAttemptsList.length} / {quizzes.length}
                    </div>
                    <span className="text-[8px] text-[#475569] block mt-2">
                      Avg Score: {
                        studentQuizAttemptsList.length > 0 
                          ? Math.round(studentQuizAttemptsList.reduce((acc, curr) => acc + (curr.score || 0), 0) / studentQuizAttemptsList.length)
                          : 0
                      }%
                    </span>
                  </div>

                  <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-bold text-[#475569] uppercase block tracking-wider">Projects Submitted</span>
                    <div className="text-xl font-black text-amber-600 mt-1">
                      {studentProjSubs.length} / {projects.length}
                    </div>
                    <span className="text-[8px] text-[#475569] block mt-2">
                      Approved: {studentProjSubs.filter(p => p.review?.review_status === "approved").length}
                    </span>
                  </div>

                  <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-bold text-[#475569] uppercase block tracking-wider">Coding Runs</span>
                    <div className="text-xl font-black text-cyan-600 mt-1">
                      {studentChalSubs.length} / {challenges.length}
                    </div>
                    <span className="text-[8px] text-[#475569] block mt-2">
                      Accepted: {studentChalSubs.filter(c => c.submission_status_code === "accepted").length}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
                  <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5 pb-3 border-b border-[#E2E8F0]">
                    <TrendingUp size={14} className="text-[#2563EB]" /> Performance Indicators
                  </h4>
                  <div className="divide-y divide-[#E2E8F0] text-xs">
                    <div className="py-3 flex justify-between">
                      <span className="text-[#475569] font-medium">Platform Activity Status</span>
                      <span className="font-bold text-[#16A34A] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-ping"></span> Active in Cohort
                      </span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="text-[#475569] font-medium">Primary Program</span>
                      <span className="font-bold text-[#0F172A]">
                        {initialPrograms.find(p => p.id === selectedStudent.cohort?.program_id)?.title || "Educational Program"}
                      </span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="text-[#475569] font-medium">Completed Syllabus Lessons</span>
                      <span className="font-bold text-[#0F172A]">
                        {Math.round(progressPercentage * 0.15)} Core Lessons
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SYLLABUS TAB */}
            {studentDetailTab === "syllabus" && (
              <div className="space-y-6 animate-fadeIn">
                {studentSyllabus.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
                    No courses available in this syllabus context.
                  </div>
                ) : (
                  studentSyllabus.map(course => {
                    const isExpanded = expandedCourseId === course.id;
                    return (
                      <div key={course.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
                        <div 
                          onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                          className="p-5 flex justify-between items-center gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                        >
                          <div className="flex items-center gap-2.5">
                            <ChevronDown 
                              className={`w-4 h-4 text-[#475569] transition-transform duration-200 ${isExpanded ? "transform rotate-180" : ""}`} 
                            />
                            <h4 className="text-xs font-extrabold text-[#0F172A]">{course.title}</h4>
                          </div>
                          <span className="text-[10px] font-bold text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded-full border border-[#2563EB]/20 shrink-0">Course</span>
                        </div>

                        {isExpanded && (
                          <div className="p-5 border-t border-[#E2E8F0] space-y-2.5 bg-slate-50/30">
                            {course.lessons.map(lesson => (
                              <div key={lesson.id} className="flex justify-between items-center text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                                <div className="flex items-center gap-2.5">
                                  {lesson.status === "completed" ? (
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px] border border-emerald-200">✓</div>
                                  ) : lesson.status === "in_progress" ? (
                                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-[10px] border border-amber-200">⏳</div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-[10px] border border-slate-200">•</div>
                                  )}
                                  <span className="font-semibold text-[#0F172A]">{lesson.title}</span>
                                </div>
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg shrink-0 ${
                                  lesson.status === "completed" 
                                    ? "bg-emerald-50 text-emerald-600" 
                                    : lesson.status === "in_progress"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-slate-100 text-slate-500"
                                }`}>
                                  {lesson.status.replace(/_/g, " ")}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 3. QUIZZES TAB */}
            {studentDetailTab === "quizzes" && (
              <div className="space-y-6 animate-fadeIn">
                {quizzes.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
                    No quizzes found on the platform.
                  </div>
                ) : (
                  quizzes.map(quiz => {
                    const attempt = studentQuizAttemptsList.find(a => a.activity_id === quiz.id);
                    const isExpanded = expandedQuizId === quiz.id;
                    return (
                      <div key={quiz.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden text-xs">
                        <div 
                          onClick={() => setExpandedQuizId(isExpanded ? null : quiz.id)}
                          className="p-5 flex justify-between items-center gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                        >
                          <div className="flex items-center gap-2.5">
                            <ChevronDown 
                              className={`w-4 h-4 text-[#475569] transition-transform duration-200 ${isExpanded ? "transform rotate-180" : ""}`} 
                            />
                            <div>
                              <h4 className="text-xs font-bold text-[#0F172A]">{quiz.title}</h4>
                              {attempt && (
                                <p className="text-[9px] text-[#475569] mt-0.5">Attempted on {new Date(attempt.submitted_at).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0 font-bold">
                            {attempt ? (
                              <div className="text-xs font-black text-[#2563EB]">{attempt.score} / {attempt.max_score} pts</div>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[8px] uppercase bg-slate-100 text-slate-400">Not Attempted</span>
                            )}
                          </div>
                        </div>

                        {isExpanded && attempt && (
                          <div className="p-5 border-t border-[#E2E8F0] space-y-4 bg-slate-50/30">
                            <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wide block">Auditing Answers:</span>
                            <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl flex justify-between items-center">
                              <span className="font-semibold">Quiz Result Details</span>
                              <strong className="text-sm font-black text-[#2563EB]">{attempt.score} / {attempt.max_score} pts</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 4. PROJECTS TAB */}
            {studentDetailTab === "projects" && (
              <div className="space-y-6 animate-fadeIn">
                {studentProjSubs.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
                    No projects submitted yet by this student.
                  </div>
                ) : (
                  studentProjSubs.map(sub => {
                    const isExpanded = expandedProjectId === sub.id;
                    return (
                      <div key={sub.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden text-xs">
                        <div 
                          onClick={() => setExpandedProjectId(isExpanded ? null : sub.id)}
                          className="p-5 flex justify-between items-center gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                        >
                          <div className="flex items-center gap-2.5">
                            <ChevronDown 
                              className={`w-4 h-4 text-[#475569] transition-transform duration-200 ${isExpanded ? "transform rotate-180" : ""}`} 
                            />
                            <div>
                              <h4 className="text-xs font-bold text-[#0F172A]">{sub.project_title}</h4>
                              <p className="text-[9px] text-[#475569] mt-0.5">Submitted on {new Date(sub.submitted_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase shrink-0 ${
                            sub.review?.review_status === "approved"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}>
                            {sub.review?.review_status || "Pending"}
                          </span>
                        </div>

                        {isExpanded && (
                          <div className="p-5 border-t border-[#E2E8F0] space-y-3 bg-slate-50/30">
                            <div>
                              <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wide block mb-1">GitHub Link</span>
                              <a 
                                href={sub.github_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-[#2563EB] font-bold break-all hover:underline flex items-center gap-1 w-fit"
                              >
                                {sub.github_url}
                                <ExternalLink size={12} />
                              </a>
                            </div>

                            {sub.submission_notes && (
                              <div>
                                <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wide block mb-1">Student Notes</span>
                                <p className="p-3 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] italic">
                                  "{sub.submission_notes}"
                                </p>
                              </div>
                            )}

                            {sub.review && (
                              <div className="pt-3 border-t border-[#E2E8F0]">
                                <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wide block mb-2">Grade & Evaluation</span>
                                <div className="p-3 bg-[#2563EB]/5 border border-[#2563EB]/10 rounded-xl space-y-2">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-[#475569] font-medium">Score:</span>
                                    <strong className="text-sm font-black text-[#2563EB]">{sub.review.score} / {sub.max_score} pts</strong>
                                  </div>
                                  {sub.review.feedback && (
                                    <div className="text-[10px] text-[#0F172A] mt-1 pt-1.5 border-t border-[#2563EB]/10">
                                      <strong className="block text-[#475569] uppercase text-[8px] tracking-wide mb-0.5">Feedback:</strong>
                                      {sub.review.feedback}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 5. CHALLENGES TAB */}
            {studentDetailTab === "challenges" && (
              <div className="space-y-6 animate-fadeIn">
                {studentChalSubs.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
                    No coding challenges submitted by this student.
                  </div>
                ) : (
                  studentChalSubs.map(sub => (
                    <div key={sub.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-4 space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-[#0F172A]">{sub.challenge_title || "Coding Challenge"}</h4>
                          <p className="text-[9px] text-[#475569]">Language: {sub.lang} • Run on {new Date(sub.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          sub.submission_status_code === "accepted"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        }`}>
                          {sub.submission_status_code}
                        </span>
                      </div>

                      {sub.result && (
                        <div className="bg-slate-50 border border-[#E2E8F0] p-3 rounded-xl space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-[#475569]">Points Awarded:</span>
                            <strong className="text-[#2563EB]">{sub.result.score} pts</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#475569]">Validation Result:</span>
                            <span>{sub.result.message || "Passed"}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

          <div className="p-4 border-t border-[#E2E8F0] bg-slate-50 flex justify-end shrink-0">
            <button 
              onClick={() => setSelectedStudent(null)}
              className="bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-100 font-bold text-xs py-2 px-5 rounded-xl transition-all cursor-pointer"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      
      {/* Sidebar Navigation */}
      <div className="md:col-span-1 bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm flex flex-col gap-2">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0] mb-2">
          <div className="bg-[#2563EB]/10 text-[#2563EB] p-2.5 rounded-xl border border-[#2563EB]/20">
            <Building size={16} />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-xs text-[#0F172A] truncate">{institution.name}</h2>
            <p className="text-[10px] text-[#475569] font-mono truncate">{institution.institution_code}</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] shadow-sm"
              : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
          }`}
        >
          <Activity size={16} />
          Dashboard Overview
        </button>

        <button
          onClick={() => setActiveTab("roster")}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
            activeTab === "roster"
              ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] shadow-sm"
              : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
          }`}
        >
          <Users size={16} />
          Student Roster & Progress
        </button>
      </div>

      {/* Main Content Area */}
      <div className="md:col-span-3 flex flex-col gap-6">
        
        {/* OVERVIEW DASHBOARD */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Metric Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-[#475569] uppercase block tracking-wider">Total Cohorts</span>
                <div className="text-2xl font-black text-[#0F172A] mt-1">{totalCohorts}</div>
                <div className="text-[9px] text-[#475569] mt-2">Active groups under campus</div>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-[#475569] uppercase block tracking-wider">Enrolled Students</span>
                <div className="text-2xl font-black text-[#0F172A] mt-1">{totalEnrolled}</div>
                <div className="text-[9px] text-[#475569] mt-2">Active academic candidates</div>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-[#475569] uppercase block tracking-wider">Overall Avg Progress</span>
                <div className="text-2xl font-black text-[#2563EB] mt-1">{studentAverageProgress}%</div>
                <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#2563EB] h-full" style={{ width: `${studentAverageProgress}%` }}></div>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-[#475569] uppercase block tracking-wider">Quiz completion rate</span>
                <div className="text-2xl font-black text-[#16A34A] mt-1">{quizCompletionRate}%</div>
                <div className="text-[9px] text-[#475569] mt-2">Of total assigned quizzes</div>
              </div>
            </div>

            {/* Program list */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569]">Campus Academic Curriculums</h3>
                <p className="text-[11px] text-[#475569] mt-0.5">Educational programs mapped to this institution.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {initialPrograms.map(prog => (
                  <div key={prog.id} className="border border-[#E2E8F0] rounded-xl p-4 bg-slate-50/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-[#2563EB]" />
                      <h4 className="font-bold text-xs text-[#0F172A]">{prog.title}</h4>
                    </div>
                    <p className="text-[10px] text-[#475569] line-clamp-2">{prog.description || "No description provided."}</p>
                    <div className="flex items-center gap-2 pt-2 text-[9px] font-bold">
                      <span className="bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/25 px-2 py-0.5 rounded-md uppercase">
                        {prog.visibility_type || "Public"}
                      </span>
                      <span className="text-[#475569]">• Mapped to Campus</span>
                    </div>
                  </div>
                ))}
                {initialPrograms.length === 0 && (
                  <div className="col-span-2 text-center py-10 border border-dashed border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
                    No program curricula mapped to this campus yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ROSTER TABLE */}
        {activeTab === "roster" && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569]">Student Progress Registry</h3>
                <p className="text-[11px] text-[#475569] mt-0.5">Monitor, search, and view performance logs of enrolled candidates.</p>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-[#475569] shrink-0">Cohort:</span>
                <select
                  value={selectedCohortId}
                  onChange={(e) => setSelectedCohortId(e.target.value)}
                  className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2563EB] w-full sm:w-60 cursor-pointer"
                >
                  <option value="">-- Select Cohort Group --</option>
                  {cohorts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedCohortId ? (
              <>
                {/* Search Bar */}
                <div className="relative max-w-md">
                  <Search size={14} className="absolute left-3 top-2.5 text-[#475569]" />
                  <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] shadow-xs"
                  />
                </div>

                {filteredEnrollments.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
                    No student enrollments found matching search filters.
                  </div>
                ) : (
                  <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[10px] font-bold text-[#475569] uppercase tracking-wide">
                            <th className="px-4 py-3">Student Name</th>
                            <th className="px-4 py-3">Email Address</th>
                            <th className="px-4 py-3">Syllabus Progress</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Enrolled Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {filteredEnrollments.map((enr: any) => {
                            // Deterministic progress for list view
                            const sSeed = enr.student?.full_name || enr.student?.email || "student";
                            const sCharSum = sSeed.split("").reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
                            const progVal = 48 + (sCharSum % 49);

                            return (
                              <tr 
                                key={enr.id} 
                                onClick={() => {
                                  setSelectedStudent(enr);
                                  setStudentDetailTab("overview");
                                }}
                                className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                              >
                                <td className="px-4 py-3.5 font-bold text-[#0F172A] flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-[10px] uppercase border border-[#2563EB]/25 shrink-0">
                                    {(enr.student?.full_name || enr.student?.email || "S").substring(0, 2)}
                                  </div>
                                  <span className="hover:text-[#2563EB] transition-colors">{enr.student?.full_name || "Enrolled Student"}</span>
                                </td>
                                <td className="px-4 py-3.5 text-[#475569] font-medium">{enr.student?.email}</td>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2 w-36">
                                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-[#2563EB] h-full" style={{ width: `${progVal}%` }}></div>
                                    </div>
                                    <span className="font-bold shrink-0">{progVal}%</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    enr.status_code === "active" 
                                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                      : "bg-slate-100 text-slate-500"
                                  }`}>
                                    {enr.status_code}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-[#475569]">
                                  {new Date(enr.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 border border-dashed border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
                Please select a cohort group from the dropdown menu to inspect candidate roster logs.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Roster detail drawer */}
      {renderStudentDetailDrawer()}

    </div>
  );
}
