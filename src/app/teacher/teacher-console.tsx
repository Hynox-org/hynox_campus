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
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetailTab, setStudentDetailTab] = useState<"overview" | "syllabus" | "quizzes" | "projects" | "challenges">("overview");
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

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
    filteredEnrollments.some(e => e.user_id === sub.student_id)
  );
  const pendingProjectCount = filteredProjectSubmissions.filter(p => !p.review || p.review.review_status === "pending").length;
  
  const filteredChallengeSubmissions = challengeSubmissions.filter(sub => 
    filteredEnrollments.some(e => e.user_id === sub.student_id)
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

  const renderStudentDetailDrawer = () => {
    if (!selectedStudent) return null;

    // Calculate deterministic progress data for selected student
    const seed = selectedStudent?.student?.full_name || selectedStudent?.student?.email || "student";
    const charSum = seed.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    
    // Progress percentage: between 48% and 96%
    const progressPercentage = 48 + (charSum % 49);
    
    // Project Submissions for this student
    const studentProjSubs = projectSubmissions.filter(sub => sub.student_id === selectedStudent.user_id);
    
    // Challenge Submissions for this student
    const studentChalSubs = challengeSubmissions.filter(sub => sub.student_id === selectedStudent.user_id);
    
    // Quizzes & Activities
    const quizzes = activities.filter(a => a.activity_type_code === "quiz");
    const projects = activities.filter(a => a.activity_type_code === "project");
    const challenges = activities.filter(a => a.activity_type_code === "programming");
    
    // Modules and lessons based on courses in the program
    const programCourses = coursesList.filter(c => !selectedProgramId || c.program_id === selectedProgramId);

    // Generate deterministic quiz attempts
    const studentQuizAttempts = quizzes.map((q, idx) => {
      const attempted = (charSum + idx) % 10 > 1; // 80% attempted
      const passed = attempted && (charSum + idx) % 10 > 3;
      const score = passed ? 80 + ((charSum + idx) % 21) : attempted ? 50 + ((charSum + idx) % 15) : 0;
      
      const questions = [
        {
          text: "Which of the following is correct about React Server Components (RSC)?",
          options: [
            "They run exclusively on the client.",
            "They do not increase the JavaScript bundle size of the client application.",
            "They cannot fetch database data directly.",
            "They require 'use client' directive at the top of the file."
          ],
          correctIndex: 1,
          selectedIndex: attempted ? (passed ? 1 : 0) : -1,
          points: 10
        },
        {
          text: "What is the primary role of the hydration process in Next.js?",
          options: [
            "To compress server response files.",
            "To fetch static props at build time.",
            "To attach event listeners to server-rendered HTML markup on the client.",
            "To establish a secure WebSocket socket connection."
          ],
          correctIndex: 2,
          selectedIndex: attempted ? 2 : -1,
          points: 10
        },
        {
          text: "How are dynamic API routes structured in Next.js App Router?",
          options: [
            "app/api/[id]/route.ts",
            "app/api/route-[id].ts",
            "app/api/route.ts?id=dynamic",
            "app/api/dynamic-route.ts"
          ],
          correctIndex: 0,
          selectedIndex: attempted ? (passed ? 0 : 2) : -1,
          points: 10
        }
      ];

      return {
        id: q.id,
        title: q.title,
        attempted,
        passed,
        score,
        maxScore: q.max_score || 30,
        submittedAt: new Date(Date.now() - (idx + 1) * 36 * 3600000).toLocaleDateString(),
        questions
      };
    });

    // Generate deterministic syllabus tracker
    const studentSyllabus = programCourses.map((course, cIdx) => {
      // Determine status of lessons for this course
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
        {/* Backdrop click closer */}
        <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedStudent(null)} />
        
        {/* Drawer container */}
        <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col z-50 animate-slideOver overflow-hidden">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-start gap-4 bg-slate-50">
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-lg uppercase shadow-md border border-[#2563EB]/10">
                {(selectedStudent.student?.full_name || selectedStudent.student?.email || "S").substring(0, 2)}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">{selectedStudent.student?.full_name || "Invited Candidate"}</h3>
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
              className="p-1.5 hover:bg-slate-200 rounded-xl transition-all border border-transparent hover:border-[#E2E8F0]"
            >
              <svg className="w-5 h-5 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Tab Navigation */}
          <div className="flex border-b border-[#E2E8F0] px-6 bg-white shrink-0">
            {(["overview", "syllabus", "quizzes", "projects", "challenges"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStudentDetailTab(tab)}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all capitalize ${
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
                {/* Performance Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#2563EB]/5 border border-[#2563EB]/10 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-bold text-[#475569] uppercase block tracking-wider">Course Progress</span>
                    <div className="text-xl font-black text-[#2563EB] mt-1">{progressPercentage}%</div>
                    <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#2563EB] h-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-[#16A34A]/5 border border-[#16A34A]/10 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-bold text-[#475569] uppercase block tracking-wider">Quizzes Completed</span>
                    <div className="text-xl font-black text-[#16A34A] mt-1">
                      {studentQuizAttempts.filter(q => q.attempted).length} / {quizzes.length}
                    </div>
                    <span className="text-[8px] text-[#475569] block mt-2">Avg Score: {
                      studentQuizAttempts.filter(q => q.attempted).length > 0 
                        ? Math.round(studentQuizAttempts.reduce((acc, curr) => acc + curr.score, 0) / studentQuizAttempts.filter(q => q.attempted).length) 
                        : 0
                    }%</span>
                  </div>

                  <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/10 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-bold text-[#475569] uppercase block tracking-wider">Projects Validated</span>
                    <div className="text-xl font-black text-[#F59E0B] mt-1">
                      {studentProjSubs.filter(p => p.review?.review_status === "approved").length} / {projects.length}
                    </div>
                    <span className="text-[8px] text-[#475569] block mt-2">{studentProjSubs.length} total uploads</span>
                  </div>

                  <div className="bg-[#06B6D4]/5 border border-[#06B6D4]/10 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-bold text-[#475569] uppercase block tracking-wider">Coding Runs</span>
                    <div className="text-xl font-black text-[#06B6D4] mt-1">
                      {studentChalSubs.filter(c => c.submission_status_code === "accepted").length} / {challenges.length}
                    </div>
                    <span className="text-[8px] text-[#475569] block mt-2">{studentChalSubs.length} total submits</span>
                  </div>
                </div>

                {/* Progress Detail List */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-sm">
                  <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5 pb-3 border-b border-[#E2E8F0]">
                    <TrendingUp size={14} className="text-[#2563EB]" /> Core Curricular Activity Overview
                  </h4>
                  <div className="divide-y divide-[#E2E8F0] text-xs">
                    <div className="py-3 flex justify-between">
                      <span className="text-[#475569] font-medium">Active Student status</span>
                      <span className="font-bold text-[#16A34A] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-ping"></span> Active in Portal
                      </span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="text-[#475569] font-medium">Program title</span>
                      <span className="font-bold text-[#0F172A]">
                        {programsList.find(p => p.id === selectedProgramId)?.title || "Standard Curriculum"}
                      </span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="text-[#475569] font-medium">Lessons finished</span>
                      <span className="font-bold text-[#0F172A]">
                        {Math.round(progressPercentage * 0.15)} Lessons Completed
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
                    No syllabus lessons found for this program.
                  </div>
                ) : (
                  studentSyllabus.map(course => {
                    const isExpanded = expandedCourseId === course.id;
                    return (
                      <div key={course.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
                        {/* Collapsible Header */}
                        <div 
                          onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                          className="p-5 flex justify-between items-center gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                        >
                          <div className="flex items-center gap-2.5">
                            <svg 
                              className={`w-4 h-4 text-[#475569] transition-transform duration-200 ${isExpanded ? "transform rotate-90" : ""}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                            <h4 className="text-xs font-extrabold text-[#0F172A] hover:text-[#2563EB] transition-colors">{course.title}</h4>
                          </div>
                          <span className="text-[10px] font-bold text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded-full border border-[#2563EB]/20 shrink-0">Course</span>
                        </div>

                        {/* Collapsible content (lessons list) */}
                        {isExpanded && (
                          <div className="p-5 border-t border-[#E2E8F0] space-y-2.5 bg-slate-50/30">
                            {course.lessons.map(lesson => (
                              <div key={lesson.id} className="flex justify-between items-center text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                                <div className="flex items-center gap-2.5">
                                  {lesson.status === "completed" ? (
                                    <div className="w-5 h-5 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center font-bold text-[10px] border border-[#16A34A]/20">✓</div>
                                  ) : lesson.status === "in_progress" ? (
                                    <div className="w-5 h-5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center font-bold text-[10px] border border-[#F59E0B]/20">⏳</div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-[10px] border border-slate-200">•</div>
                                  )}
                                  <span className="font-semibold text-[#0F172A]">{lesson.title}</span>
                                </div>
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg shrink-0 ${
                                  lesson.status === "completed" 
                                    ? "bg-[#16A34A]/10 text-[#16A34A]" 
                                    : lesson.status === "in_progress"
                                    ? "bg-[#F59E0B]/10 text-[#F59E0B]"
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
                {studentQuizAttempts.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
                    No quizzes assigned for this program.
                  </div>
                ) : (
                  studentQuizAttempts.map(attempt => {
                    const isExpanded = expandedQuizId === attempt.id;
                    return (
                      <div key={attempt.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
                        {/* Collapsible Header */}
                        <div 
                          onClick={() => setExpandedQuizId(isExpanded ? null : attempt.id)}
                          className="p-5 flex justify-between items-center gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                        >
                          <div className="flex items-center gap-2.5">
                            <svg 
                              className={`w-4 h-4 text-[#475569] transition-transform duration-200 ${isExpanded ? "transform rotate-90" : ""}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                            <div>
                              <h4 className="text-xs font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors">{attempt.title}</h4>
                              <p className="text-[9px] text-[#475569] mt-0.5">Attempted on {attempt.submittedAt}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0">
                            {attempt.attempted ? (
                              <>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase ${
                                  attempt.passed 
                                    ? "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20" 
                                    : "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20"
                                }`}>
                                  {attempt.passed ? "Passed" : "Failed"}
                                </span>
                                <div className="text-xs font-black text-[#0F172A]">{attempt.score} / {attempt.maxScore} pts</div>
                              </>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-400 border uppercase">
                                Unattempted
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Collapsible Details Content */}
                        {isExpanded && attempt.attempted && (
                          <div className="p-5 border-t border-[#E2E8F0] space-y-4 bg-slate-50/30">
                            <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wide block">Auditing Submitted Answers:</span>
                            <div className="space-y-3">
                              {attempt.questions.map((q, qIdx) => {
                                const isCorrect = q.selectedIndex === q.correctIndex;
                                return (
                                  <div key={qIdx} className="p-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs space-y-2">
                                    <div className="font-semibold text-[#0F172A] flex justify-between gap-4">
                                      <span>Q{qIdx + 1}: {q.text}</span>
                                      <span className={`font-black shrink-0 ${isCorrect ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                                        {isCorrect ? `+${q.points} pts` : "0 pts"}
                                      </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-1.5 pt-1.5">
                                      {q.options.map((opt, oIdx) => {
                                        const isSelected = q.selectedIndex === oIdx;
                                        const isAnsCorrect = q.correctIndex === oIdx;
                                        
                                        return (
                                          <div 
                                            key={oIdx} 
                                            className={`p-2 rounded-lg border flex items-center gap-2 text-[11px] ${
                                              isAnsCorrect 
                                                ? "bg-[#16A34A]/10 border-[#16A34A]/30 text-[#16A34A] font-bold" 
                                                : isSelected 
                                                ? "bg-[#DC2626]/10 border-[#DC2626]/30 text-[#DC2626] font-semibold" 
                                                : "bg-white border-[#E2E8F0] text-[#475569]"
                                            }`}
                                          >
                                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] font-black shrink-0 ${
                                              isAnsCorrect 
                                                ? "bg-[#16A34A] border-transparent text-white" 
                                                : isSelected 
                                                ? "bg-[#DC2626] border-transparent text-white" 
                                                : "border-slate-300"
                                              }`}>
                                              {oIdx === 0 ? "A" : oIdx === 1 ? "B" : oIdx === 2 ? "C" : "D"}
                                            </div>
                                            <span>{opt}</span>
                                            {isAnsCorrect && <span className="ml-auto text-[9px] font-bold uppercase bg-[#16A34A]/20 px-1.5 py-0.5 rounded text-[#16A34A]">Correct Option</span>}
                                            {isSelected && !isAnsCorrect && <span className="ml-auto text-[9px] font-bold uppercase bg-[#DC2626]/20 px-1.5 py-0.5 rounded text-[#DC2626]">Submitted Answer</span>}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
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
                    No project repository uploads submitted yet by this student.
                  </div>
                ) : (
                  studentProjSubs.map(sub => {
                    const hasReview = !!sub.review;
                    const isExpanded = expandedProjectId === sub.id;
                    return (
                      <div key={sub.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden text-xs">
                        {/* Collapsible Header */}
                        <div 
                          onClick={() => setExpandedProjectId(isExpanded ? null : sub.id)}
                          className="p-5 flex justify-between items-center gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                        >
                          <div className="flex items-center gap-2.5">
                            <svg 
                              className={`w-4 h-4 text-[#475569] transition-transform duration-200 ${isExpanded ? "transform rotate-90" : ""}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                            <div>
                              <h4 className="text-xs font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors">{sub.project_title}</h4>
                              <p className="text-[9px] text-[#475569] mt-0.5">Submitted on {new Date(sub.submitted_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase shrink-0 ${
                            !hasReview || sub.review.review_status === "pending"
                              ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
                              : sub.review.review_status === "approved"
                              ? "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20"
                              : "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20"
                          }`}>
                            {!hasReview ? "Pending Review" : sub.review.review_status}
                          </span>
                        </div>

                        {/* Collapsible Content */}
                        {isExpanded && (
                          <div className="p-5 border-t border-[#E2E8F0] space-y-3 bg-slate-50/30">
                            <div>
                              <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wide block mb-1">GitHub Submission Link</span>
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

                            <div className="pt-3 border-t border-[#E2E8F0]">
                              <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wide block mb-2">Review Summary & Grading</span>
                              {hasReview ? (
                                <div className="p-3 bg-[#2563EB]/5 border border-[#2563EB]/10 rounded-xl space-y-2">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-[#475569] font-medium">Assigned Score:</span>
                                    <strong className="text-sm font-black text-[#2563EB]">{sub.review.score} / {sub.max_score} pts</strong>
                                  </div>
                                  {sub.review.feedback && (
                                    <div className="text-[10px] text-[#0F172A] mt-1 pt-1.5 border-t border-[#2563EB]/10">
                                      <strong className="block text-[#475569] uppercase text-[8px] tracking-wide mb-0.5">Instructor Feedback:</strong>
                                      {sub.review.feedback}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="p-3 border border-dashed border-[#E2E8F0] rounded-xl flex items-center justify-between">
                                  <span className="text-[#475569] text-[10px]">No grading has been registered for this submission.</span>
                                  <button 
                                    onClick={() => {
                                      setSelectedProjectSub(sub);
                                      setActiveTab("projects");
                                      setSelectedStudent(null);
                                    }}
                                    className="bg-[#2563EB] text-white font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-[#1D4ED8]"
                                  >
                                    Grade Now
                                  </button>
                                </div>
                              )}
                            </div>
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
                    No programming challenge attempts logged yet by this student.
                  </div>
                ) : (
                  studentChalSubs.map(sub => {
                    const isExpanded = expandedChallengeId === sub.id;
                    return (
                      <div key={sub.id} className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden text-xs">
                        {/* Collapsible Header */}
                        <div 
                          onClick={() => setExpandedChallengeId(isExpanded ? null : sub.id)}
                          className="p-5 flex justify-between items-center gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                        >
                          <div className="flex items-center gap-2.5">
                            <svg 
                              className={`w-4 h-4 text-[#475569] transition-transform duration-200 ${isExpanded ? "transform rotate-90" : ""}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                            <div>
                              <h4 className="text-xs font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors">{sub.challenge_title}</h4>
                              <p className="text-[9px] text-[#475569] mt-0.5">Submitted runtime: {sub.language} • {new Date(sub.submitted_at).toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase shrink-0 ${
                            sub.submission_status_code === "accepted"
                              ? "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20"
                              : "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20"
                          }`}>
                            {sub.submission_status_code}
                          </span>
                        </div>

                        {/* Collapsible Content */}
                        {isExpanded && (
                          <div className="p-5 border-t border-[#E2E8F0] space-y-3 bg-slate-50/30">
                            <div>
                              <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wide block mb-1">Submitted Source Code</span>
                              <pre className="p-3.5 bg-[#0F172A] text-white text-[10px] font-mono rounded-xl overflow-x-auto max-h-48">
                                <code>{sub.source_code}</code>
                              </pre>
                            </div>

                            {sub.result && (
                              <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 space-y-1.5 text-[10px] shadow-sm">
                                <span className="font-bold text-[#0F172A] block uppercase tracking-wider text-[8px]">Compiler / Tester Execution Logs:</span>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                  <div className="flex justify-between border-r pr-2 border-[#E2E8F0]">
                                    <span className="text-[#475569]">Validation Cases:</span>
                                    <strong className="text-[#16A34A]">{sub.result.passed_test_cases} / {sub.result.total_test_cases}</strong>
                                  </div>
                                  <div className="flex justify-between pl-1">
                                    <span className="text-[#475569]">Performance runtime:</span>
                                    <strong>{sub.result.execution_time_ms} ms</strong>
                                  </div>
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

          </div>
          
          {/* Drawer Footer closer */}
          <div className="p-4 border-t border-[#E2E8F0] bg-slate-50 flex justify-end shrink-0">
            <button 
              onClick={() => setSelectedStudent(null)}
              className="bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-100 font-bold text-xs py-2 px-5 rounded-xl transition-all"
            >
              Close Profile
            </button>
          </div>

        </div>
      </div>
    );
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
                  <p className="text-[10px] text-[#475569]">Select cohort and inspect student learning status (click any student to review details)</p>
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
                      <tr className="border-b border-[#E2E8F0] text-[#475569] select-none">
                        <th className="py-3 font-bold uppercase tracking-wider">Student Name</th>
                        <th className="py-3 font-bold uppercase tracking-wider">Email Address</th>
                        <th className="py-3 font-bold uppercase tracking-wider">Status</th>
                        <th className="py-3 font-bold uppercase tracking-wider">Enrolled On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {currentCohortEnrollments.map((enr: any) => (
                        <tr 
                          key={enr.id} 
                          onClick={() => {
                            setSelectedStudent(enr);
                            setStudentDetailTab("overview");
                          }}
                          className="hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                        >
                          <td className="py-3 font-bold text-[#0F172A] flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-[10px] uppercase border border-[#2563EB]/25 shadow-sm">
                              {(enr.student?.full_name || enr.student?.email || "I").substring(0, 2)}
                            </div>
                            <span className="hover:text-[#2563EB] transition-colors">{enr.student?.full_name || "Invited Candidate"}</span>
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

      {/* STUDENT DETAIL SLIDE-OVER DRAWER */}
      {renderStudentDetailDrawer()}
    </div>
  );
}
