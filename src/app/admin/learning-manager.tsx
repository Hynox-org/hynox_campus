"use client";

import React, { useState, useEffect } from "react";
import { 
  listProgramsAction,
  listCoursesAction,
  listModulesAction,
  listLessonsAction,
  listTenantCoursesAction,
  listLessonsForCourseAction
} from "@/app/actions/academic-actions";
import { listCohortsAction } from "@/app/actions/delivery-actions";
import {
  listAllActivitiesAction,
  createActivityAndSubclassAction,
  createQuizQuestionAndOptionsAction,
  createChallengeExampleAction,
  createChallengeTestCaseAction,
  assignActivityToCohortAction,
  getQuizDetailsAction,
  getProgrammingChallengeDetailsAction
} from "@/app/actions/learning-actions";
import { 
  BookOpen, Plus, Folder, Calendar, Award, CheckCircle, 
  HelpCircle, Trash2, Shield, Eye, Layers, Copy, List, AlertCircle
} from "lucide-react";

interface LearningManagerProps {
  institutions: any[];
}

export default function LearningManager({ institutions }: LearningManagerProps) {
  const [selectedInstId, setSelectedInstId] = useState("");
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgId, setSelectedProgId] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [allTenantCourses, setAllTenantCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [allCourseLessons, setAllCourseLessons] = useState<any[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [cohorts, setCohorts] = useState<any[]>([]);
  
  // Base Activity list
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Creation forms
  const [activityType, setActivityType] = useState<"quiz" | "project" | "programming">("quiz");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [maxScore, setMaxScore] = useState(100);
  const [passingScore, setPassingScore] = useState(0);
  const [isMandatory, setIsMandatory] = useState(true);

  // Subclass forms: Quiz
  const [quizTimeLimit, setQuizTimeLimit] = useState(30);
  const [quizMaxAttempts, setQuizMaxAttempts] = useState(1);
  const [quizShuffleQ, setQuizShuffleQ] = useState(false);
  const [quizShuffleO, setQuizShuffleO] = useState(false);
  const [quizShowResults, setQuizShowResults] = useState(true);

  // Subclass forms: Project
  const [projOverview, setProjOverview] = useState("");
  const [projRequirements, setProjRequirements] = useState("");
  const [projDeliverables, setProjDeliverables] = useState("");
  const [projDifficulty, setProjDifficulty] = useState("intermediate");
  const [projHours, setProjHours] = useState(10);

  // Subclass forms: Challenge
  const [chalDifficulty, setChalDifficulty] = useState("easy");
  const [chalStatement, setChalStatement] = useState("");
  const [chalInput, setChalInput] = useState("");
  const [chalOutput, setChalOutput] = useState("");
  const [chalConstraints, setChalConstraints] = useState("");
  const [chalStarter, setChalStarter] = useState("");
  const [chalTime, setChalTime] = useState(1000);
  const [chalMemory, setChalMemory] = useState(256);

  // Newly created subclass reference
  const [createdActivityId, setCreatedActivityId] = useState("");
  const [createdQuizId, setCreatedQuizId] = useState("");
  const [createdChallengeId, setCreatedChallengeId] = useState("");

  // Child additions helper: Quiz Questions
  const [quizQuestionsList, setQuizQuestionsList] = useState<any[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("single_choice");
  const [newQuestionPoints, setNewQuestionPoints] = useState(10);
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(["", "", "", ""]);
  const [newQuestionCorrectIndices, setNewQuestionCorrectIndices] = useState<number[]>([0]);

  // Child additions helper: Challenge Examples / Test cases
  const [examplesList, setExamplesList] = useState<any[]>([]);
  const [testCasesList, setTestCasesList] = useState<any[]>([]);
  
  const [newExInput, setNewExInput] = useState("");
  const [newExOutput, setNewExOutput] = useState("");
  const [newExExpl, setNewExExpl] = useState("");

  const [newTcInput, setNewTcInput] = useState("");
  const [newTcOutput, setNewTcOutput] = useState("");
  const [newTcHidden, setNewTcHidden] = useState(true);

  // Assignment form
  const [assignCohortId, setAssignCohortId] = useState("");
  const [assignRequired, setAssignRequired] = useState(true);
  const [assignFrom, setAssignFrom] = useState("");
  const [assignUntil, setAssignUntil] = useState("");

  // Load activities
  const loadActivitiesList = async (tenantId: string) => {
    const res = await listAllActivitiesAction(tenantId);
    if (res.activities) setActivities(res.activities);
  };

  // Hierarchy updates
  useEffect(() => {
    if (!selectedInstId) {
      setPrograms([]);
      setCourses([]);
      setAllTenantCourses([]);
      return;
    }
    listProgramsAction(selectedInstId).then(res => setPrograms(res.programs || []));
    listTenantCoursesAction(selectedInstId).then(res => {
      setCourses(res.courses || []);
      setAllTenantCourses(res.courses || []);
    });
    listCohortsAction(selectedInstId).then(res => setCohorts(res.cohorts || []));
    loadActivitiesList(selectedInstId);
  }, [selectedInstId]);

  useEffect(() => {
    if (!selectedProgId) {
      setCourses(allTenantCourses);
      return;
    }
    listCoursesAction(selectedProgId).then(res => setCourses(res.courses || []));
  }, [selectedProgId, allTenantCourses]);

  useEffect(() => {
    if (!selectedCourseId) {
      setModules([]);
      setLessons([]);
      setAllCourseLessons([]);
      return;
    }
    listModulesAction(selectedCourseId).then(res => setModules(res.modules || []));
    listLessonsForCourseAction(selectedCourseId).then(res => {
      setLessons(res.lessons || []);
      setAllCourseLessons(res.lessons || []);
    });
  }, [selectedCourseId]);

  useEffect(() => {
    if (!selectedModuleId) {
      setLessons(allCourseLessons);
      return;
    }
    listLessonsAction(selectedModuleId).then(res => setLessons(res.lessons || []));
  }, [selectedModuleId, allCourseLessons]);

  const handleCreateActivityBase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLessonId) {
      setError("Please navigate to a specific lesson to append this activity.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

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

      // Quiz
      quiz_time_limit: quizTimeLimit,
      quiz_max_attempts: quizMaxAttempts,
      quiz_shuffle_questions: quizShuffleQ,
      quiz_shuffle_options: quizShuffleO,
      quiz_show_results_immediately: quizShowResults,

      // Project
      project_overview: projOverview,
      project_requirements: projRequirements,
      project_deliverables: projDeliverables,
      project_difficulty: projDifficulty,
      project_estimated_hours: projHours,

      // Challenge
      chal_difficulty: chalDifficulty,
      chal_problem_statement: chalStatement,
      chal_input_format: chalInput,
      chal_output_format: chalOutput,
      chal_constraints: chalConstraints,
      chal_starter_code: chalStarter,
      chal_time_limit: chalTime,
      chal_memory_limit: chalMemory
    });

    if (res.error) {
      setError(res.error);
    } else if (res.activity) {
      setSuccess(`Base learning activity "${title}" created successfully!`);
      setCreatedActivityId(res.activity.id);
      
      // If quiz type, fetch the quiz subclass ID to add questions
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

      loadActivitiesList(selectedInstId);
      // Reset base form
      setTitle("");
      setDescription("");
      setInstructions("");
    }
    setLoading(false);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdQuizId) return;

    setLoading(true);
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
      setSuccess("Question and options appended successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setNewQuestionText("");
      if (newQuestionType === "true_false") {
        setNewQuestionOptions(["True", "False"]);
        setNewQuestionCorrectIndices([0]);
      } else {
        setNewQuestionOptions(["", "", "", ""]);
        setNewQuestionCorrectIndices([0]);
      }
    } else if (res.error) {
      setError(res.error);
    }
    setLoading(false);
  };

  const handleAddExample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdChallengeId) return;

    setLoading(true);
    const res = await createChallengeExampleAction({
      challenge_id: createdChallengeId,
      example_number: examplesList.length + 1,
      input_example: newExInput,
      output_example: newExOutput,
      explanation: newExExpl
    });

    if (res.example) {
      setExamplesList(prev => [...prev, res.example]);
      setSuccess("Visible Example added!");
      setNewExInput("");
      setNewExOutput("");
      setNewExExpl("");
    }
    setLoading(false);
  };

  const handleAddTestCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdChallengeId) return;

    setLoading(true);
    const res = await createChallengeTestCaseAction({
      challenge_id: createdChallengeId,
      input_data: newTcInput,
      expected_output: newTcOutput,
      is_hidden: newTcHidden,
      position: testCasesList.length + 1
    });

    if (res.testCase) {
      setTestCasesList(prev => [...prev, res.testCase]);
      setSuccess("Execution Test Case added!");
      setNewTcInput("");
      setNewTcOutput("");
    }
    setLoading(false);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdActivityId || !assignCohortId) {
      setError("Please select a target Cohort for assignment.");
      return;
    }

    setLoading(true);
    const res = await assignActivityToCohortAction({
      activity_id: createdActivityId,
      cohort_id: assignCohortId,
      is_required: assignRequired,
      available_from: assignFrom,
      available_until: assignUntil
    });

    if (res.assignment) {
      setSuccess("Activity assigned to cohort successfully!");
      setCreatedActivityId("");
      setCreatedQuizId("");
      setCreatedChallengeId("");
      setQuizQuestionsList([]);
      setExamplesList([]);
      setTestCasesList([]);
    } else if (res.error) {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 text-xs text-[#0F172A]">
      {error && (
        <div className="bg-[#DC2626]/5 border border-[#DC2626]/20 text-[#DC2626] rounded-xl p-4 text-xs flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 text-[#16A34A] rounded-xl p-4 text-xs flex items-start gap-2">
          <CheckCircle size={16} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Top Banner Scope */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-[#475569] flex items-center gap-1.5">
          <Shield size={15} className="text-[#2563EB]" /> Learning Activities Scope
        </h3>
        <p className="text-xs text-[#475569] mb-4">
          Select institution and navigate the academic tree node to configure and publish new learning assessments.
        </p>
        <select
          value={selectedInstId}
          onChange={(e) => setSelectedInstId(e.target.value)}
          className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#2563EB] shadow-sm"
        >
          <option value="">-- Select Institution Campus --</option>
          {institutions.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name} ({inst.institution_code})
            </option>
          ))}
        </select>
      </div>

      {selectedInstId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Tree Navigation Left */}
          <div className="lg:col-span-1 bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm space-y-4">
            <h4 className="font-bold text-xs uppercase text-[#0f172a] border-b border-[#E2E8F0] pb-2">Academic Navigator</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-[#475569] mb-1">Learning Program</label>
                <select
                  value={selectedProgId}
                  onChange={(e) => {
                    setSelectedProgId(e.target.value);
                    setSelectedCourseId("");
                    setSelectedModuleId("");
                    setSelectedLessonId("");
                  }}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                >
                  <option value="">-- Select Program --</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#475569] mb-1">Course *</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setSelectedModuleId("");
                    setSelectedLessonId("");
                  }}
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                  required
                >
                  <option value="">-- Select Course --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              {selectedCourseId && (
                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Module (Optional)</label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => {
                      setSelectedModuleId(e.target.value);
                      setSelectedLessonId("");
                    }}
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                  >
                    <option value="">-- Select Module --</option>
                    {modules.map(m => <option key={m.id} value={m.id}>Mod {m.position}: {m.title}</option>)}
                  </select>
                </div>
              )}

              {selectedCourseId && (
                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Lesson Target *</label>
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs outline-none"
                    required
                  >
                    <option value="">-- Select Lesson --</option>
                    {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* List of created activities */}
            <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
              <h4 className="font-bold text-[10px] uppercase text-[#475569] tracking-wider flex items-center gap-1.5">
                <List size={12} /> Published Activities ({activities.length})
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {activities.map(act => (
                  <div key={act.id} className="p-2 bg-slate-50 rounded-lg border border-[#E2E8F0] flex justify-between items-center">
                    <span className="font-semibold truncate pr-2">{act.title}</span>
                    <span className="bg-slate-200 text-slate-700 text-[8px] px-1 py-0.5 rounded font-mono font-bold uppercase shrink-0">{act.activity_type_code}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration Builder Panels Right */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Base Details Form */}
            {!createdActivityId && (
              <form onSubmit={handleCreateActivityBase} className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-4">
                <h4 className="font-bold text-xs uppercase text-[#0f172a] border-b border-[#E2E8F0] pb-2 flex items-center gap-1.5">
                  <Plus size={16} className="text-[#2563EB]" /> Create Lesson Activity
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">Activity Type *</label>
                    <select
                      value={activityType}
                      onChange={(e: any) => setActivityType(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="quiz">Quiz Engine Assessment</option>
                      <option value="project">Project Work (GitHub URL)</option>
                      <option value="programming">Programming Challenge (Judge Engine)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. React Router V6 Quiz"
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">Max Score</label>
                    <input
                      type="number"
                      value={maxScore}
                      onChange={(e) => setMaxScore(Number(e.target.value))}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">Passing Score</label>
                    <input
                      type="number"
                      value={passingScore}
                      onChange={(e) => setPassingScore(Number(e.target.value))}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      checked={isMandatory}
                      onChange={(e) => setIsMandatory(e.target.checked)}
                      id="isMandatory"
                    />
                    <label htmlFor="isMandatory" className="font-semibold text-[#475569]">Mandatory Activity</label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Description / Overview</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Brief description of the challenge..."
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Instructions / Guidelines</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                    placeholder="Enter guidelines for submission, execution rules, or details here..."
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-xs focus:outline-none"
                  />
                </div>

                {/* Subclass-specific fields inside the initial creation step */}
                {activityType === "quiz" && (
                  <div className="border-t border-[#E2E8F0] pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#475569] mb-1">Time Limit (Minutes)</label>
                        <input
                          type="number"
                          value={quizTimeLimit}
                          onChange={(e) => setQuizTimeLimit(Number(e.target.value))}
                          className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#475569] mb-1">Max AttemptsAllowed</label>
                        <input
                          type="number"
                          value={quizMaxAttempts}
                          onChange={(e) => setQuizMaxAttempts(Number(e.target.value))}
                          className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={quizShuffleQ}
                          onChange={(e) => setQuizShuffleQ(e.target.checked)}
                          id="quizShuffleQ"
                          className="accent-[#2563EB]"
                        />
                        <label htmlFor="quizShuffleQ" className="font-semibold text-[#475569]">Shuffle Questions</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={quizShuffleO}
                          onChange={(e) => setQuizShuffleO(e.target.checked)}
                          id="quizShuffleO"
                          className="accent-[#2563EB]"
                        />
                        <label htmlFor="quizShuffleO" className="font-semibold text-[#475569]">Shuffle Options</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={quizShowResults}
                          onChange={(e) => setQuizShowResults(e.target.checked)}
                          id="quizShowResults"
                          className="accent-[#2563EB]"
                        />
                        <label htmlFor="quizShowResults" className="font-semibold text-[#475569]">Show Results Immediately</label>
                      </div>
                    </div>
                  </div>
                )}

                {activityType === "project" && (
                  <div className="border-t border-[#E2E8F0] pt-4 space-y-3">
                    <div>
                      <label className="block font-semibold text-[#475569] mb-1">Project Overview</label>
                      <textarea
                        value={projOverview}
                        onChange={(e) => setProjOverview(e.target.value)}
                        rows={2}
                        placeholder=" Netflix Clone with React Hooks..."
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#475569] mb-1">Difficulty Level</label>
                        <select
                          value={projDifficulty}
                          onChange={(e) => setProjDifficulty(e.target.value)}
                          className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-[#475569] mb-1">Estimated Hours</label>
                        <input
                          type="number"
                          value={projHours}
                          onChange={(e) => setProjHours(Number(e.target.value))}
                          className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#475569] mb-1">Requirements</label>
                      <textarea
                        value={projRequirements}
                        onChange={(e) => setProjRequirements(e.target.value)}
                        rows={2}
                        placeholder="Must use Redux, TailwindCSS..."
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {activityType === "programming" && (
                  <div className="border-t border-[#E2E8F0] pt-4 space-y-3">
                    <div>
                      <label className="block font-semibold text-[#475569] mb-1">Problem Statement</label>
                      <textarea
                        value={chalStatement}
                        onChange={(e) => setChalStatement(e.target.value)}
                        rows={3}
                        placeholder="Given an array of integers..."
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#475569] mb-1">Difficulty</label>
                        <select
                          value={chalDifficulty}
                          onChange={(e) => setChalDifficulty(e.target.value)}
                          className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-[#475569] mb-1">Starter Code Outline</label>
                        <textarea
                          value={chalStarter}
                          onChange={(e) => setChalStarter(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg p-2.5 text-xs font-mono focus:outline-none"
                          placeholder="function twoSum(nums, target) { }"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2563EB] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2563EB]/95 transition-all text-xs disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Save Learning Activity"}
                </button>
              </form>
            )}

            {/* Quiz child creator: Questions & Choices configuration */}
            {createdQuizId && activityType === "quiz" && (
              <div className="space-y-6">
                <form onSubmit={handleAddQuestion} className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-4">
                  <h4 className="font-bold text-xs uppercase text-[#0f172a] border-b border-[#E2E8F0] pb-2 flex items-center gap-1.5">
                    <HelpCircle size={16} className="text-[#2563EB]" /> Add Quiz Questions
                  </h4>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">Question Text</label>
                    <input
                      type="text"
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="e.g. What is the virtual DOM in React?"
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-[#475569] mb-1">Question Type</label>
                      <select
                        value={newQuestionType}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewQuestionType(val);
                          if (val === "true_false") {
                            setNewQuestionOptions(["True", "False"]);
                            setNewQuestionCorrectIndices([0]);
                          } else {
                            setNewQuestionOptions(["", "", "", ""]);
                            setNewQuestionCorrectIndices([0]);
                          }
                        }}
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="single_choice">Single Choice</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True / False</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-[#475569] mb-1">Points</label>
                      <input
                        type="number"
                        value={newQuestionPoints}
                        onChange={(e) => setNewQuestionPoints(Number(e.target.value))}
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {newQuestionType !== "short_answer" && (
                    <div className="space-y-2 pt-2">
                      <label className="block font-bold text-[#0f172a]">Answer Options & Correct Key</label>
                      {newQuestionOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type={newQuestionType === "multiple_choice" ? "checkbox" : "radio"}
                            name="correctIndex"
                            checked={newQuestionCorrectIndices.includes(idx)}
                            onChange={() => {
                              if (newQuestionType === "multiple_choice") {
                                if (newQuestionCorrectIndices.includes(idx)) {
                                  setNewQuestionCorrectIndices(newQuestionCorrectIndices.filter(i => i !== idx));
                                } else {
                                  setNewQuestionCorrectIndices([...newQuestionCorrectIndices, idx]);
                                }
                              } else {
                                setNewQuestionCorrectIndices([idx]);
                              }
                            }}
                            className="accent-[#2563EB]"
                          />
                          <input
                            type="text"
                            value={opt}
                            disabled={newQuestionType === "true_false"}
                            onChange={(e) => {
                              const copy = [...newQuestionOptions];
                              copy[idx] = e.target.value;
                              setNewQuestionOptions(copy);
                            }}
                            placeholder={`Option choice ${idx + 1}`}
                            className="flex-1 bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs outline-none disabled:bg-slate-50 disabled:text-slate-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#2563EB] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2563EB]/95 transition-all text-xs"
                  >
                    Add Question to Quiz
                  </button>
                </form>

                {/* Question List View */}
                {quizQuestionsList.length > 0 && (
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-3">
                    <h5 className="font-bold text-xs text-[#0f172a]">Added Questions ({quizQuestionsList.length})</h5>
                    <div className="divide-y divide-[#E2E8F0]">
                      {quizQuestionsList.map((q, idx) => (
                        <div key={idx} className="py-2 flex justify-between items-center text-xs">
                          <span>{idx + 1}. {q.question_text}</span>
                          <span className="font-mono text-[9px] text-[#475569]">({q.points} pts)</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        // Go to assign screen
                        setCreatedQuizId("");
                      }}
                      className="bg-[#16A34A] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#16A34A]/95 text-xs w-full mt-3"
                    >
                      Finished Adding Questions &rarr; Go to Assign Cohort
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Challenge child creator: Examples & Test Cases */}
            {createdChallengeId && activityType === "programming" && (
              <div className="space-y-6">
                
                {/* 1. Add examples */}
                <form onSubmit={handleAddExample} className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-4">
                  <h4 className="font-bold text-xs uppercase text-[#0f172a] border-b border-[#E2E8F0] pb-2 flex items-center gap-1.5">
                    <Eye size={16} className="text-[#2563EB]" /> Add Visible Examples
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-[#475569] mb-1">Example Input</label>
                      <input
                        type="text"
                        value={newExInput}
                        onChange={(e) => setNewExInput(e.target.value)}
                        placeholder="[2, 7, 11, 15], 9"
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#475569] mb-1">Example Output</label>
                      <input
                        type="text"
                        value={newExOutput}
                        onChange={(e) => setNewExOutput(e.target.value)}
                        placeholder="[0, 1]"
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">Explanation</label>
                    <input
                      type="text"
                      value={newExExpl}
                      onChange={(e) => setNewExExpl(e.target.value)}
                      placeholder="Because nums[0] + nums[1] == 9..."
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <button type="submit" className="bg-[#2563EB] text-white px-4 py-1.5 rounded-lg font-bold">
                    Add Example
                  </button>
                </form>

                {/* 2. Add test cases */}
                <form onSubmit={handleAddTestCase} className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-4">
                  <h4 className="font-bold text-xs uppercase text-[#0f172a] border-b border-[#E2E8F0] pb-2 flex items-center gap-1.5">
                    <Layers size={16} className="text-[#2563EB]" /> Add Hidden Test Cases
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-[#475569] mb-1">Test Case Input</label>
                      <input
                        type="text"
                        value={newTcInput}
                        onChange={(e) => setNewTcInput(e.target.value)}
                        placeholder="[3, 2, 4], 6"
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#475569] mb-1">Expected Output</label>
                      <input
                        type="text"
                        value={newTcOutput}
                        onChange={(e) => setNewTcOutput(e.target.value)}
                        placeholder="[1, 2]"
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <button type="submit" className="bg-[#2563EB] text-white px-4 py-1.5 rounded-lg font-bold">
                    Add Test Case
                  </button>
                </form>

                <button
                  onClick={() => {
                    setCreatedChallengeId("");
                  }}
                  className="bg-[#16A34A] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#16A34A]/95 text-xs w-full"
                >
                  Finished Challenge Content &rarr; Go to Assign Cohort
                </button>
              </div>
            )}

            {/* Step 5: Assign Activity to Cohorts */}
            {createdActivityId && !createdQuizId && !createdChallengeId && (
              <form onSubmit={handleAssignSubmit} className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-4">
                <h4 className="font-bold text-xs uppercase text-[#0f172a] border-b border-[#E2E8F0] pb-2 flex items-center gap-1.5">
                  <Calendar size={16} className="text-[#2563EB]" /> Assign Activity to Cohort
                </h4>

                <div>
                  <label className="block font-semibold text-[#475569] mb-1">Target Cohort *</label>
                  <select
                    value={assignCohortId}
                    onChange={(e) => setAssignCohortId(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none"
                    required
                  >
                    <option value="">-- Select Cohort --</option>
                    {cohorts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">Available From</label>
                    <input
                      type="datetime-local"
                      value={assignFrom}
                      onChange={(e) => setAssignFrom(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#475569] mb-1">Due Date (Available Until)</label>
                    <input
                      type="datetime-local"
                      value={assignUntil}
                      onChange={(e) => setAssignUntil(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !assignCohortId}
                  className="bg-[#16A34A] text-white px-5 py-2.5 rounded-lg shadow-sm font-semibold hover:bg-[#16A34A]/95 transition-all text-xs"
                >
                  Publish & Assign Activity
                </button>
              </form>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
