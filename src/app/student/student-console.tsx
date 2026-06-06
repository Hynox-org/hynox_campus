"use client";

import React, { useState, useEffect } from "react";
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
  getStudentAssignedActivitiesAction,
  getQuizDetailsAction,
  startQuizAttemptAction,
  submitQuizAnswersAction,
  getProjectDetailsAction,
  submitProjectAction,
  getProgrammingChallengeDetailsAction,
  submitChallengeCodeAction,
  getChallengeSubmissionResultsAction,
  getActiveQuizAttemptAction,
  getQuizSessionDetailsAction
} from "@/app/actions/learning-actions";
import Link from "next/link";
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
  CheckCircle2,
  FileQuestion,
  FolderCode,
  Terminal as TerminalIcon,
  Send,
  AlertTriangle,
  History,
  Code
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
  const [activeTab, setActiveTab] = useState<"overview" | "academics" | "quizzes" | "projects" | "challenges">("overview");

  // Academics exploration state
  const [programs, setPrograms] = useState<any[]>(initialPrograms);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<string, any>>({});
  const [activeLesson, setActiveLesson] = useState<any | null>(null);

  // Learning activities state
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Active quiz state
  const [selectedQuizActivity, setSelectedQuizActivity] = useState<any | null>(null);
  const [quizDetails, setQuizDetails] = useState<any | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [activeAttempt, setActiveAttempt] = useState<any | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [quizSubmittedResult, setQuizSubmittedResult] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Active project state
  const [selectedProjectActivity, setSelectedProjectActivity] = useState<any | null>(null);
  const [projectDetails, setProjectDetails] = useState<any | null>(null);
  const [projectSubmission, setProjectSubmission] = useState<any | null>(null);
  const [projectReview, setProjectReview] = useState<any | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");

  // Active programming challenge state
  const [selectedChallengeActivity, setSelectedChallengeActivity] = useState<any | null>(null);
  const [challengeDetails, setChallengeDetails] = useState<any | null>(null);
  const [challengeExamples, setChallengeExamples] = useState<any[]>([]);
  const [challengeSubmissions, setChallengeSubmissions] = useState<any[]>([]);
  const [editorLanguage, setEditorLanguage] = useState("javascript");
  const [editorCode, setEditorCode] = useState("");
  const [selectedSubmissionForResults, setSelectedSubmissionForResults] = useState<any | null>(null);
  const [submissionResults, setSubmissionResults] = useState<any | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load activities on mount or tab change
  const loadActivities = async () => {
    setLoadingActivities(true);
    const res = await getStudentAssignedActivitiesAction(studentId);
    if (res.activities) {
      setActivities(res.activities);
    } else if (res.error) {
      setError(res.error);
    }
    setLoadingActivities(false);
  };

  useEffect(() => {
    loadActivities();
  }, [studentId]);

  const refreshStudentData = async () => {
    const res = await getStudentDeliveryDataAction(studentId);
    if (res.programs) {
      setPrograms(res.programs);
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
    await loadActivities();
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

  // Quiz interactive flows
  const handleEnterQuiz = async (activity: any) => {
    setSelectedQuizActivity(activity);
    setQuizSubmittedResult(null);
    setActiveAttempt(null);
    setSelectedAnswers({});
    setLoading(true);
    setError("");

    try {
      // 1. Fetch main quiz configuration
      const res = await getQuizDetailsAction(activity.id);
      if (res && "quiz" in res) {
        setQuizDetails(res.quiz);
        setQuizQuestions(res.questions || []);

        // 2. Check for any active (unfinished) attempt
        const activeRes = await getActiveQuizAttemptAction(res.quiz.id, studentId);
        if (activeRes.attempt) {
          // Unfinished attempt found, resume it and fetch shuffled session details
          const sessionRes = await getQuizSessionDetailsAction(activeRes.attempt.id);
          if (sessionRes && "questions" in sessionRes) {
            setQuizQuestions(sessionRes.questions);
            setActiveAttempt(sessionRes.attempt);
          }
        }
      } else if (res && "error" in res) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load quiz details.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    if (!quizDetails) return;
    setActionLoading(true);
    setError("");
    const attemptNum = (selectedQuizActivity.progress?.attempt_number || 0) + 1;
    const res = await startQuizAttemptAction(quizDetails.id, studentId, selectedQuizActivity.progress?.id || "new", attemptNum);
    if (res.attempt) {
      // Fetch shuffled session questions for this attempt
      const sessionRes = await getQuizSessionDetailsAction(res.attempt.id);
      if (sessionRes && "questions" in sessionRes) {
        setQuizQuestions(sessionRes.questions);
        setActiveAttempt(sessionRes.attempt);
      } else {
        setActiveAttempt(res.attempt);
      }
      setSelectedAnswers({});
      setSuccess("Quiz attempt started. Good luck!");
      setTimeout(() => setSuccess(""), 3000);
    } else if (res.error) {
      setError(res.error);
    }
    setActionLoading(false);
  };

  const handleOptionSelect = (questionId: string, optionId: string, questionType?: string) => {
    setSelectedAnswers(prev => {
      const current = prev[questionId] || [];
      if (questionType === "multiple_choice") {
        if (current.includes(optionId)) {
          return {
            ...prev,
            [questionId]: current.filter(id => id !== optionId)
          };
        } else {
          return {
            ...prev,
            [questionId]: [...current, optionId]
          };
        }
      } else {
        return {
          ...prev,
          [questionId]: [optionId]
        };
      }
    });
  };

  const handleSubmitQuiz = async () => {
    if (!activeAttempt) return;
    setActionLoading(true);
    setError("");
    const payload = Object.entries(selectedAnswers).flatMap(([qId, optIds]) =>
      optIds.map(optId => ({
        questionId: qId,
        selectedOptionId: optId
      }))
    );

    const res = await submitQuizAnswersAction(activeAttempt.id, payload);
    if (res.attempt) {
      setQuizSubmittedResult(res.attempt);
      setActiveAttempt(null);
      setSuccess("Quiz submitted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await refreshStudentData();
    } else if (res.error) {
      setError(res.error);
    }
    setActionLoading(false);
  };

  // Countdown Timer logic for quizzes
  useEffect(() => {
    if (!activeAttempt || !quizDetails || !quizDetails.time_limit_minutes) {
      setTimeLeft(null);
      return;
    }

    const limitSeconds = quizDetails.time_limit_minutes * 60;
    const calculateTimeLeft = () => {
      const elapsedSeconds = Math.floor((new Date().getTime() - new Date(activeAttempt.started_at).getTime()) / 1000);
      const remaining = limitSeconds - elapsedSeconds;
      return remaining > 0 ? remaining : 0;
    };

    // Initialize
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        // Auto-submit when timer expires
        setActionLoading(true);
        const payload = Object.entries(selectedAnswers).flatMap(([qId, optIds]) =>
          optIds.map(optId => ({
            questionId: qId,
            selectedOptionId: optId
          }))
        );
        submitQuizAnswersAction(activeAttempt.id, payload).then((res) => {
          if (res.attempt) {
            setQuizSubmittedResult(res.attempt);
            setActiveAttempt(null);
            setSuccess("Time limit reached. Quiz automatically submitted.");
            setTimeout(() => setSuccess(""), 4000);
            refreshStudentData();
          } else if (res.error) {
            setError(res.error);
            setActiveAttempt(null);
          }
          setActionLoading(false);
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeAttempt, quizDetails, selectedAnswers]);

  // Project interactive flows
  const handleEnterProject = async (activity: any) => {
    setSelectedProjectActivity(activity);
    setLoading(true);
    const res = await getProjectDetailsAction(activity.id, studentId);
    if (res && "project" in res) {
      setProjectDetails(res.project);
      setProjectSubmission(res.submission);
      setProjectReview(res.review);
      setGithubUrl(res.submission?.github_url || "");
      setSubmissionNotes(res.submission?.submission_notes || "");
    } else if (res && "error" in res) {
      setError(res.error);
    }
    setLoading(false);
  };

  const handleSubmitProjectUrl = async () => {
    if (!projectDetails) return;
    if (!githubUrl.trim().startsWith("https://github.com/")) {
      setError("Please provide a valid GitHub repository URL (starts with https://github.com/).");
      setTimeout(() => setError(""), 4000);
      return;
    }
    setActionLoading(true);
    const res = await submitProjectAction(
      projectDetails.id,
      studentId,
      selectedProjectActivity.progress?.id || "new",
      githubUrl,
      submissionNotes
    );
    if (res.submission) {
      setProjectSubmission(res.submission);
      setSuccess("Project submitted successfully for mentor review!");
      setTimeout(() => setSuccess(""), 4000);
      await refreshStudentData();
    } else if (res.error) {
      setError(res.error);
    }
    setActionLoading(false);
  };

  // Programming challenge flows
  const handleEnterChallenge = async (activity: any) => {
    setSelectedChallengeActivity(activity);
    setSelectedSubmissionForResults(null);
    setSubmissionResults(null);
    setLoading(true);
    const res = await getProgrammingChallengeDetailsAction(activity.id, studentId);
    if (res && "challenge" in res) {
      setChallengeDetails(res.challenge);
      setChallengeExamples(res.examples || []);
      setChallengeSubmissions(res.submissions || []);
      setEditorCode(res.challenge.starter_code || "");
    } else if (res && "error" in res) {
      setError(res.error);
    }
    setLoading(false);
  };

  const handleSubmitChallenge = async () => {
    if (!challengeDetails) return;
    if (!editorCode.trim()) {
      setError("Source code cannot be blank.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setActionLoading(true);
    const res = await submitChallengeCodeAction(
      challengeDetails.id,
      studentId,
      selectedChallengeActivity.progress?.id || "new",
      editorLanguage,
      editorCode
    );
    if (res.submission) {
      setSuccess("Code submitted successfully. Added to execution queue!");
      setTimeout(() => setSuccess(""), 4000);
      // Reload submissions list
      const updatedData = await getProgrammingChallengeDetailsAction(selectedChallengeActivity.id, studentId);
      if (updatedData && "submissions" in updatedData) {
        setChallengeSubmissions(updatedData.submissions || []);
      }
      await refreshStudentData();
    } else if (res.error) {
      setError(res.error);
    }
    setActionLoading(false);
  };

  const handleViewSubmissionResults = async (sub: any) => {
    setSelectedSubmissionForResults(sub);
    setLoading(true);
    const res = await getChallengeSubmissionResultsAction(sub.id);
    setSubmissionResults(res);
    setLoading(false);
  };

  // Quick stats calculations
  const totalEnrolledCourses = programs.reduce((acc, prog) => acc + (prog.courses?.length || 0), 0);
  const inProgressCourses = programs.flatMap(p => p.courses || []).filter(c => c.progress?.status_code === "in_progress").length;
  const completedCourses = programs.flatMap(p => p.courses || []).filter(c => c.progress?.status_code === "completed").length;

  const quizCount = activities.filter(a => a.activity_type_code === "quiz").length;
  const projectCount = activities.filter(a => a.activity_type_code === "project").length;
  const challengeCount = activities.filter(a => a.activity_type_code === "programming_challenge" || a.activity_type_code === "programming").length;

  const completedActivities = activities.filter(a => a.progress?.status_code === "completed" || a.progress?.status_code === "reviewed").length;
  const pendingActivities = activities.length - completedActivities;

  // Programming challenges specific stats
  const challengeActivities = activities.filter(a => a.activity_type_code === "programming_challenge" || a.activity_type_code === "programming");
  const assignedChallengesCount = challengeActivities.length;
  const completedChallengesCount = challengeActivities.filter(a => a.progress?.status_code === "completed" || a.progress?.status_code === "reviewed").length;
  const pendingChallengesCount = assignedChallengesCount - completedChallengesCount;
  
  const challengeScores = challengeActivities.map(a => a.progress?.score).filter(s => s !== null && s !== undefined).map(Number);
  const averageChallengeScore = challengeScores.length > 0 ? (challengeScores.reduce((a, b) => a + b, 0) / challengeScores.length).toFixed(1) : "0.0";
  
  // Recent submissions/updates from activities
  const recentSubmissions = [...challengeActivities]
    .filter(a => a.progress?.status_code !== "assigned")
    .sort((a, b) => new Date(b.progress?.updated_at || b.progress?.submitted_at || 0).getTime() - new Date(a.progress?.updated_at || a.progress?.submitted_at || 0).getTime())
    .slice(0, 3);

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

        <div className="pt-2 border-t border-[#E2E8F0] mt-2">
          <p className="text-[9px] font-bold text-[#475569] px-4 uppercase tracking-wider mb-1.5">Learning Assessments</p>
          
          <button
            onClick={() => {
              setActiveTab("quizzes");
              setSelectedQuizActivity(null);
              setSelectedProjectActivity(null);
              setSelectedChallengeActivity(null);
            }}
            className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
              activeTab === "quizzes"
                ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] shadow-sm"
                : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileQuestion size={16} /> Quizzes
            </span>
            <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{quizCount}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("projects");
              setSelectedQuizActivity(null);
              setSelectedProjectActivity(null);
              setSelectedChallengeActivity(null);
            }}
            className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all mt-1.5 ${
              activeTab === "projects"
                ? "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB] shadow-sm"
                : "bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FolderCode size={16} /> Projects
            </span>
            <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{projectCount}</span>
          </button>

          <Link
            href="/student/programming"
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all mt-1.5 bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#475569] hover:text-[#0F172A]"
          >
            <span className="flex items-center gap-2.5">
              <TerminalIcon size={16} /> Code Challenges
            </span>
            <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{challengeCount}</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="md:col-span-3 flex flex-col gap-6">
        
        {error && (
          <div className="bg-[#DC2626]/5 border border-[#DC2626]/20 text-[#DC2626] rounded-xl p-4 text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 text-[#16A34A] rounded-xl p-4 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 size={14} />
            {success}
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && !selectedProgram && (
          <div className="space-y-6">
            
            {/* Quick Metrics Header */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                  <span className="text-[10px] text-[#475569] block font-semibold uppercase tracking-wider">Tasks Done</span>
                  <span className="text-sm font-bold text-[#0F172A]">{completedActivities} Completed</span>
                </div>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex items-center gap-3">
                <div className="bg-[#06B6D4]/10 text-[#06B6D4] p-2.5 rounded-xl">
                  <FileQuestion size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-[#475569] block font-semibold uppercase tracking-wider">Pending Tasks</span>
                  <span className="text-sm font-bold text-[#0F172A]">{pendingActivities} Tasks</span>
                </div>
              </div>
            </div>

            {/* Learning Activities Summary Grid */}
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

            {/* Programming Challenges Dashboard Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                  <TerminalIcon className="text-[#2563EB]" size={16} /> Programming Challenges
                </h3>
                <Link
                  href="/student/programming"
                  className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
                >
                  Challenges Hub <ArrowRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-4 shadow-sm text-center">
                  <span className="text-[10px] text-[#475569] block font-semibold uppercase tracking-wider">Assigned</span>
                  <span className="text-sm font-bold text-[#0F172A]">{assignedChallengesCount}</span>
                </div>
                <div className="bg-[#16A34A]/5 border border-[#16A34A]/10 rounded-xl p-4 shadow-sm text-center">
                  <span className="text-[10px] text-[#16A34A] block font-semibold uppercase tracking-wider">Completed</span>
                  <span className="text-sm font-bold text-[#16A34A]">{completedChallengesCount}</span>
                </div>
                <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/10 rounded-xl p-4 shadow-sm text-center">
                  <span className="text-[10px] text-[#F59E0B] block font-semibold uppercase tracking-wider">Pending</span>
                  <span className="text-sm font-bold text-[#F59E0B]">{pendingChallengesCount}</span>
                </div>
                <div className="bg-[#2563EB]/5 border border-[#2563EB]/10 rounded-xl p-4 shadow-sm text-center">
                  <span className="text-[10px] text-[#2563EB] block font-semibold uppercase tracking-wider">Avg Score</span>
                  <span className="text-sm font-bold text-[#2563EB]">{averageChallengeScore}%</span>
                </div>
              </div>

              {recentSubmissions.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#0F172A]">Recent Submissions</h4>
                  <div className="divide-y divide-[#E2E8F0] bg-slate-50/50 rounded-xl border border-[#E2E8F0] overflow-hidden">
                    {recentSubmissions.map((act) => {
                      const statusColor =
                        act.progress?.status_code === "completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : act.progress?.status_code === "submitted"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : "bg-amber-50 text-amber-700 border-amber-100";
                      
                      return (
                        <div key={act.id} className="p-3 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-[#0F172A]">{act.title}</span>
                            <span className="text-[9px] text-[#475569] ml-2 block sm:inline">
                              Score: {act.progress?.score ?? 0} pts
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold border capitalize ${statusColor}`}>
                            {act.progress?.status_code}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ACADEMICS / SYLLABUS VIEWER */}
        {(activeTab === "academics" || selectedProgram) && (
          <div className="space-y-6">
            {!selectedProgram ? (
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
              <div className="space-y-6">
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
                          <div className="bg-slate-50 px-4 py-3 border-b border-[#E2E8F0]">
                            <p className="font-semibold text-xs text-[#0F172A]">
                              Module {mod.position}: {mod.title}
                            </p>
                            {mod.description && <p className="text-[10px] text-[#475569] mt-0.5 font-medium">{mod.description}</p>}
                          </div>

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

        {/* TAB 3: QUIZZES */}
        {activeTab === "quizzes" && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6">
            {!selectedQuizActivity ? (
              <>
                <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
                  <FileQuestion className="text-[#2563EB]" size={16} /> My Assigned Quizzes
                </h3>
                {loadingActivities ? (
                  <p className="text-slate-500 animate-pulse py-4 font-semibold text-center">Loading quizzes...</p>
                ) : activities.filter(a => a.activity_type_code === "quiz").length > 0 ? (
                  <div className="space-y-4">
                    {activities.filter(a => a.activity_type_code === "quiz").map((act) => (
                      <div key={act.id} className="border border-[#E2E8F0] rounded-xl p-4 bg-slate-50/20 flex justify-between items-center hover:shadow-sm transition-all">
                        <div>
                          <h4 className="font-bold text-xs text-[#0F172A]">{act.title}</h4>
                          <p className="text-[#475569] text-[10px] mt-1 line-clamp-1">{act.description}</p>
                          <div className="flex gap-3 text-[9px] text-[#475569] font-semibold mt-2.5">
                            <span className="bg-slate-100 px-2 py-0.5 rounded uppercase font-bold border text-slate-700">Status: {act.progress?.status_code}</span>
                            {act.progress?.score !== null && (
                              <span className="bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded font-bold border border-[#16A34A]/20">Score: {act.progress?.score} / {act.progress?.max_score || 100}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleEnterQuiz(act)}
                          className="bg-[#2563EB] text-white px-3.5 py-1.5 rounded-lg shadow-sm font-semibold hover:bg-[#2563EB]/90 transition-all flex items-center gap-1 text-[10px]"
                        >
                          Enter Quiz <ChevronRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-slate-500 font-medium">No quizzes assigned to your cohort.</p>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xs border-b border-[#E2E8F0] pb-3">
                  <button
                    onClick={() => {
                      setSelectedQuizActivity(null);
                      setQuizDetails(null);
                      setQuizQuestions([]);
                    }}
                    className="text-[#2563EB] hover:underline flex items-center gap-1 font-bold"
                  >
                    <ChevronLeft size={14} /> Quizzes
                  </button>
                  <span className="text-slate-300">/</span>
                  <span className="font-semibold text-[#0F172A]">{selectedQuizActivity.title}</span>
                </div>

                {loading ? (
                  <p className="text-slate-500 animate-pulse text-center py-8">Loading quiz details...</p>
                ) : (
                  <div className="space-y-6">
                    {!activeAttempt && (
                      (() => {
                        const assignment = selectedQuizActivity.assignment;
                        const now = new Date();
                        const isNotOpenYet = assignment?.available_from ? new Date(assignment.available_from) > now : false;
                        const isPastDue = assignment?.available_until ? new Date(assignment.available_until) < now : false;

                        return (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white p-3 rounded-lg border border-[#e2e8f0]">
                                <span className="text-[9px] text-[#475569] font-bold block uppercase tracking-wide">Questions Count</span>
                                <span className="font-bold text-[#0F172A] text-xs">{quizQuestions.length} Questions</span>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-[#e2e8f0]">
                                <span className="text-[9px] text-[#475569] font-bold block uppercase tracking-wide">Attempts Done</span>
                                <span className="font-bold text-[#0F172A] text-xs font-mono">{selectedQuizActivity.progress?.attempt_number || 0} / {quizDetails.max_attempts}</span>
                              </div>
                              {assignment?.available_from && (
                                <div className="bg-white p-3 rounded-lg border border-[#e2e8f0]">
                                  <span className="text-[9px] text-[#475569] font-bold block uppercase tracking-wide">Available From</span>
                                  <span className="font-bold text-[#0F172A] text-[11px]">{new Date(assignment.available_from).toLocaleString()}</span>
                                </div>
                              )}
                              {assignment?.available_until && (
                                <div className="bg-white p-3 rounded-lg border border-[#e2e8f0]">
                                  <span className="text-[9px] text-[#475569] font-bold block uppercase tracking-wide">Due Date</span>
                                  <span className={`font-bold text-[11px] ${isPastDue ? 'text-red-600' : 'text-[#0F172A]'}`}>{new Date(assignment.available_until).toLocaleString()}</span>
                                </div>
                              )}
                            </div>

                            {isNotOpenYet ? (
                              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3.5 text-xs font-semibold flex items-center gap-2">
                                <AlertTriangle size={15} className="text-amber-600" />
                                <span>This quiz is not available yet. It will open on {new Date(assignment.available_from).toLocaleString()}.</span>
                              </div>
                            ) : isPastDue ? (
                              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3.5 text-xs font-semibold flex items-center gap-2">
                                <AlertTriangle size={15} className="text-red-600" />
                                <span>The due date for this quiz has passed. You cannot start a new attempt.</span>
                              </div>
                            ) : (selectedQuizActivity.progress?.attempt_number || 0) >= quizDetails.max_attempts ? (
                              <div className="bg-[#DC2626]/5 border border-[#DC2626]/20 text-[#DC2626] rounded-lg p-3.5 text-xs font-semibold flex items-center gap-2">
                                <AlertTriangle size={15} />
                                <span>You have reached the maximum allowed attempts limit for this quiz. Retakes are locked.</span>
                              </div>
                            ) : (
                              <button
                                onClick={handleStartQuiz}
                                disabled={actionLoading}
                                className="bg-[#2563EB] text-white px-5 py-2.5 rounded-lg shadow-sm font-semibold hover:bg-[#2563EB]/95 transition-all text-xs flex items-center gap-1.5 disabled:opacity-50 font-sans"
                              >
                                <Play size={13} fill="white" /> Start Quiz Attempt
                              </button>
                            )}
                          </div>
                        );
                      })()
                    )}

                    {/* Quiz Questions List / Active Test screen */}
                    {activeAttempt && (
                      <div className="space-y-6">
                        <div className="bg-[#2563EB]/5 border border-[#2563EB]/20 rounded-xl p-4 flex justify-between items-center">
                          <span className="font-semibold text-[#2563EB] text-[10px] uppercase tracking-wider">Attempt #{activeAttempt.attempt_number} in progress...</span>
                          {timeLeft !== null ? (
                            <span className="bg-white border border-red-200 px-3 py-1.5 rounded font-mono font-bold text-xs text-red-600 flex items-center gap-1.5 animate-pulse">
                              <Clock size={13} /> Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </span>
                          ) : (
                            <span className="bg-white border border-[#2563EB]/30 px-3 py-1 rounded font-bold text-xs text-[#2563EB]">Time Started: {new Date(activeAttempt.started_at).toLocaleTimeString()}</span>
                          )}
                        </div>

                        <div className="space-y-6">
                          {quizQuestions.map((q, idx) => (
                            <div key={q.id} className="border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                              <h4 className="font-bold text-xs text-[#0f172a] flex gap-2">
                                <span className="text-[#2563EB]">Q{idx + 1}.</span> {q.question_text}
                                <span className="font-mono text-[9px] text-[#475569] bg-slate-100 px-1.5 py-0.5 rounded">({q.points} pts)</span>
                              </h4>

                              <div className="grid grid-cols-1 gap-2.5">
                                {q.options?.map((opt: any) => {
                                  const isSelected = selectedAnswers[q.id]?.includes(opt.id) || false;
                                  return (
                                    <label
                                      key={opt.id}
                                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50 transition-all ${
                                        isSelected
                                          ? "border-[#2563EB] bg-[#2563EB]/5 font-semibold text-[#2563EB]"
                                          : "border-[#E2E8F0] bg-white text-[#475569]"
                                      }`}
                                    >
                                      <input
                                        type={q.question_type === "multiple_choice" ? "checkbox" : "radio"}
                                        name={q.id}
                                        value={opt.id}
                                        checked={isSelected}
                                        onChange={() => handleOptionSelect(q.id, opt.id, q.question_type)}
                                        className="accent-[#2563EB]"
                                      />
                                      <span>{opt.option_text}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={handleSubmitQuiz}
                          disabled={actionLoading}
                          className="bg-[#16A34A] text-white px-5 py-2.5 rounded-lg shadow-sm font-semibold hover:bg-[#16A34A]/95 transition-all text-xs flex items-center gap-1.5 disabled:opacity-50 w-full justify-center"
                        >
                          <Send size={13} /> Submit Quiz Answers
                        </button>
                      </div>
                    )}
                    {quizSubmittedResult && (
                      <div className="border border-[#16A34A]/20 bg-[#16A34A]/5 rounded-xl p-6 space-y-5 text-center">
                        <Award size={48} className="text-[#16A34A] mx-auto" />
                        <div>
                          <h4 className="font-bold text-sm text-[#0F172A]">Quiz Submitted Successfully!</h4>
                          <p className="text-[#475569] text-xs mt-1">
                            {quizDetails.show_results_immediately 
                              ? "Your grading calculations have completed." 
                              : "Your answers have been recorded. Grades will be released by the instructor."}
                          </p>
                        </div>

                        {quizDetails.show_results_immediately && (
                          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-xs pt-2">
                            <div className="bg-white p-3 border border-[#E2E8F0] rounded-xl">
                              <span className="text-[9px] text-[#475569] font-bold block uppercase tracking-wider">Score</span>
                              <span className="font-bold text-xs text-[#0F172A]">{quizSubmittedResult.score} / {quizSubmittedResult.max_score}</span>
                            </div>
                            <div className="bg-white p-3 border border-[#E2E8F0] rounded-xl">
                              <span className="text-[9px] text-[#475569] font-bold block uppercase tracking-wide">Passed</span>
                              <span className={`font-bold text-xs uppercase ${quizSubmittedResult.passed ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                                {quizSubmittedResult.passed ? "Yes" : "No"}
                              </span>
                            </div>
                            <div className="bg-white p-3 border border-[#E2E8F0] rounded-xl">
                              <span className="text-[9px] text-[#475569] font-bold block uppercase tracking-wider">Duration</span>
                              <span className="font-bold text-xs text-[#0F172A]">{quizSubmittedResult.time_spent_seconds} Secs</span>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setQuizSubmittedResult(null);
                            setSelectedQuizActivity(null);
                          }}
                          className="bg-white border border-[#E2E8F0] text-[#0F172A] px-4 py-2 rounded-lg font-bold hover:bg-slate-50 transition-all text-xs"
                        >
                          Return to Quiz List
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROJECTS */}
        {activeTab === "projects" && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6">
            {!selectedProjectActivity ? (
              <>
                <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
                  <FolderCode className="text-[#2563EB]" size={16} /> My Assigned Projects
                </h3>
                {loadingActivities ? (
                  <p className="text-slate-500 animate-pulse py-4 font-semibold text-center">Loading projects...</p>
                ) : activities.filter(a => a.activity_type_code === "project").length > 0 ? (
                  <div className="space-y-4">
                    {activities.filter(a => a.activity_type_code === "project").map((act) => (
                      <div key={act.id} className="border border-[#E2E8F0] rounded-xl p-4 bg-slate-50/20 flex justify-between items-center hover:shadow-sm transition-all">
                        <div>
                          <h4 className="font-bold text-xs text-[#0F172A]">{act.title}</h4>
                          <p className="text-[#475569] text-[10px] mt-1 line-clamp-1">{act.description}</p>
                          <div className="flex gap-3 text-[9px] text-[#475569] font-semibold mt-2.5">
                            <span className="bg-slate-100 px-2 py-0.5 rounded uppercase font-bold border text-slate-700">Status: {act.progress?.status_code}</span>
                            {act.progress?.score !== null && (
                              <span className="bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded font-bold border border-[#16A34A]/20">Score: {act.progress?.score} / {act.progress?.max_score || 100}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleEnterProject(act)}
                          className="bg-[#2563EB] text-white px-3.5 py-1.5 rounded-lg shadow-sm font-semibold hover:bg-[#2563EB]/90 transition-all flex items-center gap-1 text-[10px]"
                        >
                          Enter Project <ChevronRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-slate-500 font-medium">No projects assigned to your cohort.</p>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xs border-b border-[#E2E8F0] pb-3">
                  <button
                    onClick={() => {
                      setSelectedProjectActivity(null);
                      setProjectDetails(null);
                    }}
                    className="text-[#2563EB] hover:underline flex items-center gap-1 font-bold"
                  >
                    <ChevronLeft size={14} /> Projects
                  </button>
                  <span className="text-slate-300">/</span>
                  <span className="font-semibold text-[#0F172A]">{selectedProjectActivity.title}</span>
                </div>

                {loading ? (
                  <p className="text-slate-500 animate-pulse text-center py-8">Loading details...</p>
                ) : projectDetails && (
                  <div className="space-y-6">
                    <div className="border border-[#E2E8F0] rounded-xl p-5 bg-slate-50/20 space-y-4 text-xs">
                      <div>
                        <h4 className="font-bold text-[#0F172A] text-xs">Project Overview</h4>
                        <p className="text-[#475569] leading-relaxed mt-1">{projectDetails.project_overview}</p>
                      </div>

                      {projectDetails.requirements && (
                        <div>
                          <h4 className="font-bold text-[#0F172A] text-xs">Requirements</h4>
                          <p className="text-[#475569] leading-relaxed mt-1 whitespace-pre-line">{projectDetails.requirements}</p>
                        </div>
                      )}

                      {projectDetails.deliverables && (
                        <div>
                          <h4 className="font-bold text-[#0F172A] text-xs">Deliverables</h4>
                          <p className="text-[#475569] leading-relaxed mt-1 whitespace-pre-line">{projectDetails.deliverables}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-4 text-xs pt-2 border-t border-[#E2E8F0]">
                        <div>
                          <span className="text-[9px] text-[#475569] font-bold block uppercase tracking-wide">Difficulty</span>
                          <span className="font-bold text-[#0F172A] text-xs capitalize">{projectDetails.difficulty_level || "intermediate"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-[#475569] font-bold block uppercase tracking-wide">Estimated Hours</span>
                          <span className="font-bold text-[#0F172A] text-xs">{projectDetails.estimated_hours || 0} hrs</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-[#475569] font-bold block uppercase tracking-wide">Max Score</span>
                          <span className="font-bold text-[#0F172A] text-xs">{projectDetails.max_score} pts</span>
                        </div>
                      </div>
                    </div>

                    {/* GitHub submission module */}
                    <div className="border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                      <h4 className="font-bold text-xs text-[#0f172a] flex items-center gap-1">
                        <FolderCode className="text-[#2563EB]" size={14} /> Submission Form
                      </h4>

                      {projectSubmission && (
                        <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 text-[#16A34A] rounded-lg p-3 text-[10px] font-semibold flex items-center gap-2">
                          <CheckCircle2 size={12} />
                          <span>Last Submitted: {new Date(projectSubmission.submitted_at).toLocaleString()}</span>
                        </div>
                      )}

                      <div className="space-y-3 text-xs">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-[#0f172a]">GitHub Repository URL</label>
                          <input
                            type="text"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/username/repository"
                            className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 w-full text-xs outline-none focus:border-[#2563EB] transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-[#0f172a]">Submission Notes (optional)</label>
                          <textarea
                            value={submissionNotes}
                            onChange={(e) => setSubmissionNotes(e.target.value)}
                            placeholder="Write details or instructions for running the codebase here..."
                            rows={3}
                            className="bg-white border border-[#E2E8F0] rounded-lg p-3 w-full text-xs outline-none focus:border-[#2563EB] transition-all"
                          />
                        </div>

                        <button
                          onClick={handleSubmitProjectUrl}
                          disabled={actionLoading}
                          className="bg-[#2563EB] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2563EB]/95 transition-all text-xs disabled:opacity-50"
                        >
                          Submit Project Repository
                        </button>
                      </div>
                    </div>

                    {/* Mentor review block */}
                    {projectReview && (
                      <div className="border border-[#F59E0B]/20 bg-[#F59E0B]/5 rounded-xl p-5 space-y-3">
                        <h4 className="font-bold text-xs text-[#F59E0B] uppercase tracking-wide">Mentor Review Output</h4>
                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                          <div>
                            <span className="text-[9px] text-[#475569] block">Review Status</span>
                            <span className="capitalize">{projectReview.review_status}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#475569] block">Score Awarded</span>
                            <span>{projectReview.score !== null ? `${projectReview.score} / ${projectDetails.max_score}` : "Not Graded"}</span>
                          </div>
                        </div>
                        {projectReview.feedback && (
                          <div className="bg-white p-3 rounded-lg border border-[#e2e8f0] text-[#475569] mt-2">
                            <span className="text-[9px] font-bold text-[#0f172a] block mb-1">Mentor Feedback</span>
                            <p className="italic">{projectReview.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PROGRAMMING CHALLENGES */}
        {activeTab === "challenges" && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-6">
            {!selectedChallengeActivity ? (
              <>
                <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
                  <TerminalIcon className="text-[#2563EB]" size={16} /> My Assigned Coding Challenges
                </h3>
                {loadingActivities ? (
                  <p className="text-slate-500 animate-pulse py-4 font-semibold text-center">Loading challenges...</p>
                ) : activities.filter(a => a.activity_type_code === "programming_challenge" || a.activity_type_code === "programming").length > 0 ? (
                  <div className="space-y-4">
                    {activities.filter(a => a.activity_type_code === "programming_challenge" || a.activity_type_code === "programming").map((act) => (
                      <div key={act.id} className="border border-[#E2E8F0] rounded-xl p-4 bg-slate-50/20 flex justify-between items-center hover:shadow-sm transition-all">
                        <div>
                          <h4 className="font-bold text-xs text-[#0F172A]">{act.title}</h4>
                          <p className="text-[#475569] text-[10px] mt-1 line-clamp-1">{act.description}</p>
                          <div className="flex gap-3 text-[9px] text-[#475569] font-semibold mt-2.5">
                            <span className="bg-slate-100 px-2 py-0.5 rounded uppercase font-bold border text-slate-700">Status: {act.progress?.status_code}</span>
                            {act.progress?.score !== null && (
                              <span className="bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded font-bold border border-[#16A34A]/20">Score: {act.progress?.score} / {act.progress?.max_score || 100}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleEnterChallenge(act)}
                          className="bg-[#2563EB] text-white px-3.5 py-1.5 rounded-lg shadow-sm font-semibold hover:bg-[#2563EB]/90 transition-all flex items-center gap-1 text-[10px]"
                        >
                          Enter Challenge <ChevronRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-slate-500 font-medium">No challenges assigned to your cohort.</p>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xs border-b border-[#E2E8F0] pb-3">
                  <button
                    onClick={() => {
                      setSelectedChallengeActivity(null);
                      setChallengeDetails(null);
                      setSelectedSubmissionForResults(null);
                      setSubmissionResults(null);
                    }}
                    className="text-[#2563EB] hover:underline flex items-center gap-1 font-bold"
                  >
                    <ChevronLeft size={14} /> Challenges
                  </button>
                  <span className="text-slate-300">/</span>
                  <span className="font-semibold text-[#0F172A]">{selectedChallengeActivity.title}</span>
                </div>

                {loading ? (
                  <p className="text-slate-500 animate-pulse text-center py-8">Loading details...</p>
                ) : challengeDetails && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    
                    {/* Left: Problem statement & Examples */}
                    <div className="space-y-6">
                      <div className="border border-[#E2E8F0] rounded-xl p-5 bg-slate-50/20 space-y-4">
                        <div>
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-[#0F172A] text-xs">Problem Statement</h4>
                            <span className="px-2 py-0.5 rounded font-bold uppercase text-[9px] bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/20">
                              {challengeDetails.difficulty_level}
                            </span>
                          </div>
                          <p className="text-[#475569] leading-relaxed mt-2 whitespace-pre-line">{challengeDetails.problem_statement}</p>
                        </div>

                        {challengeDetails.input_format && (
                          <div>
                            <h4 className="font-bold text-[#0F172A] text-xs">Input Format</h4>
                            <p className="text-[#475569] leading-relaxed mt-1">{challengeDetails.input_format}</p>
                          </div>
                        )}

                        {challengeDetails.output_format && (
                          <div>
                            <h4 className="font-bold text-[#0F172A] text-xs">Output Format</h4>
                            <p className="text-[#475569] leading-relaxed mt-1">{challengeDetails.output_format}</p>
                          </div>
                        )}

                        {challengeDetails.constraints_text && (
                          <div>
                            <h4 className="font-bold text-[#0F172A] text-xs">Constraints</h4>
                            <p className="text-[#475569] font-mono leading-relaxed mt-1 text-[10px] bg-slate-100 p-2 rounded">{challengeDetails.constraints_text}</p>
                          </div>
                        )}
                      </div>

                      {/* Examples */}
                      {challengeExamples.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-xs text-[#0F172A] uppercase tracking-wide">Visible Examples</h4>
                          {challengeExamples.map((ex) => (
                            <div key={ex.id} className="border border-[#E2E8F0] rounded-xl p-4 bg-white space-y-2">
                              <p className="font-bold text-[#2563EB] text-[10px]">Example {ex.example_number}</p>
                              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono bg-slate-50 p-2 rounded border border-[#E2E8F0]">
                                <div>
                                  <span className="font-bold text-[#0f172a] block mb-0.5">Input</span>
                                  <span className="text-[#475569]">{ex.input_example}</span>
                                </div>
                                <div>
                                  <span className="font-bold text-[#0f172a] block mb-0.5">Output</span>
                                  <span className="text-[#475569]">{ex.output_example}</span>
                                </div>
                              </div>
                              {ex.explanation && <p className="text-[10px] text-[#475569] italic">Explanation: {ex.explanation}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Code editor & submissions list */}
                    <div className="space-y-6">
                      <div className="border border-[#E2E8F0] rounded-xl p-5 bg-white space-y-4">
                        <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
                          <h4 className="font-bold text-xs text-[#0f172a] flex items-center gap-1">
                            <Code size={14} className="text-[#2563EB]" /> Code Editor
                          </h4>
                          <select
                            value={editorLanguage}
                            onChange={(e) => setEditorLanguage(e.target.value)}
                            className="bg-slate-50 border border-[#E2E8F0] rounded-md px-2 py-1 text-[10px] font-semibold text-[#0F172A] outline-none"
                          >
                            <option value="javascript">JavaScript (Node.js)</option>
                            <option value="python">Python 3</option>
                            <option value="java">Java (OpenJDK)</option>
                            <option value="cpp">C++ (GCC)</option>
                            <option value="c">C (GCC)</option>
                          </select>
                        </div>

                        <textarea
                          value={editorCode}
                          onChange={(e) => setEditorCode(e.target.value)}
                          rows={12}
                          className="bg-[#0F172A] text-emerald-400 font-mono p-4 rounded-xl w-full text-[10px] outline-none border border-slate-800 leading-normal"
                          placeholder="// Write your code solution here..."
                        />

                        <button
                          onClick={handleSubmitChallenge}
                          disabled={actionLoading}
                          className="bg-[#2563EB] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2563EB]/95 transition-all text-xs disabled:opacity-50 w-full flex justify-center items-center gap-1.5"
                        >
                          <Send size={12} /> Submit Solution
                        </button>
                      </div>

                      {/* Submissions list */}
                      <div className="border border-[#E2E8F0] rounded-xl p-5 bg-white space-y-4">
                        <h4 className="font-bold text-xs text-[#0f172a] flex items-center gap-1">
                          <History size={14} className="text-[#2563EB]" /> Submission History ({challengeSubmissions.length})
                        </h4>

                        <div className="divide-y divide-[#E2E8F0] max-h-48 overflow-y-auto pr-1">
                          {challengeSubmissions.map((sub) => (
                            <div key={sub.id} className="py-2.5 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold capitalize text-[#0F172A]">{sub.language}</span>
                                <span className="text-[10px] text-[#475569] ml-2">{new Date(sub.submitted_at).toLocaleTimeString()}</span>
                                <div className="mt-1 flex gap-2">
                                  <span className={`px-1.5 py-0.5 rounded-[4px] font-bold text-[8px] uppercase border ${
                                    sub.submission_status_code === "accepted"
                                      ? "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20"
                                      : sub.submission_status_code === "pending" || sub.submission_status_code === "running"
                                      ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                                      : "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20"
                                  }`}>
                                    {sub.submission_status_code}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleViewSubmissionResults(sub)}
                                className="text-[#2563EB] hover:underline font-bold text-[10px]"
                              >
                                View Results
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Detailed submission results */}
                      {selectedSubmissionForResults && submissionResults && (
                        <div className="border border-[#E2E8F0] bg-slate-50/50 rounded-xl p-5 space-y-4 text-xs">
                          <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
                            <h4 className="font-bold text-[#0F172A] text-xs">Grading & Execution Report</h4>
                            <span className="font-mono text-[9px] text-[#475569]">ID: {selectedSubmissionForResults.id.substring(0, 8)}</span>
                          </div>

                          {submissionResults.result ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                              <div className="bg-white p-2 border border-[#E2E8F0] rounded-lg">
                                <span className="text-[9px] text-[#475569] block">Passed Cases</span>
                                <span className="font-bold text-[#16A34A]">{submissionResults.result.passed_test_cases} / {submissionResults.result.total_test_cases}</span>
                              </div>
                              <div className="bg-white p-2 border border-[#E2E8F0] rounded-lg">
                                <span className="text-[9px] text-[#475569] block">Time Spent</span>
                                <span className="font-bold">{submissionResults.result.execution_time_ms ?? 0} ms</span>
                              </div>
                              <div className="bg-white p-2 border border-[#E2E8F0] rounded-lg">
                                <span className="text-[9px] text-[#475569] block">Memory Used</span>
                                <span className="font-bold">{submissionResults.result.memory_used_kb ?? 0} KB</span>
                              </div>
                              <div className="bg-white p-2 border border-[#E2E8F0] rounded-lg">
                                <span className="text-[9px] text-[#475569] block">Score</span>
                                <span className="font-bold text-[#2563EB]">{submissionResults.result.score ?? 0} pts</span>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 text-[#F59E0B] p-3 rounded-lg flex items-center gap-1.5 font-semibold">
                              <AlertTriangle size={14} />
                              <span>Submission is currently: {selectedSubmissionForResults.submission_status_code}. Grading results will update automatically.</span>
                            </div>
                          )}

                          {/* Logs list */}
                          {submissionResults.logs?.length > 0 && (
                            <div className="space-y-2">
                              <span className="font-bold text-[#0F172A] block">Execution Output Logs</span>
                              <div className="bg-[#0F172A] text-[#E2E8F0] p-3 rounded-xl font-mono text-[9px] max-h-32 overflow-y-auto space-y-1">
                                {submissionResults.logs.map((log: any) => (
                                  <div key={log.id}>
                                    <span className="text-amber-400">[{log.log_type}]</span> {log.log_message}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
