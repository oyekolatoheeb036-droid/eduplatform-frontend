import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Chip, IconButton, CircularProgress, useMediaQuery,
  Avatar, Divider, Tab, Tabs
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../AuthContext';
import { formatDistanceToNow } from 'date-fns';

const API = 'https://eduplatform-api-pol1.onrender.com';

const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

const courseColors = [
  'linear-gradient(135deg, #1a237e, #283593)',
  'linear-gradient(135deg, #006064, #00838f)',
  'linear-gradient(135deg, #4a148c, #6a1b9a)',
  'linear-gradient(135deg, #b71c1c, #c62828)',
  'linear-gradient(135deg, #1b5e20, #2e7d32)',
  'linear-gradient(135deg, #e65100, #ef6c00)',
];

function getInitials(name) {
  if (!name) return 'S';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(date) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
}

const ReplyBox = ({ postId, studentId, studentName, onReplyAdded }) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/community/${postId}/replies`, {
        student_id: studentId, student_name: studentName, content: text.trim()
      });
      setText('');
      onReplyAdded();
    } catch (err) { console.log(err); }
    finally { setSubmitting(false); }
  };

  return (
    <Box style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginTop: '12px' }}>
      <Avatar style={{ width: '30px', height: '30px', fontSize: '12px', fontWeight: '800', background: 'linear-gradient(135deg, #1a237e, #0288d1)', flexShrink: 0 }}>
        {getInitials(studentName)}
      </Avatar>
      <TextField fullWidth multiline maxRows={3} placeholder="Write a reply..."
        value={text} onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
        variant="outlined" size="small"
        InputProps={{ style: { borderRadius: '12px', fontSize: '13px', ...bodyFont } }}
      />
      <IconButton onClick={handleSubmit} disabled={!text.trim() || submitting}
        style={{ backgroundColor: text.trim() && !submitting ? '#1a237e' : '#e0e0e0', color: 'white', width: '36px', height: '36px', flexShrink: 0 }}>
        {submitting ? <CircularProgress size={14} style={{ color: 'white' }} /> : <SendIcon style={{ fontSize: '16px' }} />}
      </IconButton>
    </Box>
  );
};

const PostCard = ({ post, studentId, studentName, userRole, likedPosts, onLike, onDelete, isMobile }) => {
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const isLiked = likedPosts.includes(post.id);
  const isOwner = post.student_id === studentId;

  const fetchReplies = async () => {
    setLoadingReplies(true);
    try {
      const res = await axios.get(`${API}/api/community/${post.id}/replies`);
      setReplies(res.data);
    } catch (err) { console.log(err); }
    finally { setLoadingReplies(false); }
  };

  const handleToggleReplies = () => {
    if (!showReplies) fetchReplies();
    setShowReplies(!showReplies);
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await axios.delete(`${API}/api/community/replies/${replyId}`);
      setReplies(prev => prev.filter(r => r.id !== replyId));
    } catch (err) { console.log(err); }
  };

  const colorIndex = (post.student_id || 0) % courseColors.length;

  return (
    <Card elevation={0} style={{ borderRadius: '20px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '16px', overflow: 'visible' }}>
      <CardContent style={{ padding: isMobile ? '18px' : '24px 28px' }}>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <Box style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Avatar style={{ width: '42px', height: '42px', fontSize: '15px', fontWeight: '800', background: courseColors[colorIndex], flexShrink: 0 }}>
              {getInitials(post.student_name)}
            </Avatar>
            <Box>
              <Typography style={{ fontWeight: '700', fontSize: '14px', color: '#0a0a0a', ...fontStyle }}>
                {post.student_name}
              </Typography>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <Typography variant="caption" style={{ color: '#999', ...bodyFont }}>
                  {timeAgo(post.created_at)}
                </Typography>
                {post.course_name && (
                  <Chip label={`📚 ${post.course_name}`} size="small"
                    style={{ fontSize: '10px', height: '18px', backgroundColor: '#e8eaf6', color: '#1a237e', fontWeight: '700' }} />
                )}
              </Box>
            </Box>
          </Box>
          {(isOwner || userRole === 'admin' || userRole === 'teacher') && (
            <IconButton size="small" onClick={() => onDelete(post.id)} style={{ color: '#f44336' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Typography style={{ fontSize: '15px', lineHeight: '1.7', color: '#333', marginBottom: '16px', ...bodyFont }}>
          {post.content}
        </Typography>

        <Box style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Button size="small" startIcon={isLiked ? <FavoriteIcon style={{ color: '#f44336' }} /> : <FavoriteBorderIcon />}
            onClick={() => onLike(post.id)}
            style={{ textTransform: 'none', color: isLiked ? '#f44336' : '#666', fontWeight: '600', padding: '4px 10px', borderRadius: '8px', backgroundColor: isLiked ? '#fff0f0' : 'transparent', ...bodyFont }}>
            {post.like_count || 0}
          </Button>
          <Button size="small" startIcon={<ChatBubbleOutlineIcon />}
            onClick={handleToggleReplies}
            style={{ textTransform: 'none', color: showReplies ? '#1a237e' : '#666', fontWeight: '600', padding: '4px 10px', borderRadius: '8px', backgroundColor: showReplies ? '#e8eaf6' : 'transparent', ...bodyFont }}>
            {post.reply_count || 0} {Number(post.reply_count) === 1 ? 'Reply' : 'Replies'}
          </Button>
        </Box>

        {showReplies && (
          <Box style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f5f5f5' }}>
            {loadingReplies ? (
              <Box style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <CircularProgress size={24} style={{ color: '#1a237e' }} />
              </Box>
            ) : (
              <>
                {replies.map(reply => (
                  <Box key={reply.id} style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                    <Avatar style={{ width: '30px', height: '30px', fontSize: '11px', fontWeight: '800', background: courseColors[reply.student_id % courseColors.length], flexShrink: 0 }}>
                      {getInitials(reply.student_name)}
                    </Avatar>
                    <Box style={{ flex: 1, backgroundColor: '#f8f9ff', borderRadius: '12px', padding: '10px 14px' }}>
                      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <Typography style={{ fontWeight: '700', fontSize: '13px', color: '#1a237e', ...fontStyle }}>
                          {reply.student_name}
                        </Typography>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Typography variant="caption" style={{ color: '#bbb', ...bodyFont }}>{timeAgo(reply.created_at)}</Typography>
                          {(reply.student_id === studentId || userRole === 'admin' || userRole === 'teacher') && (
                            <IconButton size="small" onClick={() => handleDeleteReply(reply.id)} style={{ color: '#f44336', padding: '2px' }}>
                              <DeleteIcon style={{ fontSize: '14px' }} />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                      <Typography variant="body2" style={{ color: '#333', lineHeight: '1.6', ...bodyFont }}>
                        {reply.content}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                <ReplyBox postId={post.id} studentId={studentId} studentName={studentName}
                  onReplyAdded={fetchReplies} />
              </>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

function Community() {
  const { user } = useAuth();
  const studentId = user?.id;
  const studentName = user?.name || user?.email || 'Student';
  const userRole = user?.role;

  const [posts, setPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    fetchPosts();
    fetchCourses();
    if (studentId) {
      fetchLikes();
      fetchEnrolledCourses();
    }
  }, [studentId]);

  useEffect(() => {
    fetchPosts();
  }, [activeTab, selectedCourse]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = `${API}/api/community`;
      if (activeTab !== 0 && selectedCourse) {
        url = `${API}/api/community/course/${selectedCourse.id}`;
      }
      const res = await axios.get(url);
      setPosts(res.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API}/api/courses`);
      setCourses(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const res = await axios.get(`${API}/api/enrollments/${studentId}`);
      setEnrolledCourses(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchLikes = async () => {
    try {
      const res = await axios.get(`${API}/api/community/likes/${studentId}`);
      setLikedPosts(res.data);
    } catch (err) { console.log(err); }
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setPosting(true);
    try {
      await axios.post(`${API}/api/community`, {
        student_id: studentId,
        student_name: studentName,
        course_id: selectedCourse?.id || null,
        course_name: selectedCourse?.title || null,
        content: newPost.trim()
      });
      setNewPost('');
      fetchPosts();
    } catch (err) { console.log(err); }
    finally { setPosting(false); }
  };

  const handleLike = async (postId) => {
    if (!user) return;
    try {
      const res = await axios.post(`${API}/api/community/${postId}/like`, { student_id: studentId });
      if (res.data.liked) {
        setLikedPosts(prev => [...prev, postId]);
      } else {
        setLikedPosts(prev => prev.filter(id => id !== postId));
      }
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p, like_count: res.data.liked ? Number(p.like_count) + 1 : Number(p.like_count) - 1
      } : p));
    } catch (err) { console.log(err); }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${API}/api/community/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) { console.log(err); }
  };

  const handleTabChange = (e, val) => {
    setActiveTab(val);
    if (val === 0) setSelectedCourse(null);
  };

  return (
    <Box style={{ background: '#fafafa', minHeight: '100vh', ...bodyFont }}>

      <Box style={{ background: 'white', padding: isMobile ? '40px 20px' : '60px 80px', borderBottom: '1px solid #f0f0f0', position: 'relative', overflow: 'hidden' }}>
        <Box style={{ position: 'absolute', top: '-60px', right: '-60px', width: '320px', height: '320px', borderRadius: '50%', background: 'linear-gradient(135deg, #e8eaf6, #e3f2fd)', opacity: 0.7 }} />
        <Box style={{ position: 'absolute', bottom: '-80px', right: '250px', width: '200px', height: '200px', borderRadius: '50%', background: '#fff3e0', opacity: 0.6 }} />
        <Box style={{ position: 'relative', maxWidth: '700px' }}>
          <Box style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#e8eaf6', border: '1px solid #1a237e', borderRadius: '30px', padding: '6px 16px', marginBottom: '20px' }}>
            <PeopleIcon style={{ fontSize: '16px', color: '#1a237e' }} />
            <Typography variant="body2" style={{ color: '#1a237e', fontWeight: '700' }}>STUDENT COMMUNITY</Typography>
          </Box>
          <Typography style={{ fontWeight: '800', color: '#0a0a0a', fontSize: isMobile ? '32px' : '42px', lineHeight: '1.15', marginBottom: '12px', ...fontStyle }}>
            Learn Together,{' '}
            <span style={{ background: 'linear-gradient(135deg, #1a237e, #0288d1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Grow Together
            </span>
          </Typography>
          <Typography style={{ color: '#666', fontSize: '16px', lineHeight: '1.7', maxWidth: '540px', ...bodyFont }}>
            Share what you've learned, ask questions, and help your fellow students. This is your space to grow together.
          </Typography>
          <Box style={{ display: 'flex', gap: '24px', marginTop: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'Posts', value: posts.length },
              { label: 'Courses', value: courses.length },
              { label: 'Active Rooms', value: courses.length },
            ].map(stat => (
              <Box key={stat.label} style={{ textAlign: 'center' }}>
                <Typography style={{ fontWeight: '800', fontSize: '24px', color: '#1a237e', ...fontStyle }}>{stat.value}</Typography>
                <Typography variant="caption" style={{ color: '#999', fontWeight: '600', ...bodyFont }}>{stat.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box style={{ padding: isMobile ? '20px 16px' : '40px 80px', maxWidth: '1400px', margin: '0 auto' }}>
        <Box style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>

          {!isMobile && (
            <Box style={{ width: '260px', flexShrink: 0, position: 'sticky', top: '84px' }}>
              <Card elevation={0} style={{ borderRadius: '20px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <Box style={{ background: 'linear-gradient(135deg, #1a237e, #283593)', padding: '20px 20px 16px' }}>
                  <Typography style={{ fontWeight: '800', color: 'white', fontSize: '15px', ...fontStyle }}>📚 Course Rooms</Typography>
                  <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.7)', ...bodyFont }}>Discuss by subject</Typography>
                </Box>
                <Box style={{ padding: '12px' }}>
                  <Box onClick={() => { setSelectedCourse(null); setActiveTab(0); }}
                    style={{ padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', backgroundColor: activeTab === 0 ? '#e8eaf6' : 'transparent', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }}>
                    <Box style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #1a237e, #0288d1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography style={{ color: 'white', fontSize: '14px' }}>🌍</Typography>
                    </Box>
                    <Box>
                      <Typography style={{ fontWeight: '700', fontSize: '13px', color: activeTab === 0 ? '#1a237e' : '#333', ...fontStyle }}>General Feed</Typography>
                      <Typography variant="caption" style={{ color: '#999', ...bodyFont }}>All posts</Typography>
                    </Box>
                  </Box>
                  <Divider style={{ margin: '8px 0' }} />
                  {courses.map((course, i) => (
                    <Box key={course.id}
                      onClick={() => { setSelectedCourse(course); setActiveTab(1); }}
                      style={{ padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', backgroundColor: selectedCourse?.id === course.id ? '#e8eaf6' : 'transparent', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }}>
                      <Box style={{ width: '32px', height: '32px', borderRadius: '8px', background: courseColors[i % courseColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Typography style={{ color: 'white', fontSize: '12px', fontWeight: '800' }}>{course.title?.charAt(0)}</Typography>
                      </Box>
                      <Box style={{ minWidth: 0 }}>
                        <Typography style={{ fontWeight: '700', fontSize: '12px', color: selectedCourse?.id === course.id ? '#1a237e' : '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...fontStyle }}>
                          {course.title}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Box>
          )}

          <Box style={{ flex: 1, minWidth: 0 }}>
            {isMobile && (
              <Tabs value={activeTab} onChange={handleTabChange} style={{ marginBottom: '16px' }}
                sx={{ '& .MuiTabs-indicator': { backgroundColor: '#1a237e' }, '& .MuiTab-root': { textTransform: 'none', fontWeight: '700', fontFamily: "'Inter', sans-serif" }, '& .Mui-selected': { color: '#1a237e !important' } }}>
                <Tab label="🌍 General" />
                <Tab label="📚 Courses" />
              </Tabs>
            )}

            {isMobile && activeTab === 1 && (
              <Box style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
                {courses.map((course, i) => (
                  <Chip key={course.id} label={course.title}
                    onClick={() => setSelectedCourse(course)}
                    style={{ flexShrink: 0, backgroundColor: selectedCourse?.id === course.id ? '#1a237e' : '#f0f0f0', color: selectedCourse?.id === course.id ? 'white' : '#333', fontWeight: '700', cursor: 'pointer' }} />
                ))}
              </Box>
            )}

            {(selectedCourse || activeTab === 0) && (
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <Box>
                  <Typography style={{ fontWeight: '800', fontSize: '20px', color: '#0a0a0a', ...fontStyle }}>
                    {selectedCourse ? `📚 ${selectedCourse.title}` : '🌍 General Feed'}
                  </Typography>
                  <Typography variant="caption" style={{ color: '#999', ...bodyFont }}>
                    {posts.length} post{posts.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
                {selectedCourse && (
                  <Button size="small" startIcon={<CloseIcon />}
                    onClick={() => { setSelectedCourse(null); setActiveTab(0); }}
                    style={{ textTransform: 'none', color: '#666', ...bodyFont }}>
                    Clear filter
                  </Button>
                )}
              </Box>
            )}

            {user ? (
              <Card elevation={0} style={{ borderRadius: '20px', border: '2px solid #e8eaf6', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                <CardContent style={{ padding: isMobile ? '18px' : '24px' }}>
                  <Box style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Avatar style={{ width: '42px', height: '42px', fontSize: '15px', fontWeight: '800', background: 'linear-gradient(135deg, #1a237e, #0288d1)', flexShrink: 0 }}>
                      {getInitials(studentName)}
                    </Avatar>
                    <Box style={{ flex: 1 }}>
                      <TextField fullWidth multiline rows={3}
                        placeholder={selectedCourse ? `Share something about ${selectedCourse.title}...` : "Share what you've learned, ask a question, or help a fellow student..."}
                        value={newPost} onChange={e => setNewPost(e.target.value)}
                        variant="outlined"
                        InputProps={{ style: { borderRadius: '14px', fontSize: '14px', ...bodyFont } }}
                      />
                      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
                        <Box style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {selectedCourse ? (
                            <Chip label={`📚 ${selectedCourse.title}`} size="small"
                              onDelete={() => setSelectedCourse(null)}
                              style={{ backgroundColor: '#e8eaf6', color: '#1a237e', fontWeight: '700' }} />
                          ) : (
                            <Typography variant="caption" style={{ color: '#bbb', alignSelf: 'center', ...bodyFont }}>
                              Posting to General Feed
                            </Typography>
                          )}
                        </Box>
                        <Button variant="contained" onClick={handlePost}
                          disabled={!newPost.trim() || posting}
                          endIcon={posting ? <CircularProgress size={16} style={{ color: 'white' }} /> : <SendIcon />}
                          style={{ backgroundColor: newPost.trim() ? '#1a237e' : '#e0e0e0', borderRadius: '10px', textTransform: 'none', fontWeight: '700', padding: '8px 20px', boxShadow: 'none', ...bodyFont }}>
                          Post
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Card elevation={0} style={{ borderRadius: '20px', border: '1px solid #f0f0f0', marginBottom: '24px', textAlign: 'center', padding: '24px' }}>
                <Typography style={{ color: '#666', fontWeight: '600', marginBottom: '12px', ...bodyFont }}>
                  Login to join the conversation 👋
                </Typography>
                <Button variant="contained" href="/login"
                  style={{ backgroundColor: '#1a237e', borderRadius: '10px', textTransform: 'none', fontWeight: '700', boxShadow: 'none', ...bodyFont }}>
                  Login to Post
                </Button>
              </Card>
            )}

            {loading ? (
              <Box style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <CircularProgress style={{ color: '#1a237e' }} />
              </Box>
            ) : posts.length === 0 ? (
              <Card elevation={0} style={{ borderRadius: '20px', border: '1px solid #f0f0f0', textAlign: 'center', padding: '60px 20px' }}>
                <Typography style={{ fontSize: '48px', marginBottom: '16px' }}>💬</Typography>
                <Typography style={{ fontWeight: '800', color: '#333', fontSize: '20px', marginBottom: '8px', ...fontStyle }}>
                  No posts yet!
                </Typography>
                <Typography style={{ color: '#999', ...bodyFont }}>
                  Be the first to share something in {selectedCourse ? selectedCourse.title : 'the community'}.
                </Typography>
              </Card>
            ) : (
              posts.map(post => (
                <PostCard key={post.id} post={post} studentId={studentId}
                  studentName={studentName} userRole={userRole}
                  likedPosts={likedPosts} onLike={handleLike}
                  onDelete={handleDelete} isMobile={isMobile} />
              ))
            )}
          </Box>

          {!isMobile && enrolledCourses.length > 0 && (
            <Box style={{ width: '220px', flexShrink: 0, position: 'sticky', top: '84px' }}>
              <Card elevation={0} style={{ borderRadius: '20px', border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <Box style={{ background: 'linear-gradient(135deg, #ff6f00, #ef6c00)', padding: '16px 20px' }}>
                  <Typography style={{ fontWeight: '800', color: 'white', fontSize: '14px', ...fontStyle }}>🎓 My Courses</Typography>
                  <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.8)', ...bodyFont }}>Post to your rooms</Typography>
                </Box>
                <Box style={{ padding: '10px' }}>
                  {enrolledCourses.map((course, i) => (
                    <Box key={course.id} onClick={() => { setSelectedCourse(course); setActiveTab(1); }}
                      style={{ padding: '8px 10px', borderRadius: '10px', cursor: 'pointer', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s', backgroundColor: selectedCourse?.id === course.id ? '#fff3e0' : 'transparent' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff8f0'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = selectedCourse?.id === course.id ? '#fff3e0' : 'transparent'}>
                      <Box style={{ width: '28px', height: '28px', borderRadius: '6px', background: courseColors[i % courseColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Typography style={{ color: 'white', fontSize: '11px', fontWeight: '800' }}>{course.title?.charAt(0)}</Typography>
                      </Box>
                      <Typography style={{ fontWeight: '600', fontSize: '12px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...fontStyle }}>
                        {course.title}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Community;