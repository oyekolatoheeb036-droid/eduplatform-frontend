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
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, useMediaQuery } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from './AuthContext';

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

  return (
    <AppBar position="static" style={{ backgroundColor: '#1a237e' }}>
      <Toolbar>
        <SchoolIcon style={{ marginRight: '10px' }} />
        <Typography variant="h6" style={{ flexGrow: 1, fontWeight: 'bold' }}>
          Nairafame Academy
        </Typography>
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              edge="end"
              aria-label="Open navigation menu"
              onClick={(event) => setMenuAnchor(event.currentTarget)}
            >
              <MenuIcon />
            </IconButton>
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
        ) : (
          <>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/courses">Courses</Button>

            {/* Not logged in */}
            {!user && (
              <>
                <Button color="inherit" component={Link} to="/login">Login</Button>
                <Button color="inherit" component={Link} to="/register">Register</Button>
              </>
            )}

            {/* Student */}
            {user && user.role === 'student' && (
              <>
                <Button color="inherit" component={Link} to="/dashboard" startIcon={<DashboardIcon />}>Dashboard</Button>
                <Button color="inherit" component={Link} to="/badges" startIcon={<EmojiEventsIcon />}>Badges</Button>
                <Button color="inherit" onClick={logout} component={Link} to="/">Logout</Button>
              </>
            )}

            {/* Teacher */}
            {user && user.role === 'teacher' && (
              <>
                <Button color="inherit" component={Link} to="/teacher">My Dashboard</Button>
                <Button color="inherit" onClick={logout} component={Link} to="/">Logout</Button>
              </>
            )}

            {/* Admin */}
            {user && user.role === 'admin' && (
              <>
                <Button color="inherit" component={Link} to="/dashboard" startIcon={<DashboardIcon />}>Student View</Button>
                <Button color="inherit" component={Link} to="/teacher">Teacher View</Button>
                <Button color="inherit" component={Link} to="/admin">Admin Panel</Button>
                <Button color="inherit" component={Link} to="/badges" startIcon={<EmojiEventsIcon />}>Badges</Button>
                <Button color="inherit" onClick={logout} component={Link} to="/">Logout</Button>
              </>
            )}
          </>
        )}

        {/* Show username */}
        {user && !isMobile && (
          <Typography variant="body2" style={{ marginLeft: '15px', opacity: 0.8 }}>
            👋 {user.name}
          </Typography>
        )}
      </Toolbar>
    </AppBar>
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