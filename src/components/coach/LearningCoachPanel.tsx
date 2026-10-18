import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CoachMessage, PRESET_COACH_PROMPTS } from '@/types/coach';
import {
  queryLearningCoach,
  getCachedCoachHistory,
  saveCoachHistory,
} from '@/services/coachService';
import { UnifiedSkillAssessmentReport } from '@/services/skillEngine';
import { useAuth } from '@/contexts/AuthContext';
import styles from './LearningCoachPanel.module.css';

interface LearningCoachPanelProps {
  assessment: UnifiedSkillAssessmentReport | null;
}

export const LearningCoachPanel: React.FC<LearningCoachPanelProps> = ({ assessment }) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize coach history
  useEffect(() => {
    if (!user) return;
    const history = getCachedCoachHistory(user.uid);
    if (history.length > 0) {
      setMessages(history);
    } else {
      // Seed welcome greeting
      const welcomeMsg: CoachMessage = {
        id: 'msg_welcome',
        sender: 'coach',
        text: `Hi ${profile?.fullName || 'Student'}! I am your AI Learning Coach.
I continuously analyze your verified CodeLab execution results and InterviewAI rubric scorecards to help you identify learning gaps and choose your next best practice tasks.

Select a quick question below or ask me anything about your progress!`,
        timestamp: new Date().toISOString(),
        isFallbackMode: true,
      };
      setMessages([welcomeMsg]);
      saveCoachHistory(user.uid, [welcomeMsg]);
    }
  }, [user, profile]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || !user || !assessment) return;

    const userMsg: CoachMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputText('');
    setIsThinking(true);

    try {
      const response = await queryLearningCoach(user.uid, queryText, assessment, profile);
      const updatedHistory = [...nextMessages, response];
      setMessages(updatedHistory);
      saveCoachHistory(user.uid, updatedHistory);
    } catch (err) {
      console.warn('[LearningCoachPanel] Query error:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendQuery(inputText);
  };

  return (
    <div className={styles.coachContainer}>
      {/* Header */}
      <div className={styles.coachHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.botIconCircle}>
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className={styles.coachTitle}>AI Learning Coach</h3>
            <p className={styles.coachSub}>Grounded in your real CodeLab & InterviewAI records</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="accent" size="sm">Grounded Intelligence</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!user) return;
              setMessages([]);
              localStorage.removeItem(`nexora_coach_history_${user.uid}`);
            }}
            title="Reset Coach Conversation"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Quick Questions Bar */}
      <div className={styles.quickPromptsRow}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
          Suggested:
        </span>
        {PRESET_COACH_PROMPTS.map((qp) => (
          <button
            key={qp.id}
            className={styles.quickPromptBtn}
            onClick={() => handleSendQuery(qp.prompt)}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className={styles.messagesList}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${isUser ? styles.messageRowUser : styles.messageRowCoach}`}
            >
              <div className={isUser ? styles.bubbleUser : styles.bubbleCoach}>
                {msg.text}

                {/* Grounded Action Recommendations */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className={styles.actionsGrid}>
                    {msg.suggestedActions.slice(0, 2).map((action) => (
                      <div key={action.id} className={styles.actionCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Badge variant={action.difficulty} size="sm">
                            {action.difficulty.toUpperCase()}
                          </Badge>
                          <span className={styles.actionTitle}>{action.title}</span>
                        </div>
                        <p className={styles.actionReason}>{action.reason}</p>
                        <Link to={action.actionUrl} style={{ textDecoration: 'none' }}>
                          <Button variant="primary" size="sm" rightIcon={<ArrowRight size={12} />}>
                            {action.actionLabel}
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className={styles.messageTime}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {isThinking && (
          <div className={`${styles.messageRow} ${styles.messageRowCoach}`}>
            <div className={styles.bubbleCoach}>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>
                Analyzing submission data and verifying rubric criteria...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          className={styles.chatInput}
          placeholder="Ask coach (e.g. 'What should I practise today?', 'Help me with SQL')..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value.slice(0, 500))}
        />
        <Button variant="primary" size="sm" type="submit" leftIcon={<Send size={14} />} disabled={!inputText.trim() || isThinking}>
          Ask
        </Button>
      </form>
    </div>
  );
};
