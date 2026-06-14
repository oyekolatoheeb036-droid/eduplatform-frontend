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
  Grid,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [editCourse, setEditCourse] = useState({ title: '', description: '' });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const navigate = useNavigate();
  const { user } = useAuth();
  const instructor_id = user?.id || 1;
  const teacherName = user?.name || 'Teacher';
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
  const bodyFont = { fontFamily: "'Inter', sans-serif" };
  const headerPadding = isMobile ? '48px 20px' : isTablet ? '56px 32px' : '60px 80px';
  const pagePadding = isMobile ? '36px 20px' : isTablet ? '44px 32px' : '50px 80px';

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    axios.get('http://localhost:5000/api/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.log(err));
  };

  const handleCreateCourse = async () => {
    try {
      await axios.post('http://localhost:5000/api/courses', {
        title: newCourse.title,
        description: newCourse.description,
        instructor_id
      });
      setMessageType('success');
      setMessage('Course created successfully!');
      setOpenDialog(false);
      setNewCourse({ title: '', description: '' });
      fetchCourses();
    } catch (err) {
      setMessageType('error');
      setMessage('Error creating course.');
    }
  };

  const handleEditCourse = async () => {
    try {
      await axios.put(`http://localhost:5000/api/courses/${selectedCourse.id}`, {
        title: editCourse.title,
        description: editCourse.description
      });
      setMessageType('success');
      setMessage('Course updated successfully!');
      setOpenEditDialog(false);
      fetchCourses();
    } catch (err) {
      setMessageType('error');
      setMessage('Error updating course.');
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/courses/${selectedCourse.id}`);
      setMessageType('success');
      setMessage('Course deleted successfully!');
      setOpenDeleteDialog(false);
      fetchCourses();
    } catch (err) {
      setMessageType('error');
      setMessage('Error deleting course.');
    }
  };

  const openEdit = (course) => {
    setSelectedCourse(course);
    setEditCourse({ title: course.title, description: course.description });
    setOpenEditDialog(true);
  };

  const openDelete = (course) => {
    setSelectedCourse(course);
    setOpenDeleteDialog(true);
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
              TEACHER DASHBOARD
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
            Manage your{' '}
            <span style={{
              background: 'linear-gradient(135deg, #1a237e, #0288d1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              courses
            </span>
          </Typography>
          <Typography variant="h6" style={{ color: '#666', fontWeight: '400', lineHeight: '1.6', maxWidth: '680px', ...bodyFont }}>
            Welcome, {teacherName}. Create lessons, organize course content, and keep your classroom moving.
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            style={{
              marginTop: '28px',
              backgroundColor: '#1a237e',
              borderRadius: '10px',
              padding: '12px 24px',
              fontWeight: '700',
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(26,35,126,0.25)',
              ...bodyFont
            }}
          >
            Create Course
          </Button>
        </Box>
      </Box>

      <Box style={{ padding: pagePadding }}>
        <Grid container spacing={3} style={{ marginBottom: '30px' }}>
          <Grid item xs={12} sm={6}>
            <Card elevation={0} style={{ borderRadius: '18px', textAlign: 'center', padding: '24px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <SchoolIcon style={{ fontSize: '44px', color: '#1a237e', marginBottom: '10px' }} />
              <Typography variant="h3" style={{ fontWeight: '800', color: '#1a237e', ...fontStyle }}>
                {courses.length}
              </Typography>
              <Typography variant="body1" style={{ color: '#666', fontWeight: '600', ...bodyFont }}>
                Total Courses
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card elevation={0} style={{ borderRadius: '18px', textAlign: 'center', padding: '24px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <PeopleIcon style={{ fontSize: '44px', color: '#ff6f00', marginBottom: '10px' }} />
              <Typography variant="h3" style={{ fontWeight: '800', color: '#ff6f00', ...fontStyle }}>
                0
              </Typography>
              <Typography variant="body1" style={{ color: '#666', fontWeight: '600', ...bodyFont }}>
                Total Students
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {message && (
          <Alert severity={messageType} style={{ marginBottom: '24px', borderRadius: '10px' }} onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
          <Box>
            <Typography style={{ fontWeight: '800', color: '#0a0a0a', fontSize: '26px', ...fontStyle }}>
              My Courses
            </Typography>
            <Typography variant="body2" style={{ color: '#999', marginTop: '4px', ...bodyFont }}>
              Build lessons and manage your course library
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            style={{ borderColor: '#1a237e', color: '#1a237e', borderRadius: '10px', padding: '10px 18px', fontWeight: '700', textTransform: 'none', ...bodyFont }}
          >
            New Course
          </Button>
        </Box>

        {courses.length === 0 ? (
          <Card elevation={0} style={{ borderRadius: '18px', padding: isMobile ? '28px 18px' : '36px', textAlign: 'center', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Typography variant="h6" style={{ color: '#333', fontWeight: '700', ...fontStyle }}>
              No courses yet.
            </Typography>
            <Typography variant="body2" style={{ color: '#999', marginTop: '8px', ...bodyFont }}>
              Create your first course and start adding lessons.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              style={{ marginTop: '20px', backgroundColor: '#1a237e', borderRadius: '10px', padding: '12px 24px', fontWeight: '700', textTransform: 'none', ...bodyFont }}
            >
              Create Course
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {courses.map(course => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card elevation={0} style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
                  <Box style={{ background: 'linear-gradient(135deg, #1a237e, #283593)', padding: '28px 25px', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                      <PlayCircleFilledIcon style={{ fontSize: '30px', color: 'white' }} />
                    </Box>
                    <Box>
                      <Chip label="Course" size="small" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: '700', marginBottom: '8px' }} />
                      <Typography style={{ color: 'white', fontWeight: '800', fontSize: '18px', lineHeight: '1.3', ...fontStyle }}>
                        {course.title}
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent style={{ padding: '22px 25px' }}>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: '20px', lineHeight: '1.6', minHeight: '44px', ...bodyFont }}>
                      {course.description || 'Create structured lessons and quizzes for this course.'}
                    </Typography>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate(`/teacher/course/${course.id}/lessons`)}
                      style={{ background: 'linear-gradient(135deg, #1a237e, #283593)', borderRadius: '10px', padding: '12px', marginBottom: '10px', textTransform: 'none', fontWeight: '700', boxShadow: 'none', ...bodyFont }}
                    >
                      Build Lessons
                    </Button>

                    <Box style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => openEdit(course)}
                        style={{ borderColor: '#0288d1', color: '#0288d1', borderRadius: '10px', textTransform: 'none', fontWeight: '700', ...bodyFont }}
                      >
                        Edit
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => openDelete(course)}
                        style={{ borderColor: '#f44336', color: '#f44336', borderRadius: '10px', textTransform: 'none', fontWeight: '700', ...bodyFont }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ color: '#0a0a0a', fontWeight: '800', ...fontStyle }}>
          Create New Course
        </DialogTitle>
        <DialogContent style={{ padding: '24px' }}>
          <TextField
            fullWidth
            label="Course Title"
            value={newCourse.title}
            onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
            margin="normal"
            variant="outlined"
            placeholder="e.g. Introduction to Algebra"
          />
          <TextField
            fullWidth
            label="Course Description"
            value={newCourse.description}
            onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
            margin="normal"
            variant="outlined"
            multiline
            rows={4}
            placeholder="Describe what students will learn..."
          />
        </DialogContent>
        <DialogActions style={{ padding: '20px 24px' }}>
          <Button onClick={() => setOpenDialog(false)} style={{ color: '#666', textTransform: 'none', ...bodyFont }}>Cancel</Button>
          <Button onClick={handleCreateCourse} variant="contained"
            style={{ backgroundColor: '#1a237e', borderRadius: '10px', textTransform: 'none', fontWeight: '700', ...bodyFont }}>
            Create Course
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ color: '#0a0a0a', fontWeight: '800', ...fontStyle }}>
          Edit Course
        </DialogTitle>
        <DialogContent style={{ padding: '24px' }}>
          <TextField
            fullWidth
            label="Course Title"
            value={editCourse.title}
            onChange={e => setEditCourse({ ...editCourse, title: e.target.value })}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Course Description"
            value={editCourse.description}
            onChange={e => setEditCourse({ ...editCourse, description: e.target.value })}
            margin="normal"
            variant="outlined"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions style={{ padding: '20px 24px' }}>
          <Button onClick={() => setOpenEditDialog(false)} style={{ color: '#666', textTransform: 'none', ...bodyFont }}>Cancel</Button>
          <Button onClick={handleEditCourse} variant="contained"
            style={{ backgroundColor: '#0288d1', borderRadius: '10px', textTransform: 'none', fontWeight: '700', ...bodyFont }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
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
            This will permanently delete the course and all its lessons, sections, and quizzes. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions style={{ padding: '20px 24px' }}>
          <Button onClick={() => setOpenDeleteDialog(false)} style={{ color: '#666', textTransform: 'none', ...bodyFont }}>Cancel</Button>
          <Button onClick={handleDeleteCourse} variant="contained"
            style={{ backgroundColor: '#f44336', borderRadius: '10px', textTransform: 'none', fontWeight: '700', ...bodyFont }}>
            Yes, Delete Course
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeacherDashboard;
