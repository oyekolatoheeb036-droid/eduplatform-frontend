import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

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
    icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a237e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16c2-8 4-8 6 0s4 8 6 0"/></svg>),
  },
  {
    id: 'linear-equations',
    title: 'Linear Equations Tool',
    description: 'Graph and solve linear equations step by step with AI assistance.',
    path: '/math-tools/linear-equations',
    free: false,
    premium: true,
    available: false,
    featured: false,
    popular: false,
    icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>),
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
    icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M9 6h12M6 9v12"/></svg>),
  },
];

export default function MathematicalTools() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f8' }}>
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
        .mt-card:nth-child(1).mt-card-featured { animation-delay: 0s, 1s; }
        .mt-card:nth-child(2).mt-card-featured { animation-delay: 0.12s, 1.12s; }
        .mt-card:nth-child(3).mt-card-featured { animation-delay: 0.24s, 1.24s; }
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

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28, perspective: '1200px' }}>
          {TOOLS.map((tool) => {
            const isLocked = !tool.available;
            const isFeatured = tool.featured;
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
                {/* Featured gradient accent strip + mini graph */}
                {isFeatured && (
                  <div style={{
                    height: 140,
                    background: 'linear-gradient(135deg, #1a237e 0%, #283593 60%, #3949ab 100%)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {/* Decorative grid dots */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
                      {Array.from({ length: 80 }).map((_, i) => (
                        <div key={i} style={{ position: 'absolute', width: 2, height: 2, borderRadius: '50%', background: '#fff', left: `${(i % 10) * 10 + 5}%`, top: `${Math.floor(i / 10) * 12.5 + 6}%` }} />
                      ))}
                    </div>
                    {/* Mini parabola SVG */}
                    <svg width="200" height="110" viewBox="0 0 200 110" style={{ position: 'relative', zIndex: 1 }}>
                      {/* Axes */}
                      <line x1="20" y1="95" x2="180" y2="95" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                      <line x1="100" y1="10" x2="100" y2="95" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                      {/* Axis arrows */}
                      <polygon points="180,95 175,91 175,99" fill="rgba(255,255,255,0.3)" />
                      <polygon points="100,10 96,15 104,15" fill="rgba(255,255,255,0.3)" />
                      {/* Parabola curve */}
                      <path d="M 30 95 Q 50 90 65 70 Q 80 45 100 30 Q 120 45 135 70 Q 150 90 170 95" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
                      {/* Vertex dot */}
                      <circle cx="100" cy="30" r="5" fill="#F59E0B" stroke="#fff" strokeWidth="2" />
                      {/* Root dots */}
                      <circle cx="55" cy="95" r="4" fill="#E0623D" stroke="#fff" strokeWidth="1.5" />
                      <circle cx="145" cy="95" r="4" fill="#E0623D" stroke="#fff" strokeWidth="1.5" />
                      {/* Y-intercept dot */}
                      <circle cx="100" cy="82" r="4" fill="#2F5FCC" stroke="#fff" strokeWidth="1.5" />
                      {/* Dashed symmetry line */}
                      <line x1="100" y1="15" x2="100" y2="90" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 3" />
                      {/* Labels */}
                      <text x="100" y="22" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="Inter, sans-serif" fontWeight="600">vertex</text>
                      <text x="55" y="88" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="Inter, sans-serif">root</text>
                      <text x="145" y="88" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="Inter, sans-serif">root</text>
                    </svg>
                    {/* Popular badge */}
                    {tool.popular && (
                      <div style={{ position: 'absolute', top: 12, right: 12, display: 'inline-flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg, #FFB300, #FF8F00)', color: '#3E2723', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: '0.5px', zIndex: 2 }}>
                        ⭐ Most Popular
                      </div>
                    )}
                  </div>
                )}

                <div style={{ padding: isFeatured ? '20px 28px 28px' : '28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {!isFeatured && (
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: isLocked ? '#f5f5f5' : '#E8EAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{tool.icon}</div>
                  )}
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: isFeatured ? 20 : 18, fontWeight: 700, marginBottom: 8, color: isLocked ? '#999' : '#0a0a0a' }}>{tool.title}</h3>
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

        <div style={{ marginTop: 48, background: 'linear-gradient(135deg, #FFF8E1, #FFF3E0)', border: '1px solid #FFB300', borderRadius: 20, padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF8F00" stroke="#FF8F00" strokeWidth="1"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26z"/></svg>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, color: '#3E2723' }}>Upgrade to Nairafame Premium</h2>
          </div>
          <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6, maxWidth: 500, margin: '0 auto 20px' }}>Unlock Auto-Graph Mode, AI Tutor, and step-by-step solutions for all tools. Just 2,500 NGN/month.</p>
          <Link to={user ? '/math-tools/quadratic-explorer' : '/register'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #FFB300, #FF8F00)', color: '#3E2723', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}>
            {user ? 'Try the Quadratic Tool' : 'Register to Get Started'}
          </Link>
        </div>
      </div>
    </div>
  );
}