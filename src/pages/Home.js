import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Modal, useMediaQuery } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { X, Check, Star, BookOpen, Sigma, ClipboardCheck, TrendingUp, Trophy, BotMessageSquare, CheckCircle, GraduationCap } from 'lucide-react';

// Animated Counter
function Counter({ target, suffix }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1600;
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextCount = Math.floor(easedProgress * target);
      if (progress === 1) { setCount(target); return; }
      setCount(nextCount);
      requestAnimationFrame(animate);
    };
    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return <span>{count}{suffix}</span>;
}

// Typing Animation
function TypingText({ texts }) {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = texts[currentIndex];
      if (!isDeleting) {
        setCurrentText(current.substring(0, currentText.length + 1));
        if (currentText === current) { setTimeout(() => setIsDeleting(true), 1500); }
      } else {
        setCurrentText(current.substring(0, currentText.length - 1));
        if (currentText === '') { setIsDeleting(false); setCurrentIndex((prev) => (prev + 1) % texts.length); }
      }
    }, isDeleting ? 50 : 100);
    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentIndex, texts]);

  return (
    <span style={{ color: '#1a237e', borderBottom: '4px solid #ff6f00', paddingBottom: '2px' }}>
      {currentText}
    </span>
  );
}

function Home() {
  const [openModal, setOpenModal] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
  const bodyFont = { fontFamily: "'Inter', sans-serif" };
  const sectionPadding = isMobile ? '64px 20px' : isTablet ? '80px 32px' : '100px 80px';
  const compactSectionPadding = isMobile ? '36px 20px' : isTablet ? '40px 32px' : '40px 80px';
  const footerPadding = isMobile ? '48px 20px' : isTablet ? '56px 32px' : '60px 80px';
  const buttonStyle = isMobile ? { width: '100%', justifyContent: 'center' } : {};

  const features = [
    { icon: BookOpen, title: 'Structured Lessons', description: 'Step by step lessons designed by expert mathematics teachers following Nigerian curriculum', color: '#1a237e', bg: 'linear-gradient(135deg, #1a237e, #283593)', link: '/courses', label: 'Browse Courses →' },
    { icon: Sigma, title: 'Math Equation Support', description: 'Beautiful rendering of complex mathematical equations, formulas and graphs', color: '#0288d1', bg: 'linear-gradient(135deg, #0277bd, #0288d1)', link: '/courses', label: 'See Examples →' },
    { icon: ClipboardCheck, title: 'Auto-Graded Quizzes', description: 'Test your understanding with instant feedback and detailed explanations', color: '#2e7d32', bg: 'linear-gradient(135deg, #2e7d32, #4caf50)', link: '/courses', label: 'Take a Quiz →' },
    { icon: TrendingUp, title: 'Progress Tracking', description: 'Track your learning progress and see how far you have come in each course', color: '#e65100', bg: 'linear-gradient(135deg, #e65100, #ff6f00)', link: '/dashboard', label: 'View Dashboard →' },
    { icon: Trophy, title: 'Badges & Rewards', description: 'Earn badges and rewards as you complete lessons and pass quizzes', color: '#6a1b9a', bg: 'linear-gradient(135deg, #6a1b9a, #9c27b0)', link: '/badges', label: 'View Badges →' },
    { icon: BotMessageSquare, title: 'Nairafame AI Tutor', description: 'Chat with your personal AI tutor for step-by-step help in Mathematics and Science. Powered by advanced AI.', color: '#c62828', bg: 'linear-gradient(135deg, #c62828, #f44336)', link: '/ai-tutor', label: 'Try AI Tutor →' },
  ];

  return (
    <Box style={{ overflowX: 'hidden', ...bodyFont }}>

      {/* Hero Section */}
      <Box style={{ background: 'white', padding: isMobile ? '56px 20px 64px' : isTablet ? '80px 32px' : '100px 80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: isMobile ? 'auto' : '90vh', gap: isMobile ? '32px' : '40px', flexDirection: isTablet ? 'column' : 'row', flexWrap: 'wrap' }}>
        <Box style={{ maxWidth: isTablet ? '100%' : '580px', width: '100%' }}>
          <Box style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff3e0', border: '1px solid #ff6f00', borderRadius: '30px', padding: '8px 20px', marginBottom: '30px' }}>
            <span>🇳🇬</span>
            <Typography variant="body2" style={{ color: '#ff6f00', fontWeight: '600', ...bodyFont }}>Nigeria's #1 Mathematics Learning Platform</Typography>
          </Box>

          <Typography variant="h2" style={{ fontWeight: '800', marginBottom: '20px', fontSize: isMobile ? '36px' : isTablet ? '44px' : '52px', lineHeight: '1.15', color: '#0a0a0a', ...fontStyle }}>
            Learn{' '}<TypingText texts={['Mathematics', 'Algebra', 'Calculus', 'Statistics', 'Geometry']} />{' '}the right way.
          </Typography>

          <Typography variant="h6" style={{ marginBottom: '40px', color: '#555', lineHeight: '1.8', ...bodyFont, fontWeight: '400' }}>
            Structured lessons, interactive quizzes, and expert teachers helping Nigerian students pass WAEC, JAMB and build real STEM skills.
          </Typography>

          <Box style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '40px', width: '100%' }}>
            <Button variant="contained" onClick={() => setOpenModal(true)}
              style={{ backgroundColor: '#1a237e', color: 'white', padding: '16px 40px', fontSize: '16px', borderRadius: '8px', fontWeight: '700', boxShadow: '0 4px 15px rgba(26,35,126,0.3)', ...bodyFont, ...buttonStyle }}>
              Start Learning Free →
            </Button>
            <Button variant="outlined" component={Link} to="/courses"
              style={{ borderColor: '#1a237e', color: '#1a237e', padding: '16px 40px', fontSize: '16px', borderRadius: '8px', fontWeight: '600', ...bodyFont, ...buttonStyle }}>
              Browse Courses
            </Button>
          </Box>

          <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {['Free to start', 'No credit card needed', 'Cancel anytime'].map((item, i) => (
              <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} color="#4caf50" fill="#e8f5e9" />
                <Typography variant="body2" style={{ color: '#999', ...bodyFont }}>{item}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Hero Dashboard Preview */}
        <Box style={{ flex: 1, minWidth: 0, width: '100%', maxWidth: isTablet ? '100%' : '550px', background: 'linear-gradient(135deg, #1a237e, #0288d1)', borderRadius: isMobile ? '14px' : '20px', padding: isMobile ? '12px' : '30px', boxShadow: isMobile ? '0 12px 32px rgba(26,35,126,0.18)' : '0 20px 60px rgba(26,35,126,0.2)' }}>
          <Box style={{ background: 'white', borderRadius: isMobile ? '10px' : '12px', padding: isMobile ? '12px' : '20px', marginBottom: isMobile ? '10px' : '15px' }}>
            <Typography variant="h6" style={{ fontWeight: '700', color: '#1a237e', marginBottom: '4px', fontSize: isMobile ? '16px' : undefined, ...fontStyle }}>Welcome back, Amaka! 👋</Typography>
            <Typography variant="body2" style={{ color: '#666', fontSize: isMobile ? '12px' : undefined }}>Continue your learning journey</Typography>
            <Box style={{ marginTop: isMobile ? '10px' : '15px', background: '#f5f5f5', borderRadius: '8px', padding: isMobile ? '8px' : '10px' }}>
              <Typography variant="body2" style={{ color: '#333', marginBottom: '5px', fontSize: isMobile ? '12px' : undefined }}>Course Progress</Typography>
              <Box style={{ background: '#e0e0e0', borderRadius: '5px', height: isMobile ? '6px' : '8px' }}>
                <Box style={{ background: 'linear-gradient(90deg, #1a237e, #0288d1)', borderRadius: '5px', height: '100%', width: '65%' }} />
              </Box>
              <Typography variant="body2" style={{ color: '#1a237e', fontWeight: '700', marginTop: '5px', fontSize: isMobile ? '12px' : undefined }}>65% Complete</Typography>
            </Box>
          </Box>
          <Grid container spacing={isMobile ? 1 : 2}>
            {[
              { label: 'Lessons Done', value: '12' },
              { label: 'Quizzes Passed', value: '8' },
              { label: 'Badges Earned', value: '3' },
              { label: 'Day Streak', value: '7🔥' },
            ].map((item, index) => (
              <Grid item xs={6} key={index}>
                <Box style={{ background: 'rgba(255,255,255,0.15)', borderRadius: isMobile ? '8px' : '10px', padding: isMobile ? '9px 6px' : '15px', textAlign: 'center' }}>
                  <Typography variant="h5" style={{ fontWeight: '800', color: 'white', fontSize: isMobile ? '18px' : undefined, ...fontStyle }}>{item.value}</Typography>
                  <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '10px' : undefined, lineHeight: 1.2, display: 'block' }}>{item.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Stats Bar */}
      <Box style={{ background: '#0a0a0a', padding: compactSectionPadding }}>
        <Grid container spacing={3} justifyContent="center">
          {[
            { target: 500, suffix: '+', label: 'Students Enrolled' },
            { target: 20, suffix: '+', label: 'Expert Teachers' },
            { target: 50, suffix: '+', label: 'Math Courses' },
            { target: 95, suffix: '%', label: 'Pass Rate' },
          ].map((stat, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box style={{ textAlign: 'center', color: 'white' }}>
                <Typography variant="h3" style={{ fontWeight: '800', color: '#ff6f00', ...fontStyle }}><Counter target={stat.target} suffix={stat.suffix} /></Typography>
                <Typography variant="body1" style={{ color: 'rgba(255,255,255,0.7)', ...bodyFont }}>{stat.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Features Section */}
      <Box style={{ padding: sectionPadding, background: '#f0f2f8' }}>
        <Box style={{ maxWidth: '600px', marginBottom: '60px' }}>
          <Typography variant="body1" style={{ color: '#ff6f00', fontWeight: '700', marginBottom: '10px', ...bodyFont }}>WHY NAIRAFAME ACADEMY</Typography>
          <Typography variant="h3" style={{ fontWeight: '800', color: '#0a0a0a', lineHeight: '1.2', ...fontStyle }}>Everything you need to master Mathematics</Typography>
        </Box>
        <Grid container spacing={4}>
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Link to={feature.link} style={{ textDecoration: 'none' }}>
                  <Box onMouseEnter={() => setHoveredFeature(index)} onMouseLeave={() => setHoveredFeature(null)}
                    style={{ borderRadius: '20px', overflow: 'hidden', height: '100%', cursor: 'pointer', transition: 'transform 0.3s ease, box-shadow 0.3s ease', transform: hoveredFeature === index ? 'translateY(-12px) rotateX(2deg) rotateY(-2deg) scale(1.02)' : 'translateY(0) rotateX(0) rotateY(0) scale(1)', boxShadow: hoveredFeature === index ? `0 24px 60px rgba(0,0,0,0.2), 0 8px 20px ${feature.color}44, inset 0 1px 0 rgba(255,255,255,0.15)` : '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)', background: 'white', position: 'relative', transformStyle: 'preserve-3d' }}>
                    <Box style={{ height: '6px', background: feature.bg }} />
                    <Box style={{ padding: isMobile ? '24px 20px' : '32px 28px' }}>
                      <Box style={{ width: '64px', height: '64px', borderRadius: '16px', background: `${feature.color}14`, border: `2px solid ${feature.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: `0 4px 14px ${feature.color}22` }}>
                        <IconComponent size={28} color={feature.color} strokeWidth={1.8} />
                      </Box>
                      <Typography variant="h6" style={{ fontWeight: '800', marginBottom: '10px', color: '#0a0a0a', fontSize: '17px', ...fontStyle }}>{feature.title}</Typography>
                      <Typography variant="body2" style={{ color: '#777', lineHeight: '1.75', marginBottom: '24px', ...bodyFont }}>{feature.description}</Typography>
                      <Box style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: feature.color, fontWeight: '700', fontSize: '13px', padding: '8px 16px', borderRadius: '30px', backgroundColor: `${feature.color}12`, border: `1.5px solid ${feature.color}30`, transition: 'all 0.2s', ...bodyFont, ...(hoveredFeature === index ? { backgroundColor: feature.color, color: 'white', borderColor: feature.color } : {}) }}>
                        {feature.label}
                      </Box>
                    </Box>
                    {hoveredFeature === index && (
                      <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)', borderRadius: '20px', pointerEvents: 'none' }} />
                    )}
                  </Box>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* How It Works */}
      <Box style={{ padding: sectionPadding, background: 'white' }}>
        <Box style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Typography variant="body1" style={{ color: '#ff6f00', fontWeight: '700', marginBottom: '10px', ...bodyFont }}>HOW IT WORKS</Typography>
          <Typography variant="h3" style={{ fontWeight: '800', color: '#0a0a0a', ...fontStyle }}>Start learning in 3 simple steps</Typography>
        </Box>
        <Grid container spacing={6} justifyContent="center">
          {[
            { step: '01', title: 'Create Your Account', description: 'Sign up for free in less than 1 minute. No credit card needed.', color: '#1a237e' },
            { step: '02', title: 'Choose a Course', description: 'Browse our library of mathematics courses and enroll instantly.', color: '#0288d1' },
            { step: '03', title: 'Start Learning', description: 'Learn at your own pace with expert guidance and track your progress.', color: '#ff6f00' },
          ].map((item, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Box style={{ textAlign: 'center', padding: '20px' }}>
                <Typography variant="h2" style={{ fontWeight: '900', color: '#f0f0f0', marginBottom: '-20px', ...fontStyle }}>{item.step}</Typography>
                <Box style={{ width: '70px', height: '70px', borderRadius: '16px', background: item.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px', fontWeight: 'bold', boxShadow: `0 8px 25px ${item.color}44` }}>{index + 1}</Box>
                <Typography variant="h5" style={{ fontWeight: '700', marginBottom: '12px', color: '#0a0a0a', ...fontStyle }}>{item.title}</Typography>
                <Typography variant="body1" style={{ color: '#666', lineHeight: '1.7', ...bodyFont }}>{item.description}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Testimonials */}
      <Box style={{ padding: sectionPadding, background: '#fafafa' }}>
        <Box style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Typography variant="body1" style={{ color: '#ff6f00', fontWeight: '700', marginBottom: '10px', ...bodyFont }}>STUDENT STORIES</Typography>
          <Typography variant="h3" style={{ fontWeight: '800', color: '#0a0a0a', ...fontStyle }}>What our students say</Typography>
        </Box>
        <Grid container spacing={4}>
          {[
            { name: 'Amaka O.', role: 'SS3 Student, Lagos', text: 'This platform helped me understand algebra better than my school teacher. I scored A1 in WAEC mathematics!', stars: 5 },
            { name: 'Chidi E.', role: 'JAMB Candidate, Enugu', text: 'The quizzes and progress tracking kept me motivated. I improved my JAMB math score from 40 to 68!', stars: 5 },
            { name: 'Fatima B.', role: 'University Student, Kano', text: 'Finally a platform that explains Nigerian math curriculum properly. The lessons are clear and easy to follow.', stars: 5 },
          ].map((testimonial, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card elevation={0} style={{ borderRadius: '16px', height: '100%', border: '2px solid #f0f0f0', background: 'white', transition: 'transform 0.3s', padding: '10px' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <CardContent style={{ padding: '30px' }}>
                  <Box style={{ display: 'flex', marginBottom: '20px', gap: '2px' }}>
                    {[...Array(testimonial.stars)].map((_, i) => (
                      <Star key={i} size={18} fill="#ff6f00" color="#ff6f00" />
                    ))}
                  </Box>
                  <Typography variant="body1" style={{ lineHeight: '1.8', marginBottom: '25px', color: '#333', ...bodyFont }}>"{testimonial.text}"</Typography>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Box style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a237e, #0288d1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>{testimonial.name[0]}</Box>
                    <Box>
                      <Typography variant="body1" style={{ fontWeight: '700', color: '#0a0a0a', ...fontStyle }}>{testimonial.name}</Typography>
                      <Typography variant="body2" style={{ color: '#999', ...bodyFont }}>{testimonial.role}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      <Box style={{ background: '#0a0a0a', padding: sectionPadding, textAlign: 'center', color: 'white' }}>
        <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <GraduationCap size={48} color="#ff6f00" strokeWidth={1.5} />
        </Box>
        <Typography variant="h2" style={{ fontWeight: '800', marginBottom: '20px', fontSize: isMobile ? '32px' : isTablet ? '42px' : undefined, ...fontStyle }}>
          Ready to excel in Mathematics?
        </Typography>
        <Typography variant="h6" style={{ marginBottom: '40px', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto 40px', ...bodyFont }}>
          Join thousands of Nigerian students already learning on Nairafame Academy
        </Typography>
        <Box style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
          <Button variant="contained" onClick={() => setOpenModal(true)}
            style={{ backgroundColor: '#ff6f00', color: 'white', padding: '18px 50px', fontSize: '18px', borderRadius: '8px', fontWeight: '700', ...bodyFont, ...buttonStyle }}>
            Get Started Free →
          </Button>
          <Button variant="outlined" component={Link} to="/courses"
            style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', padding: '18px 50px', fontSize: '18px', borderRadius: '8px', ...bodyFont, ...buttonStyle }}>
            Browse Courses
          </Button>
        </Box>
        <Box style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
          {['Free to start', 'No credit card needed'].map((item, i) => (
            <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={15} color="#4caf50" fill="#1a3a1a" />
              <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.4)', ...bodyFont }}>{item}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Footer */}
      <Box style={{ background: '#050505', padding: footerPadding, color: 'white' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <GraduationCap size={24} color="#ff6f00" />
              <Typography variant="h6" style={{ fontWeight: '800', ...fontStyle }}>Nairafame Academy</Typography>
            </Box>
            <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.8', ...bodyFont }}>
              Nigeria's most advanced online mathematics learning platform helping students pass WAEC, JAMB and build STEM skills.
            </Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="body1" style={{ fontWeight: '700', marginBottom: '15px', ...fontStyle }}>Platform</Typography>
            {[{ label: 'Courses', path: '/courses' }, { label: 'Login', path: '/login' }, { label: 'Register', path: '/register' }].map(item => (
              <Box key={item.label} style={{ marginBottom: '10px' }}>
                <Link to={item.path} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', ...bodyFont }}>{item.label}</Link>
              </Box>
            ))}
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="body1" style={{ fontWeight: '700', marginBottom: '15px', ...fontStyle }}>Company</Typography>
            {[{ label: 'About', path: '/about' }, { label: 'Contact', path: '/' }, { label: 'Privacy Policy', path: '/privacy' }].map(item => (
              <Box key={item.label} style={{ marginBottom: '10px' }}>
                <Link to={item.path} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', ...bodyFont }}>
                  <Typography variant="body2">{item.label}</Typography>
                </Link>
              </Box>
            ))}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1" style={{ fontWeight: '700', marginBottom: '15px', ...fontStyle }}>Start Learning Today</Typography>
            <Button fullWidth variant="contained" onClick={() => setOpenModal(true)}
              style={{ backgroundColor: '#ff6f00', borderRadius: '8px', padding: '12px', ...bodyFont }}>
              Create Free Account
            </Button>
          </Grid>
        </Grid>
        <Box style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '40px', paddingTop: '20px', textAlign: 'center' }}>
          <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.3)', ...bodyFont }}>© 2026 Nairafame Academy. All Rights Reserved.</Typography>
        </Box>
      </Box>

      {/* Popup Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: '20px', padding: '40px', width: '90%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GraduationCap size={26} color="#1a237e" />
              <Typography variant="h5" style={{ fontWeight: '800', color: '#0a0a0a', ...fontStyle }}>Join Nairafame Academy</Typography>
            </Box>
            <X onClick={() => setOpenModal(false)} size={22} style={{ cursor: 'pointer', color: '#666' }} />
          </Box>
          <Box style={{ marginBottom: '25px' }}>
            {['Free to start — no credit card needed', '50+ Mathematics courses', 'Expert Nigerian teachers', 'Track your progress and earn badges'].map((item, index) => (
              <Box key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Box style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1a237e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={14} color="white" strokeWidth={3} />
                </Box>
                <Typography variant="body2" style={{ color: '#333', ...bodyFont }}>{item}</Typography>
              </Box>
            ))}
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button fullWidth variant="contained"
              onClick={() => { setOpenModal(false); navigate('/register'); }}
              style={{ backgroundColor: '#1a237e', padding: '15px', borderRadius: '10px', fontSize: '16px', fontWeight: '700', ...bodyFont }}>
              Create Free Account →
            </Button>
            <Button fullWidth variant="outlined"
              onClick={() => { setOpenModal(false); navigate('/login'); }}
              style={{ borderColor: '#1a237e', color: '#1a237e', padding: '15px', borderRadius: '10px', fontSize: '16px', ...bodyFont }}>
              Already have an account? Login
            </Button>
            <Button fullWidth variant="text"
              onClick={() => { setOpenModal(false); navigate('/courses'); }}
              style={{ color: '#999', padding: '12px', ...bodyFont }}>
              Browse Courses First
            </Button>
          </Box>
        </Box>
      </Modal>

    </Box>
  );
}

export default Home;