import { StudyPlan, StudyTask, StudyPlanInput } from '@/types/studyPlan';
import { SEED_PROBLEMS } from '@/data/seedProblems';
import { Submission } from '@/types/codelab';
import { InterviewSessionSummary } from '@/types/interview';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const LOCAL_STORAGE_PLAN_PREFIX = 'nexora_study_plan_';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getLocalStudyPlan(userId: string): StudyPlan | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PLAN_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalStudyPlan(userId: string, plan: StudyPlan): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PLAN_PREFIX}${userId}`, JSON.stringify(plan));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Creates or updates a personalized study plan for a student
 */
export async function createPersonalizedStudyPlan(
  userId: string,
  input: StudyPlanInput,
  submissions: Submission[] = [],
  interviews: InterviewSessionSummary[] = []
): Promise<StudyPlan> {
  const planId = `plan_${Date.now()}`;
  const now = new Date().toISOString();

  const preferredDays =
    input.preferredDays && input.preferredDays.length > 0
      ? input.preferredDays
      : [1, 3, 5]; // Default Mon, Wed, Fri
  const availableProblems = SEED_PROBLEMS;

  // Filter out problems the student has already solved
  const solvedProblemIds = new Set(
    submissions.filter((s) => s.verdict === 'accepted').map((s) => s.problemId)
  );

  const unsolvedProblems = availableProblems.filter((p) => !solvedProblemIds.has(p.id));
  const candidateProblems = unsolvedProblems.length > 0 ? unsolvedProblems : availableProblems;

  // Generate 4-6 balanced tasks mapped across preferred days
  const tasks: StudyTask[] = [];

  preferredDays.forEach((dayIndex, idx) => {
    const prob = candidateProblems[idx % candidateProblems.length];
    const isInterviewDay = idx === preferredDays.length - 1; // Last day of week is mock interview

    if (isInterviewDay) {
      tasks.push({
        id: `task_${planId}_${idx + 1}`,
        planId,
        title: `${input.targetRole} Mock Diagnostic Interview`,
        topic: 'Technical Interviewing',
        taskType: 'mock_interview',
        targetId: 'technical',
        difficulty: 'intermediate',
        estimatedMinutes: 45,
        reason: `Rehearse explaining technical decisions out loud for your target role (${input.targetRole}).`,
        actionUrl: '/interview/setup',
        isCompleted: false,
        scheduledDayIndex: dayIndex,
        dayLabel: DAY_NAMES[dayIndex] || 'Practice Day',
      });
    } else {
      tasks.push({
        id: `task_${planId}_${idx + 1}`,
        planId,
        title: `Code Challenge: ${prob.title}`,
        topic: prob.topicName,
        taskType: 'solve_problem',
        targetId: prob.slug,
        difficulty: prob.difficulty,
        estimatedMinutes: 30,
        reason: `Build algorithmic problem solving in ${prob.topicName} using sandboxed test verification.`,
        actionUrl: `/codelab/problems/${prob.slug}`,
        isCompleted: false,
        scheduledDayIndex: dayIndex,
        dayLabel: DAY_NAMES[dayIndex] || 'Practice Day',
      });
    }
  });

  const totalEstimatedMinutes = tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

  const plan: StudyPlan = {
    id: planId,
    userId,
    title: `${input.targetRole} Acceleration Plan`,
    targetRole: input.targetRole,
    focusTopics: input.focusTopics.length > 0 ? input.focusTopics : ['Data Structures', 'System Design'],
    weeklyHours: input.weeklyHours || 5,
    preferredDays,
    startDate: now,
    targetCompletionDate: input.targetCompletionDate,
    tasks,
    totalEstimatedMinutes,
    status: 'active',
    progressPercent: 0,
    createdAt: now,
    updatedAt: now,
  };

  // Re-verify initial completion state against provided records
  recomputePlanProgress(plan, submissions, interviews);

  // Save to local cache
  saveLocalStudyPlan(userId, plan);

  // Persist to Firestore if available
  if (db) {
    try {
      const planRef = doc(db, 'users', userId, 'studyPlans', plan.id);
      await setDoc(planRef, plan, { merge: true });
    } catch (err) {
      console.warn('[StudyPlanService] Firestore save error:', err);
    }
  }

  return plan;
}

/**
 * Automatically reconciles task completion using genuine persisted activity
 */
export function recomputePlanProgress(
  plan: StudyPlan,
  submissions: Submission[],
  interviews: InterviewSessionSummary[]
): StudyPlan {
  const solvedProblemSlugs = new Set<string>();
  submissions
    .filter((s) => s.verdict === 'accepted')
    .forEach((s) => {
      if (s.problemId) solvedProblemSlugs.add(s.problemId);
      if (s.problemSlug) solvedProblemSlugs.add(s.problemSlug);
    });

  const completedInterviews = interviews.filter((i) => i.status === 'completed');

  let completedTasksCount = 0;

  plan.tasks.forEach((task) => {
    if (task.taskType === 'solve_problem' && (solvedProblemSlugs.has(task.targetId) || solvedProblemSlugs.has(task.targetId.replace(/^prob-/, '')))) {
      task.isCompleted = true;
      task.verifiedVia = 'codelab_submission';
      if (!task.completedAt) task.completedAt = new Date().toISOString();
    } else if (task.taskType === 'mock_interview' && completedInterviews.length > 0) {
      task.isCompleted = true;
      task.verifiedVia = 'interview_report';
      if (!task.completedAt) task.completedAt = new Date().toISOString();
    }

    if (task.isCompleted) completedTasksCount += 1;
  });

  plan.progressPercent = Math.round((completedTasksCount / Math.max(1, plan.tasks.length)) * 100);
  plan.updatedAt = new Date().toISOString();

  if (plan.progressPercent === 100) {
    plan.status = 'completed';
  }

  return plan;
}

/**
 * Mark a manual task complete
 */
export async function toggleTaskCompletion(
  userId: string,
  plan: StudyPlan,
  taskId: string
): Promise<StudyPlan> {
  const task = plan.tasks.find((t) => t.id === taskId);
  if (!task) return plan;

  task.isCompleted = !task.isCompleted;
  task.completedAt = task.isCompleted ? new Date().toISOString() : undefined;
  task.verifiedVia = task.isCompleted ? 'manual' : undefined;

  const completedCount = plan.tasks.filter((t) => t.isCompleted).length;
  plan.progressPercent = Math.round((completedCount / Math.max(1, plan.tasks.length)) * 100);
  plan.updatedAt = new Date().toISOString();

  saveLocalStudyPlan(userId, plan);

  if (db) {
    try {
      const planRef = doc(db, 'users', userId, 'studyPlans', plan.id);
      await setDoc(planRef, plan, { merge: true });
    } catch {
      // Ignore
    }
  }

  return { ...plan };
}
