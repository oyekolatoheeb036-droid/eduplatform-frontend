import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Alert, Box, Button, Card, CardContent, Chip,
  Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, Grid, IconButton, InputLabel, MenuItem,
  Paper, Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, useMediaQuery
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import QuizIcon from '@mui/icons-material/Quiz';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const API = 'https://eduplatform-api-pol1.onrender.com';

function AdminDashboard() {
  const [stats, setStats] = useState({ total_users: 0, total_courses: 0, total_enrollments: 0, total_lessons: 0 });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [openDeleteUserDialog, setOpenDeleteUserDialog] = useState(false);
  const [openDeleteCourseDialog, setOpenDeleteCourseDialog] = useState(false);
  const [openEditRoleDialog, setOpenEditRoleDialog] = useState(false);
  const [openQuizDialog, setOpenQuizDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newRole, setNewRole] = useState('');
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
  const bodyFont = { fontFamily: "'Inter', sans-serif" };
  const headerPadding = isMobile ? '48px 20px' : isTablet ? '56px 32px' : '60px 80px';
  const pagePadding = isMobile ? '36px 20px' : isTablet ? '44px 32px' : '50px 80px';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get(`${API}/api/admin/users`),
        axios.get(`${API}/api/admin/stats`)
      ]);
      setUsers(usersRes.data.users);
      setCourses(usersRes.data.courses);
      setStats(statsRes.data);
    } catch (err) {
      setMessage('Error loading admin data.');
    }
  };

  const handleViewQuizResults = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await axios.get(`${API}/api/quiz/my-results/${student.id}`);
      setQuizAttempts(res.data);
    } catch (err) {
      setQuizAttempts([]);
    }
    setOpenQuizDialog(true);
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${API}/api/admin/users/${selectedUser.id}`);
      setMessageType('success');
      setMessage(`User "${selectedUser.name}" deleted successfully!`);
      setOpenDeleteUserDialog(false);
      fetchData();
    } catch (err) {
      setMessageType('error');
      setMessage('Error deleting user.');
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await axios.delete(`${API}/api/courses/${selectedCourse.id}`);
      setMessageType('success');
      setMessage(`Course "${selectedCourse.title}" deleted successfully!`);
      setOpenDeleteCourseDialog(false);
      fetchData();
    } catch (err) {
      setMessageType('error');
      setMessage('Error deleting course.');
    }
  };

  const handleUpdateRole = async () => {
    try {
      await axios.put(`${API}/api/admin/users/${selectedUser.id}/role`, { role: newRole });
      setMessageType('success');
      setMessage(`Role updated to "${newRole}" successfully!`);
      setOpenEditRoleDialog(false);
      fetchData();
    } catch (err) {
      setMessageType('error');
      setMessage('Error updating role.');
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.total_users, icon: <PeopleIcon />, color: '#1a237e' },
    { label: 'Total Courses', value: stats.total_courses, icon: <BookIcon />, color: '#ff6f00' },
    { label: 'Total Enrollments', value: stats.total_enrollments, icon: <SchoolIcon />, color: '#4caf50' },
    { label: 'Total Lessons', value: stats.total_lessons, icon: <MenuBookIcon />, color: '#0288d1' }
  ];

  const roleColor = (role) => {
    if (role === 'admin') return 'error';
    if (role === 'teacher') return 'warning';
    return 'primary';
  };

  return (
    <Box style={{ background: '#fafafa', minHeight: '100vh', ...bodyFont }}>
      {/* Header */}
      <Box style={{ background: 'white', padding: headerPadding, borderBottom: '1px solid #f0f0f0', position: 'relative', overflow: 'hidden' }}>
        <Box style={{ position: 'absolute', top: '-70px', right: '-80px', width: isMobile ? '220px' : '320px', height: isMobile ? '220px' : '320px', borderRadius: '50%', background: 'linear-gradient(135deg, #e8eaf6, #e3f2fd)', opacity: 0.7 }} />
        <Box style={{ position: 'absolute', bottom: '-90px', right: isMobile ? '-30px' : '250px', width: isMobile ? '150px' : '200px', height: isMobile ? '150px' : '200px', borderRadius: '50%', background: '#fff3e0', opacity: 0.6 }} />
        <Box style={{ position: 'relative', maxWidth: '780px' }}>
          <Box style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#fff3e0', border: '1px solid #ff6f00', borderRadius: '30px', padding: '6px 16px', marginBottom: '20px' }}>
            <Typography variant="body2" style={{ color: '#ff6f00', fontWeight: '700', ...bodyFont }}>ADMIN PANEL</Typography>
          </Box>
          <Typography style={{ fontWeight: '800', marginBottom: '12px', color: '#0a0a0a', fontSize: isMobile ? '34px' : '42px', lineHeight: '1.15', ...fontStyle }}>
            Manage the{' '}
            <span style={{ background: 'linear-gradient(135deg, #1a237e, #0288d1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              platform
            </span>
          </Typography>
          <Typography variant="h6" style={{ color: '#666', fontWeight: '400', lineHeight: '1.6', maxWidth: '680px', ...bodyFont }}>
            Review users, monitor courses, update roles, and keep Nairafame Academy running smoothly.
          </Typography>
        </Box>
      </Box>

      <Box style={{ padding: pagePadding }}>
        {message && (
          <Alert severity={messageType} style={{ marginBottom: '24px', borderRadius: '10px' }} onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        {/* Stat Cards */}
        <Grid container spacing={3} style={{ marginBottom: '36px' }}>
          {statCards.map(stat => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card elevation={0} style={{ borderRadius: '18px', textAlign: 'center', padding: '24px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <Box style={{ color: stat.color, marginBottom: '10px' }}>
                  {React.cloneElement(stat.icon, { style: { fontSize: '44px' } })}
                </Box>
                <Typography variant="h3" style={{ fontWeight: '800', color: stat.color, ...fontStyle }}>{stat.value}</Typography>
                <Typography variant="body1" style={{ color: '#666', fontWeight: '600', ...bodyFont }}>{stat.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Users Table */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} style={{ borderRadius: '20px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <CardContent style={{ padding: isMobile ? '20px' : '28px' }}>
                <Box style={{ marginBottom: '20px' }}>
                  <Typography style={{ fontWeight: '800', color: '#0a0a0a', fontSize: '26px', ...fontStyle }}>All Users</Typography>
                  <Typography variant="body2" style={{ color: '#999', marginTop: '4px', ...bodyFont }}>Manage accounts and platform roles</Typography>
                </Box>
                <TableContainer component={Paper} elevation={0} style={{ border: '1px solid #f0f0f0', borderRadius: '14px', overflowX: 'auto' }}>
                  <Table size={isMobile ? 'small' : 'medium'}>
                    <TableHead>
                      <TableRow style={{ backgroundColor: '#fafafa' }}>
                        <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Name</TableCell>
                        <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Role</TableCell>
                        <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map(user => (
                        <TableRow key={user.id} hover>
                          <TableCell>
                            <Typography style={{ fontWeight: '700', color: '#333', fontSize: '13px', ...bodyFont }}>{user.name}</Typography>
                            <Typography style={{ color: '#999', fontSize: '11px', ...bodyFont }}>{user.email}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={user.role} size="small" color={roleColor(user.role)} style={{ fontWeight: '700' }} />
                          </TableCell>
                          <TableCell>
                            <Box style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {user.role === 'student' && (
                                <IconButton size="small"
                                  onClick={() => handleViewQuizResults(user)}
                                  style={{ backgroundColor: '#e8f5e9', color: '#4caf50' }}
                                  aria-label="View quiz results">
                                  <QuizIcon fontSize="small" />
                                </IconButton>
                              )}
                              <IconButton size="small"
                                onClick={() => { setSelectedUser(user); setNewRole(user.role); setOpenEditRoleDialog(true); }}
                                style={{ backgroundColor: '#e3f2fd', color: '#1a237e' }}
                                aria-label="Edit role">
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small"
                                onClick={() => { setSelectedUser(user); setOpenDeleteUserDialog(true); }}
                                style={{ backgroundColor: '#ffebee', color: '#f44336' }}
                                aria-label="Delete user">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Courses Table */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} style={{ borderRadius: '20px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <CardContent style={{ padding: isMobile ? '20px' : '28px' }}>
                <Box style={{ marginBottom: '20px' }}>
                  <Typography style={{ fontWeight: '800', color: '#0a0a0a', fontSize: '26px', ...fontStyle }}>All Courses</Typography>
                  <Typography variant="body2" style={{ color: '#999', marginTop: '4px', ...bodyFont }}>Review course activity and remove outdated courses</Typography>
                </Box>
                <TableContainer component={Paper} elevation={0} style={{ border: '1px solid #f0f0f0', borderRadius: '14px', overflowX: 'auto' }}>
                  <Table size={isMobile ? 'small' : 'medium'}>
                    <TableHead>
                      <TableRow style={{ backgroundColor: '#fafafa' }}>
                        <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Title</TableCell>
                        <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Students</TableCell>
                        <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Lessons</TableCell>
                        <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {courses.map(course => (
                        <TableRow key={course.id} hover>
                          <TableCell style={{ fontWeight: '700', color: '#333', ...bodyFont }}>{course.title}</TableCell>
                          <TableCell style={{ color: '#666', ...bodyFont }}>{course.total_students}</TableCell>
                          <TableCell style={{ color: '#666', ...bodyFont }}>{course.total_lessons}</TableCell>
                          <TableCell>
                            <IconButton size="small"
                              onClick={() => { setSelectedCourse(course); setOpenDeleteCourseDialog(true); }}
                              style={{ backgroundColor: '#ffebee', color: '#f44336' }}
                              aria-label="Delete course">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Quiz Results Table */}
          <Grid item xs={12}>
            <Card elevation={0} style={{ borderRadius: '20px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <CardContent style={{ padding: isMobile ? '20px' : '28px' }}>
                <Box style={{ marginBottom: '20px' }}>
                  <Typography style={{ fontWeight: '800', color: '#0a0a0a', fontSize: '26px', ...fontStyle }}>
                    All Quiz Attempts
                  </Typography>
                  <Typography variant="body2" style={{ color: '#999', marginTop: '4px', ...bodyFont }}>
                    View every student's quiz submissions and scores
                  </Typography>
                </Box>
                <AllQuizAttemptsTable fontStyle={fontStyle} bodyFont={bodyFont} isMobile={isMobile} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Quiz Results Dialog for individual student */}
      <Dialog open={openQuizDialog} onClose={() => setOpenQuizDialog(false)} maxWidth="md" fullWidth
        PaperProps={{ style: { borderRadius: '16px' } }}>
        <DialogTitle style={{ borderBottom: '1px solid #f0f0f0', padding: '20px 24px' }}>
          <Typography style={{ fontWeight: '800', fontSize: '18px', color: '#0a0a0a', ...fontStyle }}>
            Quiz Results — {selectedStudent?.name}
          </Typography>
        </DialogTitle>
        <DialogContent style={{ padding: '24px' }}>
          {quizAttempts.length === 0 ? (
            <Box style={{ textAlign: 'center', padding: '40px' }}>
              <QuizIcon style={{ fontSize: '48px', color: '#ccc', marginBottom: '12px' }} />
              <Typography style={{ color: '#999', fontWeight: '700', ...fontStyle }}>No quiz attempts yet</Typography>
            </Box>
          ) : (
            quizAttempts.map((attempt, i) => (
              <Card key={i} elevation={0} style={{ borderRadius: '12px', marginBottom: '16px', border: '1px solid #f0f0f0' }}>
                <CardContent style={{ padding: '20px' }}>
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <Typography style={{ fontWeight: '800', color: '#0a0a0a', ...fontStyle }}>{attempt.quiz_title}</Typography>
                    <Chip
                      icon={attempt.status === 'fully_marked' ? <CheckCircleIcon style={{ fontSize: '14px' }} /> : <HourglassEmptyIcon style={{ fontSize: '14px' }} />}
                      label={attempt.status === 'fully_marked' ? 'Fully Marked' : 'Pending Section C'}
                      size="small"
                      style={{
                        backgroundColor: attempt.status === 'fully_marked' ? '#e8f5e9' : '#fff3e0',
                        color: attempt.status === 'fully_marked' ? '#2e7d32' : '#ff6f00',
                        fontWeight: '700', ...bodyFont
                      }}
                    />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box style={{ textAlign: 'center', backgroundColor: '#fff3e0', borderRadius: '10px', padding: '12px' }}>
                        <Typography style={{ fontWeight: '800', fontSize: '20px', color: '#ff6f00', ...fontStyle }}>
                          {attempt.section_a_score ?? '-'}
                        </Typography>
                        <Typography variant="caption" style={{ color: '#666', ...bodyFont }}>Section A</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box style={{ textAlign: 'center', backgroundColor: '#e3f2fd', borderRadius: '10px', padding: '12px' }}>
                        <Typography style={{ fontWeight: '800', fontSize: '20px', color: '#0288d1', ...fontStyle }}>
                          {attempt.section_b_score ?? '-'}
                        </Typography>
                        <Typography variant="caption" style={{ color: '#666', ...bodyFont }}>Section B</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box style={{ textAlign: 'center', backgroundColor: '#e8f5e9', borderRadius: '10px', padding: '12px' }}>
                        <Typography style={{ fontWeight: '800', fontSize: '20px', color: '#4caf50', ...fontStyle }}>
                          {attempt.section_c_score ?? '⏳'}
                        </Typography>
                        <Typography variant="caption" style={{ color: '#666', ...bodyFont }}>Section C</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Box style={{ textAlign: 'center', marginTop: '12px', backgroundColor: '#f5f5f5', borderRadius: '10px', padding: '10px' }}>
                    <Typography style={{ fontWeight: '800', fontSize: '22px', color: '#1a237e', ...fontStyle }}>
                      {attempt.total_score ?? (attempt.section_a_score + attempt.section_b_score)} / {attempt.grand_total || '?'}
                    </Typography>
                    <Typography variant="caption" style={{ color: '#999', ...bodyFont }}>Total Score</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0' }}>
          <Button onClick={() => setOpenQuizDialog(false)} style={{ textTransform: 'none', color: '#666', ...bodyFont }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={openDeleteUserDialog} onClose={() => setOpenDeleteUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ color: '#0a0a0a', fontWeight: '800', ...fontStyle }}>Delete User</DialogTitle>
        <DialogContent style={{ padding: '24px' }}>
          <Typography variant="h6" style={{ marginBottom: '10px', fontWeight: '700', ...fontStyle }}>Are you sure you want to delete this user?</Typography>
          <Typography variant="body1" style={{ color: '#f44336', fontWeight: '700', ...bodyFont }}>{selectedUser?.name} ({selectedUser?.email})</Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginTop: '10px', lineHeight: '1.6', ...bodyFont }}>
            This will permanently delete the user and all their data. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions style={{ padding: '20px 24px' }}>
          <Button onClick={() => setOpenDeleteUserDialog(false)} style={{ color: '#666', textTransform: 'none', ...bodyFont }}>Cancel</Button>
          <Button onClick={handleDeleteUser} variant="contained"
            style={{ backgroundColor: '#f44336', borderRadius: '10px', textTransform: 'none', fontWeight: '700', ...bodyFont }}>
            Yes, Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={openDeleteCourseDialog} onClose={() => setOpenDeleteCourseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ color: '#0a0a0a', fontWeight: '800', ...fontStyle }}>Delete Course</DialogTitle>
        <DialogContent style={{ padding: '24px' }}>
          <Typography variant="h6" style={{ marginBottom: '10px', fontWeight: '700', ...fontStyle }}>Are you sure you want to delete this course?</Typography>
          <Typography variant="body1" style={{ color: '#f44336', fontWeight: '700', ...bodyFont }}>"{selectedCourse?.title}"</Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginTop: '10px', lineHeight: '1.6', ...bodyFont }}>
            This will permanently delete the course and all its lessons and sections. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions style={{ padding: '20px 24px' }}>
          <Button onClick={() => setOpenDeleteCourseDialog(false)} style={{ color: '#666', textTransform: 'none', ...bodyFont }}>Cancel</Button>
          <Button onClick={handleDeleteCourse} variant="contained"
            style={{ backgroundColor: '#f44336', borderRadius: '10px', textTransform: 'none', fontWeight: '700', ...bodyFont }}>
            Yes, Delete Course
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={openEditRoleDialog} onClose={() => setOpenEditRoleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ color: '#0a0a0a', fontWeight: '800', ...fontStyle }}>Change User Role</DialogTitle>
        <DialogContent style={{ padding: '24px' }}>
          <Typography variant="body1" style={{ marginBottom: '20px', color: '#333', ...bodyFont }}>
            Changing role for: <strong>{selectedUser?.name}</strong>
          </Typography>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Role</InputLabel>
            <Select value={newRole} onChange={e => setNewRole(e.target.value)} label="Role">
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions style={{ padding: '20px 24px' }}>
          <Button onClick={() => setOpenEditRoleDialog(false)} style={{ color: '#666', textTransform: 'none', ...bodyFont }}>Cancel</Button>
          <Button onClick={handleUpdateRole} variant="contained"
            style={{ backgroundColor: '#0288d1', borderRadius: '10px', textTransform: 'none', fontWeight: '700', ...bodyFont }}>
            Save Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// All quiz attempts table component
function AllQuizAttemptsTable({ fontStyle, bodyFont, isMobile }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllAttempts = async () => {
      try {
        const res = await axios.get(`${API}/api/quiz/all-attempts`);
        setAttempts(res.data);
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    };
    fetchAllAttempts();
  }, []);

  if (loading) return <Typography style={{ color: '#999', padding: '20px', ...bodyFont }}>Loading...</Typography>;

  if (attempts.length === 0) return (
    <Box style={{ textAlign: 'center', padding: '40px' }}>
      <QuizIcon style={{ fontSize: '48px', color: '#ccc', marginBottom: '12px' }} />
      <Typography style={{ color: '#999', fontWeight: '700', ...fontStyle }}>No quiz attempts yet</Typography>
    </Box>
  );

  return (
    <TableContainer component={Paper} elevation={0} style={{ border: '1px solid #f0f0f0', borderRadius: '14px', overflowX: 'auto' }}>
      <Table size={isMobile ? 'small' : 'medium'}>
        <TableHead>
          <TableRow style={{ backgroundColor: '#fafafa' }}>
            <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Student</TableCell>
            <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Quiz</TableCell>
            <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Section A</TableCell>
            <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Section B</TableCell>
            <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Section C</TableCell>
            <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Total</TableCell>
            <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attempts.map((attempt, i) => (
            <TableRow key={i} hover>
              <TableCell style={{ fontWeight: '700', color: '#333', ...bodyFont }}>{attempt.student_name}</TableCell>
              <TableCell style={{ color: '#666', ...bodyFont }}>{attempt.quiz_title}</TableCell>
              <TableCell style={{ color: '#ff6f00', fontWeight: '700', ...bodyFont }}>
                {attempt.section_a_score ?? '-'}{attempt.section_a_total ? ` / ${attempt.section_a_total}` : ''}
              </TableCell>
              <TableCell style={{ color: '#0288d1', fontWeight: '700', ...bodyFont }}>
                {attempt.section_b_score ?? '-'}{attempt.section_b_total ? ` / ${attempt.section_b_total}` : ''}
              </TableCell>
              <TableCell style={{ color: '#4caf50', fontWeight: '700', ...bodyFont }}>
                {attempt.section_c_score != null ? `${attempt.section_c_score}${attempt.section_c_total ? ` / ${attempt.section_c_total}` : ''}` : '⏳'}
              </TableCell>
              <TableCell style={{ fontWeight: '800', color: '#1a237e', ...bodyFont }}>
                {attempt.total_score ?? (attempt.section_a_score + attempt.section_b_score)}{attempt.grand_total ? ` / ${attempt.grand_total}` : ''}
              </TableCell>
              <TableCell>
                <Chip
                  label={attempt.status === 'fully_marked' ? '✅ Done' : '⏳ Pending'}
                  size="small"
                  style={{
                    backgroundColor: attempt.status === 'fully_marked' ? '#e8f5e9' : '#fff3e0',
                    color: attempt.status === 'fully_marked' ? '#2e7d32' : '#ff6f00',
                    fontWeight: '700', fontSize: '11px'
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AdminDashboard;