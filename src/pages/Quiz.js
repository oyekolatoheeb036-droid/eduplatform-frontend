import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Box, Typography, Card, CardContent, Button, Radio, RadioGroup, FormControlLabel, FormControl, Alert, LinearProgress } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';

function Quiz() {
  const { lesson_id, course_id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
const student_id = user?.id;

  useEffect(() => {
    axios.get(`http://localhost:5000/api/quiz/lesson/${lesson_id}`)
      .then(res => {
        setQuiz(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, [lesson_id]);

  const handleAnswer = (question_id, answer) => {
    setAnswers({ ...answers, [question_id]: answer });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/quiz/submit', {
        student_id,
        quiz_id: quiz.id,
        answers
      });
      setResult(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <Typography style={{ padding: '40px', textAlign: 'center' }}>Loading quiz...</Typography>;

  if (!quiz) return (
    <Box style={{ padding: '40px', textAlign: 'center' }}>
      <Typography variant="h5" color="textSecondary">No quiz available for this lesson.</Typography>
      <Button variant="contained" onClick={() => navigate(-1)} style={{ marginTop: '20px', backgroundColor: '#1a237e' }}>
        Go Back
      </Button>
    </Box>
  );

  return (
    <Box style={{ padding: '40px', background: '#f5f5f5', minHeight: '90vh' }}>
      <Box style={{ maxWidth: '800px', margin: 'auto' }}>
        <Box style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <QuizIcon style={{ fontSize: '40px', color: '#1a237e', marginRight: '15px' }} />
          <Typography variant="h4" style={{ fontWeight: 'bold', color: '#1a237e' }}>
            {quiz.title}
          </Typography>
        </Box>

        {result ? (
          <Card elevation={4} style={{ borderRadius: '15px', textAlign: 'center', padding: '40px' }}>
            <Typography variant="h3" style={{ fontWeight: 'bold', color: result.passed ? '#4caf50' : '#f44336' }}>
              {result.percentage}%
            </Typography>
            <Typography variant="h5" style={{ marginTop: '10px', marginBottom: '20px' }}>
              {result.passed ? '🎉 Congratulations! You Passed!' : '😔 You need to score 70% to pass'}
            </Typography>
            <LinearProgress variant="determinate" value={result.percentage}
              style={{ height: '15px', borderRadius: '8px', marginBottom: '20px' }}
              color={result.passed ? 'success' : 'error'} />
            <Typography variant="h6" style={{ marginBottom: '30px' }}>
              You scored {result.score} out of {result.total} questions
            </Typography>
            <Box style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <Button variant="contained" onClick={() => { setResult(null); setAnswers({}); }}
                style={{ backgroundColor: '#1a237e', padding: '12px 30px', borderRadius: '8px' }}>
                Try Again
              </Button>
              <Button variant="outlined" onClick={() => navigate(-1)}
                style={{ borderColor: '#1a237e', color: '#1a237e', padding: '12px 30px', borderRadius: '8px' }}>
                Back to Lessons
              </Button>
            </Box>
          </Card>
        ) : (
          <>
            {quiz.questions.map((question, index) => (
              <Card key={question.id} elevation={3} style={{ borderRadius: '15px', marginBottom: '20px' }}>
                <CardContent style={{ padding: '30px' }}>
                  <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                    {index + 1}. {question.question}
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup value={answers[question.id] || ''} onChange={e => handleAnswer(question.id, e.target.value)}>
                      <FormControlLabel value="A" control={<Radio />} label={question.option_a} />
                      <FormControlLabel value="B" control={<Radio />} label={question.option_b} />
                      <FormControlLabel value="C" control={<Radio />} label={question.option_c} />
                      <FormControlLabel value="D" control={<Radio />} label={question.option_d} />
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            ))}
            {Object.keys(answers).length === quiz.questions.length && (
              <Button fullWidth variant="contained" onClick={handleSubmit}
                style={{ backgroundColor: '#ff6f00', padding: '15px', fontSize: '18px', borderRadius: '8px', marginTop: '10px' }}>
                Submit Quiz 🎯
              </Button>
            )}
            {Object.keys(answers).length < quiz.questions.length && (
              <Alert severity="info" style={{ marginTop: '10px' }}>
                Please answer all {quiz.questions.length} questions to submit.
              </Alert>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default Quiz;