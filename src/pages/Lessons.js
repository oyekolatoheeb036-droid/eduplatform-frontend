import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  Box, Typography, Card, CardContent, Button, Divider,
  LinearProgress, Chip, TextField, IconButton, CircularProgress,
  useMediaQuery, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const API = 'https://eduplatform-api-pol1.onrender.com';

const sectionTypes = [
  { type: 'introduction', label: '📖 Introduction', color: '#1a237e' },
  { type: 'learn', label: '📚 Learn', color: '#0288d1' },
  { type: 'relate', label: '🔗 Relate', color: '#4caf50' },
  { type: 'quiz', label: '📝 Quiz', color: '#ff6f00' },
  { type: 'dive_deeper', label: '🤖 Dive Deeper', color: '#9c27b0' },
];

function getSectionLabel(type) {
  return sectionTypes.find(s => s.type === type)?.label || type;
}
function getSectionColor(type) {
  return sectionTypes.find(s => s.type === type)?.color || '#666';
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    if (url.includes('youtube.com/embed/')) return url;
    let videoId = null;
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) videoId = shortMatch[1];
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) videoId = watchMatch[1];
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) videoId = shortsMatch[1];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return null;
  } catch { return null; }
}

// ── Inline renderer: bold, italic, inline math ──
function renderInline(text) {
  if (!text) return null;
  const parts = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Inline math $...$
    const inlineMathMatch = remaining.match(/^\$([^$]+)\$/);
    if (inlineMathMatch) {
      try {
        parts.push(<InlineMath key={keyIndex++} math={inlineMathMatch[1]} />);
      } catch {
        parts.push(<span key={keyIndex++} style={{ color: 'red' }}>Invalid math</span>);
      }
      remaining = remaining.slice(inlineMathMatch[0].length);
      continue;
    }

    // Bold **text**
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={keyIndex++} style={{ fontWeight: '700' }}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic *text*
    const italicMatch = remaining.match(/^\*(.+?)\*/);
    if (italicMatch) {
      parts.push(<em key={keyIndex++}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Plain text
    const nextSpecial = remaining.search(/\$|\*|\[/);
    if (nextSpecial === -1) {
      parts.push(<span key={keyIndex++}>{remaining}</span>);
      remaining = '';
    } else if (nextSpecial === 0) {
      parts.push(<span key={keyIndex++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    } else {
      parts.push(<span key={keyIndex++}>{remaining.slice(0, nextSpecial)}</span>);
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts;
}

// ── Main content renderer ──
function renderContent(content) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (line.trim() === '') {
      elements.push(<Box key={`space-${i}`} style={{ height: '10px' }} />);
      i++;
      continue;
    }

    // Heading 1 — # Heading
    if (line.startsWith('# ')) {
      elements.push(
        <Typography key={i} style={{
          fontWeight: '800', fontSize: '24px', color: '#0a0a0a',
          marginTop: '28px', marginBottom: '10px', lineHeight: '1.3',
          fontFamily: "'Space Grotesk', sans-serif"
        }}>
          {renderInline(line.slice(2))}
        </Typography>
      );
      i++;
      continue;
    }

    // Heading 2 — ## Heading
    if (line.startsWith('## ')) {
      elements.push(
        <Typography key={i} style={{
          fontWeight: '800', fontSize: '20px', color: '#1a237e',
          marginTop: '22px', marginBottom: '8px', lineHeight: '1.3',
          fontFamily: "'Space Grotesk', sans-serif"
        }}>
          {renderInline(line.slice(3))}
        </Typography>
      );
      i++;
      continue;
    }

    // Heading 3 — ### Heading
    if (line.startsWith('### ')) {
      elements.push(
        <Typography key={i} style={{
          fontWeight: '700', fontSize: '17px', color: '#333',
          marginTop: '18px', marginBottom: '6px', lineHeight: '1.3',
          fontFamily: "'Space Grotesk', sans-serif"
        }}>
          {renderInline(line.slice(4))}
        </Typography>
      );
      i++;
      continue;
    }

    // Horizontal rule ---
    if (line.trim() === '---') {
      elements.push(<Divider key={i} style={{ margin: '20px 0' }} />);
      i++;
      continue;
    }

    // Block math $$ ... $$ on one line
    if (line.startsWith('$$') && line.endsWith('$$') && line.length > 4) {
      try {
        elements.push(
          <Box key={i} style={{ margin: '16px 0', overflowX: 'auto' }}>
            <BlockMath math={line.slice(2, -2)} />
          </Box>
        );
      } catch {
        elements.push(<span key={i} style={{ color: 'red' }}>Invalid equation</span>);
      }
      i++;
      continue;
    }

    // Block math $$ ... $$ multi-line
    if (line.trim() === '$$') {
      i++;
      const mathLines = [];
      while (i < lines.length && lines[i].trim() !== '$$') {
        mathLines.push(lines[i]);
        i++;
      }
      i++; // skip closing $$
      try {
        elements.push(
          <Box key={i} style={{ margin: '16px 0', overflowX: 'auto' }}>
            <BlockMath math={mathLines.join('\n')} />
          </Box>
        );
      } catch {
        elements.push(<span key={i} style={{ color: 'red' }}>Invalid equation</span>);
      }
      continue;
    }

    // Bullet list - or •
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const bulletLines = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('• '))) {
        bulletLines.push(lines[i].startsWith('- ') ? lines[i].slice(2) : lines[i].slice(2));
        i++;
      }
      elements.push(
        <Box key={`ul-${i}`} component="ul" style={{ paddingLeft: '24px', margin: '8px 0 16px 0' }}>
          {bulletLines.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '6px' }}>
              <Typography variant="body1" style={{
                fontSize: '17px', lineHeight: '1.85', color: '#333',
                fontFamily: "'Inter', sans-serif"
              }}>
                {renderInline(item)}
              </Typography>
            </li>
          ))}
        </Box>
      );
      continue;
    }

    // Numbered list 1. 2. 3.
    if (/^\d+\.\s/.test(line)) {
      const numberedLines = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        numberedLines.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <Box key={`ol-${i}`} component="ol" style={{ paddingLeft: '24px', margin: '8px 0 16px 0' }}>
          {numberedLines.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '6px' }}>
              <Typography variant="body1" style={{
                fontSize: '17px', lineHeight: '1.85', color: '#333',
                fontFamily: "'Inter', sans-serif"
              }}>
                {renderInline(item)}
              </Typography>
            </li>
          ))}
        </Box>
      );
      continue;
    }

    // Blockquote > text
    if (line.startsWith('> ')) {
      elements.push(
        <Box key={i} style={{
          borderLeft: '4px solid #1a237e', paddingLeft: '16px',
          margin: '12px 0', backgroundColor: '#f5f7ff', borderRadius: '0 8px 8px 0', padding: '12px 16px'
        }}>
          <Typography variant="body1" style={{
            fontSize: '17px', lineHeight: '1.85', color: '#1a237e', fontStyle: 'italic',
            fontFamily: "'Inter', sans-serif"
          }}>
            {renderInline(line.slice(2))}
          </Typography>
        </Box>
      );
      i++;
      continue;
    }

    // Image [IMAGE:url]
    const imageMatch = line.match(/^\[IMAGE:(.*)\]$/);
    if (imageMatch) {
      elements.push(
        <Box key={i} style={{ margin: '16px 0' }}>
          <img src={imageMatch[1]} alt="lesson content"
            style={{ maxWidth: '100%', borderRadius: '10px', display: 'block', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }} />
        </Box>
      );
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <Typography key={i} variant="body1" style={{
        fontSize: '17px', lineHeight: '1.9', color: '#333',
        marginBottom: '6px', fontFamily: "'Inter', sans-serif"
      }}>
        {renderInline(line)}
      </Typography>
    );
    i++;
  }

  return elements;
}

// ── Q&A Component ──
const QASection = ({ lessonId, sectionId, studentId, studentName, bodyFont, fontStyle, isMobile }) => {
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const fetchMyQuestions = () => {
    if (sectionId && studentId) {
      axios.get(`${API}/api/questions/section/${sectionId}/student/${studentId}`)
        .then(res => setQuestions(res.data))
        .catch(err => console.log(err));
    }
  };

  useEffect(() => { fetchMyQuestions(); }, [sectionId, studentId]);

  const handleSubmit = async () => {
    if (!questionText.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/questions`, {
        lesson_id: lessonId, section_id: sectionId,
        student_id: studentId, student_name: studentName,
        question_text: questionText.trim()
      });
      setQuestionText('');
      setSubmitted(true);
      fetchMyQuestions();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) { console.log(err); }
    finally { setSubmitting(false); }
  };

  const displayQuestions = showAll ? questions : questions.slice(0, 3);

  return (
    <Box style={{ marginTop: '32px', borderTop: '1px solid #f0f0f0', paddingTop: '28px' }}>
      <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Box style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <QuestionAnswerIcon style={{ color: '#1a237e', fontSize: '20px' }} />
        </Box>
        <Box>
          <Typography style={{ fontWeight: '800', fontSize: '16px', color: '#0a0a0a', ...fontStyle }}>Ask a Question</Typography>
          <Typography variant="caption" style={{ color: '#999', ...bodyFont }}>Your teacher will answer below</Typography>
        </Box>
      </Box>
      <Box style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '16px' }}>
        <TextField fullWidth multiline maxRows={4}
          placeholder="What would you like to ask about this section?"
          value={questionText} onChange={e => setQuestionText(e.target.value)}
          variant="outlined" size="small"
          InputProps={{ style: { borderRadius: '12px', fontSize: '14px', ...bodyFont } }} />
        <IconButton onClick={handleSubmit} disabled={!questionText.trim() || submitting}
          style={{ backgroundColor: questionText.trim() && !submitting ? '#1a237e' : '#e0e0e0', color: 'white', width: '42px', height: '42px', flexShrink: 0 }}>
          {submitting ? <CircularProgress size={18} style={{ color: 'white' }} /> : <SendIcon style={{ fontSize: '18px' }} />}
        </IconButton>
      </Box>
      {submitted && (
        <Alert severity="success" style={{ marginBottom: '16px', borderRadius: '10px' }}>
          Question submitted! Your teacher will answer soon. 🎉
        </Alert>
      )}
      {questions.length > 0 && (
        <Box>
          <Typography style={{ fontWeight: '700', fontSize: '14px', color: '#666', marginBottom: '12px', ...bodyFont }}>
            📋 Your Questions ({questions.length})
          </Typography>
          {displayQuestions.map(q => (
            <Box key={q.id} style={{ backgroundColor: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '14px', padding: '16px', marginBottom: '12px' }}>
              <Box style={{ display: 'flex', gap: '10px', marginBottom: q.answer_text ? '12px' : '0' }}>
                <Box style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <PersonIcon style={{ color: '#1a237e', fontSize: '16px' }} />
                </Box>
                <Box style={{ flex: 1 }}>
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" style={{ fontWeight: '700', color: '#1a237e', ...bodyFont }}>You</Typography>
                    {!q.answer_text && (
                      <Chip label="⏳ Awaiting reply" size="small"
                        style={{ fontSize: '10px', backgroundColor: '#fff3e0', color: '#ff6f00', fontWeight: '700', height: '20px' }} />
                    )}
                  </Box>
                  <Typography variant="body2" style={{ color: '#333', lineHeight: '1.6', marginTop: '2px', ...bodyFont }}>
                    {q.question_text}
                  </Typography>
                </Box>
              </Box>
              {q.answer_text && (
                <Box style={{ display: 'flex', gap: '10px', backgroundColor: '#e8f5e9', borderRadius: '10px', padding: '12px' }}>
                  <Box style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Typography style={{ color: 'white', fontSize: '12px', fontWeight: '800' }}>T</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" style={{ fontWeight: '700', color: '#2e7d32', ...bodyFont }}>Teacher</Typography>
                    <Typography variant="body2" style={{ color: '#1b5e20', lineHeight: '1.6', marginTop: '2px', ...bodyFont }}>{q.answer_text}</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          ))}
          {questions.length > 3 && (
            <Button onClick={() => setShowAll(!showAll)}
              style={{ textTransform: 'none', color: '#1a237e', fontWeight: '700', ...bodyFont }}>
              {showAll ? 'Show less ↑' : `Show ${questions.length - 3} more ↓`}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

// ── Dive Deeper AI Chat ──
function DiveDeeperChat({ section }) {
  const starterMessage = section?.starter_prompt ||
    "Hi! I'm your AI tutor for this lesson. What would you like to understand better? 🤖";
  const [messages, setMessages] = useState([{ role: 'assistant', content: starterMessage }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  const bodyFont = { fontFamily: "'Inter', sans-serif" };
  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_context: section?.ai_context || '',
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          mode: 'dive_deeper'
        })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || "I'm sorry, I couldn't generate a response. Please try again." }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I ran into an issue. Please check your connection and try again." }]);
    } finally { setLoading(false); }
  };

  return (
    <Box style={{ border: '2px solid #9c27b0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(156,39,176,0.12)', background: 'white' }}>
      <Box style={{ background: 'linear-gradient(135deg, #6a1b9a, #9c27b0)', padding: isMobile ? '14px 16px' : '18px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Box style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AutoAwesomeIcon style={{ color: 'white', fontSize: '20px' }} />
        </Box>
        <Box>
          <Typography style={{ fontWeight: '800', color: 'white', fontSize: isMobile ? '15px' : '17px', ...fontStyle }}>
            {section?.title || 'Dive Deeper'}
          </Typography>
          <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.75)', ...bodyFont }}>
            AI Tutor · Ask anything about this lesson
          </Typography>
        </Box>
      </Box>
      <Box style={{ height: isMobile ? '320px' : '400px', overflowY: 'auto', padding: isMobile ? '16px' : '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#fafafa' }}>
        {messages.map((msg, i) => (
          <Box key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
            {msg.role === 'assistant' && (
              <Box style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6a1b9a, #9c27b0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AutoAwesomeIcon style={{ color: 'white', fontSize: '16px' }} />
              </Box>
            )}
            <Box style={{ maxWidth: isMobile ? '85%' : '72%', backgroundColor: msg.role === 'user' ? '#1a237e' : 'white', color: msg.role === 'user' ? 'white' : '#0a0a0a', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '12px 16px', border: msg.role === 'assistant' ? '1px solid #f0f0f0' : 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <Typography variant="body2" style={{ lineHeight: '1.65', whiteSpace: 'pre-wrap', ...bodyFont }}>{msg.content}</Typography>
            </Box>
            {msg.role === 'user' && (
              <Box style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PersonIcon style={{ color: '#1a237e', fontSize: '18px' }} />
              </Box>
            )}
          </Box>
        ))}
        {loading && (
          <Box style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <Box style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6a1b9a, #9c27b0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AutoAwesomeIcon style={{ color: 'white', fontSize: '16px' }} />
            </Box>
            <Box style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '18px 18px 18px 4px', padding: '12px 18px', display: 'flex', gap: '5px', alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <Box key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#9c27b0', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </Box>
          </Box>
        )}
        <div ref={bottomRef} />
      </Box>
      <Box style={{ padding: isMobile ? '12px 16px' : '14px 20px', background: 'white', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
        <TextField fullWidth multiline maxRows={4} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask a question about this lesson..."
          variant="outlined" size="small"
          InputProps={{ style: { borderRadius: '12px', fontSize: '14px', ...bodyFont } }} />
        <IconButton onClick={sendMessage} disabled={!input.trim() || loading}
          style={{ backgroundColor: input.trim() && !loading ? '#9c27b0' : '#e0e0e0', color: 'white', width: '42px', height: '42px', flexShrink: 0 }}>
          {loading ? <CircularProgress size={18} style={{ color: 'white' }} /> : <SendIcon style={{ fontSize: '18px' }} />}
        </IconButton>
      </Box>
      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }`}</style>
    </Box>
  );
}

// ── Main Lessons Component ──
function Lessons() {
  const { course_id } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [progress, setProgress] = useState({ percentage: 0, completed_lessons: [] });
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const student_id = user?.id;
  const student_name = user?.name || user?.email || 'Student';
  const contentRef = useRef(null);

  const isMobile = useMediaQuery('(max-width:768px)');
  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
  const bodyFont = { fontFamily: "'Inter', sans-serif" };

  useEffect(() => {
    axios.get(`${API}/api/lessons/${course_id}`)
      .then(res => { setLessons(res.data); if (res.data.length > 0) setSelectedLesson(res.data[0]); })
      .catch(err => console.log(err));
    axios.get(`${API}/api/progress/${student_id}/${course_id}`)
      .then(res => setProgress(res.data))
      .catch(err => console.log(err));
  }, [course_id]);

  useEffect(() => {
    if (selectedLesson) {
      axios.get(`${API}/api/sections/${selectedLesson.id}`)
        .then(res => { setSections(res.data); if (res.data.length > 0) setSelectedSection(res.data[0]); else setSelectedSection(null); })
        .catch(err => console.log(err));
    }
  }, [selectedLesson]);

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen, isMobile]);

  const isCompleted = (lesson_id) => progress.completed_lessons?.some(p => p.lesson_id === lesson_id);

  const handleComplete = async () => {
    try {
      await axios.post(`${API}/api/progress/complete`, {
        student_id, lesson_id: selectedLesson.id, course_id: parseInt(course_id)
      });
      setMessage('Lesson marked as complete! 🎉');
      const res = await axios.get(`${API}/api/progress/${student_id}/${course_id}`);
      setProgress(res.data);
    } catch { setMessage('Error marking lesson complete.'); }
  };

  const currentLessonIndex = lessons.findIndex(l => l.id === selectedLesson?.id);
  const isLastLesson = currentLessonIndex === lessons.length - 1;
  const isFirstLesson = currentLessonIndex === 0;

  const handleNextLesson = () => {
    if (!isLastLesson) {
      setSelectedLesson(lessons[currentLessonIndex + 1]);
      setMessage('');
      if (contentRef.current) contentRef.current.scrollTop = 0;
    }
  };

  const handlePrevLesson = () => {
    if (!isFirstLesson) {
      setSelectedLesson(lessons[currentLessonIndex - 1]);
      setMessage('');
      if (contentRef.current) contentRef.current.scrollTop = 0;
    }
  };

  const sidebarContent = (
    <Box style={{ width: '100%', height: '100%', backgroundColor: '#1a237e', color: 'white', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <Box style={{ padding: '20px', paddingBottom: '10px' }}>
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/courses')}
            style={{ color: 'white', textTransform: 'none', fontWeight: '700', padding: 0, ...bodyFont }}>
            Courses
          </Button>
          {isMobile && (
            <IconButton onClick={() => setSidebarOpen(false)} style={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <Typography style={{ fontWeight: '800', fontSize: '13px', opacity: 0.6, marginBottom: '8px', letterSpacing: '0.5px', ...bodyFont }}>PROGRESS</Typography>
        <LinearProgress variant="determinate" value={progress.percentage || 0}
          style={{ marginBottom: '6px', borderRadius: '5px', height: '8px' }}
          sx={{ backgroundColor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { backgroundColor: '#4caf50' } }} />
        <Typography variant="body2" style={{ marginBottom: '16px', opacity: 0.8, ...bodyFont }}>{progress.percentage || 0}% Complete</Typography>
        <Divider style={{ backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: '16px' }} />
        <Typography style={{ fontWeight: '800', fontSize: '13px', opacity: 0.6, marginBottom: '10px', letterSpacing: '0.5px', ...bodyFont }}>LESSONS</Typography>
      </Box>
      <Box style={{ flex: 1, padding: '0 20px', overflowY: 'auto' }}>
        {lessons.map((lesson, index) => (
          <Box key={lesson.id}
            onClick={() => { setSelectedLesson(lesson); setMessage(''); if (isMobile) setSidebarOpen(false); }}
            style={{ padding: '10px 12px', borderRadius: '10px', marginBottom: '8px', cursor: 'pointer', backgroundColor: selectedLesson?.id === lesson.id ? 'rgba(255,255,255,0.2)' : 'transparent', borderLeft: `3px solid ${isCompleted(lesson.id) ? '#4caf50' : 'rgba(255,255,255,0.3)'}`, transition: 'background 0.2s' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isCompleted(lesson.id)
                ? <CheckCircleIcon style={{ fontSize: '18px', color: '#4caf50', flexShrink: 0 }} />
                : <PlayCircleFilledIcon style={{ fontSize: '18px', flexShrink: 0 }} />}
              <Typography variant="body2" style={{ fontWeight: '700', ...fontStyle }}>{index + 1}. {lesson.title}</Typography>
            </Box>
          </Box>
        ))}
        {selectedLesson && sections.length > 0 && (
          <>
            <Divider style={{ backgroundColor: 'rgba(255,255,255,0.15)', margin: '16px 0' }} />
            <Typography style={{ fontWeight: '800', fontSize: '13px', opacity: 0.6, marginBottom: '10px', letterSpacing: '0.5px', ...bodyFont }}>SECTIONS</Typography>
            {sections.map(section => (
              <Box key={section.id}
                onClick={() => { setSelectedSection(section); if (isMobile) setSidebarOpen(false); }}
                style={{ padding: '10px 12px', borderRadius: '10px', marginBottom: '6px', cursor: 'pointer', backgroundColor: selectedSection?.id === section.id ? 'rgba(255,255,255,0.2)' : 'transparent', borderLeft: `3px solid ${getSectionColor(section.type)}`, transition: 'background 0.2s' }}>
                <Typography variant="body2" style={{ fontWeight: '700', fontSize: '12px', ...fontStyle }}>{getSectionLabel(section.type)}</Typography>
                <Typography variant="caption" style={{ opacity: 0.7, ...bodyFont }}>{section.title}</Typography>
              </Box>
            ))}
          </>
        )}
        <Box style={{ height: '20px' }} />
      </Box>
    </Box>
  );

  return (
    <Box style={{ display: 'flex', minHeight: '100vh', background: '#fafafa', ...bodyFont }}>
      {!isMobile && (
        <Box style={{ width: '280px', minWidth: '280px', flexShrink: 0 }}>
          {sidebarContent}
        </Box>
      )}
      {isMobile && sidebarOpen && (
        <Box style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200, display: 'flex' }}>
          <Box style={{ width: '300px', maxWidth: '85vw', height: '100vh', overflow: 'hidden', flexShrink: 0 }}>
            {sidebarContent}
          </Box>
          <Box onClick={() => setSidebarOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
        </Box>
      )}

      <Box ref={contentRef} style={{ flex: 1, minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {isMobile && (
          <Box style={{ background: '#1a237e', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 100, flexShrink: 0 }}>
            <IconButton onClick={() => setSidebarOpen(true)}
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }} size="small">
              <MenuIcon />
            </IconButton>
            <Typography style={{ fontWeight: '800', fontSize: '15px', color: 'white', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...fontStyle }}>
              {selectedLesson?.title || 'Lesson'}
            </Typography>
          </Box>
        )}

        <Box style={{ padding: isMobile ? '16px' : '40px', flex: 1 }}>
          {selectedSection ? (
            <Card elevation={0} style={{ borderRadius: '20px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <Box style={{ height: '6px', backgroundColor: getSectionColor(selectedSection.type) }} />
              <CardContent style={{ padding: isMobile ? '20px 16px' : '40px' }}>
                <Chip label={getSectionLabel(selectedSection.type)} size="small"
                  style={{ backgroundColor: getSectionColor(selectedSection.type), color: 'white', fontWeight: '700', marginBottom: '16px', ...bodyFont }} />
                <Typography style={{ fontWeight: '800', color: '#0a0a0a', fontSize: isMobile ? '20px' : '30px', marginBottom: '20px', lineHeight: '1.2', ...fontStyle }}>
                  {selectedSection.title}
                </Typography>
                <Divider style={{ marginBottom: '24px' }} />

                {selectedSection.type === 'dive_deeper' ? (
                  <DiveDeeperChat section={selectedSection} />
                ) : (
                  <>
                   {selectedSection.html_content && (
  <Box style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
    <iframe
      srcDoc={selectedSection.html_content}
      style={{ width: '100%', height: '600px', border: 'none', display: 'block' }}
      title="HTML Lesson Content"
      sandbox="allow-scripts"
    />
  </Box>
)}
                    {selectedSection.video_url && (() => {
                      const embedUrl = getYouTubeEmbedUrl(selectedSection.video_url);
                      return embedUrl ? (
                        <Box style={{ marginBottom: '24px' }}>
                          <Typography variant="h6" style={{ fontWeight: '800', marginBottom: '12px', color: '#ff0000', ...fontStyle }}>🎥 Video Lesson</Typography>
                          <Box style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                            <iframe src={embedUrl}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                              allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              title="Video Lesson" />
                          </Box>
                        </Box>
                      ) : null;
                    })()}
                    {selectedSection.website_url && (
                      <Box style={{ marginBottom: '24px' }}>
                        <Typography variant="h6" style={{ fontWeight: '800', marginBottom: '12px', color: '#0288d1', ...fontStyle }}>🌐 Additional Resource</Typography>
                        <Box style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e3f2fd', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                          <iframe src={selectedSection.website_url}
                            style={{ width: '100%', height: isMobile ? '400px' : '600px', border: 'none', display: 'block' }}
                            title="Resource" allowFullScreen />
                        </Box>
                      </Box>
                    )}
                    {selectedSection.type === 'quiz' && (
                      <Button variant="contained"
                        onClick={() => navigate(`/courses/${course_id}/lessons/${selectedLesson.id}/quiz`)}
                        style={{ backgroundColor: '#ff6f00', padding: '12px 30px', borderRadius: '10px', fontSize: '16px', fontWeight: '700', textTransform: 'none', marginTop: '20px', boxShadow: 'none', ...bodyFont }}>
                        Take Quiz 🎯
                      </Button>
                    )}
                    <QASection
                      lessonId={selectedLesson?.id}
                      sectionId={selectedSection?.id}
                      studentId={student_id}
                      studentName={student_name}
                      bodyFont={bodyFont}
                      fontStyle={fontStyle}
                      isMobile={isMobile}
                    />
                  </>
                )}

                {message && (
                  <Typography style={{ color: '#4caf50', marginTop: '16px', fontWeight: '700', ...bodyFont }}>{message}</Typography>
                )}

                <Box style={{ marginTop: '28px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  {!isFirstLesson && (
                    <Button variant="outlined" size="small" startIcon={<ArrowBackIosNewIcon style={{ fontSize: '12px' }} />}
                      onClick={handlePrevLesson}
                      style={{ borderColor: '#e0e0e0', color: '#666', padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textTransform: 'none', ...bodyFont }}>
                      Previous
                    </Button>
                  )}
                  {!isCompleted(selectedLesson?.id) ? (
                    <Button variant="contained" size="small" onClick={handleComplete}
                      style={{ backgroundColor: '#4caf50', padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textTransform: 'none', boxShadow: 'none', ...bodyFont }}>
                      ✅ Mark Complete
                    </Button>
                  ) : (
                    <Chip icon={<CheckCircleIcon style={{ fontSize: '16px' }} />} label="Completed!" color="success" size="small" style={{ fontSize: '13px', fontWeight: '700' }} />
                  )}
                  {!isLastLesson && (
                    <Button variant="contained" size="small" endIcon={<ArrowForwardIcon style={{ fontSize: '14px' }} />}
                      onClick={handleNextLesson}
                      style={{ backgroundColor: '#1a237e', padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textTransform: 'none', boxShadow: 'none', ...bodyFont }}>
                      Next Lesson
                    </Button>
                  )}
                  {isLastLesson && isCompleted(selectedLesson?.id) && (
                    <Chip label="🎓 Course Complete!" size="small" style={{ backgroundColor: '#1a237e', color: 'white', fontSize: '13px', fontWeight: '700' }} />
                  )}
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card elevation={0} style={{ borderRadius: '20px', textAlign: 'center', padding: isMobile ? '40px 20px' : '60px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <Typography variant="h5" style={{ color: '#999', fontWeight: '700', ...fontStyle }}>
                {sections.length === 0 ? 'No sections available for this lesson yet.' : 'Select a section to start learning!'}
              </Typography>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Lessons;