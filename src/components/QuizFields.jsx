import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Radio, RadioGroup,
  FormControlLabel, FormControl, Divider, IconButton, Chip, Alert, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };
const API = 'https://eduplatform-api-pol1.onrender.com';

const emptyMCQ = () => ({
  section: 'A', question_type: 'mcq', question_text: '',
  option_a: '', option_b: '', option_c: '', option_d: '',
  correct_answer: 'A', marks: 1, marking_scheme: ''
});

const emptyTheory = () => ({
  section: 'B', question_type: 'theory_text', question_text: '',
  marks: 5, marking_scheme: ''
});

const emptyImage = () => ({
  section: 'C', question_type: 'theory_image', question_text: '',
  marks: 10, marking_scheme: ''
});

const sectionColor = { A: '#ff6f00', B: '#0288d1', C: '#4caf50' };
const sectionLabel = {
  A: 'Section A — MCQ',
  B: 'Section B — Theory (Typed)',
  C: 'Section C — Handwritten Image'
};

function QuizFields({ lessonId, courseId, onSaved }) {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([emptyMCQ()]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  // Load existing quiz on mount
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`${API}/api/quiz/lesson/${lessonId}`);
        const data = await res.json();
        if (data && data.title) {
          setTitle(data.title);
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions.map(q => ({
              section: q.section,
              question_type: q.question_type,
              question_text: q.question_text || '',
              option_a: q.option_a || '',
              option_b: q.option_b || '',
              option_c: q.option_c || '',
              option_d: q.option_d || '',
              correct_answer: q.correct_answer || 'A',
              marks: q.marks || 1,
              marking_scheme: q.marking_scheme || ''
            })));
          }
        }
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    };
    fetchQuiz();
  }, [lessonId]);

  const addQuestion = (type) => {
    if (type === 'A') setQuestions([...questions, emptyMCQ()]);
    if (type === 'B') setQuestions([...questions, emptyTheory()]);
    if (type === 'C') setQuestions([...questions, emptyImage()]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) { setMessageType('error'); setMessage('Please enter a quiz title.'); return; }
    if (questions.length === 0) { setMessageType('error'); setMessage('Add at least one question.'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/quiz/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_id: lessonId, course_id: courseId, title, questions })
      });
      const data = await res.json();
      if (res.ok) {
        setMessageType('success');
        setMessage('Quiz saved successfully! ✅');
        if (onSaved) onSaved();
      } else {
        setMessageType('error');
        setMessage(data.error || 'Failed to save quiz.');
      }
    } catch (err) {
      setMessageType('error');
      setMessage('Network error. Try again.');
    }
    setSaving(false);
  };

  if (loading) return (
    <Box style={{ textAlign: 'center', padding: '40px' }}>
      <CircularProgress style={{ color: '#ff6f00' }} />
      <Typography variant="body2" style={{ marginTop: '12px', color: '#666', ...bodyFont }}>
        Loading quiz...
      </Typography>
    </Box>
  );

  return (
    <Box>
      <Box style={{ backgroundColor: '#fff3e0', border: '1px solid #ff6f00', borderRadius: '12px', padding: '16px', marginBottom: '20px', marginTop: '8px' }}>
        <Typography style={{ fontWeight: '700', color: '#e65100', marginBottom: '4px', ...fontStyle }}>Quiz Builder</Typography>
        <Typography variant="body2" style={{ color: '#bf360c', lineHeight: '1.6', ...bodyFont }}>
          Section A = MCQ (auto-marked) · Section B = Theory typed (AI-marked) · Section C = Handwritten image (teacher-marked)
        </Typography>
      </Box>

      <TextField fullWidth label="Quiz Title" value={title}
        onChange={e => setTitle(e.target.value)} margin="normal" variant="outlined"
        placeholder="e.g. Algebra Quiz — Week 3"
        InputProps={{ style: { borderRadius: '10px', ...bodyFont } }} />

      {message && (
        <Alert severity={messageType} style={{ marginTop: '12px', borderRadius: '10px' }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      <Divider style={{ margin: '20px 0' }} />

      {questions.map((q, index) => (
        <Box key={index} style={{
          border: `2px solid ${sectionColor[q.section]}`,
          borderRadius: '14px', padding: '20px', marginBottom: '16px',
          backgroundColor: '#fafafa'
        }}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <Chip label={sectionLabel[q.section]} size="small"
              style={{ backgroundColor: sectionColor[q.section], color: 'white', fontWeight: '700', ...bodyFont }} />
            <IconButton size="small" onClick={() => removeQuestion(index)}
              style={{ backgroundColor: '#ffebee', color: '#f44336' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>

          <TextField fullWidth label="Question" value={q.question_text}
            onChange={e => updateQuestion(index, 'question_text', e.target.value)}
            margin="normal" variant="outlined" multiline rows={2}
            placeholder="Type your question here..."
            InputProps={{ style: { borderRadius: '10px', ...bodyFont } }} />

          {q.section === 'A' && (
            <Box>
              <Box style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                {['a', 'b', 'c', 'd'].map(opt => (
                  <TextField key={opt} label={`Option ${opt.toUpperCase()}`}
                    value={q[`option_${opt}`]}
                    onChange={e => updateQuestion(index, `option_${opt}`, e.target.value)}
                    variant="outlined" size="small"
                    style={{ flex: '1 1 45%' }}
                    InputProps={{ style: { borderRadius: '8px', ...bodyFont } }} />
                ))}
              </Box>
              <Box style={{ marginTop: '12px' }}>
                <Typography variant="body2" style={{ fontWeight: '700', color: '#333', marginBottom: '6px', ...bodyFont }}>
                  Correct Answer:
                </Typography>
                <FormControl>
                  <RadioGroup row value={q.correct_answer}
                    onChange={e => updateQuestion(index, 'correct_answer', e.target.value)}>
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <FormControlLabel key={opt} value={opt} control={<Radio size="small" />} label={opt} />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>
            </Box>
          )}

          {(q.section === 'B' || q.section === 'C') && (
            <TextField fullWidth label="Marking Scheme / Model Answer"
              value={q.marking_scheme}
              onChange={e => updateQuestion(index, 'marking_scheme', e.target.value)}
              margin="normal" variant="outlined" multiline rows={3}
              placeholder={q.section === 'B'
                ? "e.g. Step 1: x = 4 (2 marks), Step 2: substitution shown (2 marks), correct answer (1 mark)"
                : "e.g. Correct diagram (3 marks), labels shown (3 marks), working shown (4 marks)"}
              InputProps={{ style: { borderRadius: '10px', ...bodyFont } }} />
          )}

          {q.section === 'C' && (
            <Box style={{ backgroundColor: '#e8f5e9', borderRadius: '10px', padding: '12px', marginTop: '8px' }}>
              <Typography variant="body2" style={{ color: '#2e7d32', fontWeight: '600', ...bodyFont }}>
                📸 Student will upload a photo of their handwritten answer. You will mark this manually after submission.
              </Typography>
            </Box>
          )}

          <TextField label="Marks" type="number" value={q.marks}
            onChange={e => updateQuestion(index, 'marks', parseInt(e.target.value) || 1)}
            variant="outlined" size="small"
            style={{ marginTop: '12px', width: '120px' }}
            InputProps={{ style: { borderRadius: '8px', ...bodyFont } }} />
        </Box>
      ))}

      <Box style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addQuestion('A')}
          style={{ borderColor: '#ff6f00', color: '#ff6f00', borderRadius: '10px', textTransform: 'none', fontWeight: '700', ...bodyFont }}>
          Add MCQ
        </Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addQuestion('B')}
          style={{ borderColor: '#0288d1', color: '#0288d1', borderRadius: '10px', textTransform: 'none', fontWeight: '700', ...bodyFont }}>
          Add Theory
        </Button>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addQuestion('C')}
          style={{ borderColor: '#4caf50', color: '#4caf50', borderRadius: '10px', textTransform: 'none', fontWeight: '700', ...bodyFont }}>
          Add Image Question
        </Button>
      </Box>

      <Button fullWidth variant="contained" onClick={handleSave} disabled={saving}
        style={{ backgroundColor: '#ff6f00', padding: '14px', fontSize: '16px', borderRadius: '10px', fontWeight: '700', textTransform: 'none', boxShadow: 'none', ...bodyFont }}>
        {saving ? 'Saving Quiz...' : 'Save Quiz 💾'}
      </Button>
    </Box>
  );
}

export default QuizFields;