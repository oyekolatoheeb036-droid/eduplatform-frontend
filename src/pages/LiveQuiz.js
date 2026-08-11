import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../AuthContext';

const API_URL = process.env.REACT_APP_API_URL;

// ── Design tokens (matches Navbar.js) ──
const colors = {
  navy: '#1E2A78',
  navyDark: '#162060',
  amber: '#F59E0B',
  bg: '#F7F8FC',
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
    background: colors.bg,
    padding: '32px 16px',
    fontFamily: 'inherit',
  },
  container: {
    maxWidth: '640px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '24px',
  },
  eyebrow: {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: colors.amber,
    marginBottom: '6px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 600,
    color: colors.navy,
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: colors.textMuted,
    marginTop: '6px',
  },
  card: {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: '14px',
    padding: '24px',
    marginBottom: '16px',
  },
  topicGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '10px',
    marginTop: '14px',
  },
  topicButton: (selected) => ({
    padding: '14px',
    borderRadius: '10px',
    border: `1.5px solid ${selected ? colors.navy : colors.border}`,
    background: selected ? colors.navy : '#fff',
    color: selected ? '#fff' : colors.textDark,
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
  }),
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: `1.5px solid ${colors.border}`,
    fontSize: '14px',
    marginTop: '6px',
    boxSizing: 'border-box',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: colors.textDark,
  },
  timerRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '6px',
  },
  timerButton: (selected) => ({
    padding: '8px 14px',
    borderRadius: '8px',
    border: `1.5px solid ${selected ? colors.amber : colors.border}`,
    background: selected ? '#FFF7E8' : '#fff',
    color: selected ? '#92640A' : colors.textDark,
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  }),
  primaryButton: {
    marginTop: '18px',
    width: '100%',
    padding: '13px',
    borderRadius: '10px',
    border: 'none',
    background: colors.amber,
    color: colors.navy,
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  errorText: {
    color: colors.incorrect,
    fontSize: '13px',
    marginTop: '10px',
  },
  scoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
  },
  playerScore: {
    textAlign: 'center',
  },
  scoreValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: colors.navy,
  },
  scoreLabel: {
    fontSize: '12px',
    color: colors.textMuted,
    marginTop: '2px',
  },
  vs: {
    fontSize: '13px',
    color: colors.textMuted,
    fontWeight: 500,
  },
  timerBar: {
    height: '6px',
    background: colors.border,
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '18px',
  },
  timerFill: (pct) => ({
    height: '100%',
    width: `${pct}%`,
    background: pct > 30 ? colors.amber : colors.incorrect,
    transition: 'width 1s linear',
  }),
  questionText: {
    fontSize: '18px',
    fontWeight: 600,
    color: colors.textDark,
    marginBottom: '18px',
  },
  optionButton: (state) => ({
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '14px',
    borderRadius: '10px',
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
    fontSize: '14px',
    marginBottom: '10px',
    cursor: 'pointer',
  }),
  resultBanner: (won) => ({
    textAlign: 'center',
    padding: '28px 20px',
    borderRadius: '14px',
    background: won === true ? '#EFFCF3' : won === false ? '#FEF1F1' : '#FFF7E8',
    marginBottom: '18px',
  }),
  resultTitle: (won) => ({
    fontSize: '22px',
    fontWeight: 700,
    color: won === true ? colors.correct : won === false ? colors.incorrect : '#92640A',
    margin: 0,
  }),
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

  const questionStartRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const isChallenger = duel && user && duel.challenger_id === user.id;

  useEffect(() => {
    const socket = io(API_URL);
    socketRef.current = socket;

    if (user) {
      socket.emit('duel:register', { userId: user.id });
    }

    socket.on('duel:invite', (payload) => {
      const accept = window.confirm(
        `${payload.fromName} challenged you to a ${payload.topic} duel! Accept?`
      );
      if (accept) {
        acceptDuel(payload.duelId);
      }
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
          <p>You need to be logged in to play a Live Quiz duel.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {screen === 'setup' && (
          <>
            <div style={styles.header}>
              <div style={styles.eyebrow}>Live Quiz</div>
              <h1 style={styles.title}>Challenge a friend</h1>
              <p style={styles.subtitle}>Pick a topic, set your timer, and duel it out live.</p>
            </div>

            <div style={styles.card}>
              <div style={styles.label}>Topic</div>
              <div style={styles.topicGrid}>
                {TOPICS.map((topic) => (
                  <button
                    key={topic}
                    style={styles.topicButton(selectedTopic === topic)}
                    onClick={() => setSelectedTopic(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.label}>Opponent's email</div>
              <input
                style={styles.input}
                placeholder="e.g. chidinma@example.com"
                type="email"
                value={opponentEmail}
                onChange={(e) => setOpponentEmail(e.target.value)}
              />

              <div style={{ ...styles.label, marginTop: '18px' }}>Time per question</div>
              <div style={styles.timerRow}>
                {TIMER_OPTIONS.map((secs) => (
                  <button
                    key={secs}
                    style={styles.timerButton(selectedTimer === secs)}
                    onClick={() => setSelectedTimer(secs)}
                  >
                    {secs}s
                  </button>
                ))}
              </div>

              <button
                style={{
                  ...styles.primaryButton,
                  ...(creating ? styles.disabledButton : {}),
                }}
                onClick={handleChallenge}
                disabled={creating}
              >
                {creating ? 'Sending challenge…' : 'Send challenge'}
              </button>

              {setupError && <div style={styles.errorText}>{setupError}</div>}
            </div>
          </>
        )}

        {screen === 'waiting' && (
          <div style={styles.card}>
            <h2 style={{ color: colors.navy, marginTop: 0 }}>Waiting for opponent…</h2>
            <p style={{ color: colors.textMuted, fontSize: '14px' }}>
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
                  style={styles.optionButton(state)}
                  onClick={() => handleAnswer(letter)}
                  disabled={!!selectedAnswer}
                >
                  <strong>{letter}.</strong> {optionText}
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
                <div style={styles.vs}>Final score</div>
                <div style={styles.playerScore}>
                  <div style={styles.scoreValue}>
                    {isChallenger ? result.opponentScore : result.challengerScore}
                  </div>
                  <div style={styles.scoreLabel}>Opponent</div>
                </div>
              </div>
              <button
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
                Duel again
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default LiveQuiz;