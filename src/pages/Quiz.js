import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  Box, Typography, Card, CardContent, Button, Radio, RadioGroup,
  FormControlLabel, FormControl, Alert, LinearProgress, TextField,
  Chip, Divider, CircularProgress
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const API = 'https://eduplatform-api-pol1.onrender.com';
const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

const sectionColor = { A: '#ff6f00', B: '#0288d1', C: '#4caf50' };
const sectionLabel = {
  A: 'Section A — Objective (MCQ)',
  B: 'Section B — Theory',
  C: 'Section C — Handwritten Workings'
};

function Quiz() {
  const { lesson_id, course_id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const student_id = user?.id;

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/quiz/lesson/${lesson_id}`)
      .then(res => { setQuiz(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lesson_id]);

  const sectionQuestions = (section) =>
    quiz?.questions?.filter(q => q.section === section) || [];

  const handleMCQ = (question_id, value) => {
    setAnswers(prev => ({ ...prev, [question_id]: { answer_text: value } }));
  };

  const handleTheory = (question_id, value) => {
    setAnswers(prev => ({ ...prev, [question_id]: { answer_text: value } }));
  };

  const handleImageUpload = async (question_id, files) => {
  if (!files || files.length === 0) return;
  setUploadingId(question_id);
  try {
    const urls = [];
    for (const file of files) {
      const base64 = await toBase64(file);
      const res = await fetch(`${API}/api/upload/quiz-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, folder: 'quiz_answers' })
      });
      const data = await res.json();
      urls.push(data.url);
    }
    setAnswers(prev => ({
      ...prev,
      [question_id]: { image_url: urls[0], image_urls: urls }
    }));
  } catch (err) {
    console.log(err);
  }
  setUploadingId(null);
};

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const allAnswered = () => {
    if (!quiz) return false;
    return quiz.questions.every(q => answers[q.id]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/api/quiz/submit`, {
        student_id,
        quiz_id: quiz.id,
        answers
      });
      setResult(res.data);
    } catch (err) {
      console.log(err);
    }
    setSubmitting(false);
  };

  if (loading) return (
    <Box style={{ padding: '40px', textAlign: 'center' }}>
      <CircularProgress style={{ color: '#1a237e' }} />
    </Box>
  );

  if (!quiz) return (
    <Box style={{ padding: '40px', textAlign: 'center' }}>
      <Typography variant="h5" color="textSecondary" style={fontStyle}>
        No quiz available for this lesson.
      </Typography>
      <Button variant="contained" onClick={() => navigate(-1)}
        style={{ marginTop: '20px', backgroundColor: '#1a237e', borderRadius: '10px', textTransform: 'none' }}>
        Go Back
      </Button>
    </Box>
  );

  // Result screen
  if (result) {
    const { section_a_score, section_b_score, instant_total, instant_max, has_section_c, status } = result;
    const percentage = instant_max > 0 ? Math.round((instant_total / instant_max) * 100) : 0;

    return (
      <Box style={{ padding: '40px', background: '#f5f5f5', minHeight: '90vh' }}>
        <Box style={{ maxWidth: '700px', margin: 'auto' }}>
          <Card elevation={0} style={{ borderRadius: '20px', padding: '40px', border: '1px solid #f0f0f0', textAlign: 'center' }}>
            <QuizIcon style={{ fontSize: '50px', color: '#1a237e', marginBottom: '16px' }} />
            <Typography style={{ fontWeight: '800', fontSize: '28px', color: '#0a0a0a', marginBottom: '8px', ...fontStyle }}>
              Quiz Submitted! 🎯
            </Typography>

            <Divider style={{ margin: '24px 0' }} />

            {/* Section A result */}
            {sectionQuestions('A').length > 0 && (
              <Box style={{ backgroundColor: '#fff3e0', borderRadius: '12px', padding: '16px', marginBottom: '12px', textAlign: 'left' }}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography style={{ fontWeight: '700', color: '#e65100', ...fontStyle }}>Section A — MCQ</Typography>
                    <Typography variant="body2" style={{ color: '#666', ...bodyFont }}>Auto-marked instantly</Typography>
                  </Box>
                  <Box style={{ textAlign: 'right' }}>
                    <Typography style={{ fontWeight: '800', fontSize: '22px', color: '#ff6f00', ...fontStyle }}>
                      {section_a_score}
                    </Typography>
                    <CheckCircleIcon style={{ color: '#4caf50', fontSize: '18px' }} />
                  </Box>
                </Box>
              </Box>
            )}

            {/* Section B result */}
            {sectionQuestions('B').length > 0 && (
              <Box style={{ backgroundColor: '#e3f2fd', borderRadius: '12px', padding: '16px', marginBottom: '12px', textAlign: 'left' }}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography style={{ fontWeight: '700', color: '#01579b', ...fontStyle }}>Section B — Theory</Typography>
                    <Typography variant="body2" style={{ color: '#666', ...bodyFont }}>AI-marked instantly</Typography>
                  </Box>
                  <Box style={{ textAlign: 'right' }}>
                    <Typography style={{ fontWeight: '800', fontSize: '22px', color: '#0288d1', ...fontStyle }}>
                      {section_b_score}
                    </Typography>
                    <CheckCircleIcon style={{ color: '#4caf50', fontSize: '18px' }} />
                  </Box>
                </Box>
              </Box>
            )}

            {/* Section C pending */}
            {has_section_c && (
              <Box style={{ backgroundColor: '#e8f5e9', borderRadius: '12px', padding: '16px', marginBottom: '12px', textAlign: 'left' }}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography style={{ fontWeight: '700', color: '#2e7d32', ...fontStyle }}>Section C — Handwritten</Typography>
                    <Typography variant="body2" style={{ color: '#666', ...bodyFont }}>Awaiting teacher review</Typography>
                  </Box>
                  <HourglassEmptyIcon style={{ color: '#ff6f00', fontSize: '24px' }} />
                </Box>
              </Box>
            )}

            <Divider style={{ margin: '20px 0' }} />

            {/* Current score */}
            <Typography style={{ fontWeight: '800', fontSize: '36px', color: '#1a237e', ...fontStyle }}>
              {instant_total} / {instant_max}
            </Typography>
            <Typography variant="body1" style={{ color: '#666', marginBottom: '8px', ...bodyFont }}>
              {has_section_c
                ? 'Current score (Section C pending)'
                : `Final Score — ${percentage >= 70 ? '🎉 Passed!' : '😔 Keep studying'}`}
            </Typography>

            {!has_section_c && (
              <LinearProgress variant="determinate" value={percentage}
                style={{ height: '12px', borderRadius: '8px', marginBottom: '16px' }}
                color={percentage >= 70 ? 'success' : 'error'} />
            )}

            {has_section_c && (
              <Alert severity="info" style={{ borderRadius: '10px', marginTop: '12px', textAlign: 'left' }}>
                Your teacher has been notified. You'll receive an email when your full result is ready.
              </Alert>
            )}

            <Box style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={() => navigate(-1)}
                style={{ backgroundColor: '#1a237e', padding: '12px 28px', borderRadius: '10px', textTransform: 'none', fontWeight: '700', ...bodyFont }}>
                Back to Lesson
              </Button>
            </Box>
          </Card>
        </Box>
      </Box>
    );
  }

  // Quiz screen
  const sections = ['A', 'B', 'C'].filter(s => sectionQuestions(s).length > 0);

  return (
    <Box style={{ padding: '40px', background: '#f5f5f5', minHeight: '90vh' }}>
      <Box style={{ maxWidth: '800px', margin: 'auto' }}>
        <Box style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <QuizIcon style={{ fontSize: '40px', color: '#1a237e', marginRight: '15px' }} />
          <Box>
            <Typography style={{ fontWeight: '800', fontSize: '28px', color: '#1a237e', ...fontStyle }}>
              {quiz.title}
            </Typography>
            <Typography variant="body2" style={{ color: '#666', ...bodyFont }}>
              Answer all questions to submit
            </Typography>
          </Box>
        </Box>

        {sections.map(section => (
          <Box key={section} style={{ marginBottom: '32px' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Chip label={sectionLabel[section]}
                style={{ backgroundColor: sectionColor[section], color: 'white', fontWeight: '700', ...bodyFont }} />
              {section === 'C' && (
                <Typography variant="body2" style={{ color: '#666', ...bodyFont }}>
                  📸 Upload a clear photo of your handwritten workings
                </Typography>
              )}
            </Box>

            {sectionQuestions(section).map((question, index) => (
              <Card key={question.id} elevation={0}
                style={{ borderRadius: '14px', marginBottom: '16px', border: `1px solid ${sectionColor[section]}33`, borderLeft: `4px solid ${sectionColor[section]}` }}>
                <CardContent style={{ padding: '24px' }}>
                  <Typography style={{ fontWeight: '700', marginBottom: '16px', color: '#0a0a0a', fontSize: '16px', ...fontStyle }}>
                    {index + 1}. {question.question_text}
                    <span style={{ color: sectionColor[section], fontSize: '13px', marginLeft: '8px', fontWeight: '600' }}>
                      [{question.marks} mark{question.marks > 1 ? 's' : ''}]
                    </span>
                  </Typography>

                  {/* Section A - MCQ */}
                  {section === 'A' && (
                    <FormControl component="fieldset">
                      <RadioGroup value={answers[question.id]?.answer_text || ''}
                        onChange={e => handleMCQ(question.id, e.target.value)}>
                        {['A', 'B', 'C', 'D'].map(opt => (
                          question[`option_${opt.toLowerCase()}`] && (
                            <FormControlLabel key={opt} value={opt}
                              control={<Radio style={{ color: '#ff6f00' }} />}
                              label={`${opt}. ${question[`option_${opt.toLowerCase()}`]}`}
                              style={{ ...bodyFont }} />
                          )
                        ))}
                      </RadioGroup>
                    </FormControl>
                  )}

                  {/* Section B - Theory typed */}
                  {section === 'B' && (
                    <TextField fullWidth multiline rows={4}
                      placeholder="Type your answer and show all workings here..."
                      value={answers[question.id]?.answer_text || ''}
                      onChange={e => handleTheory(question.id, e.target.value)}
                      variant="outlined"
                      InputProps={{ style: { borderRadius: '10px', ...bodyFont } }} />
                  )}

                  {/* Section C - Image upload */}
                  {section === 'C' && (
                    <Box>
                      <input type="file" accept="image/*" multiple id={`upload-${question.id}`}
  style={{ display: 'none' }}
  onChange={e => handleImageUpload(question.id, e.target.files)} />
                      <label htmlFor={`upload-${question.id}`}>
                        <Button variant="outlined" component="span"
                          startIcon={uploadingId === question.id ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                          disabled={uploadingId === question.id}
                          style={{ borderColor: '#4caf50', color: '#4caf50', borderRadius: '10px', textTransform: 'none', fontWeight: '700', ...bodyFont }}>
                          {uploadingId === question.id ? 'Uploading...' : 'Upload Photo'}
                        </Button>
                      </label>
                     {answers[question.id]?.image_urls && (
  <Box style={{ marginTop: '12px' }}>
    {answers[question.id].image_urls.map((url, i) => (
      <img key={i} src={url} alt={`answer-${i + 1}`}
        style={{ maxWidth: '100%', borderRadius: '10px', border: '2px solid #4caf50', marginBottom: '8px', display: 'block' }} />
    ))}
    <Typography variant="caption" style={{ color: '#4caf50', fontWeight: '600', display: 'block', marginTop: '6px', ...bodyFont }}>
      ✅ {answers[question.id].image_urls.length} photo{answers[question.id].image_urls.length > 1 ? 's' : ''} uploaded
    </Typography>
  </Box>
)}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        ))}

        {!allAnswered() && (
          <Alert severity="info" style={{ borderRadius: '10px', marginBottom: '16px' }}>
            Please answer all questions before submitting.
          </Alert>
        )}

        {allAnswered() && (
          <Button fullWidth variant="contained" onClick={handleSubmit} disabled={submitting}
            style={{ backgroundColor: '#ff6f00', padding: '16px', fontSize: '18px', borderRadius: '10px', fontWeight: '700', textTransform: 'none', boxShadow: 'none', ...bodyFont }}>
            {submitting ? 'Submitting...' : 'Submit Quiz 🎯'}
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default Quiz;