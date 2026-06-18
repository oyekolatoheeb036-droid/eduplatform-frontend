import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import Lessons from './pages/Lessons';
import Quiz from './pages/Quiz';
import Dashboard from './pages/Dashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Badges from './pages/Badges';
import LessonBuilder from './pages/LessonBuilder';
import CourseLessons from './pages/CourseLessons';
import ProtectedRoute from './ProtectedRoute';
import Home from './pages/Home';
import VerifyEmail from './pages/VerifyEmail'; {/* ✅ ADDED */}
import { Menu, MenuItem, useMediaQuery } from '@mui/material';
import { useAuth } from './AuthContext';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NairafameAI from './pages/NairafameAI';

function Navbar() {
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery('(max-width:700px)');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuOpen = Boolean(menuAnchor);

  const closeMenu = () => setMenuAnchor(null);
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Courses', path: '/courses' },
  ];

  if (!user) {
    navItems.push(
      { label: 'Login', path: '/login' },
      { label: 'Register', path: '/register' }
    );
  }

  if (user && user.role === 'student') {
    navItems.push(
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Badges', path: '/badges' },
      { label: 'Logout', path: '/', action: logout }
    );
  }

  if (user && user.role === 'teacher') {
    navItems.push(
      { label: 'My Dashboard', path: '/teacher' },
      { label: 'Logout', path: '/', action: logout }
    );
  }

  if (user && user.role === 'admin') {
    navItems.push(
      { label: 'Student View', path: '/dashboard' },
      { label: 'Teacher View', path: '/teacher' },
      { label: 'Admin Panel', path: '/admin' },
      { label: 'Badges', path: '/badges' },
      { label: 'Logout', path: '/', action: logout }
    );
  }

  const handleItemClick = (item) => {
    if (item.action) item.action();
    closeMenu();
  };

  const navStyles = {
    wrapper: {
      backgroundColor: '#1E2A78',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 1100,
    },
    logoArea: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none',
    },
    logoMark: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      backgroundColor: '#162060',
      border: '1.5px solid rgba(245,158,11,0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    logoName: {
      fontSize: '17px',
      fontWeight: '500',
      color: '#fff',
      letterSpacing: '-0.3px',
      lineHeight: '1.1',
    },
    logoSub: {
      fontSize: '10px',
      color: '#F59E0B',
      letterSpacing: '0.18em',
      fontWeight: '500',
      textTransform: 'uppercase',
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    navLink: {
      color: 'rgba(255,255,255,0.78)',
      textDecoration: 'none',
      fontSize: '14px',
      padding: '6px 12px',
      borderRadius: '6px',
      transition: 'color 0.15s, background 0.15s',
    },
    btnGhost: {
      fontSize: '13px',
      fontWeight: '500',
      color: 'rgba(255,255,255,0.85)',
      background: 'transparent',
      border: '1.5px solid rgba(255,255,255,0.25)',
      borderRadius: '8px',
      padding: '7px 18px',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-block',
      lineHeight: '1.4',
    },
    btnPrimary: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#1E2A78',
      background: '#F59E0B',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 20px',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-block',
      lineHeight: '1.4',
    },
    userGreeting: {
      fontSize: '13px',
      color: 'rgba(255,255,255,0.75)',
      marginLeft: '12px',
      whiteSpace: 'nowrap',
    },
    hamburger: {
      background: 'none',
      border: 'none',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '24px',
      display: 'flex',
      alignItems: 'center',
      padding: '4px',
    },
  };

  return (
    <nav style={navStyles.wrapper}>
      {/* Logo */}
      <Link to="/" style={navStyles.logoArea}>
        <div style={navStyles.logoMark}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L4 7.5v7L11 20l7-5.5v-7L11 2z" fill="#F59E0B" opacity="0.9" />
            <path d="M11 7l-3.5 2.5v3.5L11 15l3.5-2V9.5L11 7z" fill="#fff" />
          </svg>
        </div>
        <div>
          <div style={navStyles.logoName}>Nairafame</div>
          <div style={navStyles.logoSub}>Academy</div>
        </div>
      </Link>

      {/* Desktop nav */}
      {!isMobile ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={navStyles.navLinks}>
            <Link to="/" style={navStyles.navLink}>Home</Link>
            <Link to="/courses" style={navStyles.navLink}>Courses</Link>

            {user && user.role === 'student' && (
              <>
                <Link to="/dashboard" style={navStyles.navLink}>Dashboard</Link>
                <Link to="/badges" style={navStyles.navLink}>Badges</Link>
              </>
            )}
            {user && user.role === 'teacher' && (
              <Link to="/teacher" style={navStyles.navLink}>My Dashboard</Link>
            )}
            {user && user.role === 'admin' && (
              <>
                <Link to="/dashboard" style={navStyles.navLink}>Student View</Link>
                <Link to="/teacher" style={navStyles.navLink}>Teacher View</Link>
                <Link to="/admin" style={navStyles.navLink}>Admin Panel</Link>
                <Link to="/badges" style={navStyles.navLink}>Badges</Link>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
            {!user && (
              <>
                <Link to="/login" style={navStyles.btnGhost}>Login</Link>
                <Link to="/register" style={navStyles.btnPrimary}>Get started</Link>
              </>
            )}
            {user && (
              <>
                <span style={navStyles.userGreeting}>👋 {user.name}</span>
                <Link to="/" onClick={logout} style={navStyles.btnGhost}>Logout</Link>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Mobile hamburger */
        <>
          <button
            style={navStyles.hamburger}
            aria-label="Open navigation menu"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            &#9776;
          </button>
          <Menu anchorEl={menuAnchor} open={menuOpen} onClose={closeMenu} keepMounted>
            {navItems.map((item) => (
              <MenuItem
                key={`${item.label}-${item.path}`}
                component={Link}
                to={item.path}
                onClick={() => handleItemClick(item)}
              >
                {item.label}
              </MenuItem>
            ))}
            {user && <MenuItem disabled>{user.name}</MenuItem>}
          </Menu>
        </>
      )}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify-email" element={<VerifyEmail />} /> {/* ✅ ADDED */}
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:course_id/lessons" element={<Lessons />} />
        <Route path="/courses/:course_id/lessons/:lesson_id/quiz" element={<Quiz />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/ai-tutor" element={<NairafameAI user={user} />} />
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/badges" element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <Badges />
          </ProtectedRoute>
        } />
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/courses/:course_id/lessons/:lesson_id/builder" element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <LessonBuilder />
          </ProtectedRoute>
        } />
        <Route path="/teacher/course/:course_id/lessons" element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <CourseLessons />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;