import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Divider, Alert, Chip, IconButton, useMediaQuery, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideoIcon from '@mui/icons-material/VideoLibrary';
import WebIcon from '@mui/icons-material/Language';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MathEditor from '../components/MathEditor';

const sectionTypes = [
  { type: 'introduction', label: '📖 Introduction', color: '#1a237e' },
  { type: 'learn', label: '📚 Learn', color: '#0288d1' },
  { type: 'relate', label: '🔗 Relate', color: '#4caf50' },
  { type: 'quiz', label: '📝 Quiz', color: '#ff6f00' },
  { type: 'dive_deeper', label: '🤖 Dive Deeper (AI)', color: '#9c27b0' },
];

const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

// ── Dive Deeper form fields (outside component to prevent re-render bug) ──
const DiveDeeperFields = ({ data, setData, isMobile }) => (
  <Box>
    <Box style={{
      display: 'flex', alignItems: 'flex-start', gap: '14px',
      backgroundColor: '#f3e5f5', border: '1px solid #9c27b0',
      borderRadius: '12px', padding: '16px', marginBottom: '20px', marginTop: '8px'
    }}>
      <AutoAwesomeIcon style={{ color: '#9c27b0', marginTop: '2px', flexShrink: 0 }} />
      <Box>
        <Typography style={{ fontWeight: '700', color: '#6a1b9a', marginBottom: '4px', ...fontStyle }}>
          AI Tutor Section
        </Typography>
        <Typography variant="body2" style={{ color: '#7b1fa2', lineHeight: '1.6', ...bodyFont }}>
          Students will chat with an AI tutor scoped to this lesson.
        </Typography>
      </Box>
    </Box>
    <TextField fullWidth multiline rows={isMobile ? 4 : 5}
      label="Lesson Topic Context (for the AI)"
      value={data.ai_context}
      onChange={e => setData({ ...data, ai_context: e.target.value })}
      margin="normal" variant="outlined"
      placeholder="e.g. This lesson covers quadratic equations for JSS3 students..."
      helperText="The AI will use this to stay on topic."
      InputProps={{ style: { borderRadius: '10px', ...bodyFont } }} />
    <TextField fullWidth
      label="Starter Message (what students see first)"
      value={data.starter_prompt}
      onChange={e => setData({ ...data, starter_prompt: e.target.value })}
      margin="normal" variant="outlined"
      placeholder="e.g. Hi! I'm your AI tutor. Ask me anything about this lesson 🧮"
      helperText="This message appears when the student opens the Dive Deeper section."
      InputProps={{ style: { borderRadius: '10px', ...bodyFont } }} />
  </Box>
);

// ── Regular section form fields (outside component to prevent re-render bug) ──
const RegularFields = ({ data, setData }) => (
  <Box>
    <MathEditor
      label="Content (with Math Support)"
      value={data.content}
      onChange={content => setData({ ...data, content })}
    />
    <TextField fullWidth label="YouTube Video URL (optional)"
      value={data.video_url}
      onChange={e => setData({ ...data, video_url: e.target.value })}
      margin="normal" variant="outlined"
      placeholder="https://www.youtube.com/watch?v=..."
      InputProps={{
        startAdornment: <VideoIcon style={{ marginRight: '10px', color: '#ff0000' }} />,
        style: { borderRadius: '10px', ...bodyFont }
      }} />
    <TextField fullWidth label="Google Docs Embed URL (optional)"
      value={data.website_url}
      onChange={e => setData({ ...data, website_url: e.target.value })}
      margin="normal" variant="outlined"
      placeholder="https://docs.google.com/document/d/.../pub?embedded=true"
      helperText="In Google Docs: File → Share → Publish to web → Embed → copy the src URL from the iframe code"
      InputProps={{
        startAdornment: <WebIcon style={{ marginRight: '10px', color: '#0288d1' }} />,
        style: { borderRadius: '10px', ...bodyFont }
      }} />
  </Box>
);

function LessonBuilder() {
  const { lesson_id, course_id } = useParams();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [addingSection, setAddingSection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editData, setEditData] = useState({
    title: '', content: '', video_url: '', website_url: '', ai_context: '', starter_prompt: ''
  });

  const [newSection, setNewSection] = useState({
    title: '', content: '', video_url: '', website_url: '',
    type: '', ai_context: '', starter_prompt: ''
  });

  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  const mainPadding = isMobile ? '24px 20px' : isTablet ? '36px 32px' : '50px 48px';

  useEffect(() => {
    fetchSections();
    fetchLesson();
  }, [lesson_id]);

  const fetchLesson = async () => {
    try {
      const res = await axios.get(`https://eduplatform-api-pol1.onrender.com/api/lessons/${course_id}`);
      const found = res.data.find(l => l.id === parseInt(lesson_id));
      setLesson(found);
    } catch (err) { console.log(err); }
  };

  const fetchSections = async () => {
    try {
      const res = await axios.get(`https://eduplatform-api-pol1.onrender.com/api/sections/${lesson_id}`);
      setSections(res.data);
    } catch (err) { console.log(err); }
  };

  const handleAddSection = async () => {
    try {
      await axios.post('https://eduplatform-api-pol1.onrender.com/api/sections', {
        lesson_id: parseInt(lesson_id),
        type: addingSection,
        title: newSection.title,
        content: newSection.content,
        video_url: newSection.video_url,
        website_url: newSection.website_url,
        order_number: sections.length + 1,
        ai_context: newSection.ai_context,
        starter_prompt: newSection.starter_prompt
      });
      setMessageType('success');
      setMessage('Section added successfully! 🎉');
      setNewSection({ title: '', content: '', video_url: '', website_url: '', type: '', ai_context: '', starter_prompt: '' });
      setAddingSection(null);
      fetchSections();
    } catch (err) {
      setMessageType('error');
      setMessage('Failed to add section. Try again.');
    }
  };

  const handleDeleteSection = async (id) => {
    try {
      await axios.delete(`https://eduplatform-api-pol1.onrender.com/api/sections/${id}`);
      fetchSections();
    } catch (err) { console.log(err); }
  };

  const handleOpenEdit = (section) => {
    setEditingSection(section);
    setEditData({
      title: section.title || '',
      content: section.content || '',
      video_url: section.video_url || '',
      website_url: section.website_url || '',
      ai_context: section.ai_context || '',
      starter_prompt: section.starter_prompt || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`https://eduplatform-api-pol1.onrender.com/api/sections/${editingSection.id}`, {
        title: editData.title,
        content: editData.content,
        video_url: editData.video_url,
        website_url: editData.website_url,
        ai_context: editData.ai_context,
        starter_prompt: editData.starter_prompt
      });
      setMessageType('success');
      setMessage('Section updated successfully! ✅');
      setEditDialogOpen(false);
      setEditingSection(null);
      fetchSections();
    } catch (err) {
      setMessageType('error');
      setMessage('Failed to update section. Try again.');
    }
  };

  const getSectionColor = (type) => sectionTypes.find(s => s.type === type)?.color || '#666';
  const getSectionLabel = (type) => sectionTypes.find(s => s.type === type)?.label || type;

  const sidebar = (
    <Box style={{
      width: isMobile ? '100%' : '280px',
      backgroundColor: '#1a237e', color: 'white',
      padding: '28px 20px', display: 'flex', flexDirection: 'column', flexShrink: 0
    }}>
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/teacher')}
          style={{ color: 'white', textTransform: 'none', fontWeight: '700', padding: 0, ...bodyFont }}>
          Back
        </Button>
        {isMobile && (
          <IconButton onClick={() => setSidebarOpen(false)} style={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Box style={{
        display: 'inline-flex', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: '30px', padding: '4px 14px', marginBottom: '12px', alignSelf: 'flex-start'
      }}>
        <Typography variant="body2" style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '11px', ...bodyFont }}>
          LESSON BUILDER
        </Typography>
      </Box>

      <Typography style={{ fontWeight: '800', fontSize: '16px', marginBottom: '4px', lineHeight: '1.3', ...fontStyle }}>
        {lesson?.title || 'Lesson Builder'}
      </Typography>
      <Typography variant="body2" style={{ opacity: 0.6, marginBottom: '20px', ...bodyFont }}>
        {sections.length} section{sections.length !== 1 ? 's' : ''}
      </Typography>

      <Divider style={{ backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: '16px' }} />

      {sections.map((section) => (
        <Box key={section.id} style={{
          padding: '10px 12px', borderRadius: '10px', marginBottom: '8px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderLeft: `4px solid ${getSectionColor(section.type)}`
        }}>
          <Typography variant="body2" style={{ fontWeight: '700', fontSize: '12px', ...fontStyle }}>
            {getSectionLabel(section.type)}
          </Typography>
          <Typography variant="caption" style={{ opacity: 0.7, ...bodyFont }}>
            {section.title}
          </Typography>
        </Box>
      ))}

      <Divider style={{ backgroundColor: 'rgba(255,255,255,0.15)', margin: '16px 0' }} />

      <Typography variant="body2" style={{ marginBottom: '10px', opacity: 0.7, fontWeight: '600', ...bodyFont }}>
        Add Section:
      </Typography>
      {sectionTypes.map(section => (
        <Button key={section.type} fullWidth variant="outlined"
          onClick={() => {
            setAddingSection(section.type);
            setNewSection({ title: section.label, content: '', video_url: '', website_url: '', type: '', ai_context: '', starter_prompt: '' });
            if (isMobile) setSidebarOpen(false);
          }}
          style={{
            marginBottom: '8px', color: 'white',
            borderColor: addingSection === section.type ? section.color : 'rgba(255,255,255,0.2)',
            backgroundColor: addingSection === section.type ? section.color : 'transparent',
            justifyContent: 'flex-start', borderRadius: '10px',
            textTransform: 'none', fontWeight: '600', ...bodyFont
          }}>
          {section.label}
        </Button>
      ))}
    </Box>
  );

  return (
    <Box style={{ display: 'flex', minHeight: '100vh', background: '#fafafa', position: 'relative' }}>

      {isMobile ? (
        sidebarOpen && (
          <Box style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200, display: 'flex' }}>
            <Box style={{ width: '100%', maxWidth: '320px' }}>{sidebar}</Box>
            <Box onClick={() => setSidebarOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
          </Box>
        )
      ) : sidebar}

      <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {isMobile && (
          <Box style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IconButton onClick={() => setSidebarOpen(true)} style={{ backgroundColor: '#e8eaf6', color: '#1a237e' }} size="small">
              <MenuIcon />
            </IconButton>
            <Typography style={{ fontWeight: '800', fontSize: '16px', ...fontStyle }}>
              {lesson?.title || 'Lesson Builder'}
            </Typography>
          </Box>
        )}

        {!isMobile && (
          <Box style={{ background: 'white', padding: isTablet ? '40px 32px' : '50px 48px', borderBottom: '1px solid #f0f0f0', position: 'relative', overflow: 'hidden' }}>
            <Box style={{ position: 'absolute', top: '-70px', right: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'linear-gradient(135deg, #e8eaf6, #e3f2fd)', opacity: 0.7 }} />
            <Box style={{ position: 'absolute', bottom: '-80px', right: '200px', width: '180px', height: '180px', borderRadius: '50%', background: '#fff3e0', opacity: 0.6 }} />
            <Box style={{ position: 'relative', maxWidth: '680px' }}>
              <Box style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#fff3e0', border: '1px solid #ff6f00', borderRadius: '30px', padding: '6px 16px', marginBottom: '16px' }}>
                <Typography variant="body2" style={{ color: '#ff6f00', fontWeight: '700', ...bodyFont }}>LESSON BUILDER</Typography>
              </Box>
              <Typography style={{ fontWeight: '800', color: '#0a0a0a', fontSize: isTablet ? '30px' : '38px', lineHeight: '1.15', marginBottom: '8px', ...fontStyle }}>
                Building:{' '}
                <span style={{ background: 'linear-gradient(135deg, #1a237e, #0288d1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {lesson?.title || '...'}
                </span>
              </Typography>
              <Typography variant="body1" style={{ color: '#666', fontWeight: '400', ...bodyFont }}>
                Add sections from the sidebar to build your lesson content.
              </Typography>
            </Box>
          </Box>
        )}

        <Box style={{ padding: mainPadding, flex: 1 }}>
          {message && (
            <Alert severity={messageType} style={{ marginBottom: '24px', borderRadius: '10px' }} onClose={() => setMessage('')}>
              {message}
            </Alert>
          )}

          {/* Add Section Form */}
          {addingSection && (
            <Card elevation={0} style={{ borderRadius: '20px', marginBottom: '28px', border: `2px solid ${getSectionColor(addingSection)}`, boxShadow: `0 4px 20px ${getSectionColor(addingSection)}22` }}>
              <CardContent style={{ padding: isMobile ? '20px' : '32px' }}>
                <Typography style={{ fontWeight: '800', fontSize: '20px', marginBottom: '20px', color: getSectionColor(addingSection), ...fontStyle }}>
                  Adding: {getSectionLabel(addingSection)}
                </Typography>
                <Divider style={{ marginBottom: '20px' }} />
                <TextField fullWidth label="Section Title" value={newSection.title}
                  onChange={e => setNewSection({ ...newSection, title: e.target.value })}
                  margin="normal" variant="outlined"
                  InputProps={{ style: { borderRadius: '10px', ...bodyFont } }} />
                {addingSection === 'dive_deeper'
                  ? <DiveDeeperFields data={newSection} setData={setNewSection} isMobile={isMobile} />
                  : <RegularFields data={newSection} setData={setNewSection} />
                }
                <Box style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                  <Button variant="contained" onClick={handleAddSection}
                    style={{ backgroundColor: getSectionColor(addingSection), padding: '10px 28px', borderRadius: '10px', fontWeight: '700', textTransform: 'none', boxShadow: 'none', ...bodyFont }}>
                    Save Section
                  </Button>
                  <Button variant="outlined" onClick={() => setAddingSection(null)}
                    style={{ padding: '10px 28px', borderRadius: '10px', textTransform: 'none', fontWeight: '600', ...bodyFont }}>
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Sections list */}
          {sections.length === 0 ? (
            <Card elevation={0} style={{ borderRadius: '20px', textAlign: 'center', padding: isMobile ? '40px 20px' : '60px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <Typography variant="h5" style={{ color: '#999', marginBottom: '10px', fontWeight: '700', ...fontStyle }}>No sections yet!</Typography>
              <Typography style={{ color: '#bbb', ...bodyFont }}>
                {isMobile ? 'Tap the menu icon above to add a section.' : 'Click a section type on the left to start building your lesson.'}
              </Typography>
            </Card>
          ) : (
            sections.map((section) => (
              <Card key={section.id} elevation={0} style={{ borderRadius: '18px', marginBottom: '16px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `5px solid ${getSectionColor(section.type)}` }}>
                <CardContent style={{ padding: isMobile ? '18px' : '24px 28px' }}>
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <Box>
                      <Chip label={getSectionLabel(section.type)} size="small"
                        style={{ backgroundColor: getSectionColor(section.type), color: 'white', fontWeight: '700', marginBottom: '8px', ...bodyFont }} />
                      <Typography style={{ fontWeight: '800', fontSize: '16px', color: '#0a0a0a', ...fontStyle }}>
                        {section.title}
                      </Typography>
                    </Box>
                    <Box style={{ display: 'flex', gap: '8px' }}>
                      <IconButton size="small" onClick={() => handleOpenEdit(section)}
                        style={{ backgroundColor: '#e3f2fd', color: '#1a237e' }} aria-label="Edit section">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteSection(section.id)}
                        style={{ backgroundColor: '#ffebee', color: '#f44336' }} aria-label="Delete section">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  {section.content && <Typography variant="body2" style={{ color: '#999', marginBottom: '6px', ...bodyFont }}>📝 Has written content</Typography>}
                  {section.video_url && <Typography variant="body2" style={{ color: '#ff0000', marginBottom: '4px', ...bodyFont }}>🎥 Video: {section.video_url}</Typography>}
                  {section.website_url && <Typography variant="body2" style={{ color: '#0288d1', marginBottom: '4px', ...bodyFont }}>🌐 Doc: {section.website_url}</Typography>}
                  {section.type === 'dive_deeper' && section.ai_context && (
                    <Typography variant="body2" style={{ color: '#9c27b0', ...bodyFont }}>🤖 AI context configured</Typography>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </Box>

      {/* ── Edit Section Dialog ── */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ style: { borderRadius: '16px' } }}>
        <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', padding: '20px 24px' }}>
          <Box>
            <Typography style={{ fontWeight: '800', fontSize: '20px', color: '#0a0a0a', ...fontStyle }}>
              Edit Section
            </Typography>
            {editingSection && (
              <Chip label={getSectionLabel(editingSection.type)} size="small"
                style={{ backgroundColor: getSectionColor(editingSection?.type), color: 'white', fontWeight: '700', marginTop: '6px', ...bodyFont }} />
            )}
          </Box>
          <IconButton onClick={() => setEditDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ padding: '24px' }}>
          <TextField fullWidth label="Section Title" value={editData.title}
            onChange={e => setEditData({ ...editData, title: e.target.value })}
            margin="normal" variant="outlined"
            InputProps={{ style: { borderRadius: '10px', ...bodyFont } }} />
          {editingSection?.type === 'dive_deeper'
            ? <DiveDeeperFields data={editData} setData={setEditData} isMobile={isMobile} />
            : <RegularFields data={editData} setData={setEditData} />
          }
        </DialogContent>

        <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', gap: '10px' }}>
          <Button onClick={() => setEditDialogOpen(false)}
            style={{ color: '#666', textTransform: 'none', ...bodyFont }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveEdit}
            style={{ backgroundColor: getSectionColor(editingSection?.type), borderRadius: '10px', textTransform: 'none', fontWeight: '700', boxShadow: 'none', padding: '10px 28px', ...bodyFont }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LessonBuilder;