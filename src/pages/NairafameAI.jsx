import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Button, IconButton, TextField,
  useMediaQuery, CircularProgress, Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const API_BASE = 'https://eduplatform-api-pol1.onrender.com';

const SUGGESTED_QUESTIONS = [
  'Explain Pythagoras theorem with examples',
  'How do I solve quadratic equations?',
  'What is the difference between speed and velocity?',
  'Explain photosynthesis simply',
  'How do I find the area of a circle?',
  'What is Newton\'s second law of motion?',
];

const STORAGE_KEY = 'nairafame_ai_chats';

function loadChats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveChats(chats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

function createNewChat() {
  return {
    id: Date.now(),
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString()
  };
}

export default function NairafameAI({ user }) {
  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
  const bodyFont = { fontFamily: "'Inter', sans-serif" };
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:900px)');

  const [chats, setChats] = useState(() => loadChats());
  const [activeChatId, setActiveChatId] = useState(() => {
    const saved = loadChats();
    return saved.length > 0 ? saved[0].id : null;
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const messagesEndRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  const handleNewChat = () => {
    const chat = createNewChat();
    setChats(prev => [chat, ...prev]);
    setActiveChatId(chat.id);
    if (isMobile) setSidebarOpen(false);
  };

  const handleDeleteChat = (id, e) => {
    e.stopPropagation();
    const updated = chats.filter(c => c.id !== id);
    setChats(updated);
    if (activeChatId === id) {
      setActiveChatId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleSend = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    let chatId = activeChatId;
    let currentChats = chats;

    // Create new chat if none active
    if (!chatId) {
      const chat = createNewChat();
      currentChats = [chat, ...chats];
      setChats(currentChats);
      setActiveChatId(chat.id);
      chatId = chat.id;
    }

    const userMessage = { role: 'user', content: messageText };
    setInput('');
    setLoading(true);

    // Add user message
    const updatedChats = currentChats.map(c =>
      c.id === chatId
        ? {
            ...c,
            title: c.messages.length === 0 ? messageText.slice(0, 40) : c.title,
            messages: [...c.messages, userMessage]
          }
        : c
    );
    setChats(updatedChats);

    try {
      const chat = updatedChats.find(c => c.id === chatId);
      const res = await axios.post(`${API_BASE}/api/ai/chat`, {
        messages: chat.messages,
        ai_context: `You are Nairafame AI, a friendly and expert tutor for Nigerian secondary school and university students. 
You specialize in Mathematics and Science subjects including:
- Mathematics: Algebra, Calculus, Statistics, Geometry, Trigonometry, Number Theory
- Physics: Mechanics, Electricity, Waves, Optics, Modern Physics
- Chemistry: Organic, Inorganic, Physical Chemistry, Stoichiometry
- Biology: Cell Biology, Genetics, Ecology, Human Biology

RULES:
- Focus only on Mathematics and Science topics
- Use simple language suitable for Nigerian students
- Use relatable Nigerian examples where possible  
- Help students understand WAEC and JAMB topics
- Be encouraging, patient and supportive
- Show step-by-step workings for math problems
- If asked about other topics, politely redirect to Math or Science
- Never do homework directly — guide students to understand`
      });

      const assistantMessage = { role: 'assistant', content: res.data.reply };
      setChats(prev => prev.map(c =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, assistantMessage] }
          : c
      ));
    } catch (err) {
      setChats(prev => prev.map(c =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, { role: 'assistant', content: "I'm sorry, I couldn't generate a response. Please try again." }] }
          : c
      ));
    }
    setLoading(false);
  };

  // If not logged in
  if (!user) {
    return (
      <Box style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#fafafa', padding: '20px'
      }}>
        <Box style={{ textAlign: 'center', maxWidth: '400px' }}>
          <SmartToyIcon style={{ fontSize: '64px', color: '#1a237e', marginBottom: '16px' }} />
          <Typography variant="h4" style={{ fontWeight: '800', color: '#0a0a0a', marginBottom: '12px', ...fontStyle }}>
            Nairafame AI Tutor
          </Typography>
          <Typography style={{ color: '#666', marginBottom: '28px', ...bodyFont }}>
            Please log in to access your personal AI Maths & Science tutor.
          </Typography>
          <Button variant="contained" href="/login"
            style={{ backgroundColor: '#1a237e', borderRadius: '10px', padding: '12px 32px', fontWeight: '700', ...bodyFont }}>
            Login to Continue
          </Button>
        </Box>
      </Box>
    );
  }

  const sidebar = (
    <Box style={{
      width: isMobile ? '100%' : '260px',
      background: '#0f1535',
      display: 'flex', flexDirection: 'column',
      height: '100%', flexShrink: 0,
      padding: '20px 14px'
    }}>
      {/* Logo */}
      <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '0 6px' }}>
        <SmartToyIcon style={{ color: '#7c8cf8', fontSize: '28px' }} />
        <Box>
          <Typography style={{ fontWeight: '800', color: 'white', fontSize: '15px', lineHeight: 1.2, ...fontStyle }}>
            Nairafame AI
          </Typography>
          <Typography style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', ...bodyFont }}>
            Maths & Science Tutor
          </Typography>
        </Box>
      </Box>

      {/* New Chat Button */}
      <Button
        onClick={handleNewChat}
        startIcon={<AddIcon />}
        fullWidth
        style={{
          background: 'rgba(124,140,248,0.15)',
          border: '1px solid rgba(124,140,248,0.3)',
          color: '#7c8cf8', borderRadius: '10px',
          textTransform: 'none', fontWeight: '700',
          padding: '10px', marginBottom: '20px',
          ...bodyFont
        }}>
        New Chat
      </Button>

      {/* Chat History */}
      <Typography style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px', padding: '0 6px', ...bodyFont }}>
        RECENT CHATS
      </Typography>

      <Box style={{ flex: 1, overflowY: 'auto' }}>
        {chats.length === 0 && (
          <Typography style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', padding: '10px 6px', ...bodyFont }}>
            No chats yet. Start a new one!
          </Typography>
        )}
        {chats.map(chat => (
          <Box
            key={chat.id}
            onClick={() => { setActiveChatId(chat.id); if (isMobile) setSidebarOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 10px', borderRadius: '10px', cursor: 'pointer', marginBottom: '4px',
              background: activeChatId === chat.id ? 'rgba(124,140,248,0.2)' : 'transparent',
              border: activeChatId === chat.id ? '1px solid rgba(124,140,248,0.3)' : '1px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            <Typography style={{
              color: activeChatId === chat.id ? 'white' : 'rgba(255,255,255,0.6)',
              fontSize: '13px', fontWeight: activeChatId === chat.id ? '600' : '400',
              flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              ...bodyFont
            }}>
              {chat.title || 'New Chat'}
            </Typography>
            <IconButton size="small" onClick={(e) => handleDeleteChat(chat.id, e)}
              style={{ color: 'rgba(255,255,255,0.3)', padding: '2px', marginLeft: '4px' }}>
<DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>

      {/* User info */}
      <Box style={{
        marginTop: '16px', padding: '10px 12px',
        background: 'rgba(255,255,255,0.06)', borderRadius: '10px',
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <Box style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #1a237e, #0288d1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0
        }}>
          {user?.name?.[0] || user?.email?.[0] || 'S'}
        </Box>
        <Typography style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...bodyFont }}>
          {user?.name || user?.email || 'Student'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#fafafa' }}>

      {/* Sidebar */}
      {isMobile ? (
        sidebarOpen && (
          <Box style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex' }}>
            <Box style={{ width: '280px' }}>{sidebar}</Box>
            <Box onClick={() => setSidebarOpen(false)} style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} />
          </Box>
        )
      ) : sidebar}

      {/* Main Chat Area */}
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top Bar */}
        <Box style={{
          background: 'white', borderBottom: '1px solid #f0f0f0',
          padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px',
          flexShrink: 0
        }}>
          {isMobile && (
            <IconButton onClick={() => setSidebarOpen(true)} size="small"
              style={{ background: '#e8eaf6', color: '#1a237e' }}>
              <SmartToyIcon fontSize="small" />
            </IconButton>
          )}
          <Box style={{ flex: 1 }}>
            <Typography style={{ fontWeight: '800', fontSize: '16px', color: '#0a0a0a', ...fontStyle }}>
              🤖 Nairafame AI Tutor
            </Typography>
            <Typography style={{ fontSize: '12px', color: '#999', ...bodyFont }}>
              Mathematics & Science · Powered by Groq
            </Typography>
          </Box>
          <Chip
            icon={<AutoAwesomeIcon style={{ fontSize: '14px' }} />}
            label="AI Powered"
            size="small"
            style={{ background: '#f3e5f5', color: '#9c27b0', fontWeight: '700', fontSize: '11px', ...bodyFont }}
          />
        </Box>

        {/* Messages Area */}
        <Box style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px 32px' }}>

          {/* Empty State */}
          {(!activeChat || activeChat.messages.length === 0) && (
            <Box style={{ maxWidth: '640px', margin: '0 auto', paddingTop: isMobile ? '20px' : '40px' }}>
              <Box style={{ textAlign: 'center', marginBottom: '40px' }}>
                <Box style={{
                  width: '72px', height: '72px', borderRadius: '20px',
                  background: 'linear-gradient(135deg, #1a237e, #0288d1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(26,35,126,0.25)'
                }}>
                  <SmartToyIcon style={{ fontSize: '36px', color: 'white' }} />
                </Box>
                <Typography variant="h5" style={{ fontWeight: '800', color: '#0a0a0a', marginBottom: '8px', ...fontStyle }}>
                  Hi {user?.name?.split(' ')[0] || 'there'}, I'm your AI Tutor! 👋
                </Typography>
                <Typography style={{ color: '#666', lineHeight: '1.7', ...bodyFont }}>
                  Ask me anything about Mathematics or Science. I'm here to help you understand concepts, solve problems step by step, and prepare for WAEC & JAMB.
                </Typography>
              </Box>

              {/* Suggested Questions */}
              <Typography style={{ fontWeight: '700', color: '#0a0a0a', marginBottom: '12px', fontSize: '14px', ...bodyFont }}>
                Try asking:
              </Typography>
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <Box
                    key={i}
                    onClick={() => handleSend(q)}
                    style={{
                      padding: '10px 16px', borderRadius: '10px',
                      border: '1px solid #e0e0e0', background: 'white',
                      cursor: 'pointer', fontSize: '13px', color: '#333',
                      transition: 'all 0.2s', ...bodyFont
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#1a237e'; e.currentTarget.style.color = '#1a237e'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.color = '#333'; }}
                  >
                    {q}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Messages */}
          {activeChat?.messages.map((msg, index) => (
            <Box key={index} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '16px',
              maxWidth: '800px', margin: '0 auto 16px'
            }}>
              {msg.role === 'assistant' && (
                <Box style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #1a237e, #0288d1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: '10px', marginTop: '4px'
                }}>
                  <SmartToyIcon style={{ fontSize: '16px', color: 'white' }} />
                </Box>
              )}

              <Box style={{
                maxWidth: isMobile ? '85%' : '70%',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #1a237e, #0288d1)'
                  : 'white',
                color: msg.role === 'user' ? 'white' : '#0a0a0a',
                padding: '12px 16px',
                borderRadius: msg.role === 'user'
                  ? '18px 18px 4px 18px'
                  : '18px 18px 18px 4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: msg.role === 'assistant' ? '1px solid #f0f0f0' : 'none',
                fontSize: '14px', lineHeight: '1.7',
                whiteSpace: 'pre-wrap',
                ...bodyFont
              }}>
                {msg.content}
              </Box>

              {msg.role === 'user' && (
                <Box style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: '#e8eaf6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginLeft: '10px', marginTop: '4px'
                }}>
                  <PersonIcon style={{ fontSize: '16px', color: '#1a237e' }} />
                </Box>
              )}
            </Box>
          ))}

          {/* Loading indicator */}
          {loading && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '800px', margin: '0 auto 16px' }}>
              <Box style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a237e, #0288d1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <SmartToyIcon style={{ fontSize: '16px', color: 'white' }} />
              </Box>
              <Box style={{
                background: 'white', border: '1px solid #f0f0f0',
                borderRadius: '18px 18px 18px 4px',
                padding: '12px 16px', display: 'flex', gap: '4px', alignItems: 'center'
              }}>
                {[0, 1, 2].map(i => (
                  <Box key={i} style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: '#1a237e', opacity: 0.4,
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                  }} />
                ))}
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box style={{
          background: 'white', borderTop: '1px solid #f0f0f0',
          padding: isMobile ? '12px 16px' : '16px 32px', flexShrink: 0
        }}>
          <Box style={{
            maxWidth: '800px', margin: '0 auto',
            display: 'flex', gap: '10px', alignItems: 'flex-end'
          }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Ask about Mathematics or Science..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              variant="outlined"
              InputProps={{
                style: {
                  borderRadius: '12px', fontSize: '14px',
                  background: '#fafafa', ...bodyFont
                }
              }}
            />
            <IconButton
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, #1a237e, #0288d1)'
                  : '#e0e0e0',
                color: 'white', borderRadius: '12px',
                width: '48px', height: '48px', flexShrink: 0,
                transition: 'all 0.2s'
              }}>
              {loading ? <CircularProgress size={20} style={{ color: 'white' }} /> : <SendIcon />}
            </IconButton>
          </Box>
          <Typography style={{ textAlign: 'center', color: '#bbb', fontSize: '11px', marginTop: '8px', ...bodyFont }}>
            Nairafame AI can make mistakes. Always verify important answers.
          </Typography>
        </Box>
      </Box>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </Box>
  );
}