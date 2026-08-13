import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const API = 'https://eduplatform-api-pol1.onrender.com';

// The image URL you provided
const BACKGROUND_IMAGE_URL = 'https://z-cdn-media.chatglm.cn/files/cb758230-6e40-4fae-b34c-5b768c0491b8.png?auth_key=1886650295-34fc000333f2456c89c61829911727b9-0-a3198ab6bcbfd8d5767c736ebbbbde0a';

const TOOLS = [
  {
    id: 'quadratic-explorer',
    title: 'Quadratic Graphing Studio',
    description: 'Explore quadratic equations interactively — graph, roots, vertex, axis of symmetry, and AI-powered step-by-step tutoring.',
    path: '/math-tools/quadratic-explorer',
    free: true,
    premium: false,
    available: true,
    featured: true,
    popular: true,
    hasIllustration: true,
    banner: 'quadratic',
  },
  {
    id: 'linear-equations',
    title: 'Linear Equations Tool',
    description: 'Graph and solve linear equations step by step — slope, intercepts, and AI assistance for every question.',
    path: '/math-tools/linear-explorer',
    free: true,
    premium: false,
    available: true,
    featured: false,
    popular: false,
    hasIllustration: true,
    banner: 'linear',
  },
  {
    id: 'set-theory-explorer',
    title: 'Set Theory Explorer',
    description: 'Solve Venn diagram problems two ways — Formula Method or Region Method — with a live diagram and AI-powered tutoring.',
    path: '/math-tools/set-theory-explorer',
    free: true,
    premium: false,
    available: true,
    featured: false,
    popular: false,
    hasIllustration: true,
    banner: 'sets',
  },
  {
    id: 'simultaneous-equations',
    title: 'Simultaneous Equations Solver',
    description: 'Solve two equations at once — graphically and algebraically with full workings.',
    path: '/math-tools/simultaneous-equations',
    free: false,
    premium: true,
    available: false,
    featured: false,
    popular: false,
    hasIllustration: false,
    icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M9 6h12M6 9v12"/></svg>),
  },
];

// ----------------------------------------------------------------------------
// Banner illustrations — one per "hasIllustration" tool, drawn in the same
// 200x110 viewBox and navy/gold/coral palette as the original Quadratic
// banner, so all three read as one professional family rather than one
// polished hero next to two plain icon cards.
// ----------------------------------------------------------------------------

function QuadraticIllustration() {
  return (
    <svg width="200" height="110" viewBox="0 0 200 110" style={{ position: 'relative', zIndex: 1 }}>
      <line x1="20" y1="95" x2="180" y2="95" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <line x1="100" y1="10" x2="100" y2="95" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <polygon points="180,95 175,91 175,99" fill="rgba(255,255,255,0.3)" />
      <polygon points="100,10 96,15 104,15" fill="rgba(255,255,255,0.3)" />
      <path d="M 30 95 Q 50 90 65 70 Q 80 45 100 30 Q 120 45 135 70 Q 150 90 170 95" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <circle cx="100" cy="30" r="5" fill="#F59E0B" stroke="#fff" strokeWidth="2" />
      <circle cx="55" cy="95" r="4" fill="#E0623D" stroke="#fff" strokeWidth="1.5" />
      <circle cx="145" cy="95" r="4" fill="#E0623D" stroke="#fff" strokeWidth="1.5" />
      <circle cx="100" cy="82" r="4" fill="#2F5FCC" stroke="#fff" strokeWidth="1.5" />
      <line x1="100" y1="15" x2="100" y2="90" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 3" />
      <text x="100" y="22" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="Inter, sans-serif" fontWeight="600">vertex</text>
      <text x="55" y="88" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="Inter, sans-serif">root</text>
      <text x="145" y="88" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="Inter, sans-serif">root</text>
    </svg>
  );
}

function LinearIllustration() {
  return (
    <svg width="200" height="110" viewBox="0 0 200 110" style={{ position: 'relative', zIndex: 1 }}>
      <line x1="20" y1="95" x2="180" y2="95" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <line x1="35" y1="10" x2="35" y2="95" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <polygon points="180,95 175,91 175,99" fill="rgba(255,255,255,0.3)" />
      <polygon points="35,10 31,15 39,15" fill="rgba(255,255,255,0.3)" />

      {/* the line itself */}
      <line x1="42" y1="88" x2="160" y2="24" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.9" />

      {/* rise/run triangle, showing slope visually */}
      <path d="M 78 66 L 78 42 L 102 42" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="70" y="56" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="7" fontFamily="Inter, sans-serif">rise</text>
      <text x="90" y="52" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="7" fontFamily="Inter, sans-serif">run</text>

      {/* y-intercept */}
      <circle cx="35" cy="72" r="4" fill="#2F5FCC" stroke="#fff" strokeWidth="1.5" />
      <text x="35" y="88" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="Inter, sans-serif" style={{ transform: 'translateY(4px)' }}>y-int</text>

      {/* x-intercept */}
      <circle cx="150" cy="95" r="4" fill="#E0623D" stroke="#fff" strokeWidth="1.5" />
      <text x="150" y="107" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="Inter, sans-serif">x-int</text>

      <text x="140" y="30" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="Inter, sans-serif" fontWeight="600">y = mx + b</text>
    </svg>
  );
}

function SetTheoryIllustration() {
  return (
    <svg width="200" height="110" viewBox="0 0 200 110" style={{ position: 'relative', zIndex: 1 }}>
      {/* universal set box */}
      <rect x="24" y="14" width="152" height="84" rx="6" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <text x="34" y="28" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="Inter, sans-serif" fontWeight="600">U</text>

      {/* two overlapping circles */}
      <circle cx="82" cy="58" r="34" fill="rgba(245,158,11,0.10)" stroke="#F59E0B" strokeWidth="2" />
      <circle cx="118" cy="58" r="34" fill="rgba(224,98,61,0.10)" stroke="#E0623D" strokeWidth="2" />

      <text x="62" y="30" textAnchor="middle" fill="#F59E0B" fontSize="11" fontFamily="Space Grotesk, sans-serif" fontWeight="700">A</text>
      <text x="138" y="30" textAnchor="middle" fill="#E0623D" fontSize="11" fontFamily="Space Grotesk, sans-serif" fontWeight="700">B</text>

      {/* overlap region + region counts, echoing the tool's own diagram */}
      <text x="66" y="62" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="9" fontFamily="'JetBrains Mono', monospace" fontWeight="700">12</text>
      <text x="100" y="62" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="'JetBrains Mono', monospace" fontWeight="700">7</text>
      <text x="134" y="62" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="9" fontFamily="'JetBrains Mono', monospace" fontWeight="700">9</text>

      <text x="100" y="90" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="Inter, sans-serif">n(A ∩ B) = 7</text>
    </svg>
  );
}

const BANNER_ILLUSTRATIONS = {
  quadratic: QuadraticIllustration,
  linear: LinearIllustration,
  sets: SetTheoryIllustration,
};

export default function MathematicalTools() {
  const { user } = useAuth();
  const [saves, setSaves] = useState([]);
  const [savesLoading, setSavesLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) {
      setSavesLoading(false);
      return;
    }
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${API}/api/quadratic-saves`, { headers })
        .then((res) => res.data.saves.map((s) => ({ ...s, type: 'quadratic' })))
        .catch((err) => { console.error('Failed to load quadratic saves:', err); return []; }),
      axios.get(`${API}/api/linear-saves`, { headers })
        .then((res) => res.data.saves.map((s) => ({ ...s, type: 'linear' })))
        .catch((err) => { console.error('Failed to load linear saves:', err); return []; }),
    ])
      .then(([quadraticSaves, linearSaves]) => {
        const combined = [...quadraticSaves, ...linearSaves].sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
        setSaves(combined);
      })
      .finally(() => setSavesLoading(false));
  }, [user]);

  const handleDeleteSave = async (id, type) => {
    setDeletingId(id);
    const token = localStorage.getItem('token');
    const endpoint = type === 'linear' ? 'linear-saves' : 'quadratic-saves';
    try {
      await axios.delete(`${API}/api/${endpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaves((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete save:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      // Added the background image with a deep navy overlay for readability
      backgroundImage: `linear-gradient(rgba(15, 23, 60, 0.92), rgba(5, 10, 25, 0.95)), url(${BACKGROUND_IMAGE_URL})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundAttachment: 'fixed',
    }}>
      <style>{`
        @keyframes mt-bounce-in {
          0% { opacity: 0; transform: translateY(40px) scale(0.92); }
          50% { transform: translateY(-8px) scale(1.02); }
          70% { transform: translateY(4px) scale(0.99); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mt-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes mt-premium-glow {
          0%, 100% { box-shadow: 0 8px 32px rgba(255,152,0,0.15), 0 2px 8px rgba(0,0,0,0.04); }
          50% { box-shadow: 0 12px 40px rgba(255,152,0,0.25), 0 4px 12px rgba(0,0,0,0.06); }
        }
        .mt-card {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease;
          animation: mt-bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        }
        .mt-card:hover {
          transform: translateY(-12px) scale(1.03);
          box-shadow: 0 20px 50px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06);
        }
        .mt-card-featured {
          animation: mt-bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) backwards, mt-float 3s ease-in-out 1s infinite;
        }
        .mt-card-featured:hover {
          animation: none;
          transform: translateY(-14px) scale(1.04);
          box-shadow: 0 24px 60px rgba(26,35,126,0.18), 0 10px 24px rgba(0,0,0,0.06);
        }
        .mt-card:nth-child(1) { animation-delay: 0s; }
        .mt-card:nth-child(2) { animation-delay: 0.12s; }
        .mt-card:nth-child(3) { animation-delay: 0.24s; }
        .mt-card:nth-child(4) { animation-delay: 0.36s; }
        .mt-card:nth-child(1).mt-card-featured { animation-delay: 0s, 1s; }
        .mt-card:nth-child(2).mt-card-featured { animation-delay: 0.12s, 1.12s; }
        .mt-card:nth-child(3).mt-card-featured { animation-delay: 0.24s, 1.24s; }
        .mt-premium-card {
          animation: mt-bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.36s backwards, mt-premium-glow 3s ease-in-out 1.5s infinite;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease;
        }
        .mt-premium-card:hover {
          animation: none;
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 50px rgba(255,152,0,0.3), 0 8px 20px rgba(0,0,0,0.08);
        }
      `}</style>

      <div style={{ background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #1a237e 100%)', padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 30% 50%, rgba(245,158,11,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 30, padding: '6px 16px', marginBottom: 20 }}>
            <span style={{ fontSize: 16 }}>📐</span>
            <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: 13 }}>Interactive Learning Tools</span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: 40, fontWeight: 800, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>Mathematical Tools</h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>Master WAEC and NECO math with interactive graphing tools, step-by-step solutions, and AI-powered tutoring.</p>
        </div>
      </div>

      {user && !savesLoading && saves.length > 0 && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 0' }}>
          {/* Changed title color to white so it's visible on the dark background */}
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 16 }}>
            My Saved Work
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 8 }}>
            {saves.map((save) => (
              <div
                key={`${save.type}-${save.id}`}
                style={{
                  background: 'white',
                  border: '1px solid #f0f0f0',
                  borderRadius: 14,
                  padding: '18px 20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0a0a0a' }}>
                      {save.title}
                    </div>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      padding: '2px 8px',
                      borderRadius: 20,
                      background: save.type === 'linear' ? '#E8EAF6' : '#FFF3E0',
                      color: save.type === 'linear' ? '#1a237e' : '#ff6f00',
                    }}>
                      {save.type === 'linear' ? 'LINEAR' : 'QUADRATIC'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    Step {save.step} of {save.type === 'linear' ? 8 : 9} · {new Date(save.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link
                    to={`/math-tools/${save.type === 'linear' ? 'linear-explorer' : 'quadratic-explorer'}?save=${save.id}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      background: '#1a237e',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Continue
                  </Link>
                  <button
                    onClick={() => handleDeleteSave(save.id, save.type)}
                    disabled={deletingId === save.id}
                    style={{
                      border: '1px solid #f0f0f0',
                      background: 'white',
                      color: '#c62828',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {deletingId === save.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28, perspective: '1200px' }}>
          {TOOLS.map((tool) => {
            const isLocked = !tool.available;
            const isFeatured = tool.featured;
            const showBanner = tool.hasIllustration && !isLocked;
            const Illustration = tool.banner ? BANNER_ILLUSTRATIONS[tool.banner] : null;
            const linkTo = user ? tool.path : '/register';
            return (
              <div
                key={tool.id}
                className={`mt-card ${isFeatured ? 'mt-card-featured' : ''}`}
                style={{
                  background: 'white',
                  borderRadius: 20,
                  border: isLocked ? '1px solid #e0e0e0' : isFeatured ? '1px solid rgba(26,35,126,0.12)' : '1px solid #f0f0f0',
                  boxShadow: isLocked ? '0 2px 8px rgba(0,0,0,0.04)' : isFeatured ? '0 12px 32px rgba(26,35,126,0.10), 0 4px 12px rgba(0,0,0,0.04)' : '0 8px 24px rgba(0,0,0,0.06)',
                  opacity: isLocked ? 0.7 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transformStyle: 'preserve-3d',
                }}
              >
                {showBanner && (
                  <div style={{
                    height: 140,
                    background: 'linear-gradient(135deg, #1a237e 0%, #283593 60%, #3949ab 100%)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
                      {Array.from({ length: 80 }).map((_, i) => (
                        <div key={i} style={{ position: 'absolute', width: 2, height: 2, borderRadius: '50%', background: '#fff', left: `${(i % 10) * 10 + 5}%`, top: `${Math.floor(i / 10) * 12.5 + 6}%` }} />
                      ))}
                    </div>
                    {Illustration && <Illustration />}
                    {tool.popular && (
                      <div style={{ position: 'absolute', top: 12, right: 12, display: 'inline-flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg, #FFB300, #FF8F00)', color: '#3E2723', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: '0.5px', zIndex: 2 }}>
                        ⭐ Most Popular
                      </div>
                    )}
                  </div>
                )}

                <div style={{ padding: showBanner ? '20px 28px 28px' : '28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {!showBanner && (
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: isLocked ? '#f5f5f5' : '#E8EAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{tool.icon}</div>
                  )}
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: showBanner ? 20 : 18, fontWeight: 700, marginBottom: 8, color: isLocked ? '#999' : '#0a0a0a' }}>{tool.title}</h3>
                  <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{tool.description}</p>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                    {tool.free && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#E8F5E9', color: '#2e7d32', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.5px' }}>FREE</span>}
                    {tool.premium && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'linear-gradient(135deg, #FFB300, #FF8F00)', color: '#3E2723', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.5px' }}>PREMIUM</span>}
                    {isLocked && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#f5f5f5', color: '#999', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.5px' }}>COMING SOON</span>}
                  </div>
                  {tool.available ? (
                    <Link to={linkTo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: isFeatured ? 'linear-gradient(135deg, #1a237e, #283593)' : '#1a237e', color: 'white', padding: '12px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', fontFamily: "'Inter', sans-serif", textAlign: 'center', transition: 'background 0.2s' }}>
                      {user ? 'Open Tool' : 'Register to Use'}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#f5f5f5', color: '#999', padding: '12px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14, fontFamily: "'Inter', sans-serif", textAlign: 'center' }}>Coming Soon</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-premium-card" style={{
          marginTop: 48,
          background: 'linear-gradient(135deg, #FFF8E1, #FFF3E0)',
          border: '1px solid #FFB300',
          borderRadius: 20,
          padding: '40px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,152,0,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,152,0,0.04)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF8F00" stroke="#FF8F00" strokeWidth="1"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26z"/></svg>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, color: '#3E2723', margin: 0 }}>Nairafame Premium</h2>
            </div>
            <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6, maxWidth: 500, margin: '0 auto 16px' }}>Unlock Auto-Graph Mode, AI Tutor, and step-by-step solutions for all tools.</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,152,0,0.12)', border: '1px solid rgba(255,152,0,0.3)', padding: '8px 20px', borderRadius: 30, fontSize: 14, fontWeight: 700, color: '#E65100', fontFamily: "'Inter', sans-serif" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              Coming Soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}