import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  ArrowLeft,
  Clock,
  Cpu,
  Code2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Submission } from '@/types/codelab';
import { getSubmissionsForUser } from '@/services/codelabService';
import { formatProgrammingLanguage } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Codelab.module.css';

const ITEMS_PER_PAGE = 10;

export const SubmissionsPage: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [verdictFilter, setVerdictFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;
    async function loadSubs() {
      if (user) {
        setLoading(true);
        const list = await getSubmissionsForUser(user.uid);
        if (isMounted) {
          setSubmissions(list);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    loadSubs();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchLang = languageFilter === 'all' || (sub.language || '').toLowerCase() === languageFilter;
      const matchVerdict = verdictFilter === 'all' || (sub.verdict || '').toLowerCase() === verdictFilter;
      return matchLang && matchVerdict;
    });
  }, [submissions, languageFilter, verdictFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [languageFilter, verdictFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE));
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSubmissions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSubmissions, currentPage]);

  const getVerdictBadge = (verdict: string | null) => {
    switch (verdict) {
      case 'accepted':
        return <Badge variant="success" size="sm">ACCEPTED</Badge>;
      case 'wrong_answer':
        return <Badge variant="error" size="sm">WRONG ANSWER</Badge>;
      case 'time_limit_exceeded':
        return <Badge variant="warning" size="sm">TIME LIMIT EXCEEDED</Badge>;
      case 'memory_limit_exceeded':
        return <Badge variant="warning" size="sm">MEMORY LIMIT EXCEEDED</Badge>;
      case 'compilation_error':
        return <Badge variant="error" size="sm">COMPILATION ERROR</Badge>;
      default:
        return <Badge variant="default" size="sm">{verdict ? verdict.toUpperCase().replace(/_/g, ' ') : 'PENDING'}</Badge>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Submission History</h1>
          <p className={styles.desc}>
            Review past solution evaluations, sandboxed execution runtimes, verdicts, and memory consumption.
          </p>
        </div>
        <Link to="/codelab/problems">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Back to Problems
          </Button>
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Spinner size="md" label="Loading submission history..." />
        </div>
      ) : submissions.length === 0 ? (
        <Card padding="lg" className={styles.emptyCard}>
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIconCircle}>
              <Inbox size={32} />
            </div>
            <h2 className={styles.emptyHeading}>No Submissions Found</h2>
            <p className={styles.emptyParagraph}>
              You have not submitted any solutions yet. Explore our problem library, open a challenge,
              and click &quot;Submit&quot; to test your code against private automated test suites.
            </p>
            <div className={styles.emptyActions}>
              <Link to="/codelab/problems">
                <Button variant="primary">Explore Problems</Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Filters Bar */}
          <div className={styles.filtersBar}>
            <div className={styles.filtersGroup}>
              <span className={styles.filterLabel}>
                <Filter size={13} />
                Filters:
              </span>
              <select
                className={styles.filterSelect}
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                aria-label="Filter by language"
              >
                <option value="all">All Languages</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="go">Go</option>
                <option value="sql">SQL</option>
              </select>

              <select
                className={styles.filterSelect}
                value={verdictFilter}
                onChange={(e) => setVerdictFilter(e.target.value)}
                aria-label="Filter by verdict"
              >
                <option value="all">All Verdicts</option>
                <option value="accepted">Accepted</option>
                <option value="wrong_answer">Wrong Answer</option>
                <option value="time_limit_exceeded">Time Limit Exceeded</option>
                <option value="memory_limit_exceeded">Memory Limit Exceeded</option>
                <option value="compilation_error">Compilation Error</option>
              </select>
            </div>

            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
              Showing {filteredSubmissions.length} of {submissions.length} submissions
            </span>
          </div>

          <Card padding="none" className={styles.tableCard}>
            <table className={styles.problemTable}>
              <thead>
                <tr>
                  <th style={{ width: '32%' }}>Problem</th>
                  <th>Verdict</th>
                  <th>Language</th>
                  <th>Runtime</th>
                  <th>Memory</th>
                  <th>Tests Passed</th>
                  <th style={{ textAlign: 'right' }}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)' }}>
                      No submissions match the selected filters.
                    </td>
                  </tr>
                ) : (
                  paginatedSubmissions.map((sub) => (
                    <tr key={sub.id} className={styles.tableRow}>
                      <td>
                        <div className={styles.probTitleCell}>
                          <Code2 size={16} className={styles.probIcon} />
                          <Link
                            to={`/codelab/problems/${sub.problemSlug || ''}`}
                            className={styles.probTitle}
                            style={{ textDecoration: 'none' }}
                          >
                            {sub.problemTitle || 'Challenge Problem'}
                          </Link>
                        </div>
                      </td>
                      <td>{getVerdictBadge(sub.verdict)}</td>
                      <td>
                        <Badge variant="default" size="sm">
                          {formatProgrammingLanguage(sub.language)}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          <Clock size={12} color="var(--color-text-tertiary)" />
                          <span>{typeof sub.runtimeMs === 'number' ? `${sub.runtimeMs} ms` : '-'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          <Cpu size={12} color="var(--color-text-tertiary)" />
                          <span>{typeof sub.memoryKB === 'number' ? `${Math.round(sub.memoryKB / 1024)} MB` : '-'}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          {sub.passedCount ?? 0} / {sub.totalCount ?? 0}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--color-text-tertiary)', fontSize: '0.75rem' }}>
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className={styles.paginationBar}>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className={styles.paginationControls}>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    leftIcon={<ChevronLeft size={14} />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    rightIcon={<ChevronRight size={14} />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

