import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  ArrowLeft,
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  Layers,
  ChevronDown,
  ChevronRight,
  FileText,
  Code2,
  Terminal,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { getProblemBySlug, getSubmissionsForUser } from '@/services/codelabService';
import { executeCode } from '@/services/executionService';
import {
  Problem,
  ExecutionResult,
  Submission,
} from '@/types/codelab';
import { ProgrammingLanguage } from '@/types/user';
import { getSkillLevelLabel } from '@/types/skill';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Workspace.module.css';

export const ProblemWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>('python');
  const [code, setCode] = useState<string>('');
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'submissions' | 'hints'>('description');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'tests' | 'output'>('tests');
  const [activeHintIndex, setActiveHintIndex] = useState<number | null>(null);
  
  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [pastSubmissions, setPastSubmissions] = useState<Submission[]>([]);

  // Mobile viewport layout switcher ('problem' | 'editor' | 'console')
  const [mobilePane, setMobilePane] = useState<'problem' | 'editor' | 'console'>('problem');

  // Load Problem Data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!slug) return;
      setLoading(true);
      const prob = await getProblemBySlug(slug);
      if (isMounted) {
        setProblem(prob);
        if (prob) {
          const defaultLang = prob.supportedLanguages[0] || 'python';
          setSelectedLanguage(defaultLang);
          setCode(prob.starterCode[defaultLang] || '');
        }
        setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Load Past Submissions
  useEffect(() => {
    async function loadSubmissions() {
      if (user && problem) {
        const subs = await getSubmissionsForUser(user.uid, problem.id);
        setPastSubmissions(subs);
      }
    }
    loadSubmissions();
  }, [user, problem, executionResult]);

  // Handle Language Change
  const handleLanguageChange = (newLang: ProgrammingLanguage) => {
    if (!problem) return;
    const starter = problem.starterCode[newLang] || '';
    if (code.trim() && code !== problem.starterCode[selectedLanguage]) {
      if (
        window.confirm(
          `Switching to ${newLang} will replace your current editor content with ${newLang} starter code. Continue?`
        )
      ) {
        setSelectedLanguage(newLang);
        setCode(starter);
      }
    } else {
      setSelectedLanguage(newLang);
      setCode(starter);
    }
  };

  // Reset Code
  const handleResetCode = () => {
    if (!problem) return;
    if (
      window.confirm(
        'Are you sure you want to reset code? All unsubmitted changes in the editor will be lost.'
      )
    ) {
      setCode(problem.starterCode[selectedLanguage] || '');
    }
  };

  // Run Code (Public Examples)
  const handleRunCode = async () => {
    if (!problem) return;
    setIsExecuting(true);
    setExecutionResult(null);

    try {
      if (typeof window !== 'undefined' && window.innerWidth <= 960) {
        setMobilePane('console');
      }
      const result = await executeCode({
        problemId: problem.id,
        language: selectedLanguage,
        code,
        operation: 'run',
      });
      setExecutionResult(result);
      setActiveConsoleTab('tests');
    } catch (err: any) {
      setExecutionResult({
        verdict: 'internal_error',
        status: 'error',
        operation: 'run',
        runtimeMs: null,
        memoryKB: null,
        totalTests: 0,
        passedTests: 0,
        testCaseResults: [],
        isMockExecution: false,
        message: err.message || 'Execution failed',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Submit Code (Private Test Suite)
  const handleSubmitCode = async () => {
    if (!problem) return;
    setIsExecuting(true);
    setExecutionResult(null);

    try {
      if (typeof window !== 'undefined' && window.innerWidth <= 960) {
        setMobilePane('console');
      }
      const result = await executeCode({
        problemId: problem.id,
        language: selectedLanguage,
        code,
        operation: 'submit',
      });
      setExecutionResult(result);
      setActiveConsoleTab('tests');
    } catch (err: any) {
      setExecutionResult({
        verdict: 'internal_error',
        status: 'error',
        operation: 'submit',
        runtimeMs: null,
        memoryKB: null,
        totalTests: 0,
        passedTests: 0,
        testCaseResults: [],
        isMockExecution: false,
        message: err.message || 'Submission failed',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.workspaceRoot} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="lg" label="Loading CodeLab problem environment..." />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className={styles.workspaceRoot} style={{ alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <AlertTriangle size={36} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <h2>Problem Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          The requested problem slug "{slug}" does not exist in the published catalog.
        </p>
        <Link to="/codelab/problems">
          <Button variant="primary" leftIcon={<ArrowLeft size={16} />}>
            Back to Problem Library
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.workspaceRoot}>
      {/* Header */}
      <header className={styles.workspaceHeader}>
        <div className={styles.headerLeft}>
          <Link to="/codelab/problems" className={styles.backBtn} title="Back to Problem Library">
            <ArrowLeft size={16} />
            <span>Problems</span>
          </Link>
          <span style={{ color: 'var(--color-border-strong)' }}>|</span>
          <h1 className={styles.problemTitle}>{problem.title}</h1>
          <div className={styles.headerBadges}>
            <Badge variant={problem.difficulty} size="sm">
              {getSkillLevelLabel(problem.difficulty)}
            </Badge>
            <Badge variant="default" size="sm">
              {problem.topicName}
            </Badge>
          </div>
        </div>

        <div className={styles.headerRight}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Play size={14} />}
            onClick={handleRunCode}
            disabled={isExecuting}
          >
            Run
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Send size={14} />}
            onClick={handleSubmitCode}
            disabled={isExecuting}
            isLoading={isExecuting}
          >
            Submit
          </Button>
        </div>
      </header>

      {/* Mobile Screen Pane Switcher (< 960px) */}
      <div className={styles.mobilePaneSwitcher}>
        <button
          type="button"
          className={`${styles.mobileSwitcherBtn} ${mobilePane === 'problem' ? styles.mobileSwitcherBtnActive : ''}`}
          onClick={() => setMobilePane('problem')}
        >
          <FileText size={14} />
          <span>Description</span>
        </button>
        <button
          type="button"
          className={`${styles.mobileSwitcherBtn} ${mobilePane === 'editor' ? styles.mobileSwitcherBtnActive : ''}`}
          onClick={() => setMobilePane('editor')}
        >
          <Code2 size={14} />
          <span>Code Editor</span>
        </button>
        <button
          type="button"
          className={`${styles.mobileSwitcherBtn} ${mobilePane === 'console' ? styles.mobileSwitcherBtnActive : ''}`}
          onClick={() => setMobilePane('console')}
        >
          <Terminal size={14} />
          <span>Console & Tests {executionResult ? `(${executionResult.passedTests}/${executionResult.totalTests})` : ''}</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className={styles.workspaceBody}>
        {/* Left Pane: Description & Submissions */}
        <section className={`${styles.leftPane} ${mobilePane !== 'problem' ? styles.leftPaneMobileHidden : ''}`}>
          <div className={styles.paneTabBar}>
            <button
              className={`${styles.paneTab} ${activeLeftTab === 'description' ? styles.paneTabActive : ''}`}
              onClick={() => setActiveLeftTab('description')}
            >
              Description
            </button>
            <button
              className={`${styles.paneTab} ${activeLeftTab === 'submissions' ? styles.paneTabActive : ''}`}
              onClick={() => setActiveLeftTab('submissions')}
            >
              Submissions ({pastSubmissions.length})
            </button>
            <button
              className={`${styles.paneTab} ${activeLeftTab === 'hints' ? styles.paneTabActive : ''}`}
              onClick={() => setActiveLeftTab('hints')}
            >
              Hints ({problem.hints?.length || 0})
            </button>
          </div>

          <div className={styles.paneContent}>
            {activeLeftTab === 'description' && (
              <>
                <div className={styles.descriptionText}>{problem.description}</div>

                <div className={styles.sectionHeading}>Input Format</div>
                <div className={styles.specBlock}>{problem.inputFormat}</div>

                <div className={styles.sectionHeading}>Output Format</div>
                <div className={styles.specBlock}>{problem.outputFormat}</div>

                <div className={styles.sectionHeading}>Constraints</div>
                <div className={styles.specBlock}>{problem.constraints}</div>

                <div className={styles.sectionHeading}>Examples</div>
                {problem.examples.map((ex, idx) => (
                  <div key={idx} className={styles.exampleCard}>
                    <div className={styles.exampleTitle}>Example {idx + 1}</div>
                    <div className={styles.exampleRow}>
                      <span className={styles.exampleLabel}>Input</span>
                      <pre className={styles.exampleCode}>{ex.input}</pre>
                    </div>
                    <div className={styles.exampleRow}>
                      <span className={styles.exampleLabel}>Expected Output</span>
                      <pre className={styles.exampleCode}>{ex.output}</pre>
                    </div>
                    {ex.explanation && (
                      <div className={styles.exampleRow}>
                        <span className={styles.exampleLabel}>Explanation</span>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                          {ex.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {activeLeftTab === 'submissions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {pastSubmissions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)' }}>
                    No previous submissions for this problem yet. Run or submit your solution to view history.
                  </div>
                ) : (
                  pastSubmissions.map((sub) => (
                    <div key={sub.id} className={styles.subItem}>
                      <div>
                        <div
                          className={styles.subVerdict}
                          style={{
                            color: sub.verdict === 'accepted' ? '#4ade80' : '#f87171',
                            textTransform: 'uppercase',
                          }}
                        >
                          {sub.verdict?.replace('_', ' ') || 'Pending'}
                        </div>
                        <div className={styles.subMeta}>
                          {sub.language} • {new Date(sub.submittedAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                        <div>{sub.runtimeMs ? `${sub.runtimeMs} ms` : '-'}</div>
                        <div>{sub.memoryKB ? `${Math.round(sub.memoryKB / 1024)} MB` : '-'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeLeftTab === 'hints' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {(!problem.hints || problem.hints.length === 0) ? (
                  <div style={{ color: 'var(--color-text-tertiary)' }}>No hints available for this problem.</div>
                ) : (
                  problem.hints.map((hint, idx) => {
                    const isOpen = activeHintIndex === idx;
                    return (
                      <div key={idx} className={styles.hintCard}>
                        <button
                          className={styles.hintToggle}
                          onClick={() => setActiveHintIndex(isOpen ? null : idx)}
                        >
                          <span>Hint {idx + 1}</span>
                          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        {isOpen && <div className={styles.hintBody}>{hint}</div>}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right Pane: Monaco Editor & Console */}
        <section className={`${styles.rightPane} ${mobilePane === 'problem' ? styles.rightPaneMobileHidden : ''}`}>
          {/* Editor Toolbar */}
          <div className={styles.editorToolbar}>
            <div className={styles.languageSelectGroup}>
              <Layers size={14} style={{ color: 'var(--color-text-tertiary)' }} />
              <select
                className={styles.languageSelect}
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value as ProgrammingLanguage)}
              >
                {problem.supportedLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RotateCcw size={12} />}
              onClick={handleResetCode}
              title="Reset to starter code template"
            >
              Reset
            </Button>
          </div>

          {/* Monaco Editor Mount */}
          <div className={styles.editorContainer}>
            <Editor
              height="100%"
              language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontFamily: "'JetBrains Mono', Consolas, monospace",
                fontSize: 13,
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                tabSize: selectedLanguage === 'python' ? 4 : 2,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Execution Result Console */}
          <div className={`${styles.consolePanel} ${mobilePane === 'editor' ? styles.consolePanelMobileHidden : ''}`}>
            <div className={styles.consoleHeader}>
              <div className={styles.consoleTabs}>
                <button
                  className={`${styles.consoleTab} ${activeConsoleTab === 'tests' ? styles.consoleTabActive : ''}`}
                  onClick={() => setActiveConsoleTab('tests')}
                >
                  Test Cases {executionResult ? `(${executionResult.passedTests}/${executionResult.totalTests})` : ''}
                </button>
                <button
                  className={`${styles.consoleTab} ${activeConsoleTab === 'output' ? styles.consoleTabActive : ''}`}
                  onClick={() => setActiveConsoleTab('output')}
                >
                  Console Output
                </button>
              </div>

              {isExecuting && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', color: '#60a5fa' }}>
                  <Spinner size="sm" />
                  <span>Executing in sandbox...</span>
                </div>
              )}
            </div>

            <div className={styles.consoleBody}>
              {executionResult?.isMockExecution && (
                <div className={styles.sandboxNotice}>
                  <strong>Development Sandbox Notice:</strong> Local simulation mode active. Results are validated against sample test suites. Upstream Judge0 isolated sandbox credentials can be configured in Cloud Secret Manager.
                </div>
              )}

              {executionResult && (
                <div
                  className={`${styles.verdictBanner} ${
                    executionResult.verdict === 'accepted' ? styles.verdictAccepted : styles.verdictFailed
                  }`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {executionResult.verdict === 'accepted' ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    <span>
                      {executionResult.verdict.toUpperCase().replace(/_/g, ' ')}
                      {executionResult.operation === 'run' ? ' (Public Examples)' : ' (Submission)'}
                    </span>
                  </div>

                  <div className={styles.verdictMetrics}>
                    {executionResult.runtimeMs !== null && (
                      <span title="Execution Runtime">
                        <Clock size={12} style={{ display: 'inline', marginRight: 2 }} />
                        {executionResult.runtimeMs} ms
                      </span>
                    )}
                    {executionResult.memoryKB !== null && (
                      <span title="Memory Consumed">
                        <Cpu size={12} style={{ display: 'inline', marginRight: 2 }} />
                        {Math.round(executionResult.memoryKB / 1024)} MB
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Tests Tab */}
              {activeConsoleTab === 'tests' && (
                <div className={styles.testCaseCards}>
                  {!executionResult && !isExecuting && (
                    <div style={{ color: 'var(--color-text-tertiary)', padding: 'var(--space-2)' }}>
                      Click <strong>Run</strong> to test against public examples, or <strong>Submit</strong> to evaluate against the complete automated test suite.
                    </div>
                  )}

                  {executionResult?.testCaseResults.map((tc, idx) => (
                    <div key={tc.testCaseId || idx} className={styles.tcCard}>
                      <div className={styles.tcCardHeader}>
                        <span className={styles.tcTitle}>
                          Case {idx + 1} {tc.isPublic ? '(Public)' : '(Hidden Test)'}
                        </span>
                        <Badge variant={tc.passed ? 'success' : 'error'} size="sm">
                          {tc.passed ? 'Passed' : 'Failed'}
                        </Badge>
                      </div>

                      {tc.isPublic && tc.input && (
                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.6875rem', marginTop: 2 }}>
                          <span style={{ color: 'var(--color-text-tertiary)' }}>Input:</span>
                          <code style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            {tc.input.replace(/\n/g, ' ')}
                          </code>
                        </div>
                      )}

                      {!tc.isPublic && (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                          Inputs and expected outputs for hidden test cases are protected to preserve academic integrity.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Raw Output Tab */}
              {activeConsoleTab === 'output' && (
                <pre
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: executionResult?.compileOutput ? '#f87171' : 'var(--color-text-secondary)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {executionResult?.compileOutput ||
                    executionResult?.message ||
                    'No console output captured.'}
                </pre>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
