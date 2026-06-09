"use server";

import * as service from "@/services/learning";
import { revalidatePath } from "next/cache";
import * as runner from "@/services/runner";

export async function getStudentAssignedActivitiesAction(studentId: string) {
  try {
    const activities = await service.getStudentAssignedActivities(studentId);
    return { activities };
  } catch (error: any) {
    return { error: error.message || "Failed to load assigned activities." };
  }
}

export async function getQuizDetailsAction(activityId: string) {
  try {
    const data = await service.getQuizDetails(activityId);
    return data;
  } catch (error: any) {
    return { error: error.message || "Failed to load quiz details." };
  }
}

export async function startQuizAttemptAction(quizId: string, studentId: string, progressId: string, attemptNumber: number = 1) {
  try {
    const attempt = await service.startQuizAttempt(quizId, studentId, progressId, attemptNumber);
    revalidatePath("/student");
    return { attempt };
  } catch (error: any) {
    return { error: error.message || "Failed to start quiz attempt." };
  }
}

export async function submitQuizAnswersAction(
  attemptId: string,
  answers: Array<{ questionId: string; selectedOptionId?: string; answerText?: string }>
) {
  try {
    const attempt = await service.submitQuizAnswers(attemptId, answers);
    revalidatePath("/student");
    return { attempt };
  } catch (error: any) {
    return { error: error.message || "Failed to submit quiz answers." };
  }
}

export async function getProjectDetailsAction(activityId: string, studentId: string) {
  try {
    const data = await service.getProjectDetails(activityId, studentId);
    return data;
  } catch (error: any) {
    return { error: error.message || "Failed to load project details." };
  }
}

export async function submitProjectAction(
  projectId: string,
  studentId: string,
  progressId: string,
  githubUrl: string,
  notes?: string
) {
  try {
    const submission = await service.submitProject(projectId, studentId, progressId, githubUrl, notes);
    revalidatePath("/student");
    return { submission };
  } catch (error: any) {
    return { error: error.message || "Failed to submit project." };
  }
}

export async function getStudentAssignedChallengesAction(studentId: string) {
  try {
    const challenges = await service.getStudentAssignedChallenges(studentId);
    return { challenges };
  } catch (error: any) {
    return { error: error.message || "Failed to load assigned challenges." };
  }
}

export async function getProgrammingChallengeDetailsAction(activityId: string, studentId: string) {
  try {
    const data = await service.getProgrammingChallengeDetails(activityId, studentId);
    return data;
  } catch (error: any) {
    return { error: error.message || "Failed to load programming challenge." };
  }
}

export async function runChallengeCodeAction(
  challengeId: string,
  language: string,
  sourceCode: string
) {
  try {
    const results = await runner.executeVisibleTests(challengeId, language, sourceCode);
    return { results };
  } catch (error: any) {
    return { error: error.message || "Failed to run challenge code." };
  }
}

export async function submitChallengeCodeAction(
  challengeId: string,
  studentId: string,
  progressId: string,
  language: string,
  sourceCode: string
) {
  try {
    const submission = await service.submitChallengeCode(challengeId, studentId, progressId, language, sourceCode);
    
    // Automatically trigger Judge Engine execution in background only if external worker process is disabled
    if (process.env.JUDGE_WORKER_ENABLED !== "true") {
      runner.executeAllTestsAndGrade(submission.id).catch(console.error);
    }

    revalidatePath("/student");
    return { submission };
  } catch (error: any) {
    return { error: error.message || "Failed to submit challenge code." };
  }
}

export async function getChallengeSubmissionResultsAction(submissionId: string) {
  try {
    const data = await service.getChallengeSubmissionResults(submissionId);
    return data;
  } catch (error: any) {
    return { error: error.message || "Failed to load submission results." };
  }
}

// Server action to list all activities for a tenant (force recompilation refresh)
export async function listAllActivitiesAction(tenantId: string) {
  try {
    const activities = await service.listAllActivities(tenantId);
    return { activities };
  } catch (error: any) {
    return { error: error.message || "Failed to list activities." };
  }
}

export async function createActivityAndSubclassAction(input: any) {
  try {
    const activity = await service.createActivityAndSubclass(input);
    revalidatePath("/admin");
    return { activity };
  } catch (error: any) {
    return { error: error.message || "Failed to create activity." };
  }
}

export async function createQuizQuestionAndOptionsAction(
  quizId: string,
  questionText: string,
  questionType: string,
  points: number,
  position: number,
  options: Array<{ optionText: string; isCorrect: boolean; position: number }>
) {
  try {
    const question = await service.createQuizQuestionAndOptions(
      quizId,
      questionText,
      questionType,
      points,
      position,
      options
    );
    revalidatePath("/admin");
    return { question };
  } catch (error: any) {
    return { error: error.message || "Failed to create question." };
  }
}

export async function createChallengeExampleAction(input: any) {
  try {
    const example = await service.createChallengeExample(input);
    revalidatePath("/admin");
    return { example };
  } catch (error: any) {
    return { error: error.message || "Failed to create challenge example." };
  }
}

export async function createChallengeTestCaseAction(input: any) {
  try {
    const testCase = await service.createChallengeTestCase(input);
    revalidatePath("/admin");
    return { testCase };
  } catch (error: any) {
    return { error: error.message || "Failed to create test case." };
  }
}

export async function assignActivityToCohortAction(input: any) {
  try {
    const assignment = await service.assignActivityToCohort(input);
    revalidatePath("/admin");
    return { assignment };
  } catch (error: any) {
    return { error: error.message || "Failed to assign activity." };
  }
}

export async function getActiveQuizAttemptAction(quizId: string, studentId: string) {
  try {
    const attempt = await service.getActiveQuizAttempt(quizId, studentId);
    return { attempt };
  } catch (error: any) {
    return { error: error.message || "Failed to check active attempt." };
  }
}

export async function getQuizSessionDetailsAction(attemptId: string) {
  try {
    const data = await service.getQuizSessionDetails(attemptId);
    return data;
  } catch (error: any) {
    return { error: error.message || "Failed to retrieve quiz session details." };
  }
}

export async function listProjectSubmissionsAction(tenantId: string) {
  try {
    const submissions = await service.listProjectSubmissions(tenantId);
    return { submissions };
  } catch (error: any) {
    return { error: error.message || "Failed to load project submissions." };
  }
}

export async function reviewProjectSubmissionAction(input: {
  submissionId: string;
  reviewerId: string;
  status: string;
  score: number;
  feedback: string;
}) {
  try {
    const review = await service.reviewProjectSubmission(input);
    revalidatePath("/teacher");
    return { review };
  } catch (error: any) {
    return { error: error.message || "Failed to submit project review." };
  }
}

export async function listChallengeSubmissionsAction(tenantId: string) {
  try {
    const submissions = await service.listChallengeSubmissions(tenantId);
    return { submissions };
  } catch (error: any) {
    return { error: error.message || "Failed to load challenge submissions." };
  }
}


