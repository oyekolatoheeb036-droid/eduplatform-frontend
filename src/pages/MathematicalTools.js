import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const TOOLS = [
  {
    id: 'quadratic-explorer',
    title: 'Quadratic Graphing Studio',
    description: 'Explore quadratic equations interactively — see the graph, roots, vertex, and get AI-powered explanations.',
    path: '/math-tools/quadratic-explorer',
    free: true,
    premium: false,
    available: true,
    icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a237e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16c2-8 4-8 6 0s4 8 6 0"/></svg>),
  },
  {
    id: 'linear-equations',
    title: 'Linear Equations Tool',
    description: 'Graph and solve linear equations step by step.',
    path: '/math-tools/linear-equations',
    free: false,
    premium: true,
    available: false,
    icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>),
  },
];

export default function MathematicalTools() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f8' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {TOOLS.map((tool) => {
            const isLocked = !tool.available;
            const linkTo = user ? tool.path : '/register';
            return (
              <div key={tool.id} style={{ background: 'white', borderRadius: 16, padding: 28, border: isLocked ? '1px solid #e0e0e0' : '1px solid #f0f0f0', boxShadow: isLocked ? 'none' : '0 8px 24px rgba(0,0,0,0.06)', opacity: isLocked ? 0.65 : 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: isLocked ? '#f5f5f5' : '#E8EAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{tool.icon}</div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 8, color: isLocked ? '#999' : '#0a0a0a' }}>{tool.title}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{tool.description}</p>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                  {tool.free && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#E8F5E9', color: '#2e7d32', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.5px' }}>FREE</span>}
                  {tool.premium && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'linear-gradient(135deg, #FFB300, #FF8F00)', color: '#3E2723', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.5px' }}>PREMIUM</span>}
                  {isLocked && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#f5f5f5', color: '#999', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.5px' }}>COMING SOON</span>}
                </div>
                {tool.available ? (
                  <Link to={linkTo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#1a237e', color: 'white', padding: '12px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', fontFamily: "'Inter', sans-serif", textAlign: 'center' }}>
                    {user ? 'Open Tool' : 'Register to Use'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#f5f5f5', color: '#999', padding: '12px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, fontFamily: "'Inter', sans-serif", textAlign: 'center' }}>Coming Soon</div>
                )}
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
