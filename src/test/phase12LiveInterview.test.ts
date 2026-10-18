import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  LocalCanvasAvatarProvider,
  CloudStreamingAvatarProvider,
  getAvatarProvider,
} from '@/services/avatarProviderService';
import {
  generateAdaptiveFollowUp,
  getConversationalTransition,
} from '@/services/adaptiveFollowUpService';
import {
  isMediaSupported,
  stopMediaStream,
} from '@/services/mediaService';
import {
  getInterviewerPersona,
  InterviewQuestion,
} from '@/types/interview';

describe('Phase 12 — Live One-on-One AI Interview & Avatar Adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Female AI Interviewer Personas & Avatar Provider Adapter', () => {
    it('retrieves Elena Vance and Dr. Sophia Chen female personas', () => {
      const elena = getInterviewerPersona('elena');
      const sophia = getInterviewerPersona('sophia');

      expect(elena.name).toBe('Elena Vance');
      expect(elena.gender).toBe('female');
      expect(elena.title).toContain('Architect');

      expect(sophia.name).toBe('Dr. Sophia Chen');
      expect(sophia.gender).toBe('female');
      expect(sophia.title).toContain('Algorithms');
    });

    it('instantiates LocalCanvasAvatarProvider with zero latency and zero API cost', () => {
      const provider = new LocalCanvasAvatarProvider();

      expect(provider.id).toBe('local_female_canvas');
      expect(provider.type).toBe('local_canvas');
      expect(provider.status).toBe('active');
      expect(provider.capabilities.latencyMs).toBe(0);
      expect(provider.capabilities.requiresCredentials).toBe(false);
    });

    it('correctly transitions visual states across listening, thinking, and speaking', () => {
      const provider = new LocalCanvasAvatarProvider();
      expect(() => {
        provider.setExpressionState('speaking');
        provider.setExpressionState('listening');
        provider.setExpressionState('thinking');
        provider.setExpressionState('idle');
      }).not.toThrow();
    });

    it('CloudStreamingAvatarProvider reports blocked_on_credentials when API key is missing', () => {
      const cloudProvider = new CloudStreamingAvatarProvider();
      expect(cloudProvider.type).toBe('cloud_stream');
      expect(cloudProvider.status).toBe('blocked_on_credentials');
      expect(cloudProvider.capabilities.requiresCredentials).toBe(true);
    });

    it('factory returns active verified local female avatar provider', () => {
      const activeProvider = getAvatarProvider();
      expect(activeProvider.status).toBe('active');
    });
  });

  describe('2. Adaptive Follow-Up Question Engine', () => {
    const dummyQuestion: InterviewQuestion = {
      id: 'q-dsa-1',
      order: 1,
      category: 'coding_ds',
      targetRole: 'Software Engineer',
      difficulty: 'intermediate',
      topic: 'Arrays and Two Pointers',
      questionText: 'Given an array of integers, how would you find two numbers that sum to a specific target?',
      expectedCriteria: ['Hash map', 'Time complexity O(N)', 'Space complexity O(N)'],
    };

    it('prompts candidate for clarification when response is overly concise', () => {
      const briefAnswer = 'I will use a loop.';
      const result = generateAdaptiveFollowUp(dummyQuestion, briefAnswer, 'coding_ds', 0);

      expect(result.hasFollowUp).toBe(true);
      expect(result.focusArea).toBe('clarification');
      expect(result.followUpText).toContain('elaborate');
    });

    it('probes Big-O complexity when candidate omits computational analysis', () => {
      const answerWithoutComplexity =
        'I would iterate through the array from start to end, storing the numbers in a hash map as I go so that I can look up the complement.';
      const result = generateAdaptiveFollowUp(dummyQuestion, answerWithoutComplexity, 'coding_ds', 0);

      expect(result.hasFollowUp).toBe(true);
      expect(result.focusArea).toBe('complexity');
      expect(result.followUpText).toContain('Big-O');
    });

    it('probes memory constraints and collisions when candidate uses hash-based lookups', () => {
      const answerWithComplexityAndHash =
        'I would use a hash map to achieve O(N) time complexity and O(N) space complexity by storing visited values and their indices.';
      const result = generateAdaptiveFollowUp(dummyQuestion, answerWithComplexityAndHash, 'coding_ds', 0);

      expect(result.hasFollowUp).toBe(true);
      expect(result.followUpText).toContain('hash');
    });

    it('probes measurable impact and STAR results on behavioral questions', () => {
      const behavioralQ: InterviewQuestion = {
        id: 'q-beh-1',
        order: 1,
        category: 'behavioral',
        targetRole: 'Engineering Manager',
        difficulty: 'intermediate',
        topic: 'Conflict Resolution',
        questionText: 'Tell me about a time you had a technical disagreement with a teammate.',
        expectedCriteria: ['STAR framework', 'Collaboration', 'Resolution'],
      };

      const behavioralAnswer =
        'In my previous company, my teammate wanted to use a NoSQL database while I advocated for Postgres. I set up a technical benchmarking meeting and we compared query patterns.';
      const result = generateAdaptiveFollowUp(behavioralQ, behavioralAnswer, 'behavioral', 0);

      expect(result.hasFollowUp).toBe(true);
      expect(result.focusArea).toBe('ownership');
      expect(result.followUpText).toContain('result');
    });

    it('strictly respects the follow-up question quota (max 1 follow-up per main question)', () => {
      const result = generateAdaptiveFollowUp(dummyQuestion, 'Any answer text', 'coding_ds', 1);
      expect(result.hasFollowUp).toBe(false);
      expect(result.followUpText).toBe('');
    });

    it('generates natural conversational transitions for follow-up and next question', () => {
      const followUpPhrase = getConversationalTransition('follow_up', 'coding_ds');
      expect(typeof followUpPhrase).toBe('string');
      expect(followUpPhrase.length).toBeGreaterThan(15);

      const nextPhrase = getConversationalTransition('next_question', 'coding_ds');
      expect(typeof nextPhrase).toBe('string');
      expect(nextPhrase.length).toBeGreaterThan(15);

      const conclusionPhrase = getConversationalTransition('conclusion', 'coding_ds');
      expect(conclusionPhrase).toContain('performance scorecard and feedback report');
    });
  });

  describe('3. Hardware Media Lifecycle & Safety', () => {
    it('detects mediaDevices support correctly in environment', () => {
      const supported = isMediaSupported();
      expect(typeof supported).toBe('boolean');
    });

    it('safely handles null stream cleanup without throwing', () => {
      expect(() => stopMediaStream(null)).not.toThrow();
    });

    it('stops all tracks when valid media stream is passed', () => {
      const stopFn = vi.fn();
      const mockStream = {
        getTracks: () => [
          { stop: stopFn, enabled: true },
          { stop: stopFn, enabled: true },
        ],
      } as unknown as MediaStream;

      stopMediaStream(mockStream);
      expect(stopFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('4. Strict Pre-Interview Readiness Validation Engine', () => {
    it('validates environment readiness with secure context and media APIs', async () => {
      const { validateEnvironmentReadiness } = await import('@/services/interviewReadinessService');
      const checks = validateEnvironmentReadiness();

      expect(checks.length).toBeGreaterThanOrEqual(3);
      const secureCheck = checks.find((c) => c.id === 'env_secure_context');
      expect(secureCheck).toBeDefined();
      expect(secureCheck?.isCritical).toBe(true);
    });

    it('marks camera check FAIL when stream is null or tracks are inactive', async () => {
      const { validateCameraReadiness } = await import('@/services/interviewReadinessService');
      const checks = await validateCameraReadiness(null, null);

      expect(checks.length).toBe(2);
      expect(checks.every((c) => c.status === 'FAIL')).toBe(true);
    });

    it('marks camera check PASS when live video track exists', async () => {
      const { validateCameraReadiness } = await import('@/services/interviewReadinessService');
      const mockStream = {
        getVideoTracks: () => [
          { readyState: 'live', label: 'FaceTime HD Camera', enabled: true },
        ],
      } as unknown as MediaStream;

      const checks = await validateCameraReadiness(mockStream, null);
      const liveCheck = checks.find((c) => c.id === 'cam_track_live');
      expect(liveCheck?.status).toBe('PASS');
      expect(liveCheck?.detail).toContain('FaceTime HD Camera');
    });

    it('marks microphone check FAIL when stream is null', async () => {
      const { validateMicrophoneReadiness } = await import('@/services/interviewReadinessService');
      const checks = await validateMicrophoneReadiness(null, 0);

      expect(checks.every((c) => c.status === 'FAIL')).toBe(true);
    });

    it('marks microphone check PASS when live audio track exists', async () => {
      const { validateMicrophoneReadiness } = await import('@/services/interviewReadinessService');
      const mockStream = {
        getAudioTracks: () => [
          { readyState: 'live', label: 'USB Condenser Mic', enabled: true },
        ],
      } as unknown as MediaStream;

      const checks = await validateMicrophoneReadiness(mockStream, 35);
      const liveCheck = checks.find((c) => c.id === 'mic_track_live');
      expect(liveCheck?.status).toBe('PASS');
      expect(liveCheck?.detail).toContain('USB Condenser Mic');
    });

    it('validates session integrity: fails when student is unauthenticated', async () => {
      const { validateSessionIntegrity } = await import('@/services/interviewReadinessService');
      const checksUnauth = validateSessionIntegrity(undefined, true);
      const authCheck = checksUnauth.find((c) => c.id === 'session_auth');
      expect(authCheck?.status).toBe('FAIL');

      const checksAuth = validateSessionIntegrity('user_student_123', true);
      const authPass = checksAuth.find((c) => c.id === 'session_auth');
      expect(authPass?.status).toBe('PASS');
    });

    it('compiles overall readiness report and gates full-screen start flag', async () => {
      const { compileReadinessReport } = await import('@/services/interviewReadinessService');
      // Unready state (null stream)
      const reportUnready = await compileReadinessReport({
        stream: null,
        videoElement: null,
        currentAudioLevel: 0,
        personaId: 'elena',
        userId: 'student_123',
        privacyAcknowledged: true,
      });

      expect(reportUnready.canStartFullScreen).toBe(false);
      expect(reportUnready.isFullyReady).toBe(false);

      // Ready state (mock live stream and mediaDevices)
      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: vi.fn().mockResolvedValue({}) },
        configurable: true,
      });

      const mockStream = {
        getVideoTracks: () => [{ readyState: 'live', label: 'Webcam', enabled: true }],
        getAudioTracks: () => [{ readyState: 'live', label: 'Mic', enabled: true }],
      } as unknown as MediaStream;

      const reportReady = await compileReadinessReport({
        stream: mockStream,
        videoElement: null,
        currentAudioLevel: 40,
        personaId: 'elena',
        userId: 'student_123',
        privacyAcknowledged: true,
      });

      expect(reportReady.canStartFullScreen).toBe(true);
    });
  });

  describe('5. Full-Screen Interview Mode & Fallback Management', () => {
    it('requestInterviewFullScreen provides safe fallback when document is simulated', async () => {
      const { requestInterviewFullScreen, exitInterviewFullScreen } = await import(
        '@/services/interviewReadinessService'
      );

      const res = await requestInterviewFullScreen();
      expect(typeof res.success).toBe('boolean');
      expect(typeof res.isFallback).toBe('boolean');

      await expect(exitInterviewFullScreen()).resolves.not.toThrow();
    });
  });

  describe('6. Technical Pronunciation & Natural Voice Selection', () => {
    it('prepares technical acronyms and complexity notation for articulate speech', async () => {
      const { prepareTechnicalSpeechText } = await import('@/services/voiceChatService');

      const text = 'Explain SQL queries, RESTful APIs, and why O(N log N) is faster than O(N^2) in Big-O analysis.';
      const prepared = prepareTechnicalSpeechText(text);

      expect(prepared).toContain('S-Q-L');
      expect(prepared).toContain('Restful');
      expect(prepared).toContain('A-P-Is');
      expect(prepared).toContain('O of N log N');
      expect(prepared).toContain('O of N squared');
      expect(prepared).toContain('Big Oh');
    });
  });
});
