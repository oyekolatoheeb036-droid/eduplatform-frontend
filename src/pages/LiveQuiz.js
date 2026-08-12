import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../AuthContext';

const API_URL = 'https://eduplatform-api-pol1.onrender.com';

// ── Design tokens (Enhanced for 3D) ──
const colors = {
  navy: '#1E2A78',
  navyDark: '#162060',
  amber: '#F59E0B',
  amberDark: '#B45309',
  bg: '#F0F2F8',
  cardBg: '#FFFFFF',
  border: '#E4E7F2',
  textDark: '#1A1F36',
  textMuted: '#6B7280',
  correct: '#16A34A',
  incorrect: '#DC2626',
};

const styles = {
  page: {
    minHeight: '80vh',
    background: `linear-gradient(135deg, ${colors.bg} 0%, #E0E5F0 100%)`,
    padding: '40px 16px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    perspective: '1000px',
  },
  container: {
    maxWidth: '640px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    marginBottom: '28px',
    textAlign: 'center',
  },
  eyebrow: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: colors.amber,
    marginBottom: '8px',
    display: 'inline-block',
    padding: '4px 12px',
    background: '#FFF7E8',
    borderRadius: '20px',
    border: '1px solid rgba(245, 158, 11, 0.2)',
  },
  title: {
    fontSize: '32px',
    fontWeight: 800,
    color: colors.navy,
    margin: 0,
    textShadow: '1px 1px 0px rgba(255,255,255,1), 2px 2px 4px rgba(30, 42, 120, 0.1)',
  },
  subtitle: {
    fontSize: '15px',
    color: colors.textMuted,
    marginTop: '8px',
  },
  card: {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '24px',
    boxShadow: '0 10px 30px rgba(30, 42, 120, 0.08), 0 4px 12px rgba(30, 42, 120, 0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  topicGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  topicButton: (selected) => ({
    padding: '16px',
    borderRadius: '12px',
    border: `1.5px solid ${selected ? colors.navy : colors.border}`,
    background: selected ? `linear-gradient(145deg, ${colors.navy}, ${colors.navyDark})` : '#fff',
    color: selected ? '#fff' : colors.textDark,
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
    boxShadow: selected 
      ? '0 6px 12px rgba(30, 42, 120, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)' 
      : '0 4px 0 rgba(30, 42, 120, 0.1), 0 2px 4px rgba(0,0,0,0.05)',
    transform: selected ? 'translateY(2px)' : 'translateY(0)',
    transition: 'all 0.2s ease',
  }),
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: `1.5px solid ${colors.border}`,
    fontSize: '14px',
    marginTop: '8px',
    boxSizing: 'border-box',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
    transition: 'border 0.2s, box-shadow 0.2s',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: colors.textDark,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  timerRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px',
  },
  timerButton: (selected) => ({
    padding: '10px 16px',
    borderRadius: '10px',
    border: `1.5px solid ${selected ? colors.amber : colors.border}`,
    background: selected ? colors.amber : '#fff',
    color: selected ? '#fff' : colors.textDark,
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: selected 
      ? '0 4px 8px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)' 
      : '0 3px 0 rgba(0,0,0,0.08)',
    transform: selected ? 'translateY(2px)' : 'translateY(0)',
    transition: 'all 0.2s',
  }),
  primaryButton: {
    marginTop: '24px',
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    background: `linear-gradient(145deg, ${colors.amber}, #D97706)`,
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 5px 0 #B45309, 0 10px 20px rgba(245, 158, 11, 0.3)',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'translateY(4px)',
    boxShadow: '0 1px 0 #B45309',
  },
  errorText: {
    color: colors.incorrect,
    fontSize: '13px',
    marginTop: '12px',
    fontWeight: '500',
    background: '#FEF1F1',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(220, 38, 38, 0.1)',
  },
  scoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    background: '#F7F8FC',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #E4E7F2',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
  },
  playerScore: {
    textAlign: 'center',
  },
  scoreValue: {
    fontSize: '36px',
    fontWeight: 800,
    color: colors.navy,
    lineHeight: 1,
    textShadow: '1px 1px 0 rgba(255,255,255,1)',
  },
  scoreLabel: {
    fontSize: '12px',
    color: colors.textMuted,
    marginTop: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
  },
  vs: {
    fontSize: '14px',
    color: colors.amber,
    fontWeight: 700,
    background: '#FFF7E8',
    padding: '8px 14px',
    borderRadius: '20px',
    border: '1px solid rgba(245, 158, 11, 0.2)',
  },
  timerBar: {
    height: '10px',
    background: '#E4E7F2',
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '24px',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
  },
  timerFill: (pct) => ({
    height: '100%',
    width: `${pct}%`,
    background: pct > 50 
      ? `linear-gradient(90deg, ${colors.amber}, #FBBF24)` 
      : pct > 20 
        ? `linear-gradient(90deg, #DC2626, ${colors.amber})` 
        : `linear-gradient(90deg, #991B1B, ${colors.incorrect})`,
    boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
    transition: 'width 1s linear, background 0.5s ease',
  }),
  questionText: {
    fontSize: '20px',
    fontWeight: 700,
    color: colors.textDark,
    marginBottom: '24px',
    lineHeight: 1.4,
  },
  optionButton: (state) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    textAlign: 'left',
    padding: '16px 18px',
    borderRadius: '12px',
    border: `1.5px solid ${
      state === 'correct' ? colors.correct :
      state === 'incorrect' ? colors.incorrect :
      state === 'selected' ? colors.navy : colors.border
    }`,
    background:
      state === 'correct' ? '#EFFCF3' :
      state === 'incorrect' ? '#FEF1F1' :
      state === 'selected' ? '#F0F1FA' : '#fff',
    color: colors.textDark,
    fontSize: '15px',
    marginBottom: '12px',
    cursor: 'pointer',
    fontWeight: 500,
    boxShadow: state 
      ? `inset 0 4px 8px rgba(0,0,0,0.05)` 
      : '0 4px 0 rgba(30, 42, 120, 0.1), 0 2px 4px rgba(0,0,0,0.03)',
    transform: state ? 'translateY(2px)' : 'translateY(0)',
    transition: 'all 0.2s ease',
  }),
  resultBanner: (won) => ({
    textAlign: 'center',
    padding: '36px 24px',
    borderRadius: '16px',
    background: won === true 
      ? `linear-gradient(145deg, #EFFCF3, #D1FAE5)` 
      : won === false 
        ? `linear-gradient(145deg, #FEF1F1, #FEE2E2)` 
        : `linear-gradient(145deg, #FFF7E8, #FEF3C7)`,
    marginBottom: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
    border: '1px solid rgba(0,0,0,0.05)',
  }),
  resultTitle: (won) => ({
    fontSize: '28px',
    fontWeight: 800,
    color: won === true ? colors.correct : won === false ? colors.incorrect : '#92640A',
    margin: 0,
    textShadow: '1px 1px 0 rgba(255,255,255,1)',
  }),
  pendingCard: {
    background: 'linear-gradient(145deg, #FFF7E8, #FFF)',
    border: `1.5px solid ${colors.amber}`,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    boxShadow: '0 4px 0 rgba(245, 158, 11, 0.2), 0 10px 20px rgba(0,0,0,0.05)',
  },
  pendingText: {
    fontSize: '14px',
    color: colors.textDark,
    fontWeight: 500,
  },
  acceptButton: {
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    background: `linear-gradient(145deg, ${colors.navy}, ${colors.navyDark})`,
    color: '#fff',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 0 #0F1845, 0 6px 12px rgba(30, 42, 120, 0.3)',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
};

const TOPICS = [
  'Quadratic Equations',
  'Linear Equations',
  'Set Theory',
];

const TIMER_OPTIONS = [10, 15, 30, 60];

function LiveQuiz() {
  const { user } = useAuth();
  const socketRef = useRef(null);

  // duel setup
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [opponentEmail, setOpponentEmail] = useState('');
  const [selectedTimer, setSelectedTimer] = useState(15);
  const [creating, setCreating] = useState(false);
  const [setupError, setSetupError] = useState(null);

  // duel state
  const [duel, setDuel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerState, setAnswerState] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [screen, setScreen] = useState('setup');
  const [result, setResult] = useState(null);
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);

  const questionStartRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const isChallenger = duel && user && duel.challenger_id === user.id;

  const fetchPending = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/duels/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingChallenges(res.data.pending);
    } catch (err) {
      // Non-fatal — just means the pending list stays empty
    } finally {
      setLoadingPending(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchPending();
  }, [user, fetchPending]);

  useEffect(() => {
    const socket = io(API_URL);
    socketRef.current = socket;

    if (user) {
      socket.emit('duel:register', { userId: user.id });
    }

    socket.on('duel:invite', (payload) => {
      fetchPending();
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadDuel = useCallback(async (duelId) => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/api/duels/${duelId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDuel(res.data.duel);
    setQuestions(res.data.questions);
    return res.data;
  }, []);

  const handleChallenge = async () => {
    setSetupError(null);
    if (!selectedTopic) {
      setSetupError('Pick a topic first.');
      return;
    }
    if (!opponentEmail.trim()) {
      setSetupError("Enter your opponent's email.");
      return;
    }
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/duels/challenge`,
        {
          opponentEmail: opponentEmail.trim(),
          topic: selectedTopic,
          timePerQuestionSeconds: selectedTimer,
          numQuestions: 10,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDuel(res.data.duel);
      socketRef.current.emit('duel:join', { duelId: res.data.duel.id });
      setScreen('waiting');
    } catch (err) {
      setSetupError(err.response?.data?.error || 'Could not send the challenge.');
    } finally {
      setCreating(false);
    }
  };

  const acceptDuel = async (duelId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/duels/${duelId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socketRef.current.emit('duel:join', { duelId });
      const data = await loadDuel(duelId);
      setCurrentIndex(0);
      startQuestion(0, data.duel.time_per_question_seconds);
      setScreen('active');
    } catch (err) {
      setSetupError(err.response?.data?.error || 'Could not accept the duel.');
    }
  };

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleStart = async (payload) => {
      await loadDuel(payload.duelId);
      setCurrentIndex(0);
      startQuestion(0, payload.timePerQuestionSeconds);
      setScreen('active');
    };

    const handleScoreUpdate = (payload) => {
      if (!user) return;
      if (payload.userId === user.id) {
        setMyScore(payload.newScore);
      } else {
        setOpponentScore(payload.newScore);
      }
    };

    const handleEnd = (payload) => {
      clearInterval(timerIntervalRef.current);
      setResult(payload);
      setScreen('result');
    };

    socket.on('duel:start', handleStart);
    socket.on('duel:score_update', handleScoreUpdate);
    socket.on('duel:end', handleEnd);

    return () => {
      socket.off('duel:start', handleStart);
      socket.off('duel:score_update', handleScoreUpdate);
      socket.off('duel:end', handleEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadDuel]);

  const startQuestion = (index, seconds) => {
    setSelectedAnswer(null);
    setAnswerState(null);
    questionStartRef.current = Date.now();
    setTimeLeft(seconds);
    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = async (letter) => {
    if (selectedAnswer || !questions[currentIndex]) return;
    setSelectedAnswer(letter);
    clearInterval(timerIntervalRef.current);

    const timeTakenMs = Date.now() - questionStartRef.current;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/duels/${duel.id}/answer`,
        {
          questionId: questions[currentIndex].id,
          selectedAnswer: letter,
          timeTakenMs,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnswerState(res.data.isCorrect ? 'correct' : 'incorrect');
      setMyScore(res.data.newScore);

      setTimeout(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < questions.length) {
          setCurrentIndex(nextIndex);
          startQuestion(nextIndex, duel.time_per_question_seconds);
        }
      }, 1200);
    } catch (err) {
      setSetupError(err.response?.data?.error || 'Could not submit your answer.');
    }
  };

  useEffect(() => {
    if (screen === 'active' && timeLeft === 0 && !selectedAnswer) {
      handleAnswer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <p style={{ textAlign: 'center', color: colors.textMuted }}>
              You need to be logged in to play a Live Quiz duel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        .nf-3d-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 0 rgba(30, 42, 120, 0.1), 0 8px 15px rgba(0,0,0,0.08) !important;
        }
        .nf-3d-btn:active:not(:disabled) {
          transform: translateY(2px) !important;
          box-shadow: 0 2px 0 rgba(30, 42, 120, 0.1) !important;
        }
        .nf-primary-3d:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 7px 0 #B45309, 0 12px 24px rgba(245, 158, 11, 0.4) !important;
        }
        .nf-primary-3d:active:not(:disabled) {
          transform: translateY(4px) !important;
          box-shadow: 0 1px 0 #B45309 !important;
        }
        .nf-accept-3d:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 0 #0F1845, 0 10px 20px rgba(30, 42, 120, 0.4) !important;
        }
        .nf-accept-3d:active:not(:disabled) {
          transform: translateY(4px) !important;
          box-shadow: 0 1px 0 #0F1845 !important;
        }
        input:focus {
          border-color: ${colors.amber} !important;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2) !important;
        }
      `}</style>

      <div style={styles.container}>

        {screen === 'setup' && (
          <>
            {!loadingPending && pendingChallenges.map((challenge) => (
              <div key={challenge.id} style={styles.pendingCard}>
                <div style={styles.pendingText}>
                  <strong>{challenge.challenger_name}</strong> challenged you to a{' '}
                  <strong>{challenge.topic}</strong> duel ({challenge.time_per_question_seconds}s/question)
                </div>
                <button
                  className="nf-accept-3d"
                  style={styles.acceptButton}
                  onClick={() => acceptDuel(challenge.id)}
                >
                  Accept
                </button>
              </div>
            ))}

            <div style={styles.header}>
              <div style={styles.eyebrow}>⚡ Live Quiz</div>
              <h1 style={styles.title}>Challenge a Friend</h1>
              <p style={styles.subtitle}>Pick a topic, set your timer, and duel it out live.</p>
            </div>

            <div style={styles.card}>
              <div style={styles.label}>Select Topic</div>
              <div style={styles.topicGrid}>
                {TOPICS.map((topic) => (
                  <button
                    key={topic}
                    className="nf-3d-btn"
                    style={styles.topicButton(selectedTopic === topic)}
                    onClick={() => setSelectedTopic(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.label}>Opponent's Email</div>
              <input
                style={styles.input}
                placeholder="e.g. chidinma@example.com"
                type="email"
                value={opponentEmail}
                onChange={(e) => setOpponentEmail(e.target.value)}
              />

              <div style={{ ...styles.label, marginTop: '24px' }}>Time per Question</div>
              <div style={styles.timerRow}>
                {TIMER_OPTIONS.map((secs) => (
                  <button
                    key={secs}
                    className="nf-3d-btn"
                    style={styles.timerButton(selectedTimer === secs)}
                    onClick={() => setSelectedTimer(secs)}
                  >
                    {secs}s
                  </button>
                ))}
              </div>

              <button
                className="nf-primary-3d"
                style={{
                  ...styles.primaryButton,
                  ...(creating ? styles.disabledButton : {}),
                }}
                onClick={handleChallenge}
                disabled={creating}
              >
                {creating ? 'Sending challenge…' : 'Send Challenge 🚀'}
              </button>

              {setupError && <div style={styles.errorText}>{setupError}</div>}
            </div>
          </>
        )}

        {screen === 'waiting' && (
          <div style={{ ...styles.card, textAlign: 'center' }}>
            <h2 style={{ color: colors.navy, marginTop: 0, fontSize: '24px' }}>Waiting for Opponent…</h2>
            <p style={{ color: colors.textMuted, fontSize: '15px' }}>
              You challenged <strong>{opponentEmail}</strong> to a {selectedTopic} duel
              ({selectedTimer}s per question). The duel starts as soon as they accept.
            </p>
          </div>
        )}

        {screen === 'active' && questions[currentIndex] && (
          <div style={styles.card}>
            <div style={styles.scoreRow}>
              <div style={styles.playerScore}>
                <div style={styles.scoreValue}>{myScore}</div>
                <div style={styles.scoreLabel}>You</div>
              </div>
              <div style={styles.vs}>Q{currentIndex + 1} / {questions.length}</div>
              <div style={styles.playerScore}>
                <div style={styles.scoreValue}>{opponentScore}</div>
                <div style={styles.scoreLabel}>Opponent</div>
              </div>
            </div>

            <div style={styles.timerBar}>
              <div style={styles.timerFill(
                duel ? (timeLeft / duel.time_per_question_seconds) * 100 : 100
              )} />
            </div>

            <div style={styles.questionText}>{questions[currentIndex].question_text}</div>

            {['A', 'B', 'C', 'D'].map((letter) => {
              const optionText = questions[currentIndex][`option_${letter.toLowerCase()}`];
              let state = null;
              if (selectedAnswer && letter === selectedAnswer) {
                state = answerState === 'correct' ? 'correct' : 'incorrect';
              }
              return (
                <button
                  key={letter}
                  className="nf-3d-btn"
                  style={styles.optionButton(state)}
                  onClick={() => handleAnswer(letter)}
                  disabled={!!selectedAnswer}
                >
                  <strong style={{ marginRight: '10px', color: colors.amber }}>{letter}.</strong> {optionText}
                </button>
              );
            })}
          </div>
        )}

        {screen === 'result' && result && (
          <>
            <div style={styles.resultBanner(
              result.winnerId === user.id ? true :
              result.winnerId === null ? null : false
            )}>
              <h2 style={styles.resultTitle(
                result.winnerId === user.id ? true :
                result.winnerId === null ? null : false
              )}>
                {result.winnerId === user.id ? '🎉 You won!' :
                 result.winnerId === null ? "🤝 It's a tie!" :
                 'Better luck next time'}
              </h2>
            </div>
            <div style={styles.card}>
              <div style={styles.scoreRow}>
                <div style={styles.playerScore}>
                  <div style={styles.scoreValue}>
                    {isChallenger ? result.challengerScore : result.opponentScore}
                  </div>
                  <div style={styles.scoreLabel}>You</div>
                </div>
                <div style={styles.vs}>Final Score</div>
                <div style={styles.playerScore}>
                  <div style={styles.scoreValue}>
                    {isChallenger ? result.opponentScore : result.challengerScore}
                  </div>
                  <div style={styles.scoreLabel}>Opponent</div>
                </div>
              </div>
              <button
                className="nf-primary-3d"
                style={styles.primaryButton}
                onClick={() => {
                  setScreen('setup');
                  setDuel(null);
                  setQuestions([]);
                  setResult(null);
                  setMyScore(0);
                  setOpponentScore(0);
                }}
              >
                Duel Again 🔁
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default LiveQuiz;