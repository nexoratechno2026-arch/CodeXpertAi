import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ExternalLink } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Badge } from '@/components/ui/Badge';
import { getBreadcrumbSchema, getFAQPageSchema } from '@/lib/seo';
import styles from './FAQ.module.css';

interface FAQEntry {
  id: string;
  category: 'general' | 'codelab' | 'interview' | 'account';
  question: string;
  directAnswer: string;
  detail: React.ReactNode;
  plainDetail: string;
}

export const FAQ_ENTRIES: FAQEntry[] = [
  {
    id: 'what-is-codexpertai',
    category: 'general',
    question: 'What is CodeXpertAI?',
    directAnswer:
      'CodeXpertAI is a unified developer platform that combines structured coding practice with AI-guided technical mock interviews.',
    plainDetail:
      'The platform brings together an interactive coding workspace (CodeLab) and an AI-driven interview evaluation system (InterviewAI) into a single, cohesive environment. It allows software developers to practice algorithmic challenges and simulate authentic hiring interviews without switching between disparate tools.',
    detail: (
      <p>
        The platform brings together an interactive coding workspace (<Link to="/codelab" className={styles.inlineLink}>CodeLab</Link>) and an AI-driven interview evaluation system (<Link to="/interview" className={styles.inlineLink}>InterviewAI</Link>) into a single, cohesive environment. It allows software developers to practice algorithmic challenges and simulate authentic hiring interviews without switching between disparate tools.
      </p>
    ),
  },
  {
    id: 'who-created-codexpertai',
    category: 'general',
    question: 'Who created CodeXpertAI?',
    directAnswer:
      'CodeXpertAI was created and published by Nexora Techno, an innovative technology solutions and software engineering enterprise.',
    plainDetail:
      'Nexora Techno engineered CodeXpertAI to provide students and professional engineers with an authentic, production-grade technical interview readiness environment.',
    detail: (
      <p>
        Nexora Techno engineered CodeXpertAI to provide students and professional engineers with an authentic, production-grade technical interview readiness environment. For more information about the creator, visit{' '}
        <a href="https://nexoratechno.in" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
          Nexora Techno Corporate <ExternalLink size={11} style={{ display: 'inline' }} />
        </a>.
      </p>
    ),
  },
  {
    id: 'is-codexpertai-a-product-of-nexora-techno',
    category: 'general',
    question: 'Is CodeXpertAI a product of Nexora Techno?',
    directAnswer:
      'Yes. CodeXpertAI is an official software product developed and maintained by Nexora Techno.',
    plainDetail:
      'The platform operates under the Nexora Techno product umbrella while maintaining its own dedicated developer application experience and specialized educational tooling.',
    detail: (
      <p>
        The platform operates under the Nexora Techno product umbrella while maintaining its own dedicated developer application experience and specialized educational tooling.
      </p>
    ),
  },
  {
    id: 'what-is-codelab',
    category: 'codelab',
    question: 'What is CodeLab?',
    directAnswer:
      'CodeLab is CodeXpertAI\'s structured programming practice module designed for algorithmic mastery.',
    plainDetail:
      'It features a catalog of curated programming challenges across 14 computer science domains, an in-browser Monaco code editor, sandboxed code execution, sample test cases, and private automated evaluation test suites.',
    detail: (
      <p>
        It features a catalog of curated programming challenges across 14 computer science domains, an in-browser Monaco code editor, sandboxed code execution, sample test cases, and private automated evaluation test suites.
      </p>
    ),
  },
  {
    id: 'what-is-interviewai',
    category: 'interview',
    question: 'What is InterviewAI?',
    directAnswer:
      'InterviewAI is CodeXpertAI\'s intelligent technical mock interview simulator.',
    plainDetail:
      'It replicates real technical hiring loops across five core tracks: Technical Concepts, Live Coding, System Architecture, SQL & Databases, and STAR Behavioral scenarios. It features real-time audio interaction, adaptive follow-up questioning, and comprehensive feedback reports.',
    detail: (
      <p>
        It replicates real technical hiring loops across five core tracks: Technical Concepts, Live Coding, System Architecture, SQL &amp; Databases, and STAR Behavioral scenarios. It features real-time audio interaction, adaptive follow-up questioning, and comprehensive feedback reports.
      </p>
    ),
  },
  {
    id: 'how-coding-practice-works',
    category: 'codelab',
    question: 'How does coding practice work on CodeXpertAI?',
    directAnswer:
      'You select a problem from the CodeLab catalog, implement your algorithmic logic in the Monaco code editor, and verify your solution against unit test suites.',
    plainDetail:
      'Each challenge provides detailed problem descriptions, constraints, examples, and time/memory limits. You can test code incrementally with visible sample cases before final submission against comprehensive hidden test cases.',
    detail: (
      <p>
        Each challenge provides detailed problem descriptions, constraints, examples, and time/memory limits. You can test code incrementally with visible sample cases before final submission against comprehensive hidden test cases.
      </p>
    ),
  },
  {
    id: 'can-users-execute-code-and-review-tests',
    category: 'codelab',
    question: 'Can users execute code and review test results?',
    directAnswer:
      'Yes. CodeXpertAI provides true server-side sandboxed code compilation and execution with granular test results.',
    plainDetail:
      'When you click "Run Code", the platform executes your logic against visible test cases and returns execution time, memory usage, stdout, and assertion results. When you click "Submit", it runs your code against private test suites to verify edge cases and algorithmic time complexity.',
    detail: (
      <p>
        When you click &ldquo;Run Code&rdquo;, the platform executes your logic against visible test cases and returns execution time, memory usage, stdout, and assertion results. When you click &ldquo;Submit&rdquo;, it runs your code against private test suites to verify edge cases and algorithmic time complexity.
      </p>
    ),
  },
  {
    id: 'how-ai-mock-interviews-work',
    category: 'interview',
    question: 'How do AI-guided mock interviews work?',
    directAnswer:
      'InterviewAI pairs you with a simulated AI technical interviewer that asks contextual questions, listens to your explanations, and adapts to your answers in real time.',
    plainDetail:
      'Sessions support microphone voice streaming or text input, alongside a synchronized coding scratchpad. The AI analyzes your communication, problem decomposition, code correctness, and system design trade-offs, delivering an objective rubric report upon session conclusion.',
    detail: (
      <p>
        Sessions support microphone voice streaming or text input, alongside a synchronized coding scratchpad. The AI analyzes your communication, problem decomposition, code correctness, and system design trade-offs, delivering an objective rubric report upon session conclusion.
      </p>
    ),
  },
  {
    id: 'supported-programming-languages',
    category: 'codelab',
    question: 'Which programming languages are supported?',
    directAnswer:
      'CodeLab supports Python 3, JavaScript (Node.js), TypeScript, Java, C++, Go, and ANSI SQL.',
    plainDetail:
      'Each language runs inside a containerized sandbox with standardized memory and timeout boundaries matching industry competitive programming standards.',
    detail: (
      <p>
        Each language runs inside a containerized sandbox with standardized memory and timeout boundaries matching industry competitive programming standards.
      </p>
    ),
  },
  {
    id: 'is-user-account-required',
    category: 'account',
    question: 'Is a user account required?',
    directAnswer:
      'A free student account is required to execute code, save problem submissions, track learning streaks, and configure InterviewAI mock sessions.',
    plainDetail:
      'Public informational pages, engineering guides, problem catalogs, and FAQ resources are openly accessible without requiring sign-in.',
    detail: (
      <p>
        Public informational pages, engineering guides, problem catalogs, and FAQ resources are openly accessible without requiring sign-in. You can sign up with email and password or use Google Sign-In.
      </p>
    ),
  },
  {
    id: 'how-interview-feedback-generated',
    category: 'interview',
    question: 'How is interview feedback generated?',
    directAnswer:
      'Feedback is evaluated using structured, rubric-based assessment models applied directly to the transcript and code submissions.',
    plainDetail:
      'The system assesses technical correctness, algorithmic efficiency, communication clarity, and problem-solving structure (such as STAR method adherence), producing score breakdowns and concrete improvement advice.',
    detail: (
      <p>
        The system assesses technical correctness, algorithmic efficiency, communication clarity, and problem-solving structure (such as STAR method adherence), producing score breakdowns and concrete improvement advice.
      </p>
    ),
  },
  {
    id: 'contact-support-report-problem',
    category: 'general',
    question: 'How can users report a problem or contact support?',
    directAnswer:
      'Users can contact developer support by emailing support@codexpertai.in, connecting via Instagram @codexpertai_nt, or visiting the Nexora Techno corporate portal.',
    plainDetail:
      'Send technical queries or bug reports to support@codexpertai.in. For official announcements and updates, follow @codexpertai_nt on Instagram (https://www.instagram.com/codexpertai_nt/). You can also visit https://nexoratechno.in for corporate inquiries.',
    detail: (
      <p>
        Send technical questions, bug reports, or platform feedback directly to{' '}
        <a href="mailto:support@codexpertai.in" className={styles.inlineLink}>
          support@codexpertai.in
        </a>
        . Follow official product updates and engineering tips on Instagram at{' '}
        <a href="https://www.instagram.com/codexpertai_nt/" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
          @codexpertai_nt <ExternalLink size={11} style={{ display: 'inline' }} />
        </a>
        . For institutional partnerships and corporate inquiries, visit{' '}
        <a href="https://nexoratechno.in" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
          Nexora Techno <ExternalLink size={11} style={{ display: 'inline' }} />
        </a>
        .
      </p>
    ),
  },
];

export const FAQPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'codelab' | 'interview' | 'account'>('all');

  const filteredFaqs = selectedCategory === 'all'
    ? FAQ_ENTRIES
    : FAQ_ENTRIES.filter((f) => f.category === selectedCategory);

  const breadcrumbData = getBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'FAQ', item: '/faq' },
  ]);

  const faqSchemaData = getFAQPageSchema(
    FAQ_ENTRIES.map((f) => ({
      question: f.question,
      answer: `${f.directAnswer} ${f.plainDetail}`,
    }))
  );

  return (
    <div className={styles.faqPage}>
      <SEOHead
        title="Frequently Asked Questions – CodeXpertAI"
        description="Find answers to common questions about CodeXpertAI, CodeLab coding challenges, InterviewAI mock interview simulations, and platform features."
        canonicalPath="/faq"
        jsonLd={[breadcrumbData, faqSchemaData]}
      />

      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-primary)' }}>FAQ</span>
        </nav>

        {/* Header Banner */}
        <header className={styles.headerCard}>
          <div className={styles.badgeRow}>
            <Badge variant="accent" size="sm">Knowledge Base</Badge>
            <Badge variant="default" size="sm">Official Answers</Badge>
          </div>
          <h1 className={styles.title}>
            Frequently Asked <span className={styles.titleAccent}>Questions</span>
          </h1>
          <p className={styles.subtitle}>
            Direct, factual answers to essential questions regarding CodeXpertAI, CodeLab problem solving, InterviewAI mock evaluations, supported technologies, and our creator, Nexora Techno.
          </p>
        </header>

        {/* Category Filter Tabs */}
        <div className={styles.filterRow} role="tablist" aria-label="FAQ Categories">
          <button
            type="button"
            className={`${styles.filterBtn} ${selectedCategory === 'all' ? styles.filterBtnActive : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Questions ({FAQ_ENTRIES.length})
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${selectedCategory === 'general' ? styles.filterBtnActive : ''}`}
            onClick={() => setSelectedCategory('general')}
          >
            General &amp; Brand
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${selectedCategory === 'codelab' ? styles.filterBtnActive : ''}`}
            onClick={() => setSelectedCategory('codelab')}
          >
            CodeLab Practice
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${selectedCategory === 'interview' ? styles.filterBtnActive : ''}`}
            onClick={() => setSelectedCategory('interview')}
          >
            InterviewAI
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${selectedCategory === 'account' ? styles.filterBtnActive : ''}`}
            onClick={() => setSelectedCategory('account')}
          >
            Accounts &amp; Access
          </button>
        </div>

        {/* FAQ Accordion / Item List */}
        <div className={styles.faqList}>
          {filteredFaqs.map((faq) => (
            <article key={faq.id} className={styles.faqItem}>
              <div className={styles.questionHeader}>
                <HelpCircle size={20} className={styles.questionIcon} />
                <h2 className={styles.questionTitle}>{faq.question}</h2>
              </div>
              <div className={styles.directAnswer}>
                {faq.directAnswer}
              </div>
              <div className={styles.answerBody}>
                {faq.detail}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
