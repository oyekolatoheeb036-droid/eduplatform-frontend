import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Chip, Alert, CircularProgress, Badge, Divider
} from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const API = 'https://eduplatform-api-pol1.onrender.com';
const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

function PendingSubmissions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState({});
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await axios.get(`${API}/api/quiz/pending/2`);
      setSubmissions(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleMark = async (answerId, maxMarks) => {
    const score = parseInt(scores[answerId]);
    if (isNaN(score) || score < 0 || score > maxMarks) {
      setMessageType('error');
      setMessage(`Score must be between 0 and ${maxMarks}`);
      return;
    }
    setMarking(prev => ({ ...prev, [answerId]: true }));
    try {
      await axios.put(`${API}/api/quiz/mark/${answerId}`, {
        teacher_score: score,
        teacher_feedback: feedback[answerId] || ''
      });
      setMessageType('success');
      setMessage('Answer marked successfully ✅');
      fetchPending();
    } catch (err) {
      setMessageType('error');
      setMessage('Failed to mark. Try again.');
    }
    setMarking(prev => ({ ...prev, [answerId]: false }));
  };

  // Group by attempt
  const grouped = submissions.reduce((acc, sub) => {
    const key = `${sub.attempt_id}-${sub.student_name}-${sub.quiz_title}`;
    if (!acc[key]) acc[key] = { student_name: sub.student_name, quiz_title: sub.quiz_title, attempt_id: sub.attempt_id, answers: [] };
    acc[key].answers.push(sub);
    return acc;
  }, {});

  if (loading) return (
    <Box style={{ textAlign: 'center', padding: '60px' }}>
      <CircularProgress style={{ color: '#1a237e' }} />
    </Box>
  );

  return (
    <Box style={{ background: '#fafafa', minHeight: '100vh', ...bodyFont }}>
      {/* Header */}
      <Box style={{ background: 'white', padding: '40px 60px', borderBottom: '1px solid #f0f0f0' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/teacher')}
          style={{ color: '#1a237e', textTransform: 'none', fontWeight: '700', marginBottom: '16px', ...bodyFont }}>
          Back to Dashboard
        </Button>
        <Box style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#fff3e0', border: '1px solid #ff6f00', borderRadius: '30px', padding: '6px 16px', marginBottom: '12px', display: 'block', width: 'fit-content' }}>
          <Typography variant="body2" style={{ color: '#ff6f00', fontWeight: '700', ...bodyFont }}>
            PENDING MARKING
          </Typography>
        </Box>
        <Typography style={{ fontWeight: '800', fontSize: '36px', color: '#0a0a0a', ...fontStyle }}>
          Section C{' '}
          <span style={{ background: 'linear-gradient(135deg, #1a237e, #0288d1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Submissions
          </span>
        </Typography>
        <Typography style={{ color: '#666', marginTop: '8px', ...bodyFont }}>
          Review and mark handwritten answers from your students
        </Typography>
      </Box>

      <Box style={{ padding: '40px 60px' }}>
        {message && (
          <Alert severity={messageType} style={{ marginBottom: '24px', borderRadius: '10px' }} onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        {Object.keys(grouped).length === 0 ? (
          <Card elevation={0} style={{ borderRadius: '18px', textAlign: 'center', padding: '60px', border: '1px solid #f0f0f0' }}>
            <CheckCircleIcon style={{ fontSize: '60px', color: '#4caf50', marginBottom: '16px' }} />
            <Typography style={{ fontWeight: '800', fontSize: '22px', color: '#333', ...fontStyle }}>
              All caught up!
            </Typography>
            <Typography style={{ color: '#999', marginTop: '8px', ...bodyFont }}>
              No pending Section C submissions to mark.
            </Typography>
          </Card>
        ) : (
          Object.values(grouped).map((group, gi) => (
            <Card key={gi} elevation={0} style={{ borderRadius: '18px', marginBottom: '24px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <CardContent style={{ padding: '28px' }}>
                {/* Student info */}
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <Box>
                    <Typography style={{ fontWeight: '800', fontSize: '18px', color: '#0a0a0a', ...fontStyle }}>
                      {group.student_name}
                    </Typography>
                    <Typography variant="body2" style={{ color: '#666', marginTop: '4px', ...bodyFont }}>
                      Quiz: {group.quiz_title}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<HourglassEmptyIcon style={{ fontSize: '16px' }} />}
                    label={`${group.answers.length} answer${group.answers.length > 1 ? 's' : ''} pending`}
                    style={{ backgroundColor: '#fff3e0', color: '#ff6f00', fontWeight: '700', border: '1px solid #ff6f00', ...bodyFont }}
                  />
                </Box>

                <Divider style={{ marginBottom: '20px' }} />

                {/* Each answer */}
                {group.answers.map((answer, ai) => (
                  <Box key={ai} style={{ marginBottom: '28px' }}>
                    <Typography style={{ fontWeight: '700', color: '#0a0a0a', marginBottom: '12px', fontSize: '15px', ...fontStyle }}>
                      Q{ai + 1}: {answer.question_text}
                      <span style={{ color: '#4caf50', fontSize: '13px', marginLeft: '8px', fontWeight: '600' }}>
                        [Max: {answer.max_marks} marks]
                      </span>
                    </Typography>

                    {/* Images */}
                    {answer.image_urls && answer.image_urls.length > 0 ? (
                      <Box style={{ marginBottom: '16px' }}>
                        {answer.image_urls.map((url, ii) => (
                          <img key={ii} src={url} alt={`submission-${ii}`}
                            style={{ maxWidth: '100%', borderRadius: '10px', border: '2px solid #e0e0e0', marginBottom: '8px', display: 'block', cursor: 'pointer' }}
                            onClick={() => window.open(url, '_blank')} />
                        ))}
                        <Typography variant="caption" style={{ color: '#999', ...bodyFont }}>
                          Click image to open full size
                        </Typography>
                      </Box>
                    ) : answer.image_url ? (
                      <Box style={{ marginBottom: '16px' }}>
                        <img src={answer.image_url} alt="submission"
                          style={{ maxWidth: '100%', borderRadius: '10px', border: '2px solid #e0e0e0', cursor: 'pointer' }}
                          onClick={() => window.open(answer.image_url, '_blank')} />
                        <Typography variant="caption" style={{ color: '#999', ...bodyFont }}>
                          Click image to open full size
                        </Typography>
                      </Box>
                    ) : (
                      <Alert severity="warning" style={{ marginBottom: '16px', borderRadius: '10px' }}>
                        No image uploaded for this answer.
                      </Alert>
                    )}

                    {/* Marking fields */}
                    <Box style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <TextField
                        label={`Score (0 - ${answer.max_marks})`}
                        type="number"
                        value={scores[answer.id] || ''}
                        onChange={e => setScores(prev => ({ ...prev, [answer.id]: e.target.value }))}
                        variant="outlined" size="small"
                        style={{ width: '160px' }}
                        inputProps={{ min: 0, max: answer.max_marks }}
                        InputProps={{ style: { borderRadius: '8px', ...bodyFont } }}
                      />
                      <TextField
                        label="Feedback (optional)"
                        value={feedback[answer.id] || ''}
                        onChange={e => setFeedback(prev => ({ ...prev, [answer.id]: e.target.value }))}
                        variant="outlined" size="small"
                        style={{ flex: 1, minWidth: '200px' }}
                        placeholder="e.g. Good working shown, but missed final step"
                        InputProps={{ style: { borderRadius: '8px', ...bodyFont } }}
                      />
                      <Button variant="contained" onClick={() => handleMark(answer.id, answer.max_marks)}
                        disabled={marking[answer.id] || !scores[answer.id]}
                        style={{ backgroundColor: '#4caf50', borderRadius: '8px', textTransform: 'none', fontWeight: '700', boxShadow: 'none', padding: '8px 20px', ...bodyFont }}>
                        {marking[answer.id] ? 'Saving...' : 'Mark ✅'}
                      </Button>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
}

export default PendingSubmissions;