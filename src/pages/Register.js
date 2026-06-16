import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Divider, useMediaQuery } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BarChartIcon from '@mui/icons-material/BarChart';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isMobile = useMediaQuery('(max-width:768px)');
  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
  const bodyFont = { fontFamily: "'Inter', sans-serif" };

  const handleRegister = async () => {
    if (!name || !email || !password) { setMessage('Please fill in all fields.'); return; }
    if (password.length < 6) { setMessage('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await axios.post('https://eduplatform-api-pol1.onrender.com/api/auth/register', { name, email, password });
      navigate('/login');
    } catch (err) {
      setMessage('Registration failed. Email may already exist.');
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRegister();
  };

  const features = [
    { icon: <SchoolIcon style={{ color: '#4caf50' }} />, text: 'Structured Mathematics Lessons' },
    { icon: <EmojiEventsIcon style={{ color: '#ff6f00' }} />, text: 'WAEC & JAMB Focused Content' },
    { icon: <PsychologyIcon style={{ color: '#0288d1' }} />, text: 'AI Powered Learning Assistant' },
    { icon: <BarChartIcon style={{ color: '#9c27b0' }} />, text: 'Track Your Progress & Earn Badges' },
  ];

  // ── MOBILE LAYOUT ──
  if (isMobile) {
    return (
      <Box style={{ minHeight: '100vh', background: '#fafafa', ...bodyFont }}>

        {/* Top — dark panel */}
        <Box style={{
          background: 'linear-gradient(160deg, #0d1117 0%, #1a1f2e 100%)',
          padding: '36px 24px 32px',
          color: 'white'
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Box style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1a237e, #0288d1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography style={{ color: 'white', fontWeight: '800', fontSize: '16px' }}>N</Typography>
            </Box>
            <Typography style={{ fontWeight: '700', color: 'white', fontSize: '16px', ...fontStyle }}>
              Nairafame Academy
            </Typography>
          </Box>

          <Typography style={{ fontWeight: '800', lineHeight: '1.2', marginBottom: '10px', fontSize: '26px', ...fontStyle }}>
            Your journey to
            <span style={{ color: '#ff6f00' }}> Mathematics</span>{' '}
            mastery starts here.
          </Typography>
          <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', marginBottom: '20px' }}>
            Join thousands of Nigerian students learning Mathematics the right way.
          </Typography>

          {/* Features — horizontal scroll */}
          <Box style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {features.map((feature, index) => (
              <Box key={index} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: '10px', padding: '8px 12px',
                flexShrink: 0
              }}>
                {React.cloneElement(feature.icon, { style: { ...feature.icon.props.style, fontSize: '18px' } })}
                <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>
                  {feature.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bottom — form */}
        <Box style={{
          background: 'white',
          borderRadius: '24px 24px 0 0',
          marginTop: '-12px',
          padding: '32px 24px 48px',
          minHeight: 'calc(100vh - 220px)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)'
        }}>
          <Typography style={{ fontWeight: '800', color: '#0a0a0a', fontSize: '22px', marginBottom: '6px', ...fontStyle }}>
            Create your account
          </Typography>
          <Typography variant="body2" style={{ color: '#888', marginBottom: '24px' }}>
            Start learning Mathematics for free today
          </Typography>

          <TextField fullWidth label="Full Name" value={name}
            onChange={e => setName(e.target.value)} onKeyDown={handleKeyDown}
            margin="normal" variant="outlined"
            InputProps={{ style: { borderRadius: '10px', backgroundColor: '#f8f8f8', ...bodyFont } }} />

          <TextField fullWidth label="Email Address" type="email" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
            margin="normal" variant="outlined"
            InputProps={{ style: { borderRadius: '10px', backgroundColor: '#f8f8f8', ...bodyFont } }} />

          <TextField fullWidth label="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
            margin="normal" variant="outlined"
            helperText="At least 6 characters"
            InputProps={{ style: { borderRadius: '10px', backgroundColor: '#f8f8f8', ...bodyFont } }} />

          {message && (
            <Box style={{ backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '10px', padding: '12px 16px', margin: '12px 0' }}>
              <Typography style={{ color: '#c62828', fontSize: '14px', fontWeight: '600' }}>⚠️ {message}</Typography>
            </Box>
          )}

          <Button fullWidth variant="contained" onClick={handleRegister} disabled={loading}
            style={{
              backgroundColor: '#1a237e', padding: '15px', borderRadius: '10px',
              fontSize: '16px', fontWeight: '700', textTransform: 'none',
              boxShadow: '0 4px 15px rgba(26,35,126,0.25)', marginTop: '16px', marginBottom: '20px', ...bodyFont
            }}>
            {loading ? 'Creating Account...' : 'Create Free Account →'}
          </Button>

          {/* Benefits */}
          <Box style={{ backgroundColor: '#f8fbff', border: '1px solid #e8eaf6', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
            {['Free to start — no credit card needed', 'Access 50+ Mathematics courses', 'Track progress and earn badges'].map((item, index) => (
              <Box key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: index < 2 ? '8px' : '0' }}>
                <CheckCircleIcon style={{ color: '#4caf50', fontSize: '18px', flexShrink: 0 }} />
                <Typography variant="body2" style={{ color: '#444', ...bodyFont }}>{item}</Typography>
              </Box>
            ))}
          </Box>

          <Typography variant="body2" style={{ textAlign: 'center', color: '#888' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1a237e', fontWeight: '700', textDecoration: 'none' }}>
              Sign In
            </Link>
          </Typography>

          {/* Testimonial */}
          <Box style={{ marginTop: '28px', background: '#f8f9ff', border: '1px solid #e8eaf6', borderRadius: '14px', padding: '18px' }}>
            <Box style={{ display: 'flex', gap: '3px', marginBottom: '8px' }}>
              {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#ff6f00', fontSize: '14px' }}>★</span>)}
            </Box>
            <Typography variant="body2" style={{ color: '#444', lineHeight: '1.7', marginBottom: '12px', fontStyle: 'italic' }}>
              "Nairafame Academy helped me score A1 in WAEC Mathematics. The lessons are so clear!"
            </Typography>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a237e, #0288d1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>A</Box>
              <Box>
                <Typography variant="body2" style={{ color: '#0a0a0a', fontWeight: '600', fontSize: '13px' }}>Amaka O.</Typography>
                <Typography variant="caption" style={{ color: '#999' }}>SS3 Student, Lagos</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // ── DESKTOP LAYOUT — unchanged ──
  return (
    <Box style={{ display: 'flex', minHeight: '100vh', ...bodyFont }}>

      {/* Left Side */}
      <Box style={{
        width: '45%',
        background: 'linear-gradient(160deg, #0d1117 0%, #1a1f2e 100%)',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'white',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        <Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
            <Box style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #1a237e, #0288d1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>N</Typography>
            </Box>
            <Typography variant="h6" style={{ fontWeight: '700', color: 'white', ...fontStyle }}>Nairafame Academy</Typography>
          </Box>

          <Typography variant="h3" style={{ fontWeight: '800', lineHeight: '1.2', marginBottom: '15px', ...fontStyle }}>
            Your journey to
            <span style={{ color: '#ff6f00' }}> Mathematics</span>
            <br />mastery starts here.
          </Typography>
          <Typography variant="body1" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', marginBottom: '40px' }}>
            Join thousands of Nigerian students learning Mathematics the right way — structured, interactive and fun.
          </Typography>

          <Box style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '50px' }}>
            {features.map((feature, index) => (
              <Box key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Box style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {feature.icon}
                </Box>
                <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.85)' }}>{feature.text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '25px' }}>
          <Box style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
            {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#ff6f00', fontSize: '16px' }}>★</span>)}
          </Box>
          <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.7', marginBottom: '15px', fontStyle: 'italic' }}>
            "Nairafame Academy helped me score A1 in WAEC Mathematics. The lessons are so clear and the quizzes kept me sharp!"
          </Typography>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Box style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a237e, #0288d1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>A</Box>
            <Box>
              <Typography variant="body2" style={{ color: 'white', fontWeight: '600' }}>Amaka O.</Typography>
              <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.5)' }}>SS3 Student, Lagos</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Side — Form */}
      <Box style={{ flex: 1, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <Box style={{ width: '100%', maxWidth: '420px' }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', justifyContent: 'center' }}>
            <Box style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #1a237e, #0288d1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>N</Typography>
            </Box>
            <Typography variant="h6" style={{ fontWeight: '700', color: '#0a0a0a', ...fontStyle }}>Nairafame Academy</Typography>
          </Box>

          <Typography variant="h4" style={{ fontWeight: '800', color: '#0a0a0a', marginBottom: '8px', ...fontStyle }}>Create your account</Typography>
          <Typography variant="body1" style={{ color: '#888', marginBottom: '35px' }}>Start learning Mathematics for free today</Typography>

          <Button fullWidth variant="outlined"
            style={{ borderColor: '#e0e0e0', color: '#333', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', marginBottom: '20px', textTransform: 'none' }}>
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '20px', marginRight: '10px' }} />
            Sign up with Google
          </Button>

          <Box style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <Divider style={{ flex: 1 }} />
            <Typography variant="body2" style={{ color: '#999' }}>or sign up with email</Typography>
            <Divider style={{ flex: 1 }} />
          </Box>

          <TextField fullWidth label="Full Name" value={name}
            onChange={e => setName(e.target.value)} onKeyDown={handleKeyDown}
            margin="normal" variant="outlined"
            style={{ marginBottom: '5px' }}
            InputProps={{ style: { borderRadius: '10px' } }} />

          <TextField fullWidth label="Email Address" type="email" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
            margin="normal" variant="outlined"
            style={{ marginBottom: '5px' }}
            InputProps={{ style: { borderRadius: '10px' } }} />

          <TextField fullWidth label="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
            margin="normal" variant="outlined"
            style={{ marginBottom: '20px' }}
            InputProps={{ style: { borderRadius: '10px' } }} />

          {message && (
            <Box style={{ backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
              <Typography style={{ color: '#c62828', fontSize: '14px', fontWeight: '600' }}>⚠️ {message}</Typography>
            </Box>
          )}

          <Button fullWidth variant="contained" onClick={handleRegister} disabled={loading}
            style={{ backgroundColor: '#1a237e', padding: '15px', borderRadius: '10px', fontSize: '16px', fontWeight: '700', marginBottom: '20px', textTransform: 'none', ...bodyFont }}>
            {loading ? 'Creating Account...' : 'Create Free Account →'}
          </Button>

          <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '25px' }}>
            {['Free to start — no credit card needed', 'Access 50+ Mathematics courses', 'Track progress and earn badges'].map((item, index) => (
              <Box key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircleIcon style={{ color: '#4caf50', fontSize: '18px' }} />
                <Typography variant="body2" style={{ color: '#666' }}>{item}</Typography>
              </Box>
            ))}
          </Box>

          <Typography variant="body2" style={{ textAlign: 'center', color: '#888' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1a237e', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Register;