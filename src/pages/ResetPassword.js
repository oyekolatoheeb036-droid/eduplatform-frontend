import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, useMediaQuery } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockResetIcon from '@mui/icons-material/LockReset';

const API = 'https://eduplatform-api-pol1.onrender.com';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const isMobile = useMediaQuery('(max-width:768px)');
  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
  const bodyFont = { fontFamily: "'Inter', sans-serif" };

  const handleReset = async () => {
    setError('');
    if (!password || !confirm) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!token) { setError('Invalid reset link.'); return; }

    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/reset-password`, { token, password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', ...bodyFont }}>
      <Box style={{ width: '100%', maxWidth: '440px', background: 'white', borderRadius: '24px', padding: isMobile ? '32px 24px' : '48px 40px', boxShadow: '0 4px 30px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>

        {/* Logo */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
          <Box style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #1a237e, #0288d1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>N</Typography>
          </Box>
          <Typography style={{ fontWeight: '700', color: '#0a0a0a', fontSize: '16px', ...fontStyle }}>Nairafame Academy</Typography>
        </Box>

        {done ? (
          // ── Success state ──
          <Box style={{ textAlign: 'center' }}>
            <Box style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircleIcon style={{ color: '#4caf50', fontSize: '36px' }} />
            </Box>
            <Typography style={{ fontWeight: '800', fontSize: '22px', color: '#0a0a0a', marginBottom: '10px', ...fontStyle }}>
              Password Reset! 🎉
            </Typography>
            <Typography variant="body2" style={{ color: '#666', marginBottom: '28px', lineHeight: '1.7' }}>
              Your password has been reset successfully. You can now log in with your new password.
            </Typography>
            <Button fullWidth variant="contained" onClick={() => navigate('/login')}
              style={{ backgroundColor: '#1a237e', padding: '14px', borderRadius: '10px', fontWeight: '700', textTransform: 'none', fontSize: '15px', boxShadow: 'none', ...bodyFont }}>
              Go to Login →
            </Button>
          </Box>
        ) : (
          // ── Form state ──
          <>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Box style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LockResetIcon style={{ color: '#1a237e', fontSize: '24px' }} />
              </Box>
              <Typography style={{ fontWeight: '800', fontSize: isMobile ? '20px' : '24px', color: '#0a0a0a', ...fontStyle }}>
                Reset Password
              </Typography>
            </Box>
            <Typography variant="body2" style={{ color: '#888', marginBottom: '28px', lineHeight: '1.7' }}>
              Enter your new password below. Make sure it's at least 6 characters.
            </Typography>

            <TextField fullWidth label="New Password" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleReset(); }}
              margin="normal" variant="outlined"
              InputProps={{ style: { borderRadius: '10px', backgroundColor: '#f8f8f8', ...bodyFont } }} />

            <TextField fullWidth label="Confirm New Password" type="password" value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleReset(); }}
              margin="normal" variant="outlined"
              helperText="At least 6 characters"
              InputProps={{ style: { borderRadius: '10px', backgroundColor: '#f8f8f8', ...bodyFont } }} />

            {error && (
              <Box style={{ backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '10px', padding: '12px 16px', margin: '12px 0' }}>
                <Typography style={{ color: '#c62828', fontSize: '14px', fontWeight: '600' }}>⚠️ {error}</Typography>
              </Box>
            )}

            <Button fullWidth variant="contained" onClick={handleReset} disabled={loading}
              style={{ backgroundColor: '#1a237e', padding: '15px', borderRadius: '10px', fontSize: '16px', fontWeight: '700', textTransform: 'none', boxShadow: '0 4px 15px rgba(26,35,126,0.25)', marginTop: '16px', marginBottom: '16px', ...bodyFont }}>
              {loading ? 'Resetting...' : 'Reset Password →'}
            </Button>

            <Typography variant="body2" style={{ textAlign: 'center', color: '#888' }}>
              Remember your password?{' '}
              <span onClick={() => navigate('/login')} style={{ color: '#1a237e', fontWeight: '700', cursor: 'pointer' }}>
                Sign In
              </span>
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

export default ResetPassword;