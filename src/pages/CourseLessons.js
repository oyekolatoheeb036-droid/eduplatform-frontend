import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Chip, Alert,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  useMediaQuery
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BuildIcon from '@mui/icons-material/Build';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function CourseLessons() {
  const { course_id } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [course, setCourse] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [newLesson, setNewLesson] = useState({ title: '' });
  const [editLesson, setEditLesson] = useState({ title: '' });

  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
  const bodyFont = { fontFamily: "'Inter', sans-serif" };
  const headerPadding = isMobile ? '48px 20px' : isTablet ? '56px 32px' : '60px 80px';
  const pagePadding = isMobile ? '36px 20px' : isTablet ? '44px 32px' : '50px 80px';

  useEffect(() => {
    fetchLessons();
    fetchCourse();
  }, [course_id]);

  const fetchCourse = async () => {
    try {
      const res = await axios.get('https://eduplatform-api-pol1.onrender.com/api/courses');
      const found = res.data.find(c => c.id === parseInt(course_id));
      setCourse(found);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await axios.get(`https://eduplatform-api-pol1.onrender.com/api/lessons/${course_id}`);
      setLessons(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateLesson = async () => {
    try {
      await axios.post('https://eduplatform-api-pol1.onrender.com/api/lessons', {
        course_id: parseInt(course_id),
        title: newLesson.title,
        content: '',
        order_number: lessons.length + 1
      });
      setMessageType('success');
      setMessage('Lesson created successfully! 🎉');
      setOpenAddDialog(false);
      setNewLesson({ title: '' });
      fetchLessons();
    } catch (err) {
      setMessageType('error');
      setMessage('Failed to create lesson. Try again.');
    }
  };

  const handleEditLesson = async () => {
    try {
      await axios.put(`https://eduplatform-api-pol1.onrender.com/api/lessons/${selectedLesson.id}`, {
        title: editLesson.title,
        content: selectedLesson.content,
        video_url: selectedLesson.video_url,
        duration: selectedLesson.duration,
        order_number: selectedLesson.order_number
      });
      setMessageType('success');
      setMessage('Lesson updated successfully! ✅');
      setOpenEditDialog(false);
      fetchLessons();
    } catch (err) {
      setMessageType('error');
      setMessage('Failed to update lesson. Try again.');
    }
  };

  const handleDeleteLesson = async () => {
    try {
      await axios.delete(`https://eduplatform-api-pol1.onrender.com/api/lessons/${selectedLesson.id}`);
      setMessageType('success');
      setMessage('Lesson deleted successfully! 🗑️');
      setOpenDeleteDialog(false);
      fetchLessons();
    } catch (err) {
      setMessageType('error');
      setMessage('Failed to delete lesson. Try again.');
    }
  };

  return (
    <Box style={{ background: '#fafafa', minHeight: '100vh', ...bodyFont }}>

      {/* ── Header ── */}
      <Box style={{
        background: 'white',
        padding: headerPadding,
        borderBottom: '1px solid #f0f0f0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
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
          {/* Back button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/teacher')}
            style={{
              color: '#1a237e',
              textTransform: 'none',
              fontWeight: '700',
              marginBottom: '16px',
              padding: '0',
              ...bodyFont
            }}
          >
            Back to Dashboard
          </Button>

          {/* Pill badge */}
          <Box style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#fff3e0',
            border: '1px solid #ff6f00',
            borderRadius: '30px',
            padding: '6px 16px',
            marginBottom: '20px',
            marginLeft: isMobile ? '0' : '16px'
          }}>
            <Typography variant="body2" style={{ color: '#ff6f00', fontWeight: '700', ...bodyFont }}>
              COURSE CONTENT
            </Typography>
          </Box>

          <Typography style={{
            fontWeight: '800',
            marginBottom: '12px',
            color: '#0a0a0a',
            fontSize: isMobile ? '28px' : '42px',
            lineHeight: '1.15',
            ...fontStyle
          }}>
            {course?.title ? (
              <>
                {course.title.split(' ').slice(0, -1).join(' ')}{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #1a237e, #0288d1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {course.title.split(' ').slice(-1)[0]}
                </span>
              </>
            ) : (
              <>
                Course{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #1a237e, #0288d1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Lessons
                </span>{' '}📚
              </>
            )}
          </Typography>

          {course?.description && (
            <Typography variant="h6" style={{
              color: '#666',
              fontWeight: '400',
              lineHeight: '1.6',
              maxWidth: '680px',
              ...bodyFont
            }}>
              {course.description}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ── Page body ── */}
      <Box style={{ padding: pagePadding }}>

        {message && (
          <Alert severity={messageType} style={{ marginBottom: '24px', borderRadius: '10px' }} onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        {/* Add Lesson Button */}
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => setOpenAddDialog(true)}
          style={{
            backgroundColor: '#1a237e',
            padding: isMobile ? '10px 20px' : '12px 28px',
            borderRadius: '10px',
            marginBottom: '32px',
            fontSize: '15px',
            fontWeight: '700',
            textTransform: 'none',
            boxShadow: 'none',
            ...bodyFont
          }}
        >
          Add New Lesson
        </Button>

        {/* Empty state */}
        {lessons.length === 0 ? (
          <Card elevation={0} style={{
            borderRadius: '20px',
            textAlign: 'center',
            padding: isMobile ? '40px 20px' : '60px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}>
            <Typography variant="h5" style={{ color: '#999', marginBottom: '10px', fontWeight: '700', ...fontStyle }}>
              No lessons yet!
            </Typography>
            <Typography style={{ color: '#bbb', ...bodyFont }}>
              Click Add New Lesson to create your first lesson.
            </Typography>
          </Card>
        ) : (
          lessons.map((lesson, index) => (
            <Card key={lesson.id} elevation={0} style={{
              borderRadius: '18px',
              marginBottom: '14px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}>
              <CardContent style={{
                padding: isMobile ? '16px' : '22px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: isMobile ? 'wrap' : 'nowrap',
                gap: '12px'
              }}>
                {/* Left: icon + title */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                  <Box style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1a237e, #0288d1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    <PlayCircleFilledIcon />
                  </Box>
                  <Box style={{ minWidth: 0 }}>
                    <Chip
                      label={`Lesson ${index + 1}`}
                      size="small"
                      style={{
                        marginBottom: '6px',
                        fontWeight: '700',
                        backgroundColor: '#e3f2fd',
                        color: '#1a237e',
                        ...bodyFont
                      }}
                    />
                    <Typography style={{
                      fontWeight: '800',
                      fontSize: isMobile ? '15px' : '17px',
                      color: '#0a0a0a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      ...fontStyle
                    }}>
                      {lesson.title}
                    </Typography>
                  </Box>
                </Box>

                {/* Right: action buttons */}
                <Box style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  flexShrink: 0,
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: isMobile ? 'flex-end' : 'flex-start'
                }}>
                  <Button
                    variant="contained"
                    startIcon={<BuildIcon />}
                    onClick={() => navigate(`/courses/${course_id}/lessons/${lesson.id}/builder`)}
                    style={{
                      backgroundColor: '#ff6f00',
                      borderRadius: '10px',
                      padding: '8px 18px',
                      fontWeight: '700',
                      textTransform: 'none',
                      boxShadow: 'none',
                      ...bodyFont
                    }}
                  >
                    Build
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => { setSelectedLesson(lesson); setEditLesson({ title: lesson.title }); setOpenEditDialog(true); }}
                    style={{ backgroundColor: '#e3f2fd', color: '#1a237e' }}
                    aria-label="Edit lesson"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => { setSelectedLesson(lesson); setOpenDeleteDialog(true); }}
                    style={{ backgroundColor: '#ffebee', color: '#f44336' }}
                    aria-label="Delete lesson"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* ── Add Lesson Dialog ── */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ color: '#0a0a0a', fontWeight: '800', ...fontStyle }}>
          Add New Lesson
        </DialogTitle>
        <DialogContent style={{ padding: '24px' }}>
          <TextField
            fullWidth
            label="Lesson Title"
            value={newLesson.title}
            onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
            margin="normal"
            variant="outlined"
            placeholder="e.g. Introduction to Algebra"
            InputProps={{ style: { borderRadius: '10px', ...bodyFont } }}
          />
        </DialogContent>
        <DialogActions style={{ padding: '20px 24px' }}>
          <Button onClick={() => setOpenAddDialog(false)} style={{ color: '#666', textTransform: 'none', ...bodyFont }}>Cancel</Button>
          <Button onClick={handleCreateLesson} variant="contained"
            style={{ backgroundColor: '#1a237e', borderRadius: '10px', textTransform: 'none', fontWeight: '700', boxShadow: 'none', ...bodyFont }}>
            Create Lesson
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Lesson Dialog ── */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ color: '#0a0a0a', fontWeight: '800', ...fontStyle }}>
          Edit Lesson
        </DialogTitle>
        <DialogContent style={{ padding: '24px' }}>
          <Typography variant="body1" style={{ marginBottom: '8px', color: '#333', ...bodyFont }}>
            Editing: <strong>{selectedLesson?.title}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Lesson Title"
            value={editLesson.title}
            onChange={e => setEditLesson({ ...editLesson, title: e.target.value })}
            margin="normal"
            variant="outlined"
            InputProps={{ style: { borderRadius: '10px', ...bodyFont } }}
          />
        </DialogContent>
        <DialogActions style={{ padding: '20px 24px' }}>
          <Button onClick={() => setOpenEditDialog(false)} style={{ color: '#666', textTransform: 'none', ...bodyFont }}>Cancel</Button>
          <Button onClick={handleEditLesson} variant="contained"
            style={{ backgroundColor: '#0288d1', borderRadius: '10px', textTransform: 'none', fontWeight: '700', boxShadow: 'none', ...bodyFont }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Lesson Dialog ── */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ color: '#0a0a0a', fontWeight: '800', ...fontStyle }}>
          Delete Lesson
        </DialogTitle>
        <DialogContent style={{ padding: '24px' }}>
          <Typography variant="h6" style={{ marginBottom: '10px', fontWeight: '700', ...fontStyle }}>
            Are you sure you want to delete this lesson?
          </Typography>
          <Typography variant="body1" style={{ color: '#f44336', fontWeight: '700', ...bodyFont }}>
            "{selectedLesson?.title}"
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginTop: '10px', lineHeight: '1.6', ...bodyFont }}>
            ⚠️ This will permanently delete the lesson and all its sections. This cannot be undone!
          </Typography>
        </DialogContent>
        <DialogActions style={{ padding: '20px 24px' }}>
          <Button onClick={() => setOpenDeleteDialog(false)} style={{ color: '#666', textTransform: 'none', ...bodyFont }}>Cancel</Button>
          <Button onClick={handleDeleteLesson} variant="contained"
            style={{ backgroundColor: '#f44336', borderRadius: '10px', textTransform: 'none', fontWeight: '700', boxShadow: 'none', ...bodyFont }}>
            Yes, Delete Lesson
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CourseLessons;