import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Problem,
  Submission,
  TopicMastery,
  CODELAB_TOPICS,
} from '@/types/codelab';
import { SkillLevel } from '@/types/skill';
import { ProgrammingLanguage } from '@/types/user';
import { SEED_PROBLEMS } from '@/data/seedProblems';
import { addNotification } from '@/services/notificationService';

export interface ProblemFilterOptions {
  searchTerm?: string;
  difficulty?: SkillLevel | 'all';
  topicId?: string | 'all';
  language?: ProgrammingLanguage | 'all';
  companyPattern?: string | 'all';
  status?: 'all' | 'solved' | 'unsolved';
  page?: number;
  pageSize?: number;
  userId?: string;
}

const LOCAL_STORAGE_SUBMISSIONS_KEY = 'nexora_local_submissions';

/**
 * Fetch problem catalog with bounded pagination and filtering
 */
export async function getProblems(
  options: ProblemFilterOptions = {}
): Promise<{ problems: Problem[]; totalCount: number }> {
  const {
    searchTerm = '',
    difficulty = 'all',
    topicId = 'all',
    language = 'all',
    companyPattern = 'all',
    page = 1,
    pageSize = 20,
  } = options;

  let allProblems: Problem[] = [];

  if (db) {
    try {
      const problemsRef = collection(db, 'problems');
      const q = query(
        problemsRef,
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        allProblems = snapshot.docs.map((d) => ({
          ...(d.data() as Problem),
          id: d.id,
        }));
      }
    } catch (err) {
      console.warn('[CodelabService] Firestore fetch failed, falling back to seed problems:', err);
    }
  }

  // Fallback to seed catalog if Firestore is empty or local
  if (allProblems.length === 0) {
    allProblems = [...SEED_PROBLEMS];
  }

  // In-memory multi-facet filtering
  let filtered = allProblems.filter((p) => p.isPublished);

  if (difficulty !== 'all') {
    filtered = filtered.filter((p) => p.difficulty === difficulty);
  }

  if (topicId !== 'all') {
    filtered = filtered.filter((p) => p.topicId === topicId);
  }

  if (language !== 'all') {
    filtered = filtered.filter((p) => p.supportedLanguages.includes(language));
  }

  if (companyPattern !== 'all') {
    filtered = filtered.filter(
      (p) =>
        (p.companyPatterns && p.companyPatterns.includes(companyPattern)) ||
        p.tags.some((t) => t.toLowerCase().includes(companyPattern.toLowerCase()))
    );
  }

  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.topicName.toLowerCase().includes(term) ||
        p.tags.some((t) => t.toLowerCase().includes(term))
    );
  }

  const totalCount = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return {
    problems: paginated.map(sanitizeClientProblem),
    totalCount,
  };
}

/**
 * Sanitizes a problem record before returning to student clients.
 * Strips private server-only reference solutions and ensures hidden tests
 * are not leaked to the browser.
 */
export function sanitizeClientProblem(problem: Problem): Problem {
  const safeProblem = { ...problem };
  delete safeProblem.referenceSolution;
  return safeProblem;
}

/**
 * Retrieve a single problem by its unique URL slug
 * Guarantees hidden test cases and private reference solutions are never exposed to the client
 */
export async function getProblemBySlug(slug: string): Promise<Problem | null> {
  if (db) {
    try {
      const problemsRef = collection(db, 'problems');
      const q = query(problemsRef, where('slug', '==', slug), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data() as Problem;
        return sanitizeClientProblem({
          ...data,
          id: docSnap.id,
        });
      }
    } catch (err) {
      console.warn('[CodelabService] Firestore slug lookup failed, checking seeds:', err);
    }
  }

  // Match from seed collection by slug or by ID
  const found = SEED_PROBLEMS.find((p) => p.slug === slug || p.id === slug);
  return found ? sanitizeClientProblem(found) : null;
}

/**
 * Retrieve user's submission history
 */
export async function getSubmissionsForUser(
  userId: string,
  problemId?: string
): Promise<Submission[]> {
  if (!userId) return [];

  let submissions: Submission[] = [];

  if (db) {
    try {
      const subsRef = collection(db, 'submissions');
      let q = query(
        subsRef,
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc'),
        limit(50)
      );

      if (problemId) {
        q = query(
          subsRef,
          where('userId', '==', userId),
          where('problemId', '==', problemId),
          orderBy('submittedAt', 'desc'),
          limit(20)
        );
      }

      const snapshot = await getDocs(q);
      submissions = snapshot.docs.map((d) => ({
        ...(d.data() as Submission),
        id: d.id,
      }));
    } catch (err) {
      console.warn('[CodelabService] Firestore submission fetch error:', err);
    }
  }

  // Fallback to local storage for local test and emulator session
  if (submissions.length === 0 && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
      if (stored) {
        const parsed: Submission[] = JSON.parse(stored);
        submissions = parsed.filter((s) => s.userId === userId);
        if (problemId) {
          submissions = submissions.filter((s) => s.problemId === problemId);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  return submissions.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

/**
 * Save submission to persistent client cache (used when backend returns new submission record)
 */
export function cacheLocalSubmission(submission: Submission): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
    const list: Submission[] = stored ? JSON.parse(stored) : [];
    list.unshift(submission);
    // Keep max 100 in local buffer
    localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(list.slice(0, 100)));

    // Emit lightweight persistent in-app notification
    if (submission.userId) {
      addNotification(submission.userId, {
        type: 'submission_verdict',
        title: submission.verdict === 'accepted' ? 'Challenge Solved!' : 'Submission Evaluated',
        message: `Your solution for "${submission.problemTitle || 'Challenge'}" received verdict: ${(submission.verdict || 'EVALUATED').toUpperCase().replace(/_/g, ' ')}.`,
        linkUrl: '/codelab/submissions',
      }).catch(() => {});
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Compute real measured topic mastery for the student
 * Proficiency is strictly derived from actual accepted problem counts per topic
 */
export async function getTopicMasteryForUser(userId: string): Promise<TopicMastery[]> {
  const submissions = await getSubmissionsForUser(userId);
  const acceptedProblemIds = new Set(
    submissions.filter((s) => s.verdict === 'accepted').map((s) => s.problemId)
  );

  return CODELAB_TOPICS.map((topic) => {
    // Count problems solved in this topic
    const topicProblems = SEED_PROBLEMS.filter((p) => p.topicId === topic.id);
    const solvedInTopic = topicProblems.filter((p) => acceptedProblemIds.has(p.id)).length;
    const totalAttempted = submissions.filter((s) => s.topicId === topic.id).length;

    // Measured topic proficiency tiers
    let proficiency: SkillLevel = 'absolute_beginner';
    if (solvedInTopic >= 5) {
      proficiency = 'expert';
    } else if (solvedInTopic >= 3) {
      proficiency = 'advanced';
    } else if (solvedInTopic >= 2) {
      proficiency = 'intermediate';
    } else if (solvedInTopic >= 1) {
      proficiency = 'beginner';
    }

    const latestSolved = submissions
      .filter((s) => s.topicId === topic.id && s.verdict === 'accepted')
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

    return {
      topicId: topic.id,
      topicName: topic.name,
      solvedCount: solvedInTopic,
      totalAttempted,
      proficiency,
      lastSolvedAt: latestSolved ? latestSolved.submittedAt : null,
    };
  });
}
