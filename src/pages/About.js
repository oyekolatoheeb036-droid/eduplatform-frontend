import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  BookOpen, Sigma, Heart, BotMessageSquare, ClipboardCheck,
  Users, MessageCircleQuestion, Trophy, TrendingUp, GraduationCap,
  CheckCircle2, Clock, PenLine, ListChecks, Camera, Bell,
  ArrowRight, Quote
} from 'lucide-react';

function About() {
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
  const bodyFont = { fontFamily: "'Inter', sans-serif" };
  const sectionPadding = isMobile ? '64px 20px' : isTablet ? '80px 32px' : '100px 80px';
  const compactSectionPadding = isMobile ? '36px 20px' : isTablet ? '40px 32px' : '40px 80px';

  // 5-part lesson module structure
  const moduleSteps = [
    { icon: BookOpen, title: 'Introduction', description: 'A clear opening to every topic, so you know what you\'re learning and why it matters.', color: '#1a237e' },
    { icon: Sigma, title: 'Learn', description: 'Core teaching with full math equation rendering for total clarity.', color: '#0288d1' },
    { icon: Heart, title: 'Relate', description: 'Real Nigerian context so ideas connect to things you actually see and use.', color: '#2e7d32' },
    { icon: BotMessageSquare, title: 'Dive Deeper', description: 'An AI tutor locked to that exact lesson, ready whenever you want to go further.', color: '#c62828' },
    { icon: ClipboardCheck, title: 'Quiz', description: 'Three sections to prove what you\'ve learned, marked in different ways.', color: '#ff6f00' },
  ];

  const quizSections = [
    { icon: ListChecks, label: 'Section A', title: 'Multiple Choice', description: 'Auto-marked the instant you submit. No waiting.', color: '#1a237e', badge: 'Instant' },
    { icon: PenLine, label: 'Section B', title: 'Typed Theory', description: 'Marked immediately by AI right after submission.', color: '#0288d1', badge: 'AI-Marked' },
    { icon: Camera, label: 'Section C', title: 'Handwritten Theory', description: 'Write it out on paper, snap a photo, upload. Your teacher is notified right away.', color: '#ff6f00', badge: 'Teacher-Marked' },
  ];

  const platformFeatures = [
    { icon: Users, title: 'Student Community', description: 'Connect with other students, ask questions, and share knowledge with each other.', color: '#6a1b9a', bg: 'linear-gradient(135deg, #6a1b9a, #9c27b0)', link: '/community', label: 'Join the Community →' },
    { icon: MessageCircleQuestion, title: 'Section-by-Section Q&A', description: 'Ask a question right after Introduction, Learn, Relate, or Dive Deeper — not just at the end.', color: '#e65100', bg: 'linear-gradient(135deg, #e65100, #ff6f00)', link: '/courses', label: 'See It In a Lesson →' },
    { icon: Trophy, title: 'Badges & Rewards', description: 'Earn recognition as you complete lessons and pass quizzes.', color: '#2e7d32', bg: 'linear-gradient(135deg, #2e7d32, #4caf50)', link: '/badges', label: 'View Badges →' },
    { icon: TrendingUp, title: 'Progress Tracking', description: 'See exactly how far you\'ve come in every course, every step of the way.', color: '#0288d1', bg: 'linear-gradient(135deg, #0277bd, #0288d1)', link: '/dashboard', label: 'View Dashboard →' },
    { icon: BotMessageSquare, title: 'Nairafame AI Tutor', description: 'A general AI tutor for Mathematics and Science, on top of the lesson-locked Dive Deeper AI.', color: '#c62828', bg: 'linear-gradient(135deg, #c62828, #f44336)', link: '/ai-tutor', label: 'Try AI Tutor →' },
    { icon: Sigma, title: 'Full Equation Rendering', description: 'Every formula, fraction, and graph renders beautifully — nothing lost in translation.', color: '#1a237e', bg: 'linear-gradient(135deg, #1a237e, #283593)', link: '/courses', label: 'See Examples →' },
  ];

  return (
    <Box style={{ overflowX: 'hidden', ...bodyFont }}>

      {/* Hero */}
      <Box style={{ background: 'white', padding: isMobile ? '56px 20px 48px' : isTablet ? '80px 32px 56px' : '100px 80px 70px', textAlign: 'center' }}>
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff3e0', border: '1px solid #ff6f00', borderRadius: '30px', padding: '8px 20px', marginBottom: '30px' }}>
          <span>🇳🇬</span>
          <Typography variant="body2" style={{ color: '#ff6f00', fontWeight: '600', ...bodyFont }}>About Nairafame Academy</Typography>
        </Box>
        <Typography variant="h2" style={{ fontWeight: '800', marginBottom: '20px', fontSize: isMobile ? '32px' : isTablet ? '42px' : '50px', lineHeight: '1.2', color: '#0a0a0a', maxWidth: '820px', margin: '0 auto 20px', ...fontStyle }}>
          A learning platform built the way Nigerian students actually learn
        </Typography>
        <Typography variant="h6" style={{ color: '#555', lineHeight: '1.8', maxWidth: '650px', margin: '0 auto', fontWeight: '400', ...bodyFont }}>
          Every lesson, quiz, and conversation on Nairafame Academy is designed around one goal: helping you truly understand Mathematics and Science, not just memorize it.
        </Typography>
      </Box>

      {/* The Learning Journey - Module Structure */}
      <Box style={{ padding: sectionPadding, background: '#f0f2f8' }}>
        <Box style={{ maxWidth: '650px', marginBottom: '50px' }}>
          <Typography variant="body1" style={{ color: '#ff6f00', fontWeight: '700', marginBottom: '10px', ...bodyFont }}>THE LEARNING JOURNEY</Typography>
          <Typography variant="h3" style={{ fontWeight: '800', color: '#0a0a0a', lineHeight: '1.2', marginBottom: '16px', fontSize: isMobile ? '26px' : '36px', ...fontStyle }}>Every lesson follows a 5-part structure</Typography>
          <Typography variant="body1" style={{ color: '#666', lineHeight: '1.8', ...bodyFont }}>No lesson dumps information on you and walks away. Each one is built in five deliberate stages.</Typography>
        </Box>

        {/* Mockup: Module flow card */}
        <Box style={{ background: 'linear-gradient(135deg, #1a237e, #0288d1)', borderRadius: isMobile ? '16px' : '24px', padding: isMobile ? '16px' : '32px', marginBottom: '50px', boxShadow: '0 20px 60px rgba(26,35,126,0.2)' }}>
          <Box style={{ background: 'white', borderRadius: isMobile ? '12px' : '16px', padding: isMobile ? '16px' : '24px' }}>
            <Typography variant="body2" style={{ color: '#999', fontWeight: '600', marginBottom: '16px', ...bodyFont }}>QUADRATIC EQUATIONS — LESSON 3</Typography>
            <Grid container spacing={2}>
              {moduleSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Grid item xs={12} sm={6} md={2.4} key={i}>
                    <Box style={{ background: `${step.color}0d`, border: `1.5px solid ${step.color}30`, borderRadius: '12px', padding: '16px', height: '100%' }}>
                      <Box style={{ width: '40px', height: '40px', borderRadius: '10px', background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                        <Icon size={20} color="white" strokeWidth={1.8} />
                      </Box>
                      <Typography variant="body1" style={{ fontWeight: '700', color: '#0a0a0a', marginBottom: '4px', fontSize: '14px', ...fontStyle }}>{i + 1}. {step.title}</Typography>
                      <Typography variant="body2" style={{ color: '#777', fontSize: '12px', lineHeight: '1.6', ...bodyFont }}>{step.description}</Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Quiz System */}
      <Box style={{ padding: sectionPadding, background: 'white' }}>
        <Box style={{ maxWidth: '650px', marginBottom: '50px' }}>
          <Typography variant="body1" style={{ color: '#ff6f00', fontWeight: '700', marginBottom: '10px', ...bodyFont }}>PROVE WHAT YOU KNOW</Typography>
          <Typography variant="h3" style={{ fontWeight: '800', color: '#0a0a0a', lineHeight: '1.2', marginBottom: '16px', fontSize: isMobile ? '26px' : '36px', ...fontStyle }}>A quiz system with three ways to be marked</Typography>
          <Typography variant="body1" style={{ color: '#666', lineHeight: '1.8', ...bodyFont }}>Every quiz has three sections, and each one is marked the right way for the type of answer it needs.</Typography>
        </Box>

        <Grid container spacing={4}>
          {quizSections.map((section, i) => {
            const Icon = section.icon;
            return (
              <Grid item xs={12} md={4} key={i}>
                <Box style={{ borderRadius: '20px', overflow: 'hidden', height: '100%', background: 'white', border: '2px solid #f0f0f0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                  <Box style={{ height: '6px', background: section.color }} />
                  <Box style={{ padding: isMobile ? '24px 20px' : '28px 24px' }}>
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <Box style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${section.color}14`, border: `2px solid ${section.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={24} color={section.color} strokeWidth={1.8} />
                      </Box>
                      <Box style={{ padding: '5px 12px', borderRadius: '20px', background: `${section.color}12`, border: `1px solid ${section.color}30` }}>
                        <Typography variant="caption" style={{ color: section.color, fontWeight: '700', fontSize: '11px', ...bodyFont }}>{section.badge}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" style={{ color: '#999', fontWeight: '700', marginBottom: '4px', ...bodyFont }}>{section.label}</Typography>
                    <Typography variant="h6" style={{ fontWeight: '800', marginBottom: '10px', color: '#0a0a0a', fontSize: '18px', ...fontStyle }}>{section.title}</Typography>
                    <Typography variant="body2" style={{ color: '#777', lineHeight: '1.75', ...bodyFont }}>{section.description}</Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Mockup: Section C notification flow */}
        <Box style={{ marginTop: '40px', background: '#f7f8fc', borderRadius: '20px', padding: isMobile ? '20px' : '32px', border: '1.5px solid #eef0f7' }}>
          <Typography variant="body1" style={{ fontWeight: '700', color: '#0a0a0a', marginBottom: '20px', ...fontStyle }}>How Section C gets marked, start to finish</Typography>
          <Grid container spacing={2} alignItems="center">
            {[
              { icon: Camera, label: 'Student uploads photo', color: '#ff6f00' },
              { icon: Bell, label: 'Teacher notified instantly', color: '#c62828' },
              { icon: PenLine, label: 'Teacher marks the answer', color: '#1a237e' },
              { icon: CheckCircle2, label: 'Student notified immediately', color: '#2e7d32' },
            ].map((step, i, arr) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={i}>
                  <Grid item xs={6} sm={2.6}>
                    <Box style={{ textAlign: 'center' }}>
                      <Box style={{ width: '52px', height: '52px', borderRadius: '50%', background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                        <Icon size={22} color="white" strokeWidth={1.8} />
                      </Box>
                      <Typography variant="body2" style={{ color: '#333', fontWeight: '600', fontSize: '13px', ...bodyFont }}>{step.label}</Typography>
                    </Box>
                  </Grid>
                  {i < arr.length - 1 && !isMobile && (
                    <Grid item sm="auto">
                      <ArrowRight size={20} color="#ccc" />
                    </Grid>
                  )}
                </React.Fragment>
              );
            })}
          </Grid>
        </Box>
      </Box>

      {/* Platform Features */}
      <Box style={{ padding: sectionPadding, background: '#f0f2f8' }}>
        <Box style={{ maxWidth: '650px', marginBottom: '50px' }}>
          <Typography variant="body1" style={{ color: '#ff6f00', fontWeight: '700', marginBottom: '10px', ...bodyFont }}>MORE THAN JUST LESSONS</Typography>
          <Typography variant="h3" style={{ fontWeight: '800', color: '#0a0a0a', lineHeight: '1.2', fontSize: isMobile ? '26px' : '36px', ...fontStyle }}>Everything around the lessons matters too</Typography>
        </Box>
        <Grid container spacing={4}>
          {platformFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Link to={feature.link} style={{ textDecoration: 'none' }}>
                  <Box style={{ borderRadius: '20px', overflow: 'hidden', height: '100%', background: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transition: 'transform 0.25s ease, box-shadow 0.25s ease', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 16px 36px ${feature.color}33`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}>
                    <Box style={{ height: '6px', background: feature.bg }} />
                    <Box style={{ padding: isMobile ? '24px 20px' : '28px 24px' }}>
                      <Box style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${feature.color}14`, border: `2px solid ${feature.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                        <Icon size={24} color={feature.color} strokeWidth={1.8} />
                      </Box>
                      <Typography variant="h6" style={{ fontWeight: '800', marginBottom: '8px', color: '#0a0a0a', fontSize: '16px', ...fontStyle }}>{feature.title}</Typography>
                      <Typography variant="body2" style={{ color: '#777', lineHeight: '1.75', marginBottom: '20px', ...bodyFont }}>{feature.description}</Typography>
                      <Box style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: feature.color, fontWeight: '700', fontSize: '13px', padding: '8px 16px', borderRadius: '30px', backgroundColor: `${feature.color}12`, border: `1.5px solid ${feature.color}30`, ...bodyFont }}>
                        {feature.label}
                      </Box>
                    </Box>
                  </Box>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Community mockup */}
      <Box style={{ padding: sectionPadding, background: 'white' }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body1" style={{ color: '#ff6f00', fontWeight: '700', marginBottom: '10px', ...bodyFont }}>LEARN TOGETHER</Typography>
            <Typography variant="h3" style={{ fontWeight: '800', color: '#0a0a0a', marginBottom: '20px', fontSize: isMobile ? '26px' : '36px', ...fontStyle }}>You're never learning alone</Typography>
            <Typography variant="body1" style={{ color: '#666', lineHeight: '1.9', fontSize: '16px', ...bodyFont }}>
              Stuck on a step in a lesson? Ask right there, right then. The community and section-by-section Q&A mean help is never more than a question away — from other students or from your teacher.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box style={{ background: '#f7f8fc', borderRadius: '20px', padding: isMobile ? '16px' : '24px', border: '1.5px solid #eef0f7' }}>
              {[
                { name: 'Tobi A.', question: 'Why does the discriminant tell us how many roots there are?', section: 'Relate section' },
                { name: 'Blessing N.', question: 'Can someone explain step 3 differently? I get lost there.', section: 'Learn section' },
              ].map((q, i) => (
                <Box key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: i === 0 ? '12px' : 0, border: '1px solid #eee' }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Box style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a237e, #0288d1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '13px' }}>{q.name[0]}</Box>
                    <Box>
                      <Typography variant="body2" style={{ fontWeight: '700', color: '#0a0a0a', fontSize: '13px', ...fontStyle }}>{q.name}</Typography>
                      <Typography variant="caption" style={{ color: '#999', fontSize: '11px', ...bodyFont }}>{q.section}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" style={{ color: '#444', fontSize: '13px', lineHeight: '1.6', ...bodyFont }}>{q.question}</Typography>
                </Box>
              ))}
              <Button component={Link} to="/community" fullWidth variant="text"
                style={{ color: '#1a237e', fontWeight: '700', marginTop: '14px', ...bodyFont }}>
                Visit the Community →
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Founder note - short, not the whole page */}
      <Box style={{ padding: compactSectionPadding, background: '#0a0a0a' }}>
        <Box style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'center' }}>
          <Quote size={32} color="#ff6f00" style={{ marginBottom: '20px' }} />
          <Typography variant="h6" style={{ color: 'white', lineHeight: '1.8', fontWeight: '400', marginBottom: '24px', fontSize: isMobile ? '17px' : '20px', ...bodyFont }}>
            I built Nairafame Academy after years of creating math content for Nigerian students and seeing the same pattern: bright students held back not by ability, but by teaching that never quite met them where they were. This platform is my attempt to close that gap properly.
          </Typography>
          <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '600', ...bodyFont }}>— Founder, Nairafame Academy</Typography>
        </Box>
      </Box>

      {/* CTA */}
      <Box style={{ background: '#050505', padding: sectionPadding, textAlign: 'center', color: 'white' }}>
        <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <GraduationCap size={48} color="#ff6f00" strokeWidth={1.5} />
        </Box>
        <Typography variant="h2" style={{ fontWeight: '800', marginBottom: '20px', fontSize: isMobile ? '30px' : isTablet ? '40px' : undefined, ...fontStyle }}>
          Ready to see it for yourself?
        </Typography>
        <Typography variant="h6" style={{ marginBottom: '40px', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto 40px', ...bodyFont }}>
          Create a free account and experience the full lesson flow, quizzes, and community.
        </Typography>
        <Box style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="contained" component={Link} to="/register"
            style={{ backgroundColor: '#ff6f00', color: 'white', padding: '18px 50px', fontSize: '18px', borderRadius: '8px', fontWeight: '700', ...bodyFont, ...(isMobile ? { width: '100%', justifyContent: 'center' } : {}) }}>
            Get Started Free →
          </Button>
          <Button variant="outlined" component={Link} to="/courses"
            style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', padding: '18px 50px', fontSize: '18px', borderRadius: '8px', ...bodyFont, ...(isMobile ? { width: '100%', justifyContent: 'center' } : {}) }}>
            Browse Courses
          </Button>
        </Box>
      </Box>

    </Box>
  );
}

export default About;