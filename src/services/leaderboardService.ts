import { LeaderboardEntry } from '@/types/gamification';
import { UserProfile } from '@/types/user';

export interface LeaderboardFilter {
  period: 'all_time' | 'weekly';
  limit?: number;
}

/**
 * Computes a privacy-respecting leaderboard ranking with consistent tie-breaking
 */
export function buildLeaderboard(
  candidates: {
    userId: string;
    profile: Partial<UserProfile>;
    xp: number;
    challengesCompleted: number;
    streak: number;
    updatedAt: string;
    optOutOfLeaderboards?: boolean;
  }[],
  currentUserId: string,
  filter: LeaderboardFilter = { period: 'all_time', limit: 20 }
): LeaderboardEntry[] {
  // Filter out:
  // 1. Admin accounts
  // 2. Students who opted out of public rankings
  const eligible = candidates.filter((c) => {
    if (c.profile.role === 'admin') return false;
    if (c.optOutOfLeaderboards === true) return false;
    return true;
  });

  // Sort with deterministic tie-breaking:
  // Primary: XP descending
  // Secondary: challenges completed descending
  // Tertiary: streak descending
  // Quaternary: earliest updatedAt ascending
  const sorted = [...eligible].sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    if (b.challengesCompleted !== a.challengesCompleted) return b.challengesCompleted - a.challengesCompleted;
    if (b.streak !== a.streak) return b.streak - a.streak;
    return a.updatedAt.localeCompare(b.updatedAt);
  });

  const limit = filter.limit || 20;
  const sliced = sorted.slice(0, limit);

  return sliced.map((entry, index) => {
    // Generate pseudonym if fullName is absent or for privacy
    const displayName = entry.profile.fullName?.trim() || `Engineer_${entry.userId.slice(-4)}`;
    const avatarInitial = displayName.charAt(0).toUpperCase();

    return {
      rank: index + 1,
      userId: entry.userId,
      displayName,
      avatarInitial,
      xp: entry.xp,
      challengesCompleted: entry.challengesCompleted,
      currentStreak: entry.streak,
      isCurrentUser: entry.userId === currentUserId,
    };
  });
}

/**
 * Builds or fetches weekly leaderboard entries with mock peer comparisons
 */
export function getWeeklyLeaderboard(
  currentUserId: string,
  optOutLeaderboard: boolean = false,
  currentUserStats?: { xp: number; challengesCompleted: number; currentStreak: number }
): LeaderboardEntry[] {
  const mockPeers = [
    {
      userId: 'peer_1',
      profile: { fullName: 'Alex Rivera', role: 'student' as const, selectedLevel: 'advanced' as const, preferredLanguage: 'python' as const },
      xp: 1250,
      challengesCompleted: 8,
      streak: 12,
      updatedAt: '2026-10-17T08:00:00Z',
    },
    {
      userId: 'peer_2',
      profile: { fullName: 'Sarah Chen', role: 'student' as const, selectedLevel: 'intermediate' as const, preferredLanguage: 'javascript' as const },
      xp: 980,
      challengesCompleted: 6,
      streak: 9,
      updatedAt: '2026-10-17T09:00:00Z',
    },
    {
      userId: 'peer_3',
      profile: { fullName: 'Michael Ross', role: 'student' as const, selectedLevel: 'intermediate' as const, preferredLanguage: 'java' as const },
      xp: 620,
      challengesCompleted: 4,
      streak: 5,
      updatedAt: '2026-10-17T10:00:00Z',
    },
    {
      userId: 'peer_4',
      profile: { fullName: 'Elena Rostova', role: 'student' as const, selectedLevel: 'beginner' as const, preferredLanguage: 'cpp' as const },
      xp: 350,
      challengesCompleted: 2,
      streak: 3,
      updatedAt: '2026-10-17T11:00:00Z',
    },
  ];

  const currentCandidate = {
    userId: currentUserId,
    profile: {
      fullName: optOutLeaderboard ? 'Anonymous Candidate' : 'You',
      role: 'student' as const,
      selectedLevel: 'intermediate' as const,
      preferredLanguage: 'python' as const,
    },
    xp: currentUserStats?.xp ?? 0,
    challengesCompleted: currentUserStats?.challengesCompleted ?? 0,
    streak: currentUserStats?.currentStreak ?? 0,
    updatedAt: new Date().toISOString(),
    optOutOfLeaderboards: false,
  };

  const all = [...mockPeers, currentCandidate];
  return buildLeaderboard(all, currentUserId, { period: 'weekly', limit: 10 });
}

