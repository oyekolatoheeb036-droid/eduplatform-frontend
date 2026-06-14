import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  useMediaQuery
} from '@mui/material';
import { useAuth } from '../AuthContext';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const allBadges = [
  {
    id: 1,
    name: 'First Step',
    description: 'Complete your first lesson',
    icon: <MenuBookIcon style={{ fontSize: '50px' }} />,
    color: '#0288d1',
    requirement: 'complete_lesson'
  },
  {
    id: 2,
    name: 'Quiz Master',
    description: 'Pass your first quiz',
    icon: <QuizIcon style={{ fontSize: '50px' }} />,
    color: '#ff6f00',
    requirement: 'pass_quiz'
  },
  {
    id: 3,
    name: 'Scholar',
    description: 'Enroll in 2 courses',
    icon: <SchoolIcon style={{ fontSize: '50px' }} />,
    color: '#4caf50',
    requirement: 'enroll_courses'
  },
  {
    id: 4,
    name: 'On Fire',
    description: 'Complete 3 lessons',
    icon: <LocalFireDepartmentIcon style={{ fontSize: '50px' }} />,
    color: '#f44336',
    requirement: 'complete_lessons'
  },
  {
    id: 5,
    name: 'Star Student',
    description: 'Score 100% on a quiz',
    icon: <StarIcon style={{ fontSize: '50px' }} />,
    color: '#9c27b0',
    requirement: 'perfect_quiz'
  },
  {
    id: 6,
    name: 'Champion',
    description: 'Complete all lessons in a course',
    icon: <EmojiEventsIcon style={{ fontSize: '50px' }} />,
    color: '#ff6f00',
    requirement: 'complete_course'
  }
];

function Badges() {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [stats, setStats] = useState({
    completed_lessons: 0,
    passed_quizzes: 0,
    enrolled_courses: 0,
    perfect_quizzes: 0
  });
  const { user } = useAuth();
  const student_id = user?.id;

  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
  const bodyFont = { fontFamily: "'Inter', sans-serif" };
  const headerPadding = isMobile ? '48px 20px' : isTablet ? '56px 32px' : '60px 80px';
  const pagePadding = isMobile ? '36px 20px' : isTablet ? '44px 32px' : '50px 80px';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/dashboard/${student_id}`);
      const data = res.data;

      const completedLessons = data.enrolled_courses.reduce(
        (acc, course) => acc + parseInt(course.completed_lessons || 0), 0
      );
      const passedQuizzes = data.quiz_results.filter(q => q.percentage >= 70).length;
      const perfectQuizzes = data.quiz_results.filter(q => q.percentage === 100).length;
      const enrolledCourses = data.stats.total_enrolled;

      setStats({
        completed_lessons: completedLessons,
        passed_quizzes: passedQuizzes,
        enrolled_courses: enrolledCourses,
        perfect_quizzes: perfectQuizzes
      });

      const earned = [];
      if (completedLessons >= 1) earned.push(1);
      if (passedQuizzes >= 1) earned.push(2);
      if (enrolledCourses >= 2) earned.push(3);
      if (completedLessons >= 3) earned.push(4);
      if (perfectQuizzes >= 1) earned.push(5);

      setEarnedBadges(earned);
    } catch (err) {
      console.log(err);
    }
  };

  const statChips = [
    { icon: <MenuBookIcon />, label: `${stats.completed_lessons} Lessons Completed`, color: 'primary' },
    { icon: <QuizIcon />, label: `${stats.passed_quizzes} Quizzes Passed`, color: 'warning' },
    { icon: <SchoolIcon />, label: `${stats.enrolled_courses} Courses Enrolled`, color: 'success' },
    { icon: <StarIcon />, label: `${stats.perfect_quizzes} Perfect Scores`, color: 'secondary' }
  ];

  return (
    <Box style={{ background: '#fafafa', minHeight: '100vh', ...bodyFont }}>

      {/* ── Header ── */}
      <Box style={{
        background: 'white',
        padding: headerPadding,
        borderBottom: '1px solid #f0f0f0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
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

        <Box style={{ position: 'relative', maxWidth: '780px' }}>
          {/* Pill badge */}
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
              ACHIEVEMENTS
            </Typography>
          </Box>

          <Typography style={{
            fontWeight: '800',
            marginBottom: '12px',
            color: '#0a0a0a',
            fontSize: isMobile ? '34px' : '42px',
            lineHeight: '1.15',
            ...fontStyle
          }}>
            My{' '}
            <span style={{
              background: 'linear-gradient(135deg, #1a237e, #0288d1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Badges
            </span>
            {' '}🏆
          </Typography>

          <Typography variant="h6" style={{
            color: '#666',
            fontWeight: '400',
            lineHeight: '1.6',
            maxWidth: '680px',
            ...bodyFont
          }}>
            Earn badges by completing lessons, passing quizzes and more!
          </Typography>
        </Box>
      </Box>

      {/* ── Page body ── */}
      <Box style={{ padding: pagePadding }}>

        {/* Stats chips */}
        <Box style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          {statChips.map(chip => (
            <Chip
              key={chip.label}
              icon={chip.icon}
              label={chip.label}
              color={chip.color}
              style={{ fontSize: '14px', padding: '10px', fontFamily: "'Inter', sans-serif" }}
            />
          ))}
        </Box>

        {/* Badges grid */}
        <Grid container spacing={3}>
          {allBadges.map(badge => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={badge.id}>
                <Card
                  elevation={0}
                  style={{
                    borderRadius: '20px',
                    border: earned ? `2px solid ${badge.color}` : '1px solid #f0f0f0',
                    boxShadow: earned
                      ? `0 4px 20px ${badge.color}22`
                      : '0 2px 12px rgba(0,0,0,0.06)',
                    opacity: earned ? 1 : 0.5,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent style={{
                    textAlign: 'center',
                    padding: isMobile ? '24px 20px' : '32px 28px'
                  }}>
                    {/* Icon circle */}
                    <Box style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      background: earned ? badge.color : '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: 'white'
                    }}>
                      {badge.icon}
                    </Box>

                    {/* Badge name */}
                    <Typography style={{
                      fontWeight: '800',
                      marginBottom: '6px',
                      fontSize: '20px',
                      color: earned ? badge.color : '#999',
                      ...fontStyle
                    }}>
                      {badge.name}
                    </Typography>

                    {/* Description */}
                    <Typography variant="body2" style={{
                      color: '#666',
                      marginBottom: '18px',
                      lineHeight: '1.6',
                      ...bodyFont
                    }}>
                      {badge.description}
                    </Typography>

                    {/* Earned / Locked pill */}
                    <Box style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: earned ? badge.color : '#e0e0e0',
                      borderRadius: '30px',
                      padding: '6px 18px'
                    }}>
                      <Typography variant="body2" style={{
                        color: 'white',
                        fontWeight: '700',
                        ...bodyFont
                      }}>
                        {earned ? '✅ Earned!' : '🔒 Locked'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}

export default Badges;