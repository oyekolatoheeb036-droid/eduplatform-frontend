import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Typography,
  useMediaQuery
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import QuizIcon from '@mui/icons-material/Quiz';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Dashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [progress, setProgress] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();
  const student_id = user?.id;
  const studentName = user?.name || 'Student';
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
  const bodyFont = { fontFamily: "'Inter', sans-serif" };
  const headerPadding = isMobile ? '48px 20px' : isTablet ? '56px 32px' : '60px 80px';
  const pagePadding = isMobile ? '36px 20px' : isTablet ? '44px 32px' : '50px 80px';

  useEffect(() => {
    if (!student_id) return;

    axios.get(`http://localhost:5000/api/enrollments/${student_id}`)
      .then(res => {
        setEnrolledCourses(res.data);
        res.data.forEach(course => {
          axios.get(`http://localhost:5000/api/progress/${student_id}/${course.id}`)
            .then(progressRes => {
              setProgress(prev => ({ ...prev, [course.id]: progressRes.data }));
            })
            .catch(err => console.log(err));
        });
      })
      .catch(err => console.log(err));

    axios.get(`http://localhost:5000/api/quiz/results/${student_id}`)
      .then(res => setQuizResults(res.data))
      .catch(err => console.log(err));
  }, [student_id]);

  return (
    <Box style={{ background: '#fafafa', minHeight: '100vh', ...bodyFont }}>
      <Box style={{
        background: 'white',
        padding: headerPadding,
        borderBottom: '1px solid #f0f0f0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box style={{
          position: 'absolute',
          top: '-70px',
          right: '-80px',
          width: isMobile ? '220px' : '320px',
          height: isMobile ? '220px' : '320px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #e8eaf6, #e3f2fd)',
          opacity: 0.7
        }} />
        <Box style={{
          position: 'absolute',
          bottom: '-90px',
          right: isMobile ? '-30px' : '250px',
          width: isMobile ? '150px' : '200px',
          height: isMobile ? '150px' : '200px',
          borderRadius: '50%',
          background: '#fff3e0',
          opacity: 0.6
        }} />

        <Box style={{ position: 'relative', maxWidth: '760px' }}>
          <Box style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#fff3e0',
            border: '1px solid #ff6f00',
            borderRadius: '30px',
            padding: '6px 16px',
            marginBottom: '20px'
          }}>
            <Typography variant="body2" style={{ color: '#ff6f00', fontWeight: '700', ...bodyFont }}>
              STUDENT DASHBOARD
            </Typography>
          </Box>

          <Box style={{
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: '18px',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <Avatar style={{
              width: isMobile ? '56px' : '70px',
              height: isMobile ? '56px' : '70px',
              background: 'linear-gradient(135deg, #1a237e, #0288d1)',
              color: 'white',
              fontSize: isMobile ? '24px' : '30px',
              fontWeight: '800',
              ...fontStyle
            }}>
              {studentName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography style={{
                fontWeight: '800',
                marginBottom: '10px',
                color: '#0a0a0a',
                fontSize: isMobile ? '34px' : '42px',
                lineHeight: '1.15',
                ...fontStyle
              }}>
                Welcome back,{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #1a237e, #0288d1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {studentName}
                </span>
              </Typography>
              <Typography variant="h6" style={{ color: '#666', fontWeight: '400', lineHeight: '1.6', ...bodyFont }}>
                Continue your courses, track your progress, and keep building your mathematics confidence.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box style={{ padding: pagePadding }}>
        <Grid container spacing={3} style={{ marginBottom: '36px' }}>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} style={{ borderRadius: '18px', textAlign: 'center', padding: '24px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <SchoolIcon style={{ fontSize: '44px', color: '#1a237e', marginBottom: '10px' }} />
              <Typography variant="h3" style={{ fontWeight: '800', color: '#1a237e', ...fontStyle }}>
                {enrolledCourses.length}
              </Typography>
              <Typography variant="body1" style={{ color: '#666', fontWeight: '600', ...bodyFont }}>
                Enrolled Courses
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} style={{ borderRadius: '18px', textAlign: 'center', padding: '24px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <CheckCircleIcon style={{ fontSize: '44px', color: '#4caf50', marginBottom: '10px' }} />
              <Typography variant="h3" style={{ fontWeight: '800', color: '#4caf50', ...fontStyle }}>
                {quizResults.filter(q => q.percentage >= 70).length}
              </Typography>
              <Typography variant="body1" style={{ color: '#666', fontWeight: '600', ...bodyFont }}>
                Quizzes Passed
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} style={{ borderRadius: '18px', textAlign: 'center', padding: '24px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <QuizIcon style={{ fontSize: '44px', color: '#ff6f00', marginBottom: '10px' }} />
              <Typography variant="h3" style={{ fontWeight: '800', color: '#ff6f00', ...fontStyle }}>
                {quizResults.length}
              </Typography>
              <Typography variant="body1" style={{ color: '#666', fontWeight: '600', ...bodyFont }}>
                Quizzes Taken
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
          <Box>
            <Typography style={{ fontWeight: '800', color: '#0a0a0a', fontSize: '26px', ...fontStyle }}>
              My Courses
            </Typography>
            <Typography variant="body2" style={{ color: '#999', marginTop: '4px', ...bodyFont }}>
              Pick up from where you stopped
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/courses')}
            style={{ borderColor: '#1a237e', color: '#1a237e', borderRadius: '10px', padding: '10px 18px', fontWeight: '700', textTransform: 'none', ...bodyFont }}
          >
            Browse Courses
          </Button>
        </Box>

        {enrolledCourses.length === 0 ? (
          <Card elevation={0} style={{ borderRadius: '18px', padding: isMobile ? '28px 18px' : '36px', textAlign: 'center', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Typography variant="h6" style={{ color: '#333', fontWeight: '700', ...fontStyle }}>
              You haven't enrolled in any courses yet.
            </Typography>
            <Typography variant="body2" style={{ color: '#999', marginTop: '8px', ...bodyFont }}>
              Start with a course and your progress will appear here.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/courses')}
              style={{ marginTop: '20px', backgroundColor: '#1a237e', borderRadius: '10px', padding: '12px 24px', fontWeight: '700', textTransform: 'none', ...bodyFont }}
            >
              Browse Courses
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {enrolledCourses.map(course => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card elevation={0} style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
                  <Box style={{ background: 'linear-gradient(135deg, #1a237e, #283593)', padding: '28px 25px', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                      <PlayCircleFilledIcon style={{ fontSize: '30px', color: 'white' }} />
                    </Box>
                    <Typography style={{ color: 'white', fontWeight: '800', fontSize: '18px', lineHeight: '1.3', ...fontStyle }}>
                      {course.title}
                    </Typography>
                  </Box>
                  <CardContent style={{ padding: '22px 25px' }}>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: '15px', lineHeight: '1.6', ...bodyFont }}>
                      {course.description}
                    </Typography>
                    <Typography variant="body2" style={{ marginBottom: '8px', fontWeight: '700', color: '#333', ...bodyFont }}>
                      Progress: {progress[course.id]?.percentage || 0}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={progress[course.id]?.percentage || 0}
                      style={{ marginBottom: '15px', borderRadius: '5px', height: '8px', backgroundColor: '#e8eaf6' }}
                    />
                    <Chip
                      label={`${progress[course.id]?.completed_count || 0}/${progress[course.id]?.total_lessons || 0} lessons`}
                      size="small"
                      style={{ marginBottom: '18px', backgroundColor: '#fff3e0', color: '#ff6f00', fontWeight: '700' }}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate(`/courses/${course.id}/lessons`)}
                      style={{ background: 'linear-gradient(135deg, #1a237e, #283593)', borderRadius: '10px', padding: '12px', fontWeight: '700', textTransform: 'none', boxShadow: 'none', ...bodyFont }}
                    >
                      Continue Learning
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {quizResults.length > 0 && (
          <Box style={{ marginTop: '40px' }}>
            <Typography style={{ fontWeight: '800', color: '#0a0a0a', fontSize: '26px', marginBottom: '24px', ...fontStyle }}>
              Quiz Results
            </Typography>
            <Grid container spacing={3}>
              {quizResults.map(result => (
                <Grid item xs={12} sm={6} md={4} key={result.id}>
                  <Card elevation={0} style={{ borderRadius: '18px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <CardContent style={{ padding: '24px' }}>
                      <Typography variant="h6" style={{ fontWeight: '800', marginBottom: '10px', color: '#0a0a0a', ...fontStyle }}>
                        {result.quiz_title}
                      </Typography>
                      <Typography variant="h4" style={{ fontWeight: '800', color: result.percentage >= 70 ? '#4caf50' : '#f44336', ...fontStyle }}>
                        {result.percentage}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={result.percentage}
                        style={{ marginTop: '10px', borderRadius: '5px', height: '8px' }}
                        color={result.percentage >= 70 ? 'success' : 'error'}
                      />
                      <Chip
                        label={result.percentage >= 70 ? 'Passed' : 'Failed'}
                        color={result.percentage >= 70 ? 'success' : 'error'}
                        style={{ marginTop: '12px', fontWeight: '700' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Dashboard;
