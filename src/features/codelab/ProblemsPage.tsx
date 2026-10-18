import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Code2,
  Inbox,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { SKILL_LEVELS, SkillLevel, getSkillLevelLabel } from '@/types/skill';
import { CODELAB_TOPICS, Problem } from '@/types/codelab';
import { ProgrammingLanguage } from '@/types/user';
import { getProblems, getSubmissionsForUser } from '@/services/codelabService';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Codelab.module.css';

export const ProblemsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<SkillLevel | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string | 'all'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | 'all'>('all');
  const [selectedCompanyPattern, setSelectedCompanyPattern] = useState<string | 'all'>('all');
  
  const [problems, setProblems] = useState<Problem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(new Set());

  // Fetch problems when filters change
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const res = await getProblems({
        searchTerm,
        difficulty: selectedDifficulty,
        topicId: selectedTopic,
        language: selectedLanguage,
        companyPattern: selectedCompanyPattern,
        pageSize: 50,
      });

      if (isMounted) {
        setProblems(res.problems);
        setTotalCount(res.totalCount);
        setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [searchTerm, selectedDifficulty, selectedTopic, selectedLanguage, selectedCompanyPattern]);

  // Load user's solved status
  useEffect(() => {
    async function checkSolved() {
      if (user) {
        const subs = await getSubmissionsForUser(user.uid);
        const solved = new Set(
          subs.filter((s) => s.verdict === 'accepted').map((s) => s.problemId)
        );
        setSolvedProblemIds(solved);
      }
    }
    checkSolved();
  }, [user]);

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Coding Problem Library</h1>
          <p className={styles.desc}>
            Explore algorithmic assessments classified across 5 skill levels and 14 technical domains.
          </p>
        </div>
        <Badge variant="accent" size="sm">{totalCount} Problems Available</Badge>
      </div>

      {/* Filter Toolbar */}
      <Card className={styles.toolbarCard} padding="sm">
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search problems by title, tag, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterDropdowns}>
            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as SkillLevel | 'all')}
              className={styles.select}
              aria-label="Filter by difficulty"
            >
              <option value="all">All Difficulties</option>
              {SKILL_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>

            {/* Topic Filter */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className={styles.select}
              aria-label="Filter by topic"
            >
              <option value="all">All Topics (14 Domains)</option>
              {CODELAB_TOPICS.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>

            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as ProgrammingLanguage | 'all')}
              className={styles.select}
              aria-label="Filter by language"
            >
              <option value="all">All Languages</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="sql">SQL</option>
            </select>

            {/* Company-Style Pattern Filter */}
            <select
              value={selectedCompanyPattern}
              onChange={(e) => setSelectedCompanyPattern(e.target.value)}
              className={styles.select}
              aria-label="Filter by company-style pattern"
            >
              <option value="all">All Practice Patterns</option>
              <option value="Google-Style">Google-Style Patterns</option>
              <option value="Amazon-Style">Amazon-Style Patterns</option>
              <option value="Meta-Style">Meta-Style Patterns</option>
              <option value="Microsoft-Style">Microsoft-Style Patterns</option>
              <option value="Apple-Style">Apple-Style Patterns</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Provenance & Academic Integrity Notice */}
      <div style={{ padding: '8px 14px', background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.18)', borderRadius: '8px', fontSize: '0.75rem', color: '#93c5fd', marginBottom: '16px', lineHeight: 1.5 }}>
        <strong>Company-Style Practice Pattern Note:</strong> Practice questions tagged with company patterns reflect algorithmic paradigms (e.g. Sliding Window, Monotonic Stacks, Bitwise Partitioning) commonly assessed across top engineering teams. They do not imply endorsement, sponsorship, or official affiliation with any company.
      </div>

      {/* Problem Listing Table */}
      <Card padding="none" className={styles.tableCard}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Spinner size="md" label="Loading problems..." />
          </div>
        ) : (
          <table className={styles.problemTable}>
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Problem Title</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Acceptance</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((prob) => {
                const isSolved = solvedProblemIds.has(prob.id);
                const rate =
                  prob.submissionCount > 0
                    ? `${Math.round((prob.acceptedCount / prob.submissionCount) * 100)}%`
                    : '65%';

                return (
                  <tr key={prob.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.probTitleCell}>
                        <Code2 size={16} className={styles.probIcon} />
                        <div>
                          <Link
                            to={`/codelab/problems/${prob.slug}`}
                            className={styles.probTitle}
                            style={{ textDecoration: 'none' }}
                          >
                            {prob.title}
                          </Link>
                          {prob.companyPatterns && prob.companyPatterns.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                              {prob.companyPatterns.map((cp) => (
                                <span
                                  key={cp}
                                  style={{
                                    fontSize: '0.625rem',
                                    color: '#60a5fa',
                                    background: 'rgba(59, 130, 246, 0.12)',
                                    border: '1px solid rgba(59, 130, 246, 0.25)',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {cp}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.probTopic}>{prob.topicName}</span>
                    </td>
                    <td>
                      <Badge variant={prob.difficulty} size="sm">
                        {getSkillLevelLabel(prob.difficulty)}
                      </Badge>
                    </td>
                    <td>
                      <span className={styles.probRate}>{rate}</span>
                    </td>
                    <td>
                      {isSolved ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ade80', fontSize: '0.75rem' }}>
                          <CheckCircle size={14} />
                          <span>Solved</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem' }}>Unsolved</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/codelab/problems/${prob.slug}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          rightIcon={<ArrowRight size={12} />}
                        >
                          Solve
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {problems.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyTd}>
                    <Inbox size={24} />
                    <span>No problems found matching the selected filters.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};
