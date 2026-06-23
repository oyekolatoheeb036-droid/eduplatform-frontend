import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, useMediaQuery, IconButton, InputAdornment } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const API = 'https://eduplatform-api-pol1.onrender.com';

const PasswordStrength = ({ password }) => {
  const rules = [
    { label: 'At least 6 characters', met: password.length >= 6 },
    { label: 'Contains uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'Contains a number (0-9)', met: /[0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <Box style={{ backgroundColor: '#f8f9ff', border: '1px solid #e8eaf6', borderRadius: '10px', padding: '12px 14px', marginTop: '8px' }}>
      <Typography style={{ fontSize: '12px', fontWeight: '700', color: '#666', marginBottom: '8px', fontFamily: "'Inter', sans-serif" }}>
        Password requirements:
      </Typography>
      {rules.map((rule, i) => (
        <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: i < rules.length - 1 ? '6px' : '0' }}>
          {rule.met
            ? <CheckCircleIcon style={{ color: '#4caf50', fontSize: '16px', flexShrink: 0 }} />
            : <RadioButtonUncheckedIcon style={{ color: '#ccc', fontSize: '16px', flexShrink: 0 }} />
          }
          <Typography style={{ fontSize: '12px', color: rule.met ? '#2e7d32' : '#999', fontWeight: rule.met ? '600' : '400', fontFamily: "'Inter', sans-serif" }}>
            {rule.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

        <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
          <Box style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #1a237e, #0288d1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>N</Typography>
          </Box>
          <Typography style={{ fontWeight: '700', color: '#0a0a0a', fontSize: '16px', ...fontStyle }}>Nairafame Academy</Typography>
        </Box>

        {done ? (
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
          <>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Box style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LockResetIcon style={{ color: '#1a237e', fontSize: '24px' }} />
              </Box>
              <Typography style={{ fontWeight: '800', fontSize: isMobile ? '20px' : '24px', color: '#0a0a0a', ...fontStyle }}>
                Reset Password
              </Typography>
            </Box>
            <Typography variant="body2" style={{ color: '#888', marginBottom: '20px', lineHeight: '1.7' }}>
              Enter your new password below.
            </Typography>

            <TextField fullWidth label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleReset(); }}
              margin="normal" variant="outlined"
              InputProps={{
                style: { borderRadius: '10px', backgroundColor: '#f8f8f8', ...bodyFont },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }} />

            <PasswordStrength password={password} />

            <TextField fullWidth label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleReset(); }}
              margin="normal" variant="outlined"
              InputProps={{
                style: { borderRadius: '10px', backgroundColor: '#f8f8f8', ...bodyFont },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" size="small">
                      {showConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }} />

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
              <span onClick={() => navigate('/login')} style={{ color: '#1a237e', fontWeight: '700', cursor: 'pointer' }}>Sign In</span>
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

export default ResetPassword;