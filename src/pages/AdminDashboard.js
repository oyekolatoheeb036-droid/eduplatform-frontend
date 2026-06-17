import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_courses: 0,
    total_enrollments: 0,
    total_lessons: 0
  });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [openDeleteUserDialog, setOpenDeleteUserDialog] = useState(false);
  const [openDeleteCourseDialog, setOpenDeleteCourseDialog] = useState(false);
  const [openEditRoleDialog, setOpenEditRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newRole, setNewRole] = useState('');
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
  const bodyFont = { fontFamily: "'Inter', sans-serif" };
  const headerPadding = isMobile ? '48px 20px' : isTablet ? '56px 32px' : '60px 80px';
  const pagePadding = isMobile ? '36px 20px' : isTablet ? '44px 32px' : '50px 80px';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get('https://eduplatform-api-pol1.onrender.com/api/admin/users'),
        axios.get('https://eduplatform-api-pol1.onrender.com/api/admin/stats')
      ]);
      setUsers(usersRes.data.users);
      setCourses(usersRes.data.courses);
      setStats(statsRes.data);
    } catch (err) {
      setMessage('Error loading admin data.');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`https://eduplatform-api-pol1.onrender.com/api/admin/users/${selectedUser.id}`);
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
      await axios.delete(`https://eduplatform-api-pol1.onrender.com/api/courses/${selectedCourse.id}`);
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
      await axios.put(`https://eduplatform-api-pol1.onrender.com/api/admin/users/${selectedUser.id}/role`, {
        role: newRole
      });
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
      <Box style={{
        background: 'white',
        padding: headerPadding,
        borderBottom: '1px solid #f0f0f0',
        position: 'relative',
        overflow: 'hidden'
      }}>
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
              ADMIN PANEL
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
            Manage the{' '}
            <span style={{
              background: 'linear-gradient(135deg, #1a237e, #0288d1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
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

        <Grid container spacing={3} style={{ marginBottom: '36px' }}>
          {statCards.map(stat => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card elevation={0} style={{ borderRadius: '18px', textAlign: 'center', padding: '24px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <Box style={{ color: stat.color, marginBottom: '10px' }}>
                  {React.cloneElement(stat.icon, { style: { fontSize: '44px' } })}
                </Box>
                <Typography variant="h3" style={{ fontWeight: '800', color: stat.color, ...fontStyle }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" style={{ color: '#666', fontWeight: '600', ...bodyFont }}>
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={0} style={{ borderRadius: '20px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <CardContent style={{ padding: isMobile ? '20px' : '28px' }}>
                <Box style={{ marginBottom: '20px' }}>
                  <Typography style={{ fontWeight: '800', color: '#0a0a0a', fontSize: '26px', ...fontStyle }}>
                    All Users
                  </Typography>
                  <Typography variant="body2" style={{ color: '#999', marginTop: '4px', ...bodyFont }}>
                    Manage accounts and platform roles
                  </Typography>
                </Box>
                <TableContainer component={Paper} elevation={0} style={{ border: '1px solid #f0f0f0', borderRadius: '14px', overflowX: 'auto' }}>
                  <Table size={isMobile ? 'small' : 'medium'}>
                    <TableHead>
                      <TableRow style={{ backgroundColor: '#fafafa' }}>
                        <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Name</TableCell>
                        <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Email</TableCell>
                        <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Role</TableCell>
                        <TableCell style={{ fontWeight: '800', color: '#333', ...bodyFont }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map(user => (
                        <TableRow key={user.id} hover>
                          <TableCell style={{ fontWeight: '700', color: '#333', ...bodyFont }}>{user.name}</TableCell>
                          <TableCell style={{ fontSize: '12px', color: '#666', ...bodyFont }}>{user.email}</TableCell>
                          <TableCell>
                            <Chip label={user.role} size="small" color={roleColor(user.role)} style={{ fontWeight: '700' }} />
                          </TableCell>
                          <TableCell>
                            <Box style={{ display: 'flex', gap: '8px' }}>
                              <IconButton
                                size="small"
                                onClick={() => { setSelectedUser(user); setNewRole(user.role); setOpenEditRoleDialog(true); }}
                                style={{ backgroundColor: '#e3f2fd', color: '#1a237e' }}
                                aria-label="Edit role"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => { setSelectedUser(user); setOpenDeleteUserDialog(true); }}
                                style={{ backgroundColor: '#ffebee', color: '#f44336' }}
                                aria-label="Delete user"
                              >
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

          <Grid item xs={12} md={6}>
            <Card elevation={0} style={{ borderRadius: '20px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <CardContent style={{ padding: isMobile ? '20px' : '28px' }}>
                <Box style={{ marginBottom: '20px' }}>
                  <Typography style={{ fontWeight: '800', color: '#0a0a0a', fontSize: '26px', ...fontStyle }}>
                    All Courses
                  </Typography>
                  <Typography variant="body2" style={{ color: '#999', marginTop: '4px', ...bodyFont }}>
                    Review course activity and remove outdated courses
                  </Typography>
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
                            <IconButton
                              size="small"
                              onClick={() => { setSelectedCourse(course); setOpenDeleteCourseDialog(true); }}
                              style={{ backgroundColor: '#ffebee', color: '#f44336' }}
                              aria-label="Delete course"
                            >
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
        </Grid>
      </Box>

      <Dialog open={openDeleteUserDialog} onClose={() => setOpenDeleteUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ color: '#0a0a0a', fontWeight: '800', ...fontStyle }}>
          Delete User
        </DialogTitle>
        <DialogContent style={{ padding: '24px' }}>
          <Typography variant="h6" style={{ marginBottom: '10px', fontWeight: '700', ...fontStyle }}>
            Are you sure you want to delete this user?
          </Typography>
          <Typography variant="body1" style={{ color: '#f44336', fontWeight: '700', ...bodyFont }}>
            {selectedUser?.name} ({selectedUser?.email})
          </Typography>
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

      <Dialog open={openDeleteCourseDialog} onClose={() => setOpenDeleteCourseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ color: '#0a0a0a', fontWeight: '800', ...fontStyle }}>
          Delete Course
        </DialogTitle>
        <DialogContent style={{ padding: '24px' }}>
          <Typography variant="h6" style={{ marginBottom: '10px', fontWeight: '700', ...fontStyle }}>
            Are you sure you want to delete this course?
          </Typography>
          <Typography variant="body1" style={{ color: '#f44336', fontWeight: '700', ...bodyFont }}>
            "{selectedCourse?.title}"
          </Typography>
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

      <Dialog open={openEditRoleDialog} onClose={() => setOpenEditRoleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ color: '#0a0a0a', fontWeight: '800', ...fontStyle }}>
          Change User Role
        </DialogTitle>
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

export default AdminDashboard;
