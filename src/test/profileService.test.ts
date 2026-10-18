import { describe, it, expect, beforeEach } from 'vitest';
import {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
} from '@/services/profileService';

describe('Profile Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates an initial profile with student role and zeroed stats', async () => {
    const profile = await createStudentProfile('test-uid-123', 'student@test.com', 'Grace Hopper');

    expect(profile.uid).toBe('test-uid-123');
    expect(profile.email).toBe('student@test.com');
    expect(profile.fullName).toBe('Grace Hopper');
    expect(profile.role).toBe('student');
    expect(profile.selectedLevel).toBe('beginner');
    expect(profile.preferredLanguage).toBe('python');
    expect(profile.completedOnboarding).toBe(false);
    expect(profile.stats.acceptedSubmissions).toBe(0);
    expect(profile.stats.totalInterviews).toBe(0);
    expect(profile.stats.currentStreak).toBe(0);
  });

  it('retrieves an existing profile correctly', async () => {
    await createStudentProfile('test-uid-456', 'hopper@test.com', 'Admiral Hopper');
    const retrieved = await getStudentProfile('test-uid-456');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.fullName).toBe('Admiral Hopper');
    expect(retrieved?.role).toBe('student');
  });

  it('updates allowed fields without overwriting role or stats', async () => {
    await createStudentProfile('test-uid-789', 'test@test.com', 'Initial Name');

    await updateStudentProfile('test-uid-789', {
      fullName: 'Updated Name',
      selectedLevel: 'advanced',
      preferredLanguage: 'typescript',
      bio: 'Practicing for frontend interviews',
    });

    const updated = await getStudentProfile('test-uid-789');
    expect(updated?.fullName).toBe('Updated Name');
    expect(updated?.selectedLevel).toBe('advanced');
    expect(updated?.preferredLanguage).toBe('typescript');
    expect(updated?.bio).toBe('Practicing for frontend interviews');
    // Ensure role remains immutable student
    expect(updated?.role).toBe('student');
  });
});
