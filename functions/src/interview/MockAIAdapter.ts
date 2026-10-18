import {
  IAIProvider,
  InterviewCategory,
  SkillLevel,
  GeneratedQuestion,
  FullEvaluationResult,
  SingleEvaluation,
  CriterionScore,
} from './types';

export class MockAIAdapter implements IAIProvider {
  public readonly name = 'MockAIAdapter (Deterministic Rubric Engine)';

  public isConfigured(): boolean {
    return true; // Always available as local baseline
  }

  public async generateQuestions(
    category: InterviewCategory,
    targetRole: string,
    difficulty: SkillLevel,
    questionCount: number
  ): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = [];

    const categoryTopics: Record<InterviewCategory, string[]> = {
      technical: [
        'Operating Systems & Concurrency',
        'Networking & HTTP/3 Protocols',
        'System Architecture & Caching',
        'Storage Engines & B-Trees',
        'Distributed Consensus',
      ],
      programming: [
        'Data Structures & Inversion',
        'Dynamic Programming & State Transitions',
        'Graph Traversal & Shortest Paths',
        'Memory Management & Garbage Collection',
        'Concurrency & Lock-Free Queues',
      ],
      sql: [
        'Indexing & B-Tree Mechanics',
        'Join Strategies (Hash vs Nested Loop)',
        'Transaction Isolation Levels & MVCC',
        'Sharding & Read-Replicas',
        'Query Cost Optimization & EXPLAIN Plans',
      ],
      hr: [
        'Team Collaboration & Divergent Opinions',
        'Project Deadlines & Scope Negotiation',
        'Constructive Feedback & Mentorship',
        'Long-Term Career Development',
        'Workplace Adaptability & Ownership',
      ],
      behavioral: [
        'Critical Production Outage Post-Mortem',
        'Navigating Unclear Technical Requirements',
        'Resolving Architectural Deadlocks in Teams',
        'Managing Technical Debt under High Pressure',
        'Ethical Dilemmas in Software Engineering',
      ],
    };

    const topics = categoryTopics[category] || categoryTopics.technical;

    for (let i = 0; i < questionCount; i++) {
      const topic = topics[i % topics.length];
      const qId = `q_gen_${Date.now()}_${i + 1}`;

      let questionText = `For a ${targetRole} facing ${topic}, how would you architect, debug, or evaluate the scenario under ${difficulty.replace('_', ' ')} requirements?`;
      let scenario = `Consider a high-throughput production environment supporting ${targetRole} workflows where reliability and low latency are non-negotiable.`;

      if (category === 'sql') {
        questionText = `Explain how you would optimize database queries and table designs for ${topic} when handling millions of records in a ${targetRole} context.`;
      } else if (category === 'hr' || category === 'behavioral') {
        questionText = `Describe a situation involving ${topic}. What specific actions did you take, and what measurable outcome did you deliver?`;
        scenario = 'Use the STAR methodology (Situation, Task, Action, Result) to frame your response.';
      }

      questions.push({
        id: qId,
        order: i + 1,
        category,
        targetRole,
        difficulty,
        topic,
        questionText,
        scenario,
        expectedCriteria: [
          'Conceptual depth and clarity of explanation',
          'Awareness of computational and operational trade-offs',
          'Concrete examples and structural coherence',
        ],
        maxScore: 100,
      });
    }

    return questions;
  }

  public async evaluateAnswers(
    category: InterviewCategory,
    targetRole: string,
    difficulty: SkillLevel,
    questions: GeneratedQuestion[],
    answers: Record<string, string>
  ): Promise<FullEvaluationResult> {
    const singleEvals: SingleEvaluation[] = [];
    let totalScoreSum = 0;

    for (const q of questions) {
      const rawAnswer = answers[q.id] || '';
      const wordCount = rawAnswer.trim().split(/\s+/).filter(Boolean).length;

      const isSubstantive = wordCount >= 30;
      const isDetailed = wordCount >= 75;

      const baseScore = isDetailed ? 82 : isSubstantive ? 68 : 45;

      const criteria: CriterionScore[] = [
        {
          name: 'Technical Depth & Core Foundations',
          score: Math.min(100, baseScore + (rawAnswer.toLowerCase().includes('trade-off') ? 8 : 0)),
          maxScore: 100,
          feedback: isSubstantive
            ? 'Demonstrated solid grasp of key mechanisms and architectural terminology.'
            : 'Response lacked concrete technical definitions; elaborate on underlying mechanisms.',
        },
        {
          name: 'Clarity, Structure & Communication',
          score: Math.min(100, baseScore + (wordCount > 50 ? 6 : -5)),
          maxScore: 100,
          feedback: isDetailed
            ? 'Clear exposition with structured progression of thought.'
            : 'Answer was brief; structure responses with defined rationale and context.',
        },
      ];

      const qScore = Math.round(
        criteria.reduce((sum, c) => sum + c.score, 0) / criteria.length
      );
      totalScoreSum += qScore;

      singleEvals.push({
        questionId: q.id,
        questionText: q.questionText,
        studentAnswer: rawAnswer,
        overallScore: qScore,
        criteria,
        strengths: [
          isSubstantive
            ? 'Addressed core premise directly with relevant role-specific perspective.'
            : 'Participated with initial conceptual baseline.',
        ],
        improvements: [
          isDetailed
            ? 'Quantify performance metrics or explicit boundary conditions.'
            : 'Provide deeper technical trade-offs and concrete implementation examples.',
        ],
        modelAnswerSnippet: `An exemplar answer for "${q.topic}" defines core principles, evaluates memory/compute constraints, and outlines failure recovery.`,
        evaluatedAt: new Date().toISOString(),
      });
    }

    const overallScore = Math.round(totalScoreSum / Math.max(1, questions.length));

    let performanceTier: 'Exceptional' | 'Strong' | 'Developing' | 'Needs Practice' = 'Developing';
    if (overallScore >= 85) performanceTier = 'Exceptional';
    else if (overallScore >= 70) performanceTier = 'Strong';
    else if (overallScore >= 50) performanceTier = 'Developing';
    else performanceTier = 'Needs Practice';

    const criteriaBreakdown: CriterionScore[] = [
      {
        name: 'Technical & Domain Precision',
        score: Math.min(100, overallScore + 2),
        maxScore: 100,
        feedback: 'Evaluation of foundational domain knowledge and system accuracy.',
      },
      {
        name: 'Analytical Reasoning & Trade-Offs',
        score: overallScore,
        maxScore: 100,
        feedback: 'Evaluation of candidate trade-off awareness, edge cases, and architectural trade-offs.',
      },
      {
        name: 'Structure & Communication Efficacy',
        score: Math.max(40, overallScore - 3),
        maxScore: 100,
        feedback: 'Evaluation of clarity, conciseness, and structured response methodology.',
      },
    ];

    return {
      overallScore,
      performanceTier,
      criteriaBreakdown,
      questionEvaluations: singleEvals,
      topStrengths: [
        'Direct engagement with prompt context and industry fundamentals.',
        'Clear communicative intent tailored to the target role.',
      ],
      criticalImprovements: [
        'Deepen architectural trade-offs between competing approaches.',
        'Reference concrete operational constraints (e.g., latency, throughput, scale).',
      ],
      actionableNextSteps: [
        'Practice algorithmic problem solving and time complexity in Nexora CodeLab.',
        'Review database normalization and indexing strategies.',
        'Rehearse STAR structured responses for behavioral scenarios.',
      ],
      isMockAI: true,
      disclaimer:
        'AI evaluation provides rubric-based practice feedback for personal skill development. It represents diagnostic guidance rather than formal employment guarantees.',
    };
  }
}
