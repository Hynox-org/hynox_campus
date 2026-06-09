"use client";

import React, { useState, useTransition, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  CheckSquare, 
  Terminal, 
  Calendar, 
  Search, 
  ExternalLink, 
  Star, 
  Clock, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Code2,
  FileCode,
  Layers,
  Activity,
  Plus,
  Video,
  FileText,
  Trash2,
  HelpCircle,
  Save,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { 
  reviewProjectSubmissionAction,
  assignActivityToCohortAction,
  createActivityAndSubclassAction,
  createQuizQuestionAndOptionsAction,
  createChallengeExampleAction,
  createChallengeTestCaseAction,
  getQuizDetailsAction,
  getProgrammingChallengeDetailsAction,
  listProjectSubmissionsAction,
  listChallengeSubmissionsAction,
  listAllActivitiesAction
} from "@/app/actions/learning-actions";
import {
  listTenantCoursesAction,
  listLessonsForCourseAction,
  listModulesAction,
  listLessonsAction,
  createLessonAction,
  updateLessonAction,
  createLessonResourceAction,
  deleteLessonResourceAction,
  listLessonResourcesAction,
  listProgramsAction
} from "@/app/actions/academic-actions";
import {
  listCohortsAction,
  listEnrollmentsAction
} from "@/app/actions/delivery-actions";

interface TeacherConsoleProps {
  teacherId: string;
  tenantId: string;
  initialCohorts: any[];
  initialActivities: any[];
  initialProjectSubmissions: any[];
  initialChallengeSubmissions: any[];
  initialEnrollments: any[];
  assignedInstitutions: any[];
  initialPrograms: any[];
}

export default function TeacherConsole({
  teacherId,
  tenantId,
  initialCohorts,
  initialActivities,
  initialProjectSubmissions,
  initialChallengeSubmissions,
  initialEnrollments,
  assignedInstitutions,
  initialPrograms
}: TeacherConsoleProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "roster" | "projects" | "challenges" | "activities-manager" | "syllabus">("overview");
  
  // Active selected institution and programs
  const [selectedInstId, setSelectedInstId] = useState<string>(assignedInstitutions[0]?.id || tenantId || "");
  const [programsList, setProgramsList] = useState<any[]>(initialPrograms || []);
  const [selectedProgramId, setSelectedProgramId] = useState<string>(initialPrograms?.[0]?.id || "");

  // Main collections
  const [cohorts, setCohorts] = useState(initialCohorts);
  const [activities, setActivities] = useState(initialActivities);
  const [projectSubmissions, setProjectSubmissions] = useState(initialProjectSubmissions);
  const [challengeSubmissions, setChallengeSubmissions] = useState(initialChallengeSubmissions);
  const [enrollments, setEnrollments] = useState(initialEnrollments);

  // General selection states
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");
  const [selectedProjectSub, setSelectedProjectSub] = useState<any>(null);
  const [selectedChallengeSub, setSelectedChallengeSub] = useState<any>(null);

  // Transition & status
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. PROJECT GRADING STATE
  const [score, setScore] = useState<number>(100);
  const [feedback, setFeedback] = useState<string>("");
  const [reviewStatus, setReviewStatus] = useState<string>("approved");

  // 2. ACTIVITY BUILDER & ASSIGNMENT STATE
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  const [activityType, setActivityType] = useState<"quiz" | "project" | "programming">("quiz");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [maxScore, setMaxScore] = useState(100);
  const [passingScore, setPassingScore] = useState(0);
  const [isMandatory, setIsMandatory] = useState(true);

  // Quiz details
  const [quizTimeLimit, setQuizTimeLimit] = useState(30);
  const [quizMaxAttempts, setQuizMaxAttempts] = useState(1);
  const [quizShuffleQ, setQuizShuffleQ] = useState(false);
  const [quizShuffleO, setQuizShuffleO] = useState(false);

  // Project details
  const [projOverview, setProjOverview] = useState("");
  const [projRequirements, setProjRequirements] = useState("");
  const [projDeliverables, setProjDeliverables] = useState("");
  const [projDifficulty, setProjDifficulty] = useState("intermediate");
  const [projHours, setProjHours] = useState(10);

  // Challenge details
  const [chalDifficulty, setChalDifficulty] = useState("easy");
  const [chalStatement, setChalStatement] = useState("");
  const [chalInput, setChalInput] = useState("");
  const [chalOutput, setChalOutput] = useState("");
  const [chalConstraints, setChalConstraints] = useState("");
  const [chalStarter, setChalStarter] = useState("");

  // Subclass creation ids
  const [createdActivityId, setCreatedActivityId] = useState("");
  const [createdQuizId, setCreatedQuizId] = useState("");
  const [createdChallengeId, setCreatedChallengeId] = useState("");

  // Children helpers
  const [quizQuestionsList, setQuizQuestionsList] = useState<any[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("single_choice");
  const [newQuestionPoints, setNewQuestionPoints] = useState(10);
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(["", "", "", ""]);
  const [newQuestionCorrectIndices, setNewQuestionCorrectIndices] = useState<number[]>([0]);

  const [examplesList, setExamplesList] = useState<any[]>([]);
  const [testCasesList, setTestCasesList] = useState<any[]>([]);
  const [newExInput, setNewExInput] = useState("");
  const [newExOutput, setNewExOutput] = useState("");
  const [newExExpl, setNewExExpl] = useState("");
  const [newTcInput, setNewTcInput] = useState("");
  const [newTcOutput, setNewTcOutput] = useState("");
  const [newTcHidden, setNewTcHidden] = useState(true);

  // Scheduling State
  const [assignmentCohortId, setAssignmentCohortId] = useState<string>("");
  const [availableFrom, setAvailableFrom] = useState<string>("");
  const [availableUntil, setAvailableUntil] = useState<string>("");

  // 3. SYLLABUS & STUDY MATERIALS STATE
  const [syllabusCourseId, setSyllabusCourseId] = useState<string>("");
  const [syllabusModuleId, setSyllabusModuleId] = useState<string>("");
  const [syllabusLessonId, setSyllabusLessonId] = useState<string>("");
  const [syllabusModules, setSyllabusModules] = useState<any[]>([]);
  const [syllabusLessons, setSyllabusLessons] = useState<any[]>([]);
  const [syllabusResources, setSyllabusResources] = useState<any[]>([]);

  // Add Lesson Form
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState(30);

  // Resource Form
  const [resType, setResType] = useState("pdf");
  const [resTitle, setResTitle] = useState("");
  const [resExternalUrl, setResExternalUrl] = useState("");

  // Load new dataset when selected institution changes
  useEffect(() => {
    if (!selectedInstId) return;

    startTransition(async () => {
      // Fetch cohorts
      const cohortRes = await listCohortsAction(selectedInstId);
      if (cohortRes.cohorts) {
        setCohorts(cohortRes.cohorts);
      } else {
        setCohorts([]);
      }

      // Fetch programs
      const progRes = await listProgramsAction(selectedInstId);
      const resProgs = progRes.programs || [];
      setProgramsList(resProgs);
      const firstProgId = resProgs[0]?.id || "";
      setSelectedProgramId(firstProgId);
      
      // Fetch activities with forced recompile check
      const actRes = await listAllActivitiesAction(selectedInstId);
      if (actRes.activities) {
        setActivities(actRes.activities);
      } else {
        setActivities([]);
      }

      // Fetch project submissions
      const projRes = await listProjectSubmissionsAction(selectedInstId);
      if (projRes.submissions) {
        setProjectSubmissions(projRes.submissions);
      } else {
        setProjectSubmissions([]);
      }

      // Fetch challenge submissions
      const chalRes = await listChallengeSubmissionsAction(selectedInstId);
      if (chalRes.submissions) {
        setChallengeSubmissions(chalRes.submissions);
      } else {
        setChallengeSubmissions([]);
      }

      // Fetch enrollments
      const enrollRes = await listEnrollmentsAction(selectedInstId);
      if (enrollRes.enrollments) {
        setEnrollments(enrollRes.enrollments);
      } else {
        setEnrollments([]);
      }

      // Fetch courses list
      const courseRes = await listTenantCoursesAction(selectedInstId);
      if (courseRes.courses) {
        setCoursesList(courseRes.courses);
      } else {
        setCoursesList([]);
      }

      // Reset selection forms
      setSelectedProjectSub(null);
      setSelectedChallengeSub(null);
      setSelectedCourseId("");
      setSelectedLessonId("");
      setSyllabusCourseId("");
    });
  }, [selectedInstId]);

  // Derive filtered cohorts based on selected program
  const filteredCohorts = cohorts.filter(c => !selectedProgramId || c.program_id === selectedProgramId);
  const filteredCohortIds = filteredCohorts.map(c => c.id);

  // Reset selectedCohortId to the first cohort in the filtered list if needed
  useEffect(() => {
    if (filteredCohorts.length > 0) {
      if (!filteredCohorts.some(c => c.id === selectedCohortId)) {
        setSelectedCohortId(filteredCohorts[0].id);
      }
    } else {
      setSelectedCohortId("");
    }
  }, [selectedProgramId, cohorts, selectedCohortId]);

  // Load lessons whenever course is selected for activity builder
  useEffect(() => {
    if (selectedCourseId) {
      listLessonsForCourseAction(selectedCourseId).then(res => setLessonsList(res.lessons || []));
    } else {
      setLessonsList([]);
    }
  }, [selectedCourseId]);

  // Load modules & lessons for syllabus manager
  useEffect(() => {
    if (syllabusCourseId) {
      listModulesAction(syllabusCourseId).then(res => setSyllabusModules(res.modules || []));
      listLessonsForCourseAction(syllabusCourseId).then(res => setSyllabusLessons(res.lessons || []));
      setSyllabusModuleId("");
      setSyllabusLessonId("");
      setSyllabusResources([]);
    } else {
      setSyllabusModules([]);
      setSyllabusLessons([]);
    }
  }, [syllabusCourseId]);

  // Load resources when lesson is selected
  useEffect(() => {
    if (syllabusLessonId) {
      listLessonResourcesAction(syllabusLessonId).then(res => setSyllabusResources(res.resources || []));
      
      // Load current lesson video details to form
      const lesObj = syllabusLessons.find(l => l.id === syllabusLessonId);
      if (lesObj) {
        setNewLessonTitle(lesObj.title || "");
        setNewLessonVideoUrl(lesObj.video_url || "");
        setNewLessonDuration(lesObj.duration || 30);
      }
    } else {
      setSyllabusResources([]);
      setNewLessonTitle("");
      setNewLessonVideoUrl("");
    }
  }, [syllabusLessonId, syllabusLessons]);

  // Filter enrollments and submissions to program-scoped cohorts
  const filteredEnrollments = enrollments.filter(e => filteredCohortIds.includes(e.cohort_id));
  const activeStudentsCount = filteredEnrollments.filter(e => e.status_code === "active").length;
  
  const filteredProjectSubmissions = projectSubmissions.filter(sub => 
    filteredEnrollments.some(e => e.student_id === sub.student_id)
  );
  const pendingProjectCount = filteredProjectSubmissions.filter(p => !p.review || p.review.review_status === "pending").length;
  
  const filteredChallengeSubmissions = challengeSubmissions.filter(sub => 
    filteredEnrollments.some(e => e.student_id === sub.student_id)
  );

  const currentCohortEnrollments = filteredEnrollments.filter(e => e.cohort_id === selectedCohortId);

  // Filter courses list to selected program
  const filteredCourses = coursesList.filter(c => !selectedProgramId || c.program_id === selectedProgramId);

  // Form submit: project grading
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectSub) return;

    startTransition(async () => {
      const result = await reviewProjectSubmissionAction({
        submissionId: selectedProjectSub.id,
        reviewerId: teacherId,
        status: reviewStatus,
        score: Number(score),
        feedback
      });

      if (result.review) {
        setProjectSubmissions(prev => 
          prev.map(p => p.id === selectedProjectSub.id ? { ...p, review: result.review } : p)
        );
        setSelectedProjectSub(null);
        setFeedback("");
        setStatusMessage({ type: "success", text: "Project submission graded successfully!" });
      } else {
        setStatusMessage({ type: "error", text: result.error || "Failed to submit review." });
      }
    });
  };

  // Form submit: activity building
  const handleCreateActivityBase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLessonId) {
      setStatusMessage({ type: "error", text: "Please select a Course and target Lesson." });
      return;
    }

    startTransition(async () => {
      const res = await createActivityAndSubclassAction({
        tenant_id: selectedInstId,
        institution_id: selectedInstId,
        lesson_id: selectedLessonId,
        activity_type_code: activityType,
        status_code: "published",
        title,
        description,
        instructions,
        max_score: maxScore,
        passing_score: passingScore,
        is_mandatory: isMandatory,

        quiz_time_limit: quizTimeLimit,
        quiz_max_attempts: quizMaxAttempts,
        quiz_shuffle_questions: quizShuffleQ,
        quiz_shuffle_options: quizShuffleO,

        project_overview: projOverview,
        project_requirements: projRequirements,
        project_deliverables: projDeliverables,
        project_difficulty: projDifficulty,
        project_estimated_hours: projHours,

        chal_difficulty: chalDifficulty,
        chal_problem_statement: chalStatement,
        chal_input_format: chalInput,
        chal_output_format: chalOutput,
        chal_constraints: chalConstraints,
        chal_starter_code: chalStarter
      });

      if (res.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else if (res.activity) {
        setStatusMessage({ type: "success", text: `Base activity "${title}" created successfully!` });
        setCreatedActivityId(res.activity.id);

        if (activityType === "quiz") {
          const details = await getQuizDetailsAction(res.activity.id);
          if (details && "quiz" in details && details.quiz) {
            setCreatedQuizId(details.quiz.id);
          }
        } else if (activityType === "programming") {
          const details = await getProgrammingChallengeDetailsAction(res.activity.id, "00000000-0000-0000-0000-000000000000");
          if (details && "challenge" in details && details.challenge) {
            setCreatedChallengeId(details.challenge.id);
          }
        }
        
        // Refresh local activity list
        setActivities(prev => [res.activity, ...prev]);
        setTitle("");
        setDescription("");
        setInstructions("");
      }
    });
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdQuizId) return;

    startTransition(async () => {
      const optionsPayload = newQuestionOptions.filter(o => o.trim()).map((o, idx) => ({
        optionText: o,
        isCorrect: newQuestionCorrectIndices.includes(idx),
        position: idx + 1
      }));

      const res = await createQuizQuestionAndOptionsAction(
        createdQuizId,
        newQuestionText,
        newQuestionType,
        newQuestionPoints,
        quizQuestionsList.length + 1,
        optionsPayload
      );

      if (res.question) {
        setQuizQuestionsList(prev => [...prev, res.question]);
        setStatusMessage({ type: "success", text: "Quiz question appended successfully!" });
        setNewQuestionText("");
        setNewQuestionOptions(["", "", "", ""]);
        setNewQuestionCorrectIndices([0]);
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to append question." });
      }
    });
  };

  const handleAddExample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdChallengeId) return;

    startTransition(async () => {
      const res = await createChallengeExampleAction({
        challenge_id: createdChallengeId,
        example_number: examplesList.length + 1,
        input_example: newExInput,
        output_example: newExOutput,
        explanation: newExExpl
      });

      if (res.example) {
        setExamplesList(prev => [...prev, res.example]);
        setStatusMessage({ type: "success", text: "Coding example added!" });
        setNewExInput("");
        setNewExOutput("");
        setNewExExpl("");
      }
    });
  };

  const handleAddTestCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdChallengeId) return;

    startTransition(async () => {
      const res = await createChallengeTestCaseAction({
        challenge_id: createdChallengeId,
        input_data: newTcInput,
        expected_output: newTcOutput,
        is_hidden: newTcHidden,
        position: testCasesList.length + 1
      });

      if (res.testCase) {
        setTestCasesList(prev => [...prev, res.testCase]);
        setStatusMessage({ type: "success", text: "Internal validation test case added!" });
        setNewTcInput("");
        setNewTcOutput("");
      }
    });
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const actId = createdActivityId || selectedLessonId;
    if (!actId || !assignmentCohortId) {
      setStatusMessage({ type: "error", text: "Select target cohort and activity to schedule assignment." });
      return;
    }

    startTransition(async () => {
      const result = await assignActivityToCohortAction({
        activity_id: actId,
        cohort_id: assignmentCohortId,
        is_required: true,
        available_from: availableFrom ? new Date(availableFrom).toISOString() : undefined,
        available_until: availableUntil ? new Date(availableUntil).toISOString() : undefined,
        created_by: teacherId
      });

      if (result.assignment) {
        setStatusMessage({ type: "success", text: "Activity successfully scheduled and assigned to class cohort!" });
        setCreatedActivityId("");
        setCreatedQuizId("");
        setCreatedChallengeId("");
        setQuizQuestionsList([]);
        setExamplesList([]);
        setTestCasesList([]);
      } else {
        setStatusMessage({ type: "error", text: result.error || "Failed to schedule activity assignment." });
      }
    });
  };

  // Form submit: Update Lesson details (video URL etc)
  const handleUpdateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusLessonId) return;

    startTransition(async () => {
      const res = await updateLessonAction(syllabusLessonId, {
        title: newLessonTitle,
        video_url: newLessonVideoUrl,
        duration: Number(newLessonDuration)
      });

      if (res.success) {
        setStatusMessage({ type: "success", text: "Lesson video and content details updated!" });
        // Refresh local syllabus lessons
        setSyllabusLessons(prev => 
          prev.map(l => l.id === syllabusLessonId ? { ...l, title: newLessonTitle, video_url: newLessonVideoUrl, duration: Number(newLessonDuration) } : l)
        );
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to update lesson content." });
      }
    });
  };

  // Form submit: Add resource study material
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusLessonId) return;

    startTransition(async () => {
      const res = await createLessonResourceAction({
        lesson_id: syllabusLessonId,
        resource_type: resType,
        title: resTitle,
        external_url: resExternalUrl,
        tenant_id: selectedInstId,
        institution_id: selectedInstId
      });

      if (res.resource) {
        setSyllabusResources(prev => [...prev, res.resource]);
        setResTitle("");
        setResExternalUrl("");
        setStatusMessage({ type: "success", text: "Study material resource appended to lesson successfully!" });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to add resource study material." });
      }
    });
  };

  // Action click: Delete resource
  const handleDeleteResource = (id: string) => {
    if (!confirm("Are you sure you want to delete this study material resource?")) return;

    startTransition(async () => {
      const res = await deleteLessonResourceAction(id);
      if (res.success) {
        setSyllabusResources(prev => prev.filter(r => r.id !== id));
        setStatusMessage({ type: "success", text: "Resource removed." });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to delete resource." });
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Multi-Tenant Campus Selector */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">Instructor Multi-Campus Hub</h2>
          <p className="text-xs text-[#475569]">Select your active assigned campus institution and academic program to filter workspace actions.</p>
        </div>

        {assignedInstitutions.length === 0 ? (
          <div className="flex items-center gap-2 bg-[#DC2626]/10 border border-[#DC2626]/20 px-4 py-2 rounded-xl text-xs text-[#DC2626] font-bold">
            <ShieldAlert size={16} />
            No campus institution assigned yet
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Institution Select */}
            <div className="flex flex-col gap-1 w-full sm:w-64">
              <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Institution Campus</span>
              <select
                value={selectedInstId}
                onChange={(e) => setSelectedInstId(e.target.value)}
                className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs font-bold text-[#0f172a] focus:outline-none focus:border-[#2563EB] shadow-sm w-full"
              >
                {assignedInstitutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name} ({inst.institution_code})</option>
                ))}
              </select>
            </div>

            {/* Program Select */}
            <div className="flex flex-col gap-1 w-full sm:w-64">
              <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Academic Program</span>
              {programsList.length === 0 ? (
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs text-[#475569] font-medium text-center">
                  No programs found
                </div>
              ) : (
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs font-bold text-[#0f172a] focus:outline-none focus:border-[#2563EB] shadow-sm w-full"
                >
                  {programsList.map(prog => (
                    <option key={prog.id} value={prog.id}>{prog.title}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-8rem)]">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 shrink-0 bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm h-fit">
          <div className="mb-6 px-2">
            <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider">Navigation</h3>
          </div>
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => { setActiveTab("overview"); setStatusMessage(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "overview" 
                  ? "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20" 
                  : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}
            >
              <Layers size={16} />
              Overview
            </button>
            <button
              onClick={() => { setActiveTab("roster"); setStatusMessage(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "roster" 
                  ? "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20" 
                  : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}
            >
              <Users size={16} />
              Cohort Roster
            </button>
            <button
              onClick={() => { setActiveTab("projects"); setStatusMessage(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "projects" 
                  ? "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20" 
                  : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}
            >
              <CheckSquare size={16} />
              Project Validator
              {pendingProjectCount > 0 && (
                <span className="ml-auto bg-[#DC2626] text-white px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
                  {pendingProjectCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab("challenges"); setStatusMessage(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "challenges" 
                  ? "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20" 
                  : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}
            >
              <Code2 size={16} />
              Challenge Auditor
            </button>
            <button
              onClick={() => { setActiveTab("activities-manager"); setStatusMessage(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "activities-manager" 
                  ? "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20" 
                  : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}
            >
              <Plus size={16} />
              Activities Manager
            </button>
            <button
              onClick={() => { setActiveTab("syllabus"); setStatusMessage(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "syllabus" 
                  ? "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20" 
                  : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}
            >
              <BookOpen size={16} />
              Course content & Videos
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {/* Status Alerts */}
          {statusMessage && (
            <div className={`p-4 rounded-xl text-xs font-bold border transition-all ${
              statusMessage.type === "success" 
                ? "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20" 
                : "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20"
            }`}>
              {statusMessage.text}
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Cohorts</span>
                    <div className="p-2 bg-[#2563EB]/10 text-[#2563EB] rounded-xl"><Layers size={18} /></div>
                  </div>
                  <h2 className="text-2xl font-bold">{filteredCohorts.length}</h2>
                  <p className="text-[10px] text-[#475569] mt-1">Managed educational cohorts</p>
                </div>

                <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Active Students</span>
                    <div className="p-2 bg-[#16A34A]/10 text-[#16A34A] rounded-xl"><Users size={18} /></div>
                  </div>
                  <h2 className="text-2xl font-bold">{activeStudentsCount}</h2>
                  <p className="text-[10px] text-[#475569] mt-1">Enrolled class consumers</p>
                </div>

                <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Pending Projects</span>
                    <div className="p-2 bg-[#F59E0B]/10 text-[#F59E0B] rounded-xl"><CheckSquare size={18} /></div>
                  </div>
                  <h2 className="text-2xl font-bold">{pendingProjectCount}</h2>
                  <p className="text-[10px] text-[#475569] mt-1">Requires manual evaluation</p>
                </div>

                <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Challenge Runs</span>
                    <div className="p-2 bg-[#06B6D4]/10 text-[#06B6D4] rounded-xl"><Code2 size={18} /></div>
                  </div>
                  <h2 className="text-2xl font-bold">{filteredChallengeSubmissions.length}</h2>
                  <p className="text-[10px] text-[#475569] mt-1">Code challenge attempts logged</p>
                </div>
              </div>

              {/* Quick Pending Submissions Queue */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-[#2563EB]" />
                  Recent Pending Evaluations Queue
                </h3>
                
                {filteredProjectSubmissions.filter(p => !p.review || p.review.review_status === "pending").length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[#E2E8F0] rounded-xl">
                    <AlertCircle className="mx-auto mb-2 text-[#475569]/40" size={32} />
                    <p className="text-xs font-medium text-[#475569]">All clear! No pending projects to grade.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E2E8F0]">
                    {filteredProjectSubmissions.filter(p => !p.review || p.review.review_status === "pending").slice(0, 5).map(sub => (
                      <div key={sub.id} className="py-4 flex justify-between items-center gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-[#0F172A]">{sub.project_title}</h4>
                          <p className="text-[10px] text-[#475569] mt-0.5">
                            Submitted by <strong className="text-[#0F172A]">{sub.student?.full_name || sub.student?.email}</strong> on {new Date(sub.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedProjectSub(sub);
                            setActiveTab("projects");
                          }}
                          className="flex items-center gap-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                        >
                          Grade Submission <ArrowRight size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COHORT ROSTER */}
          {activeTab === "roster" && (
            <div className="space-y-6 animate-fadeIn bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Academic Student Directory</h3>
                  <p className="text-[10px] text-[#475569]">Select cohort and inspect student learning status</p>
                </div>
                <select
                  value={selectedCohortId}
                  onChange={(e) => setSelectedCohortId(e.target.value)}
                  className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2563EB] w-full sm:w-60"
                >
                  {filteredCohorts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              {currentCohortEnrollments.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
                  No students enrolled in this cohort yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-[#475569]">
                        <th className="py-3 font-bold uppercase tracking-wider">Student Name</th>
                        <th className="py-3 font-bold uppercase tracking-wider">Email Address</th>
                        <th className="py-3 font-bold uppercase tracking-wider">Status</th>
                        <th className="py-3 font-bold uppercase tracking-wider">Enrolled On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {currentCohortEnrollments.map((enr: any) => (
                        <tr key={enr.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 font-bold text-[#0F172A]">
                            {enr.student?.full_name || "Invited Candidate"}
                          </td>
                          <td className="py-3 text-[#475569]">{enr.student?.email}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              enr.status_code === "active" 
                                ? "bg-[#16A34A]/10 text-[#16A34A]" 
                                : "bg-[#475569]/10 text-[#475569]"
                            }`}>
                              {enr.status_code}
                            </span>
                          </td>
                          <td className="py-3 text-[#475569]">
                            {new Date(enr.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROJECT VALIDATOR */}
          {activeTab === "projects" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm h-fit">
                <h3 className="text-sm font-bold text-[#0F172A] mb-4">Student Project Submissions</h3>
                
                {filteredProjectSubmissions.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
                    No project submissions found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProjectSubmissions.map(sub => {
                      const hasReview = !!sub.review;
                      const isSelected = selectedProjectSub?.id === sub.id;

                      return (
                        <div 
                          key={sub.id}
                          onClick={() => setSelectedProjectSub(sub)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${
                            isSelected 
                              ? "border-[#2563EB] bg-[#2563EB]/5 shadow-sm" 
                              : "border-[#E2E8F0] hover:border-[#475569]/50"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="text-xs font-bold text-[#0F172A]">{sub.project_title}</h4>
                              <p className="text-[10px] text-[#475569] mt-0.5">
                                By <strong className="text-[#0F172A]">{sub.student?.full_name || sub.student?.email}</strong>
                              </p>
                            </div>
                            
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              !hasReview || sub.review.review_status === "pending"
                                ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                                : sub.review.review_status === "approved"
                                ? "bg-[#16A34A]/10 text-[#16A34A]"
                                : "bg-[#DC2626]/10 text-[#DC2626]"
                            }`}>
                              {!hasReview ? "Pending Review" : sub.review.review_status}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#E2E8F0] text-[10px] text-[#475569]">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(sub.submitted_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-[#2563EB]">
                              <ExternalLink size={12} />
                              GitHub Repo Link
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm h-fit">
                {selectedProjectSub ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <h3 className="text-sm font-bold text-[#0F172A] pb-3 border-b border-[#E2E8F0]">
                      Grade: {selectedProjectSub.project_title}
                    </h3>

                    <div>
                      <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                        Submitted GitHub URL
                      </label>
                      <a 
                        href={selectedProjectSub.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-[#2563EB] font-semibold break-all hover:underline flex items-center gap-1"
                      >
                        {selectedProjectSub.github_url}
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    {selectedProjectSub.submission_notes && (
                      <div>
                        <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                          Student Submission Notes
                        </label>
                        <p className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-[#0F172A]">
                          {selectedProjectSub.submission_notes}
                        </p>
                      </div>
                    )}

                    <hr className="border-[#E2E8F0]" />

                    <div>
                      <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                        Assign Status
                      </label>
                      <select
                        value={reviewStatus}
                        onChange={(e) => setReviewStatus(e.target.value)}
                        className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2563EB] w-full"
                      >
                        <option value="approved">Approved & Completed</option>
                        <option value="revision_requested">Revision Requested</option>
                        <option value="rejected">Rejected / Failed</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block">
                          Assigned Score
                        </label>
                        <span className="text-[10px] font-bold text-[#475569]">
                          Max Score: {selectedProjectSub.max_score}
                        </span>
                      </div>
                      <input 
                        type="number"
                        max={selectedProjectSub.max_score}
                        min={0}
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                        className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#2563EB] w-full"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                        Feedback Comments
                      </label>
                      <textarea 
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Add review feedback for the student..."
                        className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#2563EB] w-full resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isPending}
                      className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      {isPending ? "Submitting..." : "Submit Review Grade"}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-10 border border-dashed border-[#E2E8F0] rounded-xl">
                    <AlertCircle className="mx-auto mb-2 text-[#475569]/40" size={32} />
                    <p className="text-xs font-semibold text-[#475569]">Select submission from list to begin grading</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CHALLENGE AUDITOR */}
          {activeTab === "challenges" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm h-fit">
                <h3 className="text-sm font-bold text-[#0F172A] mb-4">Student Coding Submissions</h3>
                
                {filteredChallengeSubmissions.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
                    No coding challenge submissions logged yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredChallengeSubmissions.map(sub => {
                      const isSelected = selectedChallengeSub?.id === sub.id;

                      return (
                        <div 
                          key={sub.id}
                          onClick={() => setSelectedChallengeSub(sub)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${
                            isSelected 
                              ? "border-[#2563EB] bg-[#2563EB]/5 shadow-sm" 
                              : "border-[#E2E8F0] hover:border-[#475569]/50"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="text-xs font-bold text-[#0F172A]">{sub.challenge_title}</h4>
                              <p className="text-[10px] text-[#475569] mt-0.5">
                                Submitted by <strong className="text-[#0F172A]">{sub.student?.full_name || sub.student?.email}</strong>
                              </p>
                            </div>
                            
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 uppercase ${
                              sub.submission_status_code === "accepted"
                                ? "bg-[#16A34A]/10 text-[#16A34A]"
                                : sub.submission_status_code === "pending" || sub.submission_status_code === "running"
                                ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                                : "bg-[#DC2626]/10 text-[#DC2626]"
                            }`}>
                              {sub.submission_status_code.replace(/_/g, " ")}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#E2E8F0] text-[10px] text-[#475569]">
                            <span className="flex items-center gap-1 font-bold text-[#0F172A] bg-[#E2E8F0]/40 px-1.5 py-0.5 rounded">
                              {sub.language}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(sub.submitted_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm h-fit">
                {selectedChallengeSub ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#0F172A] pb-3 border-b border-[#E2E8F0]">
                      Audit Subscribed Code
                    </h3>

                    <div>
                      <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wide block">Challenge Name</span>
                      <span className="text-xs font-bold">{selectedChallengeSub.challenge_title}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wide block">Language Runtime</span>
                      <span className="text-xs font-semibold uppercase">{selectedChallengeSub.language}</span>
                    </div>

                    <hr className="border-[#E2E8F0]" />

                    <div>
                      <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wide block mb-1">Submitted Code Snippet</span>
                      <pre className="p-3 bg-[#0F172A] text-white text-[10px] font-mono rounded-xl overflow-x-auto max-h-60">
                        <code>{selectedChallengeSub.source_code}</code>
                      </pre>
                    </div>

                    {selectedChallengeSub.result && (
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2 text-[10px]">
                        <span className="font-bold text-[#0F172A] block uppercase tracking-wide">Judge Execution Results</span>
                        <div className="flex justify-between">
                          <span className="text-[#475569]">Passed Test Cases:</span>
                          <strong className="text-[#16A34A]">{selectedChallengeSub.result.passed_test_cases} / {selectedChallengeSub.result.total_test_cases}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#475569]">Execution Time:</span>
                          <strong>{selectedChallengeSub.result.execution_time_ms} ms</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#475569]">Assigned Grade Score:</span>
                          <strong className="text-[#2563EB]">{selectedChallengeSub.result.score} pts</strong>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-[#E2E8F0] rounded-xl">
                    <AlertCircle className="mx-auto mb-2 text-[#475569]/40" size={32} />
                    <p className="text-xs font-semibold text-[#475569]">Select student submission to audit execution logs</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ACTIVITIES & ASSIGNMENTS MANAGER */}
          {activeTab === "activities-manager" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-6">
                
                {!createdActivityId ? (
                  <form onSubmit={handleCreateActivityBase} className="space-y-4">
                    <h3 className="text-sm font-bold text-[#0F172A] pb-3 border-b border-[#E2E8F0] flex items-center gap-1.5">
                      <Plus size={16} className="text-[#2563EB]" /> Create Learning Activity
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                          Select Course *
                        </label>
                        <select
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                          className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#2563EB] w-full"
                          required
                        >
                          <option value="">-- Choose Course --</option>
                          {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                          Target Lesson *
                        </label>
                        <select
                          value={selectedLessonId}
                          onChange={(e) => setSelectedLessonId(e.target.value)}
                          className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#2563EB] w-full"
                          required
                        >
                          <option value="">-- Choose Lesson --</option>
                          {lessonsList.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                          Activity Type
                        </label>
                        <select
                          value={activityType}
                          onChange={(e: any) => setActivityType(e.target.value)}
                          className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#2563EB] w-full"
                        >
                          <option value="quiz">Quiz Assessment</option>
                          <option value="project">Project Repository Upload</option>
                          <option value="programming">Coding Challenge</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                          Activity Title *
                        </label>
                        <input 
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Module 3 Coding Quiz"
                          className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#2563EB] w-full"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                          Max Score
                        </label>
                        <input 
                          type="number"
                          value={maxScore}
                          onChange={(e) => setMaxScore(Number(e.target.value))}
                          className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#2563EB] w-full"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                          Passing Score
                        </label>
                        <input 
                          type="number"
                          value={passingScore}
                          onChange={(e) => setPassingScore(Number(e.target.value))}
                          className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#2563EB] w-full"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-6">
                        <input 
                          type="checkbox"
                          id="isMandatoryAct"
                          checked={isMandatory}
                          onChange={(e) => setIsMandatory(e.target.checked)}
                          className="rounded text-[#2563EB] focus:ring-[#2563EB] h-4 w-4"
                        />
                        <label htmlFor="isMandatoryAct" className="text-xs font-semibold text-[#475569]">
                          Mandatory
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                        Overview / Description
                      </label>
                      <textarea 
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add activity outline..."
                        className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#2563EB] w-full resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">
                        Instructions / Tips
                      </label>
                      <textarea 
                        rows={3}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Write guidelines for completion..."
                        className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#2563EB] w-full resize-none"
                      />
                    </div>

                    {activityType === "quiz" && (
                      <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
                        <h4 className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wide">Quiz Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-semibold text-[#475569] block mb-1">Time Limit (Minutes)</label>
                            <input 
                              type="number" 
                              value={quizTimeLimit} 
                              onChange={(e) => setQuizTimeLimit(Number(e.target.value))}
                              className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs w-full"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-[#475569] block mb-1">Max Attempts</label>
                            <input 
                              type="number" 
                              value={quizMaxAttempts} 
                              onChange={(e) => setQuizMaxAttempts(Number(e.target.value))}
                              className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs w-full"
                            />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1.5 text-xs">
                            <input type="checkbox" checked={quizShuffleQ} onChange={(e) => setQuizShuffleQ(e.target.checked)} />
                            Shuffle Questions
                          </label>
                          <label className="flex items-center gap-1.5 text-xs">
                            <input type="checkbox" checked={quizShuffleO} onChange={(e) => setQuizShuffleO(e.target.checked)} />
                            Shuffle Options
                          </label>
                        </div>
                      </div>
                    )}

                    {activityType === "project" && (
                      <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
                        <h4 className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wide">Project Details</h4>
                        <div>
                          <label className="text-[10px] font-semibold text-[#475569] block mb-1">Overview Context</label>
                          <textarea 
                            rows={2} 
                            value={projOverview} 
                            onChange={(e) => setProjOverview(e.target.value)}
                            className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs w-full"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-[#475569] block mb-1">Requirements</label>
                          <textarea 
                            rows={2} 
                            value={projRequirements} 
                            onChange={(e) => setProjRequirements(e.target.value)}
                            className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs w-full"
                          />
                        </div>
                      </div>
                    )}

                    {activityType === "programming" && (
                      <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
                        <h4 className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wide">Challenge Definition</h4>
                        <div>
                          <label className="text-[10px] font-semibold text-[#475569] block mb-1">Problem Statement</label>
                          <textarea 
                            rows={3} 
                            value={chalStatement} 
                            onChange={(e) => setChalStatement(e.target.value)}
                            className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs w-full font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-[#475569] block mb-1">Starter Code Outline</label>
                          <textarea 
                            rows={2} 
                            value={chalStarter} 
                            onChange={(e) => setChalStarter(e.target.value)}
                            className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs w-full font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isPending}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs py-2 px-6 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      Save Activity Base details
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
                      <h3 className="text-xs font-bold text-[#0F172A] uppercase">Activity Elements Configurations</h3>
                      <button 
                        onClick={() => setCreatedActivityId("")}
                        className="bg-slate-200 text-slate-700 font-bold text-[10px] px-3 py-1 rounded-lg"
                      >
                        Create Another Activity
                      </button>
                    </div>

                    {activityType === "quiz" && createdQuizId && (
                      <form onSubmit={handleAddQuestion} className="space-y-4 border border-[#E2E8F0] p-4 rounded-xl">
                        <h4 className="text-xs font-bold flex items-center gap-1"><HelpCircle size={14} /> Add Quiz Question</h4>
                        <div>
                          <input 
                            type="text"
                            value={newQuestionText}
                            onChange={(e) => setNewQuestionText(e.target.value)}
                            placeholder="Question Title Text..."
                            className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs w-full"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] block font-bold text-[#475569]">Question Type</label>
                            <select 
                              value={newQuestionType}
                              onChange={(e) => setNewQuestionType(e.target.value)}
                              className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs w-full"
                            >
                              <option value="single_choice">Single Choice</option>
                              <option value="multiple_choice">Multiple Choice</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] block font-bold text-[#475569]">Points</label>
                            <input 
                              type="number"
                              value={newQuestionPoints}
                              onChange={(e) => setNewQuestionPoints(Number(e.target.value))}
                              className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs w-full"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold block text-[#475569]">Options Configuration</label>
                          {newQuestionOptions.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                checked={newQuestionCorrectIndices.includes(oIdx)}
                                onChange={() => setNewQuestionCorrectIndices([oIdx])}
                              />
                              <input 
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...newQuestionOptions];
                                  newOpts[oIdx] = e.target.value;
                                  setNewQuestionOptions(newOpts);
                                }}
                                placeholder={`Option ${oIdx + 1}`}
                                className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs w-full"
                              />
                            </div>
                          ))}
                        </div>

                        <button type="submit" className="bg-[#2563EB] text-white px-4 py-1.5 rounded-xl font-bold">
                          Append Question
                        </button>
                      </form>
                    )}

                    {activityType === "programming" && createdChallengeId && (
                      <div className="space-y-4">
                        <form onSubmit={handleAddExample} className="space-y-4 border border-[#E2E8F0] p-4 rounded-xl">
                          <h4 className="text-xs font-bold flex items-center gap-1"><FileCode size={14} /> Add Code Example</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <textarea placeholder="Input example" value={newExInput} onChange={e=>setNewExInput(e.target.value)} className="bg-white border border-[#E2E8F0] rounded-lg p-2 text-xs font-mono" />
                            <textarea placeholder="Output example" value={newExOutput} onChange={e=>setNewExOutput(e.target.value)} className="bg-white border border-[#E2E8F0] rounded-lg p-2 text-xs font-mono" />
                          </div>
                          <button type="submit" className="bg-[#2563EB] text-white px-4 py-1.5 rounded-xl font-bold">Add Example</button>
                        </form>

                        <form onSubmit={handleAddTestCase} className="space-y-4 border border-[#E2E8F0] p-4 rounded-xl">
                          <h4 className="text-xs font-bold flex items-center gap-1"><CheckSquare size={14} /> Add Judge Test Case</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <textarea placeholder="Input data" value={newTcInput} onChange={e=>setNewTcInput(e.target.value)} className="bg-white border border-[#E2E8F0] rounded-lg p-2 text-xs font-mono" />
                            <textarea placeholder="Expected Output" value={newTcOutput} onChange={e=>setNewTcOutput(e.target.value)} className="bg-white border border-[#E2E8F0] rounded-lg p-2 text-xs font-mono" />
                          </div>
                          <button type="submit" className="bg-[#2563EB] text-white px-4 py-1.5 rounded-xl font-bold">Add Test Case</button>
                        </form>
                      </div>
                    )}

                    <form onSubmit={handleAssignSubmit} className="space-y-4 border border-[#E2E8F0] p-4 rounded-xl">
                      <h4 className="text-xs font-bold flex items-center gap-1"><Calendar size={14} /> Schedule Deployment Assignment</h4>
                      <div>
                        <label className="text-[10px] block font-bold text-[#475569]">Select Cohort</label>
                        <select 
                          value={assignmentCohortId}
                          onChange={(e) => setAssignmentCohortId(e.target.value)}
                          className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs w-full"
                          required
                        >
                          <option value="">-- Select Target Cohort --</option>
                          {filteredCohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] block font-bold text-[#475569]">Available From</label>
                          <input type="datetime-local" value={availableFrom} onChange={e=>setAvailableFrom(e.target.value)} className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs w-full" />
                        </div>
                        <div>
                          <label className="text-[10px] block font-bold text-[#475569]">Due Date</label>
                          <input type="datetime-local" value={availableUntil} onChange={e=>setAvailableUntil(e.target.value)} className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-xs w-full" />
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-[#16A34A] text-white font-bold text-xs py-2 rounded-xl">
                        Schedule & Deploy Activity
                      </button>
                    </form>
                  </div>
                )}
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm h-fit space-y-4">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase pb-2 border-b border-[#E2E8F0] flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#2563EB]" /> Scheduled Activities
                </h3>
                
                {activities.length === 0 ? (
                  <p className="text-xs text-[#475569] text-center py-6">No learning activity modules published.</p>
                ) : (
                  <div className="space-y-3">
                    {activities.map(act => (
                      <div key={act.id} className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl text-[10px]">
                        <span className="font-bold block text-[#0F172A]">{act.title}</span>
                        <div className="flex justify-between text-[#475569] mt-1 pt-1 border-t border-[#E2E8F0]/80">
                          <span>Type: {act.activity_type_code}</span>
                          <span>Max Score: {act.max_score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: SYLLABUS & CONTENT MANAGER */}
          {activeTab === "syllabus" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm h-fit space-y-4">
                <h3 className="text-xs font-bold text-[#0F172A] pb-3 border-b border-[#E2E8F0]">Syllabus Navigator</h3>
                
                <div>
                  <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">Select Course</label>
                  <select
                    value={syllabusCourseId}
                    onChange={(e) => setSyllabusCourseId(e.target.value)}
                    className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#2563EB] w-full"
                  >
                    <option value="">-- Choose Course --</option>
                    {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>

                {syllabusCourseId && (
                  <div>
                    <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">Modules</label>
                    <select
                      value={syllabusModuleId}
                      onChange={(e) => {
                        const modId = e.target.value;
                        setSyllabusModuleId(modId);
                        if (modId) {
                          listLessonsAction(modId).then(res => setSyllabusLessons(res.lessons || []));
                        } else {
                          listLessonsForCourseAction(syllabusCourseId).then(res => setSyllabusLessons(res.lessons || []));
                        }
                        setSyllabusLessonId("");
                      }}
                      className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#2563EB] w-full"
                    >
                      <option value="">-- All Course Modules --</option>
                      {syllabusModules.map(m => <option key={m.id} value={m.id}>Mod {m.position}: {m.title}</option>)}
                    </select>
                  </div>
                )}

                {syllabusCourseId && (
                  <div>
                    <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">Select Lesson</label>
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                      {syllabusLessons.map(l => (
                        <button
                          key={l.id}
                          onClick={() => setSyllabusLessonId(l.id)}
                          className={`w-full text-left p-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-between ${
                            syllabusLessonId === l.id 
                              ? "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20" 
                              : "bg-slate-50 border-[#E2E8F0] text-[#475569] hover:bg-slate-100"
                          }`}
                        >
                          <span className="truncate pr-2">{l.title}</span>
                          <ChevronRight size={12} className="shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 space-y-6">
                {syllabusLessonId ? (
                  <>
                    <form onSubmit={handleUpdateLesson} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
                      <h3 className="text-sm font-bold text-[#0F172A] pb-3 border-b border-[#E2E8F0] flex items-center gap-1.5">
                        <Video size={16} className="text-[#2563EB]" /> Edit Lesson Video & details
                      </h3>

                      <div>
                        <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">Lesson Title *</label>
                        <input 
                          type="text" 
                          value={newLessonTitle} 
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#2563EB] w-full"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">Class Video Recording URL</label>
                          <input 
                            type="url" 
                            value={newLessonVideoUrl} 
                            onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                            placeholder="e.g. YouTube or Drive URL"
                            className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#2563EB] w-full font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">Duration (Minutes)</label>
                          <input 
                            type="number" 
                            value={newLessonDuration} 
                            onChange={(e) => setNewLessonDuration(Number(e.target.value))}
                            className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#2563EB] w-full"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isPending}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white font-bold text-xs py-2 px-5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Save size={14} />
                        Save Changes
                      </button>
                    </form>

                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-[#0F172A] pb-3 border-b border-[#E2E8F0] flex items-center gap-1.5">
                        <FileText size={16} className="text-[#2563EB]" /> Study Materials & PDF Resources
                      </h3>

                      {syllabusResources.length === 0 ? (
                        <p className="text-xs text-[#475569] text-center py-6 border border-dashed border-[#E2E8F0] rounded-xl">
                          No study materials uploaded for this lesson yet.
                        </p>
                      ) : (
                        <div className="divide-y divide-[#E2E8F0]">
                          {syllabusResources.map(res => (
                            <div key={res.id} className="py-3 flex justify-between items-center gap-4">
                              <div className="flex items-center gap-2">
                                <FileText size={16} className="text-[#2563EB] shrink-0" />
                                <div>
                                  <span className="font-semibold text-xs text-[#0F172A] block">{res.title}</span>
                                  <a 
                                    href={res.external_url || res.file_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[9px] text-[#2563EB] font-semibold break-all hover:underline"
                                  >
                                    {res.external_url || res.file_url}
                                  </a>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleDeleteResource(res.id)}
                                className="p-1.5 bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20 rounded-lg hover:bg-[#DC2626] hover:text-white transition-all shrink-0"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <form onSubmit={handleAddResource} className="pt-4 border-t border-[#E2E8F0] space-y-3">
                        <h4 className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wide">Add Extra Resource Study Material</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-bold text-[#475569] block mb-1">Resource Type</label>
                            <select 
                              value={resType}
                              onChange={(e) => setResType(e.target.value)}
                              className="bg-white border border-[#E2E8F0] px-2.5 py-1.5 rounded-lg text-xs w-full"
                            >
                              <option value="pdf">PDF Document</option>
                              <option value="link">External Resource Link</option>
                              <option value="cheatsheet">Cheatsheet</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-[#475569] block mb-1">Title *</label>
                            <input 
                              type="text" 
                              value={resTitle} 
                              onChange={(e) => setResTitle(e.target.value)}
                              placeholder="e.g. CheatSheet PDF"
                              className="bg-white border border-[#E2E8F0] px-2.5 py-1.5 rounded-lg text-xs w-full"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#475569] block mb-1">Resource Link URL *</label>
                          <input 
                            type="url" 
                            value={resExternalUrl} 
                            onChange={(e) => setResExternalUrl(e.target.value)}
                            placeholder="https://drive.google.com/... or https://..."
                            className="bg-white border border-[#E2E8F0] px-2.5 py-1.5 rounded-lg text-xs w-full font-mono"
                            required
                          />
                        </div>
                        <button 
                          type="submit" 
                          disabled={isPending}
                          className="bg-[#2563EB] text-white text-xs font-bold py-1.5 px-4 rounded-xl flex items-center gap-1.5"
                        >
                          <Plus size={12} />
                          Add Study Material
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center text-[#475569] shadow-sm">
                    <AlertCircle className="mx-auto mb-2 text-[#475569]/40" size={36} />
                    <p className="text-xs font-bold text-[#0F172A]">Select Course and target Lesson from tree to begin editing content & uploads</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
