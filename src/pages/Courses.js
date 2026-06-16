import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Grid, Button, Chip, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedIcon from '@mui/icons-material/Verified';

const courseColors = [
  { bg: 'linear-gradient(135deg, #1a237e, #283593)', emoji: '📐' },
  { bg: 'linear-gradient(135deg, #006064, #00838f)', emoji: '🔢' },
  { bg: 'linear-gradient(135deg, #4a148c, #6a1b9a)', emoji: '📊' },
  { bg: 'linear-gradient(135deg, #b71c1c, #c62828)', emoji: '🧮' },
  { bg: 'linear-gradient(135deg, #1b5e20, #2e7d32)', emoji: '📈' },
  { bg: 'linear-gradient(135deg, #e65100, #ef6c00)', emoji: '🎯' },
];

function Courses() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const student_id = user?.id;

  useEffect(() => {
    axios.get('https://eduplatform-api-pol1.onrender.com/api/courses')
      .then(res => {
        setCourses(res.data);
        setFiltered(res.data);
      })
      .catch(err => console.log(err));

    if (student_id) {
      axios.get(`https://eduplatform-api-pol1.onrender.com/api/enrollments/${student_id}`)
        .then(res => setEnrolledCourses(res.data.map(c => c.id)))
        .catch(err => console.log(err));
    }
  }, [student_id]);

  const handleSearch = (value) => {
    setSearch(value);
    const query = value.toLowerCase();
    setFiltered(courses.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query)
    ));
  };

  const handleEnroll = async (course_id) => {
    try {
      if (!user) {
        setMessageType('error');
        setMessage('Please login first to enroll in a course!');
        return;
      }
      await axios.post('https://eduplatform-api-pol1.onrender.com/api/enrollments', {
        student_id, course_id
      });
      setMessageType('success');
      setMessage('Successfully enrolled in the course! 🎉');
      setEnrolledCourses(prev => [...prev, course_id]);
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.error || 'Enrollment failed. Try again.');
    }
  };

  const isEnrolled = (course_id) => enrolledCourses.includes(course_id);

  return (
    <Box style={{ background: '#fafafa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <Box style={{
        background: 'white', padding: '60px 80px',
        borderBottom: '1px solid #f0f0f0',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <Box style={{ position: 'absolute', top: '-60px', right: '-60px', width: '320px', height: '320px', borderRadius: '50%', background: 'linear-gradient(135deg, #e8eaf6, #e3f2fd)', opacity: 0.7 }} />
        <Box style={{ position: 'absolute', bottom: '-80px', right: '250px', width: '200px', height: '200px', borderRadius: '50%', background: '#fff3e0', opacity: 0.6 }} />

        <Box style={{ position: 'relative', maxWidth: '700px' }}>
          <Box style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#fff3e0', border: '1px solid #ff6f00',
            borderRadius: '30px', padding: '6px 16px', marginBottom: '20px'
          }}>
            <Typography variant="body2" style={{ color: '#ff6f00', fontWeight: '600' }}>
              🇳🇬 Designed for Nigerian Students
            </Typography>
          </Box>

          <Typography style={{
            fontWeight: '800', marginBottom: '10px', color: '#0a0a0a',
            fontFamily: "'Space Grotesk', sans-serif", fontSize: '42px',
            lineHeight: '1.2'
          }}>
            Find Your Perfect{' '}
            <span style={{
              background: 'linear-gradient(135deg, #1a237e, #0288d1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Mathematics</span>{' '}
            Course
          </Typography>

          <Typography variant="h6" style={{ color: '#666', marginBottom: '30px', fontWeight: '400' }}>
            Expert-led courses helping Nigerian students pass WAEC, JAMB and build real STEM skills
          </Typography>

          {/* Search Bar */}
          <Box style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'white', border: '2px solid #e0e0e0',
            borderRadius: '16px', padding: '8px 8px 8px 16px',
            maxWidth: '600px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <Typography style={{ fontSize: '20px', flexShrink: 0 }}>🔍</Typography>
            <input
              placeholder="Search e.g Algebra, Calculus, WAEC Maths..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontSize: '15px', color: '#333',
                fontFamily: "'Inter', sans-serif",
                background: 'transparent',
                minWidth: 0
              }}
            />
            <Button variant="contained"
              style={{
                backgroundColor: '#1a237e', borderRadius: '10px',
                padding: '10px 16px', fontWeight: '700',
                textTransform: 'none', fontSize: '15px',
                flexShrink: 0, whiteSpace: 'nowrap',
                boxShadow: 'none'
              }}>
              Search
            </Button>
          </Box>

          {/* Quick Tags */}
          <Box style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
            {['Algebra', 'Calculus', 'WAEC Maths', 'JAMB Prep', 'Statistics', 'Geometry'].map(tag => (
              <Chip key={tag} label={tag}
                onClick={() => handleSearch(tag)}
                style={{
                  cursor: 'pointer', backgroundColor: search === tag ? '#1a237e' : '#f5f5f5',
                  color: search === tag ? 'white' : '#333',
                  border: '1px solid #e0e0e0', fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box style={{ padding: '50px 80px' }}>
        {message && (
          <Alert severity={messageType} style={{ marginBottom: '25px', borderRadius: '10px' }} onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <Box>
            <Typography style={{ fontWeight: '800', color: '#0a0a0a', fontSize: '24px', fontFamily: "'Space Grotesk', sans-serif" }}>
              {filtered.length} Course{filtered.length !== 1 ? 's' : ''} Available
            </Typography>
            <Typography variant="body2" style={{ color: '#999', marginTop: '4px' }}>
              All courses are free to enroll
            </Typography>
          </Box>
        </Box>

        {filtered.length === 0 ? (
          <Box style={{ textAlign: 'center', padding: '80px' }}>
            <Typography style={{ fontSize: '60px', marginBottom: '20px' }}>🔍</Typography>
            <Typography variant="h5" style={{ color: '#333', marginBottom: '10px', fontWeight: '700' }}>
              No courses found
            </Typography>
            <Typography variant="body1" style={{ color: '#999' }}>
              Try searching with different keywords
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((course, index) => {
              const colorScheme = courseColors[index % courseColors.length];
              return (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <Box style={{
                    borderRadius: '20px', overflow: 'hidden',
                    background: 'white', height: '100%',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                    display: 'flex', flexDirection: 'column'
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                    }}>

                    {/* Course Banner */}
                    <Box style={{
                      background: colorScheme.bg,
                      padding: '30px 25px',
                      position: 'relative', minHeight: '140px',
                      display: 'flex', flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      {/* Top row */}
                      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box style={{
                          width: '50px', height: '50px', borderRadius: '12px',
                          background: 'rgba(255,255,255,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '24px'
                        }}>
                          {colorScheme.emoji}
                        </Box>
                        {isEnrolled(course.id) && (
                          <Chip label="✅ Enrolled" size="small"
                            style={{ backgroundColor: '#4caf50', color: 'white', fontWeight: '700' }} />
                        )}
                      </Box>

                      {/* Course title on banner */}
                      <Box>
                        <Chip label="Mathematics" size="small"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white', fontWeight: '600',
                            marginBottom: '8px', fontSize: '11px'
                          }} />
                        <Typography style={{
                          color: 'white', fontWeight: '800',
                          fontSize: '18px', lineHeight: '1.3',
                          fontFamily: "'Space Grotesk', sans-serif"
                        }}>
                          {course.title}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Card Body */}
                    <Box style={{ padding: '20px 25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" style={{
                        color: '#666', marginBottom: '15px',
                        lineHeight: '1.6', flex: 1
                      }}>
                        {course.description || 'Learn mathematics with structured lessons and interactive quizzes designed for Nigerian students.'}
                      </Typography>

                      {/* Course Stats */}
                      <Box style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                        gap: '8px', marginBottom: '20px',
                        padding: '12px', background: '#fafafa',
                        borderRadius: '10px'
                      }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <StarIcon style={{ fontSize: '14px', color: '#ff6f00' }} />
                          <Typography variant="caption" style={{ fontWeight: '700', color: '#333' }}>4.8 Rating</Typography>
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <PeopleIcon style={{ fontSize: '14px', color: '#666' }} />
                          <Typography variant="caption" style={{ color: '#666' }}>120 students</Typography>
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MenuBookIcon style={{ fontSize: '14px', color: '#666' }} />
                          <Typography variant="caption" style={{ color: '#666' }}>12 lessons</Typography>
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <AccessTimeIcon style={{ fontSize: '14px', color: '#666' }} />
                          <Typography variant="caption" style={{ color: '#666' }}>6 hours</Typography>
                        </Box>
                      </Box>

                      {/* Instructor */}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <Box style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: colorScheme.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '12px', fontWeight: '700'
                        }}>T</Box>
                        <Typography variant="caption" style={{ color: '#666' }}>
                          By <span style={{ fontWeight: '700', color: '#333' }}>Nairafame Instructor</span>
                        </Typography>
                        <VerifiedIcon style={{ fontSize: '14px', color: '#0288d1' }} />
                      </Box>

                      {/* Free Badge */}
                      <Box style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', marginBottom: '15px'
                      }}>
                        <Box>
                          <Typography style={{ fontWeight: '800', color: '#4caf50', fontSize: '20px' }}>
                            FREE
                          </Typography>
                          <Typography variant="caption" style={{ color: '#999' }}>
                            Limited time offer
                          </Typography>
                        </Box>
                        <Chip label="🏆 Certificate" size="small"
                          style={{ backgroundColor: '#fff3e0', color: '#ff6f00', fontWeight: '600' }} />
                      </Box>

                      {/* Buttons */}
                      {isEnrolled(course.id) ? (
                        <Button fullWidth variant="contained"
                          onClick={() => navigate(`/courses/${course.id}/lessons`)}
                          style={{
                            background: colorScheme.bg,
                            borderRadius: '10px', padding: '12px',
                            fontWeight: '700', textTransform: 'none',
                            fontSize: '15px', boxShadow: 'none'
                          }}>
                          Continue Learning →
                        </Button>
                      ) : (
                        <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <Button fullWidth variant="contained"
                            onClick={() => handleEnroll(course.id)}
                            style={{
                              background: colorScheme.bg,
                              borderRadius: '10px', padding: '12px',
                              fontWeight: '700', textTransform: 'none',
                              fontSize: '15px', boxShadow: 'none'
                            }}>
                            Enroll Free →
                          </Button>
                          <Button fullWidth variant="outlined"
                            onClick={() => navigate(`/courses/${course.id}/lessons`)}
                            style={{
                              borderColor: '#e0e0e0', color: '#666',
                              borderRadius: '10px', padding: '10px',
                              fontWeight: '600', textTransform: 'none'
                            }}>
                            Preview Course
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default Courses;