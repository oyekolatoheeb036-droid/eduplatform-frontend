import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Divider, useMediaQuery, Dialog, DialogContent, DialogTitle, IconButton, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockResetIcon from '@mui/icons-material/LockReset';

const API = 'https://eduplatform-api-pol1.onrender.com';

// ── Forgot Password Modal (works on both mobile and desktop) ──
const ForgotPasswordModal = ({ open, onClose, bodyFont, fontStyle }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Please enter your email.'); return; }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/api/auth/forgot-password`, { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSent(false);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{ style: { borderRadius: '20px', padding: '8px' } }}>
      <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px' }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Box style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LockResetIcon style={{ color: '#1a237e', fontSize: '20px' }} />
          </Box>
          <Typography style={{ fontWeight: '800', fontSize: '17px', color: '#0a0a0a', ...fontStyle }}>
            Forgot Password
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {sent ? (
          <Box style={{ textAlign: 'center', padding: '16px 0 8px' }}>
            <Box style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircleIcon style={{ color: '#4caf50', fontSize: '32px' }} />
            </Box>
            <Typography style={{ fontWeight: '800', fontSize: '18px', color: '#0a0a0a', marginBottom: '10px', ...fontStyle }}>
              Check your email! 📧
            </Typography>
            <Typography variant="body2" style={{ color: '#666', lineHeight: '1.7', marginBottom: '20px', ...bodyFont }}>
              If <strong>{email}</strong> is registered, you'll receive a password reset link shortly. Check your spam folder too!
            </Typography>
            <Button fullWidth variant="contained" onClick={handleClose}
              style={{ backgroundColor: '#1a237e', borderRadius: '10px', textTransform: 'none', fontWeight: '700', padding: '12px', boxShadow: 'none', ...bodyFont }}>
              Done
            </Button>
          </Box>
        ) : (
          <Box style={{ paddingTop: '4px' }}>
            <Typography variant="body2" style={{ color: '#666', marginBottom: '20px', lineHeight: '1.7', ...bodyFont }}>
              Enter the email address you used to register. We'll send you a link to reset your password.
            </Typography>

            <TextField fullWidth label="Email Address" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              variant="outlined"
              InputProps={{ style: { borderRadius: '10px', backgroundColor: '#f8f8f8', ...bodyFont } }} />

            {error && (
              <Box style={{ backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '10px', padding: '10px 14px', marginTop: '12px' }}>
                <Typography style={{ color: '#c62828', fontSize: '13px', fontWeight: '600' }}>⚠️ {error}</Typography>
              </Box>
            )}

            <Button fullWidth variant="contained" onClick={handleSubmit} disabled={loading}
              style={{ backgroundColor: '#1a237e', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', textTransform: 'none', boxShadow: '0 4px 15px rgba(26,35,126,0.25)', marginTop: '20px', marginBottom: '8px', ...bodyFont }}>
              {loading ? <CircularProgress size={20} style={{ color: 'white' }} /> : 'Send Reset Link →'}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    if (token && userStr) {
      const userData = JSON.parse(decodeURIComponent(userStr));
      login(userData, token);
      navigate('/');
    }
  }, []);

  const isMobile = useMediaQuery('(max-width:768px)');
  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
  const bodyFont = { fontFamily: "'Inter', sans-serif" };

  const handleLogin = async () => {
    if (!email || !password) { setMessage('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
      login(res.data.user, res.data.token);
      if (res.data.user.role === 'admin') navigate('/admin');
      else if (res.data.user.role === 'teacher') navigate('/teacher');
      else navigate('/dashboard');
    } catch (err) {
      setMessage('Login failed. Check your credentials.');
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
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

        <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} bodyFont={bodyFont} fontStyle={fontStyle} />

        <Box style={{ background: 'linear-gradient(160deg, #0d1117 0%, #1a1f2e 100%)', padding: '36px 24px 32px', color: 'white' }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Box style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #1a237e, #0288d1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography style={{ color: 'white', fontWeight: '800', fontSize: '16px' }}>N</Typography>
            </Box>
            <Typography style={{ fontWeight: '700', color: 'white', fontSize: '16px', ...fontStyle }}>
              Nairafame Academy
            </Typography>
          </Box>
          <Typography style={{ fontWeight: '800', lineHeight: '1.2', marginBottom: '10px', fontSize: '26px', ...fontStyle }}>
            Welcome back to
            <span style={{ color: '#ff6f00' }}> Nairafame</span>{' '}
            Academy.
          </Typography>
          <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', marginBottom: '20px' }}>
            Continue your Mathematics journey. Your progress, badges and courses are waiting for you!
          </Typography>
          <Box style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {features.map((feature, index) => (
              <Box key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 12px', flexShrink: 0 }}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {React.cloneElement(feature.icon, { style: { ...feature.icon.props.style, fontSize: '18px' } })}
                </Box>
                <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>
                  {feature.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box style={{ background: 'white', borderRadius: '24px 24px 0 0', marginTop: '-12px', padding: '32px 24px 48px', minHeight: 'calc(100vh - 220px)', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
          <Typography style={{ fontWeight: '800', color: '#0a0a0a', fontSize: '22px', marginBottom: '6px', ...fontStyle }}>
            Sign in to your account
          </Typography>
          <Typography variant="body2" style={{ color: '#888', marginBottom: '24px' }}>
            Enter your details below to continue
          </Typography>

          <Button fullWidth variant="outlined"
            onClick={() => window.location.href = `${API}/api/auth/google`}
            style={{ borderColor: '#e0e0e0', color: '#333', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', marginBottom: '16px', textTransform: 'none' }}>
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '20px', marginRight: '10px' }} />
            Sign in with Google
          </Button>

          <Box style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '16px' }}>
            <Divider style={{ flex: 1 }} />
            <Typography variant="body2" style={{ color: '#999' }}>or sign in with email</Typography>
            <Divider style={{ flex: 1 }} />
          </Box>

          <TextField fullWidth label="Email Address" type="email" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
            margin="normal" variant="outlined"
            InputProps={{ style: { borderRadius: '10px', backgroundColor: '#f8f8f8', ...bodyFont } }} />

          <TextField fullWidth label="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
            margin="normal" variant="outlined"
            InputProps={{ style: { borderRadius: '10px', backgroundColor: '#f8f8f8', ...bodyFont } }} />

          {/* ── Forgot Password Link ── */}
          <Box style={{ textAlign: 'right', marginTop: '6px', marginBottom: '20px' }}>
            <Typography variant="body2"
              onClick={() => setForgotOpen(true)}
              style={{ color: '#1a237e', cursor: 'pointer', fontWeight: '600', display: 'inline-block' }}>
              Forgot password?
            </Typography>
          </Box>

          {message && (
            <Box style={{ backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
              <Typography style={{ color: '#c62828', fontSize: '14px', fontWeight: '600' }}>⚠️ {message}</Typography>
            </Box>
          )}

          <Button fullWidth variant="contained" onClick={handleLogin} disabled={loading}
            style={{ backgroundColor: '#1a237e', padding: '15px', borderRadius: '10px', fontSize: '16px', fontWeight: '700', textTransform: 'none', boxShadow: '0 4px 15px rgba(26,35,126,0.25)', marginBottom: '20px', ...bodyFont }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </Button>

          <Typography variant="body2" style={{ textAlign: 'center', color: '#888' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1a237e', fontWeight: '700', textDecoration: 'none' }}>
              Create Free Account
            </Link>
          </Typography>

          <Box style={{ marginTop: '32px', background: '#f8f9ff', border: '1px solid #e8eaf6', borderRadius: '14px', padding: '18px' }}>
            <Box style={{ display: 'flex', gap: '3px', marginBottom: '8px' }}>
              {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#ff6f00', fontSize: '14px' }}>★</span>)}
            </Box>
            <Typography variant="body2" style={{ color: '#444', lineHeight: '1.7', marginBottom: '12px', fontStyle: 'italic' }}>
              "I improved my JAMB math score from 40 to 68 using Nairafame Academy!"
            </Typography>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6f00, #ff8f00)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>C</Box>
              <Box>
                <Typography variant="body2" style={{ color: '#0a0a0a', fontWeight: '600', fontSize: '13px' }}>Chidi E.</Typography>
                <Typography variant="caption" style={{ color: '#999' }}>JAMB Candidate, Enugu</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // ── DESKTOP LAYOUT ──
  return (
    <Box style={{ display: 'flex', minHeight: '100vh', ...bodyFont }}>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} bodyFont={bodyFont} fontStyle={fontStyle} />

      <Box style={{ width: '45%', background: 'linear-gradient(160deg, #0d1117 0%, #1a1f2e 100%)', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'white', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
            <Box style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #1a237e, #0288d1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>N</Typography>
            </Box>
            <Typography variant="h6" style={{ fontWeight: '700', color: 'white', ...fontStyle }}>Nairafame Academy</Typography>
          </Box>
          <Typography variant="h3" style={{ fontWeight: '800', lineHeight: '1.2', marginBottom: '15px', ...fontStyle }}>
            Welcome back to
            <span style={{ color: '#ff6f00' }}> Nairafame</span>
            <br />Academy.
          </Typography>
          <Typography variant="body1" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', marginBottom: '40px' }}>
            Continue your Mathematics journey. Your progress, badges and courses are waiting for you!
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
            "I improved my JAMB math score from 40 to 68 using Nairafame Academy. The progress tracking kept me motivated every day!"
          </Typography>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Box style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6f00, #ff8f00)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>C</Box>
            <Box>
              <Typography variant="body2" style={{ color: 'white', fontWeight: '600' }}>Chidi E.</Typography>
              <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.5)' }}>JAMB Candidate, Enugu</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box style={{ flex: 1, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <Box style={{ width: '100%', maxWidth: '420px' }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', justifyContent: 'center' }}>
            <Box style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #1a237e, #0288d1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>N</Typography>
            </Box>
            <Typography variant="h6" style={{ fontWeight: '700', color: '#0a0a0a', ...fontStyle }}>Nairafame Academy</Typography>
          </Box>
          <Typography variant="h4" style={{ fontWeight: '800', color: '#0a0a0a', marginBottom: '8px', ...fontStyle }}>Welcome back!</Typography>
          <Typography variant="body1" style={{ color: '#888', marginBottom: '35px' }}>Sign in to continue your learning journey</Typography>

          <Button fullWidth variant="outlined"
            onClick={() => window.location.href = `${API}/api/auth/google`}
            style={{ borderColor: '#e0e0e0', color: '#333', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', marginBottom: '20px', textTransform: 'none' }}>
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '20px', marginRight: '10px' }} />
            Sign in with Google
          </Button>

          <Box style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <Divider style={{ flex: 1 }} />
            <Typography variant="body2" style={{ color: '#999' }}>or sign in with email</Typography>
            <Divider style={{ flex: 1 }} />
          </Box>

          <TextField fullWidth label="Email Address" type="email" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
            margin="normal" variant="outlined"
            style={{ marginBottom: '5px' }}
            InputProps={{ style: { borderRadius: '10px' } }} />

          <TextField fullWidth label="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
            margin="normal" variant="outlined"
            style={{ marginBottom: '5px' }}
            InputProps={{ style: { borderRadius: '10px' } }} />

          {/* ── Forgot Password Link ── */}
          <Box style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Typography variant="body2"
              onClick={() => setForgotOpen(true)}
              style={{ color: '#1a237e', cursor: 'pointer', fontWeight: '600', display: 'inline-block' }}>
              Forgot password?
            </Typography>
          </Box>

          {message && (
            <Box style={{ backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
              <Typography style={{ color: '#c62828', fontSize: '14px', fontWeight: '600' }}>⚠️ {message}</Typography>
            </Box>
          )}

          <Button fullWidth variant="contained" onClick={handleLogin} disabled={loading}
            style={{ backgroundColor: '#1a237e', padding: '15px', borderRadius: '10px', fontSize: '16px', fontWeight: '700', marginBottom: '20px', textTransform: 'none', ...bodyFont }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </Button>

          <Typography variant="body2" style={{ textAlign: 'center', color: '#888' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1a237e', fontWeight: '700', textDecoration: 'none' }}>
              Create Free Account
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;