import { createClient } from "@/utils/supabase/server";

// ----------------------------------------------------
// Student Assigned Activities Fetching
// ----------------------------------------------------
export async function getStudentAssignedActivities(studentId: string) {
  const supabase = await createClient();

  // 1. Get student's active cohorts
  const { data: enrollments, error: enrollError } = await supabase
    .schema("delivery")
    .from("enrollments")
    .select("cohort_id")
    .eq("user_id", studentId)
    .eq("status_code", "active")
    .is("deleted_at", null);

  if (enrollError) throw enrollError;
  if (!enrollments || enrollments.length === 0) return [];

  const cohortIds = enrollments.map(e => e.cohort_id);

  // 2. Fetch assignments for these cohorts
  const { data: assignments, error: assignError } = await supabase
    .schema("learning")
    .from("activity_assignments")
    .select("*")
    .in("cohort_id", cohortIds)
    .is("deleted_at", null);

  if (assignError) throw assignError;
  if (!assignments || assignments.length === 0) return [];

  const activityIds = [...new Set(assignments.map(a => a.activity_id))];

  // 3. Fetch activities
  const { data: activities, error: actError } = await supabase
    .schema("learning")
    .from("activities")
    .select("*")
    .in("id", activityIds)
    .is("deleted_at", null);

  if (actError) throw actError;
  if (!activities || activities.length === 0) return [];

  // 4. Fetch progress records
  const { data: progressList, error: progError } = await supabase
    .schema("learning")
    .from("student_activity_progress")
    .select("*")
    .eq("student_id", studentId)
    .in("activity_id", activityIds)
    .is("deleted_at", null);

  if (progError) throw progError;

  // 5. Combine everything
  return activities.map(act => {
    const assignment = assignments.find(a => a.activity_id === act.id);
    let progress = progressList?.find(p => p.activity_id === act.id);

    // If no progress record exists yet, return a mock/default start state
    if (!progress) {
      progress = {
        status_code: "assigned",
        score: null,
        attempt_number: 0,
        completed_at: null
      };
    }

    return {
      ...act,
      assignment: {
        id: assignment?.id,
        available_from: assignment?.available_from,
        available_until: assignment?.available_until,
        is_required: assignment?.is_required ?? true
      },
      progress
    };
  });
}

// ----------------------------------------------------
// Quizzes Engine Operations
// ----------------------------------------------------
export async function getQuizDetails(activityId: string) {
  const supabase = await createClient();

  const { data: quiz, error: quizError } = await supabase
    .schema("learning")
    .from("quizzes")
    .select("*")
    .eq("activity_id", activityId)
    .maybeSingle();

  if (quizError) throw quizError;
  if (!quiz) throw new Error("Quiz definition not found for this activity.");

  const { data: questions, error: qError } = await supabase
    .schema("learning")
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quiz.id)
    .order("position", { ascending: true });

  if (qError) throw qError;

  const questionIds = (questions || []).map(q => q.id);
  let options: any[] = [];

  if (questionIds.length > 0) {
    const { data: optData, error: optError } = await supabase
      .schema("learning")
      .from("quiz_options")
      .select("id, question_id, option_text, position")
      .in("question_id", questionIds)
      .order("position", { ascending: true });

    if (optError) throw optError;
    options = optData || [];
  }

  return {
    quiz,
    questions: (questions || []).map(q => ({
      ...q,
      options: options.filter(o => o.question_id === q.id)
    }))
  };
}

export async function startQuizAttempt(quizId: string, studentId: string, progressId: string, attemptNumber: number = 1) {
  const supabase = await createClient();

  // Create progress record if it doesn't exist
  let actualProgressId = progressId;
  if (!progressId || progressId === "new") {
    const { data: quizObj } = await supabase
      .schema("learning")
      .from("quizzes")
      .select("activity_id")
      .eq("id", quizId)
      .single();

    if (quizObj) {
      // Find assignment
      const { data: assign } = await supabase
        .schema("learning")
        .from("activity_assignments")
        .select("id")
        .eq("activity_id", quizObj.activity_id)
        .limit(1)
        .maybeSingle();

      if (assign) {
        const { data: prog } = await supabase
          .schema("learning")
          .from("student_activity_progress")
          .upsert({
            student_id: studentId,
            activity_id: quizObj.activity_id,
            activity_assignment_id: assign.id,
            status_code: "started",
            started_at: new Date().toISOString()
          }, { onConflict: "student_id,activity_assignment_id" })
          .select("id")
          .single();
        if (prog) actualProgressId = prog.id;
      }
    }
  } else {
    // Update progress status to started
    await supabase
      .schema("learning")
      .from("student_activity_progress")
      .update({
        status_code: "started",
        started_at: new Date().toISOString()
      })
      .eq("id", progressId);
  }

  const { data, error } = await supabase
    .schema("learning")
    .from("quiz_attempts")
    .insert({
      quiz_id: quizId,
      student_id: studentId,
      student_activity_progress_id: actualProgressId,
      attempt_number: attemptNumber,
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function submitQuizAnswers(
  attemptId: string,
  answers: Array<{ questionId: string; selectedOptionId?: string; answerText?: string }>
) {
  const supabase = await createClient();

  // 1. Fetch Attempt
  const { data: attempt, error: attError } = await supabase
    .schema("learning")
    .from("quiz_attempts")
    .select("*")
    .eq("id", attemptId)
    .single();

  if (attError) throw attError;

  // 2. Fetch Quiz and Questions for grading
  const { data: quiz } = await supabase
    .schema("learning")
    .from("quizzes")
    .select("activity_id")
    .eq("id", attempt.quiz_id)
    .single();

  const { data: questions } = await supabase
    .schema("learning")
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", attempt.quiz_id);

  // Fetch correct options
  const questionIds = (questions || []).map(q => q.id);
  const { data: correctOptions } = await supabase
    .schema("learning")
    .from("quiz_options")
    .select("id, question_id")
    .in("question_id", questionIds)
    .eq("is_correct", true);

  let totalScore = 0;
  let totalMaxScore = 0;

  const answersToInsert = answers.map(ans => {
    const question = questions?.find(q => q.id === ans.questionId);
    const correctOpts = correctOptions?.filter(o => o.question_id === ans.questionId) || [];
    const maxPoints = Number(question?.points ?? 1);
    totalMaxScore += maxPoints;

    let isCorrect = false;
    let pointsAwarded = 0;

    if (question?.question_type === "single_choice" || question?.question_type === "true_false") {
      isCorrect = correctOpts.some(o => o.id === ans.selectedOptionId);
      pointsAwarded = isCorrect ? maxPoints : 0;
    } else if (question?.question_type === "multiple_choice") {
      // Simplistic check for single matched correct option for now, or match exactly
      isCorrect = correctOpts.some(o => o.id === ans.selectedOptionId);
      pointsAwarded = isCorrect ? maxPoints : 0;
    } else {
      // short_answer
      isCorrect = false;
      pointsAwarded = 0;
    }

    if (isCorrect) {
      totalScore += pointsAwarded;
    }

    return {
      attempt_id: attemptId,
      question_id: ans.questionId,
      selected_option_id: ans.selectedOptionId || null,
      answer_text: ans.answerText || null,
      is_correct: isCorrect,
      points_awarded: pointsAwarded
    };
  });

  // 3. Insert Answers
  if (answersToInsert.length > 0) {
    const { error: insError } = await supabase
      .schema("learning")
      .from("quiz_answers")
      .insert(answersToInsert);
    if (insError) throw insError;
  }

  // Determine passing state
  let passed = true;
  if (quiz?.activity_id) {
    const { data: activity } = await supabase
      .schema("learning")
      .from("activities")
      .select("passing_score")
      .eq("id", quiz.activity_id)
      .single();

    if (activity && activity.passing_score) {
      passed = totalScore >= activity.passing_score;
    }
  }

  // 4. Update Attempt
  const { data: updatedAttempt } = await supabase
    .schema("learning")
    .from("quiz_attempts")
    .update({
      submitted_at: new Date().toISOString(),
      score: totalScore,
      max_score: totalMaxScore,
      passed,
      time_spent_seconds: Math.floor((new Date().getTime() - new Date(attempt.started_at).getTime()) / 1000)
    })
    .eq("id", attemptId)
    .select()
    .single();

  // 5. Update Student Activity Progress
  await supabase
    .schema("learning")
    .from("student_activity_progress")
    .update({
      status_code: passed ? "completed" : "failed",
      score: totalScore,
      max_score: totalMaxScore,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", attempt.student_activity_progress_id);

  return updatedAttempt;
}

// ----------------------------------------------------
// Projects Operations
// ----------------------------------------------------
export async function getProjectDetails(activityId: string, studentId: string) {
  const supabase = await createClient();

  const { data: project, error: projError } = await supabase
    .schema("learning")
    .from("projects")
    .select("*")
    .eq("activity_id", activityId)
    .maybeSingle();

  if (projError) throw projError;
  if (!project) throw new Error("Project details not found.");

  const { data: submission } = await supabase
    .schema("learning")
    .from("project_submissions")
    .select("*")
    .eq("project_id", project.id)
    .eq("student_id", studentId)
    .maybeSingle();

  let review = null;
  if (submission) {
    const { data: revData } = await supabase
      .schema("learning")
      .from("project_reviews")
      .select("*")
      .eq("submission_id", submission.id)
      .maybeSingle();
    review = revData;
  }

  return { project, submission, review };
}

export async function submitProject(
  projectId: string,
  studentId: string,
  progressId: string,
  githubUrl: string,
  notes?: string
) {
  const supabase = await createClient();

  let actualProgressId = progressId;
  if (!progressId || progressId === "new") {
    const { data: proj } = await supabase
      .schema("learning")
      .from("projects")
      .select("activity_id")
      .eq("id", projectId)
      .single();

    if (proj) {
      const { data: assign } = await supabase
        .schema("learning")
        .from("activity_assignments")
        .select("id")
        .eq("activity_id", proj.activity_id)
        .limit(1)
        .maybeSingle();

      if (assign) {
        const { data: prog } = await supabase
          .schema("learning")
          .from("student_activity_progress")
          .upsert({
            student_id: studentId,
            activity_id: proj.activity_id,
            activity_assignment_id: assign.id,
            status_code: "submitted",
            submitted_at: new Date().toISOString()
          }, { onConflict: "student_id,activity_assignment_id" })
          .select("id")
          .single();
        if (prog) actualProgressId = prog.id;
      }
    }
  } else {
    await supabase
      .schema("learning")
      .from("student_activity_progress")
      .update({
        status_code: "submitted",
        submitted_at: new Date().toISOString()
      })
      .eq("id", progressId);
  }

  // Insert or update submission
  const { data: submission, error } = await supabase
    .schema("learning")
    .from("project_submissions")
    .upsert({
      project_id: projectId,
      student_id: studentId,
      student_activity_progress_id: actualProgressId,
      github_url: githubUrl,
      submission_notes: notes || null,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: "project_id,student_id" })
    .select()
    .single();

  if (error) throw error;
  return submission;
}

// ----------------------------------------------------
// Programming Challenges Operations
// ----------------------------------------------------
export async function getProgrammingChallengeDetails(activityId: string, studentId: string) {
  const supabase = await createClient();

  const { data: challenge, error: chalError } = await supabase
    .schema("learning")
    .from("programming_challenges")
    .select("*")
    .eq("activity_id", activityId)
    .maybeSingle();

  if (chalError) throw chalError;
  if (!challenge) throw new Error("Programming challenge not found.");

  const { data: examples } = await supabase
    .schema("learning")
    .from("challenge_examples")
    .select("*")
    .eq("challenge_id", challenge.id)
    .order("example_number");

  const { data: submissions } = await supabase
    .schema("learning")
    .from("challenge_submissions")
    .select("*")
    .eq("challenge_id", challenge.id)
    .eq("student_id", studentId)
    .order("submitted_at", { ascending: false });

  return {
    challenge,
    examples: examples || [],
    submissions: submissions || []
  };
}

export async function submitChallengeCode(
  challengeId: string,
  studentId: string,
  progressId: string,
  language: string,
  sourceCode: string
) {
  const supabase = await createClient();

  let actualProgressId = progressId;
  if (!progressId || progressId === "new") {
    const { data: chal } = await supabase
      .schema("learning")
      .from("programming_challenges")
      .select("activity_id")
      .eq("id", challengeId)
      .single();

    if (chal) {
      const { data: assign } = await supabase
        .schema("learning")
        .from("activity_assignments")
        .select("id")
        .eq("activity_id", chal.activity_id)
        .limit(1)
        .maybeSingle();

      if (assign) {
        const { data: prog } = await supabase
          .schema("learning")
          .from("student_activity_progress")
          .upsert({
            student_id: studentId,
            activity_id: chal.activity_id,
            activity_assignment_id: assign.id,
            status_code: "submitted",
            submitted_at: new Date().toISOString()
          }, { onConflict: "student_id,activity_assignment_id" })
          .select("id")
          .single();
        if (prog) actualProgressId = prog.id;
      }
    }
  } else {
    await supabase
      .schema("learning")
      .from("student_activity_progress")
      .update({
        status_code: "submitted",
        submitted_at: new Date().toISOString()
      })
      .eq("id", progressId);
  }

  // 1. Create Submission
  const { data: submission, error: subError } = await supabase
    .schema("learning")
    .from("challenge_submissions")
    .insert({
      challenge_id: challengeId,
      student_id: studentId,
      student_activity_progress_id: actualProgressId,
      language,
      source_code: sourceCode,
      submission_status_code: "pending"
    })
    .select()
    .single();

  if (subError) throw subError;

  // 2. Queue for future Judge Engine execution
  const { error: qError } = await supabase
    .schema("learning")
    .from("challenge_execution_queue")
    .insert({
      submission_id: submission.id,
      status: "queued"
    });

  if (qError) throw qError;

  return submission;
}

export async function getChallengeSubmissionResults(submissionId: string) {
  const supabase = await createClient();

  const { data: result } = await supabase
    .schema("learning")
    .from("challenge_submission_results")
    .select("*")
    .eq("submission_id", submissionId)
    .maybeSingle();

  const { data: testCases } = await supabase
    .schema("learning")
    .from("challenge_test_case_results")
    .select("*")
    .eq("submission_id", submissionId);

  const { data: logs } = await supabase
    .schema("learning")
    .from("challenge_execution_logs")
    .select("*")
    .eq("submission_id", submissionId)
    .order("created_at");

  return {
    result: result || null,
    testCases: testCases || [],
    logs: logs || []
  };
}

// ----------------------------------------------------
// Admin Creator & Manager Operations
// ----------------------------------------------------
export async function listAllActivities(tenantId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("learning")
    .from("activities")
    .select("*")
    .eq("tenant_id", tenantId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createActivityAndSubclass(input: {
  tenant_id: string;
  institution_id: string;
  lesson_id: string;
  activity_type_code: string;
  status_code: string;
  title: string;
  description?: string;
  instructions?: string;
  max_score?: number;
  passing_score?: number;
  position?: number;
  is_mandatory?: boolean;
  
  quiz_time_limit?: number;
  quiz_max_attempts?: number;
  quiz_shuffle_questions?: boolean;
  quiz_shuffle_options?: boolean;
  
  project_overview?: string;
  project_requirements?: string;
  project_deliverables?: string;
  project_submission_instructions?: string;
  project_difficulty?: string;
  project_estimated_hours?: number;

  chal_difficulty?: string;
  chal_problem_statement?: string;
  chal_input_format?: string;
  chal_output_format?: string;
  chal_constraints?: string;
  chal_starter_code?: string;
  chal_time_limit?: number;
  chal_memory_limit?: number;
}) {
  const supabase = await createClient();

  // 1. Insert Base Activity
  const { data: activity, error: actError } = await supabase
    .schema("learning")
    .from("activities")
    .insert({
      tenant_id: input.tenant_id,
      institution_id: input.institution_id,
      lesson_id: input.lesson_id,
      activity_type_code: input.activity_type_code,
      status_code: input.status_code,
      title: input.title,
      description: input.description || null,
      instructions: input.instructions || null,
      max_score: input.max_score ?? 100,
      passing_score: input.passing_score ?? 0,
      position: input.position ?? 1,
      is_mandatory: input.is_mandatory ?? true
    })
    .select()
    .single();

  if (actError) throw actError;

  // 2. Insert Type Subclass
  if (input.activity_type_code === "quiz") {
    const { error: subError } = await supabase
      .schema("learning")
      .from("quizzes")
      .insert({
        activity_id: activity.id,
        time_limit_minutes: input.quiz_time_limit || null,
        max_attempts: input.quiz_max_attempts ?? 1,
        shuffle_questions: input.quiz_shuffle_questions ?? false,
        shuffle_options: input.quiz_shuffle_options ?? false
      });
    if (subError) throw subError;
  } else if (input.activity_type_code === "project") {
    const { error: subError } = await supabase
      .schema("learning")
      .from("projects")
      .insert({
        activity_id: activity.id,
        project_overview: input.project_overview || "",
        requirements: input.project_requirements || null,
        deliverables: input.project_deliverables || null,
        submission_instructions: input.project_submission_instructions || null,
        difficulty_level: input.project_difficulty || "intermediate",
        estimated_hours: input.project_estimated_hours || null,
        max_score: input.max_score ?? 100
      });
    if (subError) throw subError;
  } else if (input.activity_type_code === "programming_challenge" || input.activity_type_code === "programming") {
    const { error: subError } = await supabase
      .schema("learning")
      .from("programming_challenges")
      .insert({
        activity_id: activity.id,
        difficulty_level: input.chal_difficulty || "easy",
        problem_statement: input.chal_problem_statement || "",
        input_format: input.chal_input_format || null,
        output_format: input.chal_output_format || null,
        constraints_text: input.chal_constraints || null,
        starter_code: input.chal_starter_code || null,
        time_limit_ms: input.chal_time_limit || 1000,
        memory_limit_mb: input.chal_memory_limit || 256
      });
    if (subError) throw subError;
  }

  return activity;
}

export async function createQuizQuestionAndOptions(
  quizId: string,
  questionText: string,
  questionType: string,
  points: number,
  position: number,
  options: Array<{ optionText: string; isCorrect: boolean; position: number }>
) {
  const supabase = await createClient();

  const { data: question, error: qError } = await supabase
    .schema("learning")
    .from("quiz_questions")
    .insert({
      quiz_id: quizId,
      question_text: questionText,
      question_type: questionType,
      points,
      position
    })
    .select()
    .single();

  if (qError) throw qError;

  if (options.length > 0) {
    const optionsToInsert = options.map(opt => ({
      question_id: question.id,
      option_text: opt.optionText,
      is_correct: opt.isCorrect,
      position: opt.position
    }));

    const { error: optError } = await supabase
      .schema("learning")
      .from("quiz_options")
      .insert(optionsToInsert);

    if (optError) throw optError;
  }

  return question;
}

export async function createChallengeExample(input: {
  challenge_id: string;
  example_number: number;
  input_example: string;
  output_example: string;
  explanation?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("learning")
    .from("challenge_examples")
    .insert({
      challenge_id: input.challenge_id,
      example_number: input.example_number,
      input_example: input.input_example,
      output_example: input.output_example,
      explanation: input.explanation || null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createChallengeTestCase(input: {
  challenge_id: string;
  input_data: string;
  expected_output: string;
  is_hidden?: boolean;
  position?: number;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("learning")
    .from("challenge_test_cases")
    .insert({
      challenge_id: input.challenge_id,
      input_data: input.input_data,
      expected_output: input.expected_output,
      is_hidden: input.is_hidden ?? true,
      position: input.position ?? 1
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function assignActivityToCohort(input: {
  activity_id: string;
  cohort_id: string;
  is_required?: boolean;
  available_from?: string;
  available_until?: string;
  created_by?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("learning")
    .from("activity_assignments")
    .insert({
      activity_id: input.activity_id,
      cohort_id: input.cohort_id,
      is_required: input.is_required ?? true,
      available_from: input.available_from || null,
      available_until: input.available_until || null,
      created_by: input.created_by || null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
