import { useState, useEffect, useRef } from 'react';

function Portfolio() {
  const [typingText, setTypingText] = useState('');
  const textIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const isDeletingRef = useRef(false);

  const typingTexts = [
    'Software Engineer',
    'Founder of Cartunde',
    'Founder of Nairafame Academy',
    'Mathematics Educator',
    'Computer Hardware & Software Technician'
  ];

  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
  const bodyFont = { fontFamily: "'Inter', sans-serif" };

  // Typing Animation
  useEffect(() => {
    const type = () => {
      const current = typingTexts[textIndexRef.current];
      if (!isDeletingRef.current) {
        charIndexRef.current++;
        setTypingText(current.substring(0, charIndexRef.current));
        if (charIndexRef.current === current.length) {
          setTimeout(() => { isDeletingRef.current = true; type(); }, 1800);
          return;
        }
      } else {
        charIndexRef.current--;
        setTypingText(current.substring(0, charIndexRef.current));
        if (charIndexRef.current === 0) {
          isDeletingRef.current = false;
          textIndexRef.current = (textIndexRef.current + 1) % typingTexts.length;
        }
      }
      setTimeout(type, isDeletingRef.current ? 40 : 90);
    };
    const timeout = setTimeout(type, 500);
    return () => clearTimeout(timeout);
  }, []);

  // Counter Animation
  const animateCounter = (el, target, suffix = '') => {
    const duration = 1600;
    const startTime = performance.now();
    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(update);
  };

  // Scroll Reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.querySelectorAll('[data-count]').forEach(el => {
            animateCounter(el, parseInt(el.dataset.count), '+');
          });
          entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
            setTimeout(() => { bar.style.width = bar.dataset.width; }, 300);
          });
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Hero Progress
  useEffect(() => {
    setTimeout(() => {
      const bar = document.getElementById('heroProgress');
      const text = document.getElementById('heroProgressText');
      if (bar) bar.style.width = '85%';
      if (text) animateCounter(text, 85, '%');
    }, 600);
  }, []);

  // Navbar scroll
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById('portNav');
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hoverService = (e, color) => {
    e.currentTarget.style.boxShadow = `0 24px 60px rgba(0,0,0,0.2), 0 8px 20px ${color}44`;
  };
  const unhoverService = (e) => {
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)';
  };

  const services = [
    { icon: '💻', title: 'Software Development', color: '#1a237e', bg: 'linear-gradient(135deg,#1a237e,#283593)', items: ['Full-stack Web Development', 'React & Next.js', 'Node.js', 'REST APIs', 'Database Design', 'AI Integration', 'Payment Gateway Integration'] },
    { icon: '🛒', title: 'E-commerce Solutions', color: '#0288d1', bg: 'linear-gradient(135deg,#0277bd,#0288d1)', items: ['Custom Online Stores', 'Multi-vendor Marketplace', 'Inventory Management', 'Order Management', 'Business Analytics', 'Vendor Dashboard'] },
    { icon: '📚', title: 'Education', color: '#2e7d32', bg: 'linear-gradient(135deg,#2e7d32,#4caf50)', items: ['Founder, Nairafame Academy', 'Mathematics Teacher', 'WAEC & NECO Exam Prep', 'Curriculum Development', 'Educational Content Creation'] },
    { icon: '🖥', title: 'Computer Repair', color: '#e65100', bg: 'linear-gradient(135deg,#e65100,#ff6f00)', items: ['Laptop & Desktop Repair', 'Windows Installation', 'Software Installation', 'Virus Removal', 'System Optimization', 'Hardware Upgrades', 'Data Backup & Recovery'] },
    { icon: '🎯', title: 'Business Digitalization', color: '#6a1b9a', bg: 'linear-gradient(135deg,#6a1b9a,#9c27b0)', items: ['Business Websites', 'Online Presence Setup', 'Website Maintenance', 'Technical Consulting'] },
  ];

  const skillCategories = [
    { title: 'Programming', icon: '⌨️', color: '#1a237e', skills: [{ name: 'JavaScript', level: 95 }, { name: 'TypeScript', level: 85 }, { name: 'HTML', level: 98 }, { name: 'CSS', level: 92 }, { name: 'SQL', level: 80 }] },
    { title: 'Frameworks', icon: '🔧', color: '#0288d1', skills: [{ name: 'React', level: 93 }, { name: 'Next.js', level: 85 }, { name: 'Node.js', level: 88 }, { name: 'Express', level: 86 }] },
    { title: 'Databases', icon: '🗄', color: '#2e7d32', skills: [{ name: 'PostgreSQL', level: 88 }, { name: 'MySQL', level: 82 }, { name: 'MongoDB', level: 78 }] },
    { title: 'Tools & IT', icon: '🛠', color: '#e65100', skills: [{ name: 'Git & GitHub', level: 90 }, { name: 'VS Code', level: 95 }, { name: 'Figma', level: 75 }, { name: 'Networking', level: 80 }, { name: 'Hardware Repair', level: 90 }] },
  ];

  return (
    <div style={{ overflowX: 'hidden', ...bodyFont }}>

      <style>{`
        .port-nav { position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(0,0,0,0.06);transition:box-shadow 0.3s; }
        .port-nav.scrolled { box-shadow:0 2px 20px rgba(0,0,0,0.08); }
        .port-nav-inner { max-width:1280px;margin:0 auto;padding:0 80px;height:72px;display:flex;align-items:center;justify-content:space-between; }
        .port-nav-links { display:flex;gap:32px;list-style:none; }
        .port-nav-links a { font-size:14px;font-weight:500;color:#555;transition:color 0.2s;text-decoration:none;position:relative; }
        .port-nav-links a:hover { color:#1a237e; }
        .port-nav-links a::after { content:'';position:absolute;bottom:-4px;left:0;width:0;height:2px;background:#ff6f00;transition:width 0.3s;border-radius:2px; }
        .port-nav-links a:hover::after { width:100%; }
        .reveal { opacity:0;transform:translateY(30px);transition:opacity 0.7s ease,transform 0.7s ease; }
        .reveal.visible { opacity:1;transform:translateY(0); }
        .reveal-delay-1 { transition-delay:0.1s; }
        .reveal-delay-2 { transition-delay:0.2s; }
        .reveal-delay-3 { transition-delay:0.3s; }
        .reveal-delay-4 { transition-delay:0.4s; }
        .skill-bar-fill { width:0%;transition:width 1.2s ease; }

        /* GRID CONTAINERS */
        .grid-services { display:grid;grid-template-columns:repeat(3,1fr);gap:24px; }
        .grid-projects { display:grid;grid-template-columns:repeat(3,1fr);gap:24px; }
        .grid-skills { display:grid;grid-template-columns:repeat(4,1fr);gap:24px; }
        .grid-testimonials { display:grid;grid-template-columns:repeat(3,1fr);gap:24px; }
        .grid-why { display:flex;gap:60px;align-items:center;flex-wrap:wrap; }
        .grid-footer { display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px; }
        .grid-hero { display:flex;align-items:center;justify-content:space-between;min-height:90vh;gap:40px;flex-wrap:wrap; }
        .hero-buttons { display:flex;gap:14px;flex-wrap:wrap;margin-bottom:32px; }
        .hero-tags { display:flex;flex-wrap:wrap;gap:16px; }
        .contact-links { display:flex;justify-content:center;flex-wrap:wrap;gap:16px;margin-bottom:40px; }
        .contact-cta-row { display:flex;justify-content:center;gap:16px;flex-wrap:wrap; }

        /* SERVICE LIST ITEMS */
        .svc-list { list-style:none;display:flex;flex-direction:column;gap:8px; }
        .svc-list li { font-size:14px;color:#777;display:flex;align-items:flex-start;gap:8px;line-height:1.5; }
        .svc-list li span { flex:1;min-width:0;word-wrap:break-word;overflow-wrap:break-word; }

        /* PROJECT TAGS */
        .proj-tags { display:flex;flex-wrap:wrap;gap:6px; }

        /* MOBILE FIXES */
        @media (max-width:1024px) {
          .grid-services { grid-template-columns:repeat(2,1fr) !important; }
          .grid-projects { grid-template-columns:repeat(2,1fr) !important; }
          .grid-skills { grid-template-columns:repeat(2,1fr) !important; }
          .port-nav-inner { padding:0 32px !important; }
          .section-pad { padding-left:32px !important;padding-right:32px !important; }
          .hero-pad { padding-left:32px !important;padding-right:32px !important; }
          .footer-pad { padding-left:32px !important;padding-right:32px !important; }
        }

        @media (max-width:768px) {
          .port-nav-inner { padding:0 20px !important; }
          .port-nav-links { display:none !important; }
          .grid-hero { flex-direction:column !important;min-height:auto !important; }
          .hero-pad { padding:120px 20px 64px !important; }
          .section-pad { padding:64px 20px !important; }
          .footer-pad { padding:48px 20px !important; }
          .grid-services { grid-template-columns:1fr !important; }
          .grid-projects { grid-template-columns:1fr !important; }
          .grid-skills { grid-template-columns:1fr !important; }
          .grid-testimonials { grid-template-columns:1fr !important; }
          .grid-why { flex-direction:column !important; }
          .hero-buttons { flex-direction:column !important; }
          .hero-buttons button { width:100% !important;justify-content:center !important; }
          .contact-cta-row { flex-direction:column !important;align-items:center !important; }
          .contact-cta-row button { width:100% !important;max-width:320px !important;justify-content:center !important; }
          .grid-footer { flex-direction:column !important;text-align:center !important; }
          .section-title-m { font-size:28px !important; }
        }

        @media (max-width:520px) {
          .grid-skills { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className="port-nav" id="portNav">
        <div className="port-nav-inner">
          <div style={{ display:'flex',alignItems:'center',gap:'10px',...fontStyle,fontWeight:800,fontSize:'18px',color:'#1a237e' }}>
            <span style={{ color:'#ff6f00' }}>Oyekola</span>Toheeb
          </div>
          <ul className="port-nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#contact" style={{ color:'#ff6f00',fontWeight:700,border:'2px solid #ff6f00',padding:'8px 20px',borderRadius:'8px' }}>Hire Me</a></li>
          </ul>
        </div>
      </nav>

      {/* HERO */}
      <section className="grid-hero hero-pad" style={{ background:'white',padding:'140px 80px 100px' }}>
        <div style={{ maxWidth:'580px',width:'100%' }}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:'8px',background:'#fff3e0',border:'1px solid #ff6f00',borderRadius:'30px',padding:'8px 20px',marginBottom:'30px' }}>
            <span>🇳🇬</span>
            <span style={{ color:'#ff6f00',fontWeight:600,fontSize:'13px' }}>Technology Entrepreneur & Educator</span>
          </div>
          <h1 className="section-title-m" style={{ fontWeight:800,fontSize:'52px',lineHeight:1.1,color:'#0a0a0a',marginBottom:'16px',...fontStyle }}>Oyekola Toheeb</h1>
          <div style={{ fontSize:'18px',fontWeight:500,color:'#555',marginBottom:'8px',minHeight:'28px' }}>
            <span style={{ color:'#1a237e',borderBottom:'4px solid #ff6f00',paddingBottom:'2px' }}>{typingText}</span>
          </div>
          <p style={{ fontSize:'17px',color:'#555',lineHeight:1.8,marginBottom:'36px',maxWidth:'520px' }}>
            I build software that solves real-world problems, empower students through technology-driven education, and provide reliable computer repair and IT solutions.
          </p>
          <div className="hero-buttons">
            <button onClick={() => document.getElementById('projects').scrollIntoView({behavior:'smooth'})} style={{ background:'#1a237e',color:'white',padding:'15px 36px',fontSize:'15px',fontWeight:700,borderRadius:'8px',border:'none',cursor:'pointer',boxShadow:'0 4px 15px rgba(26,35,126,0.3)',display:'inline-flex',alignItems:'center',gap:'8px',...bodyFont }}>View My Projects →</button>
            <button onClick={() => document.getElementById('contact').scrollIntoView({behavior:'smooth'})} style={{ background:'transparent',color:'#1a237e',padding:'15px 36px',fontSize:'15px',fontWeight:600,borderRadius:'8px',border:'2px solid #1a237e',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'8px',...bodyFont }}>Hire Me</button>
            <button style={{ background:'transparent',color:'#ff6f00',padding:'15px 36px',fontSize:'15px',fontWeight:600,borderRadius:'8px',border:'2px solid #ff6f00',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'8px',...bodyFont }}>⬇ Download CV</button>
          </div>
          <div className="hero-tags">
            {['Founder of Cartunde', 'Founder of Nairafame Academy', '3+ Years Experience'].map((t,i) => (
              <span key={i} style={{ display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',color:'#999' }}>✅ {t}</span>
            ))}
          </div>
        </div>

        <div style={{ flex:1,minWidth:0,width:'100%',maxWidth:'520px',background:'linear-gradient(135deg,#1a237e,#0288d1)',borderRadius:'20px',padding:'28px',boxShadow:'0 20px 60px rgba(26,35,126,0.2)' }}>
          <div style={{ background:'white',borderRadius:'12px',padding:'20px',marginBottom:'14px' }}>
            <div style={{ ...fontStyle,fontWeight:700,color:'#1a237e',fontSize:'17px',marginBottom:'2px' }}>Toheeb Oyekola 👋</div>
            <div style={{ fontSize:'13px',color:'#999',marginBottom:'14px' }}>Software Engineer & Educator</div>
            <div style={{ fontSize:'13px',color:'#555',marginBottom:'5px' }}>Projects Completed</div>
            <div style={{ background:'#e0e0e0',borderRadius:'5px',height:'8px',overflow:'hidden' }}>
              <div id="heroProgress" style={{ background:'linear-gradient(90deg,#1a237e,#0288d1)',borderRadius:'5px',height:'100%',width:'0%',transition:'width 1.5s ease' }}></div>
            </div>
            <div style={{ fontSize:'13px',color:'#1a237e',fontWeight:700,marginTop:'5px' }}><span id="heroProgressText">0</span> Complete</div>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px' }}>
            {[{v:'15',l:'Projects Built'},{v:'500',l:'Students Taught'},{v:'200',l:'Devices Repaired'},{v:'50',l:'Happy Clients'}].map((s,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.15)',borderRadius:'10px',padding:'15px 10px',textAlign:'center' }}>
                <div data-count={s.v} style={{ ...fontStyle,fontWeight:800,color:'white',fontSize:'22px' }}>0</div>
                <span style={{ color:'rgba(255,255,255,0.8)',fontSize:'11px',lineHeight:1.2 }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section-pad" style={{ padding:'100px 80px',background:'#f0f2f8' }}>
        <div style={{ maxWidth:'800px' }}>
          <div className="reveal">
            <div style={{ color:'#ff6f00',fontWeight:700,fontSize:'14px',marginBottom:'10px',letterSpacing:'0.5px' }}>ABOUT ME</div>
            <h2 className="section-title-m" style={{ fontWeight:800,color:'#0a0a0a',lineHeight:1.2,fontSize:'36px',...fontStyle }}>Building solutions at the intersection of technology and education</h2>
          </div>
          <div className="reveal reveal-delay-1" style={{ fontSize:'17px',color:'#555',lineHeight:1.9,marginTop:'32px' }}>
            <p>I am a software engineer, educator, and entrepreneur passionate about using technology to solve everyday problems.</p>
            <p style={{ marginTop:'20px' }}>I founded <strong>Cartunde</strong>, a multi-vendor e-commerce platform that helps businesses sell online with ease, and <strong>Nairafame Academy</strong>, an online learning platform focused on quality mathematics education.</p>
            <p style={{ marginTop:'20px' }}>Beyond software development, I provide professional computer hardware and software repair services, helping individuals and businesses maintain reliable IT systems.</p>
          </div>
          <div className="reveal reveal-delay-2" style={{ marginTop:'32px',padding:'24px 28px',background:'white',borderLeft:'5px solid #ff6f00',borderRadius:'0 16px 16px 0',boxShadow:'0 4px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ ...fontStyle,fontWeight:700,color:'#1a237e',fontSize:'14px',marginBottom:'8px' }}>🎯 My Mission</div>
            <div style={{ fontSize:'16px',color:'#555',lineHeight:1.7,fontStyle:'italic' }}>To build innovative digital solutions that improve education, business, and technology across Africa.</div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="section-pad" style={{ padding:'100px 80px',background:'white' }}>
        <div className="reveal" style={{ maxWidth:'500px',marginBottom:'60px' }}>
          <div style={{ color:'#ff6f00',fontWeight:700,fontSize:'14px',marginBottom:'10px' }}>WHAT I DO</div>
          <h2 className="section-title-m" style={{ fontWeight:800,color:'#0a0a0a',fontSize:'36px',...fontStyle }}>Everything you need in one place</h2>
        </div>
        <div className="grid-services">
          {services.map((svc, i) => (
            <div key={i} className={`reveal reveal-delay-${(i % 3) + 1}`}
              onMouseEnter={(e) => hoverService(e, svc.color)} onMouseLeave={unhoverService}
              style={{ background:'white',borderRadius:'20px',overflow:'hidden',height:'100%',transition:'transform 0.3s ease, box-shadow 0.3s ease',transformStyle:'preserve-3d',position:'relative',cursor:'default' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-12px) rotateX(2deg) rotateY(-2deg) scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0) rotateX(0) rotateY(0) scale(1)'}>
              <div style={{ height:'6px',background:svc.bg }}></div>
              <div style={{ padding:'32px 28px' }}>
                <div style={{ width:'64px',height:'64px',borderRadius:'16px',background:`${svc.color}14`,border:`2px solid ${svc.color}22`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px',fontSize:'28px',boxShadow:`0 4px 14px ${svc.color}22` }}>{svc.icon}</div>
                <div style={{ ...fontStyle,fontWeight:800,fontSize:'17px',color:'#0a0a0a',marginBottom:'14px' }}>{svc.title}</div>
                <ul className="svc-list">
                  {svc.items.map((item, j) => (
                    <li key={j}>
                      <span style={{ color:svc.color,fontWeight:700,fontSize:'12px',flexShrink:0,marginTop:'3px' }}>✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ position:'absolute',top:0,left:0,right:0,bottom:0,background:'linear-gradient(135deg,rgba(255,255,255,0.08) 0%,transparent 60%)',borderRadius:'20px',pointerEvents:'none',opacity:0,transition:'opacity 0.3s' }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0}></div>
            </div>
          ))}
          {/* CTA Card */}
          <div className="reveal reveal-delay-3" onClick={() => document.getElementById('contact').scrollIntoView({behavior:'smooth'})}
            style={{ background:'linear-gradient(135deg,#1a237e,#0288d1)',borderRadius:'20px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',minHeight:'300px',transition:'transform 0.3s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width:'80px',height:'80px',borderRadius:'50%',background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px',fontSize:'36px' }}>💬</div>
            <div style={{ ...fontStyle,fontWeight:800,fontSize:'22px',color:'white',marginBottom:'10px' }}>Need Something Custom?</div>
            <div style={{ color:'rgba(255,255,255,0.8)',fontSize:'15px',maxWidth:'240px',lineHeight:1.6 }}>Let's discuss your specific needs and find the right solution.</div>
            <div style={{ marginTop:'24px',padding:'12px 28px',background:'rgba(255,255,255,0.2)',borderRadius:'30px',color:'white',fontWeight:700,fontSize:'14px' }}>Let's Talk →</div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="section-pad" style={{ padding:'100px 80px',background:'#f0f2f8' }}>
        <div className="reveal" style={{ maxWidth:'500px',marginBottom:'60px' }}>
          <div style={{ color:'#ff6f00',fontWeight:700,fontSize:'14px',marginBottom:'10px' }}>FEATURED PROJECTS</div>
          <h2 className="section-title-m" style={{ fontWeight:800,color:'#0a0a0a',fontSize:'36px',...fontStyle }}>Things I've built</h2>
        </div>
        <div className="grid-projects">
          {[
            { title:'Cartunde', desc:'A modern multi-vendor e-commerce platform where businesses can create their own online stores, manage products, accept payments, and track sales.', badge:'E-Commerce', badgeBg:'linear-gradient(135deg,#1a237e,#283593)', img:'https://picsum.photos/seed/cartunde-ecomm/600/400.jpg', tags:[{t:'React',c:'#1a237e'},{t:'Node.js',c:'#0288d1'},{t:'PostgreSQL',c:'#2e7d32'},{t:'AI',c:'#c62828'},{t:'Paystack',c:'#e65100'},{t:'Flutterwave',c:'#6a1b9a'}] },
            { title:'Nairafame Academy', desc:'An online mathematics learning platform providing interactive lessons, quizzes, and WAEC-standard examinations for Nigerian students.', badge:'Education', badgeBg:'linear-gradient(135deg,#2e7d32,#4caf50)', img:'https://picsum.photos/seed/nairafame-math/600/400.jpg', tags:[{t:'Video Lessons',c:'#1a237e'},{t:'CBT Tests',c:'#0288d1'},{t:'Progress Tracking',c:'#2e7d32'},{t:'AI Tutor',c:'#c62828'},{t:'Math Resources',c:'#e65100'}] },
            { title:'Computer Repair Services', desc:'Professional repair and maintenance for laptops and desktop computers, serving individuals and businesses with reliable IT support.', badge:'IT Services', badgeBg:'linear-gradient(135deg,#e65100,#ff6f00)', img:'https://picsum.photos/seed/pc-repair-oyk/600/400.jpg', tags:[{t:'Hardware Diagnostics',c:'#e65100'},{t:'Windows Install',c:'#1a237e'},{t:'SSD Upgrades',c:'#0288d1'},{t:'Data Recovery',c:'#2e7d32'}] },
          ].map((proj, i) => (
            <div key={i} className={`reveal reveal-delay-${i+1}`}
              style={{ background:'white',borderRadius:'20px',overflow:'hidden',border:'2px solid #f0f0f0',height:'100%',display:'flex',flexDirection:'column',transition:'transform 0.3s, box-shadow 0.3s' }}
              onMouseOver={(e) => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 16px 48px rgba(0,0,0,0.12)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{ overflow:'hidden',position:'relative' }}>
                <span style={{ position:'absolute',top:'14px',left:'14px',padding:'5px 14px',borderRadius:'30px',fontSize:'11px',fontWeight:700,color:'white',background:proj.badgeBg,zIndex:2 }}>{proj.badge}</span>
                <img src={proj.img} alt={proj.title} style={{ width:'100%',height:'200px',objectFit:'cover',display:'block',transition:'transform 0.5s' }}
                  onMouseOver={(e) => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform='scale(1)'} />
              </div>
              <div style={{ padding:'28px',flex:1,display:'flex',flexDirection:'column' }}>
                <h3 style={{ ...fontStyle,fontWeight:800,fontSize:'20px',color:'#0a0a0a',marginBottom:'10px' }}>{proj.title}</h3>
                <p style={{ fontSize:'14px',color:'#777',lineHeight:1.75,marginBottom:'20px',flex:1 }}>{proj.desc}</p>
                <div className="proj-tags">
                  {proj.tags.map((tag, j) => (
                    <span key={j} style={{ padding:'5px 12px',borderRadius:'30px',fontSize:'12px',fontWeight:600,border:`1.5px solid ${tag.c}30`,color:tag.c,background:`${tag.c}08` }}>{tag.t}</span>
                  ))}
                </div>
                <a href="#" style={{ display:'inline-flex',alignItems:'center',gap:'6px',marginTop:'20px',fontSize:'14px',fontWeight:700,color:'#1a237e',transition:'gap 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.gap='10px'} onMouseOut={(e) => e.currentTarget.style.gap='6px'}>View Project →</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="section-pad" style={{ padding:'100px 80px',background:'white' }}>
        <div className="reveal" style={{ maxWidth:'500px',marginBottom:'60px' }}>
          <div style={{ color:'#ff6f00',fontWeight:700,fontSize:'14px',marginBottom:'10px' }}>MY SKILLS</div>
          <h2 className="section-title-m" style={{ fontWeight:800,color:'#0a0a0a',fontSize:'36px',...fontStyle }}>Technologies & tools I work with</h2>
        </div>
        <div className="grid-skills">
          {skillCategories.map((cat, i) => (
            <div key={i} className={`reveal reveal-delay-${i+1}`}
              style={{ background:'white',borderRadius:'20px',padding:'28px',border:'2px solid #f0f0f0',transition:'transform 0.3s, box-shadow 0.3s' }}
              onMouseOver={(e) => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.08)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{ width:'48px',height:'48px',borderRadius:'12px',background:`${cat.color}14`,border:`2px solid ${cat.color}22`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'16px',fontSize:'22px' }}>{cat.icon}</div>
              <div style={{ ...fontStyle,fontWeight:700,fontSize:'16px',color:'#0a0a0a',marginBottom:'16px' }}>{cat.title}</div>
              <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
                {cat.skills.map((sk, j) => (
                  <div key={j} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:'8px' }}>
                    <span style={{ fontSize:'14px',color:'#555',fontWeight:500,flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{sk.name}</span>
                    <div style={{ width:'80px',height:'6px',background:'#e8e8e8',borderRadius:'3px',overflow:'hidden',flexShrink:0 }}>
                      <div className="skill-bar-fill" data-width={`${sk.level}%`} style={{ height:'100%',borderRadius:'3px',background:`linear-gradient(90deg,${cat.color},${cat.color}cc)` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY WORK WITH ME */}
      <section className="section-pad" style={{ padding:'100px 80px',background:'#f0f2f8' }}>
        <div className="grid-why">
          <div className="reveal" style={{ flex:1,minWidth:'300px' }}>
            <div style={{ color:'#ff6f00',fontWeight:700,fontSize:'14px',marginBottom:'10px' }}>WHY WORK WITH ME</div>
            <h2 className="section-title-m" style={{ fontWeight:800,color:'#0a0a0a',fontSize:'36px',...fontStyle }}>You get more than just a developer</h2>
            <ul style={{ listStyle:'none',marginTop:'32px',display:'flex',flexDirection:'column',gap:'18px' }}>
              {['Deliver clean, scalable solutions','Strong analytical and problem-solving skills','Excellent communication','Passion for education and technology','Reliable technical support'].map((item, i) => (
                <li key={i} style={{ display:'flex',alignItems:'flex-start',gap:'14px',fontSize:'16px',color:'#555',lineHeight:1.6 }}>
                  <div style={{ width:'28px',height:'28px',borderRadius:'50%',background:'#2e7d32',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'1px',color:'white',fontWeight:700,fontSize:'14px' }}>✓</div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal reveal-delay-2" style={{ flex:1,minWidth:'300px',maxWidth:'480px' }}>
            <div style={{ background:'linear-gradient(135deg,#1a237e,#0288d1)',borderRadius:'20px',padding:'40px',color:'white',position:'relative',overflow:'hidden' }}>
              <div style={{ position:'absolute',top:'-40%',right:'-20%',width:'300px',height:'300px',background:'rgba(255,255,255,0.06)',borderRadius:'50%' }}></div>
              <div data-count="3" style={{ ...fontStyle,fontWeight:800,fontSize:'48px',position:'relative',zIndex:1 }}>0</div>
              <div style={{ fontSize:'15px',color:'rgba(255,255,255,0.8)',marginBottom:'24px',position:'relative',zIndex:1 }}>Years of Experience</div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',position:'relative',zIndex:1 }}>
                {[{v:'15',l:'Projects'},{v:'500',l:'Students'},{v:'200',l:'Repairs'},{v:'50',l:'Clients'}].map((s,i) => (
                  <div key={i} style={{ background:'rgba(255,255,255,0.12)',borderRadius:'12px',padding:'16px',textAlign:'center' }}>
                    <div data-count={s.v} style={{ ...fontStyle,fontWeight:800,fontSize:'24px' }}>0</div>
                    <div style={{ fontSize:'12px',color:'rgba(255,255,255,0.7)',marginTop:'2px' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="section-pad" style={{ padding:'100px 80px',background:'#fafafa' }}>
        <div className="reveal" style={{ textAlign:'center',marginBottom:'60px' }}>
          <div style={{ color:'#ff6f00',fontWeight:700,fontSize:'14px',marginBottom:'10px' }}>TESTIMONIALS</div>
          <h2 className="section-title-m" style={{ fontWeight:800,color:'#0a0a0a',fontSize:'36px',...fontStyle }}>What people say about me</h2>
        </div>
        <div className="grid-testimonials">
          {[
            { name:'Adebayo K.', role:'Business Owner, Lagos', text:'"Toheeb built our e-commerce platform from scratch. His attention to detail and understanding of business needs made the entire process smooth. Our sales increased by 40% in the first month."', color:'#1a237e' },
            { name:'Fatima M.', role:'SS3 Student, Kano', text:'"Nairafame Academy changed how I see mathematics. The lessons are clear, the quizzes help me practice, and I went from failing to scoring B3 in WAEC. Best platform!"', color:'#2e7d32' },
            { name:'Chidi E.', role:'University Student, Enugu', text:'"My laptop was running slow and overheating. Toheeb diagnosed the issue, upgraded my RAM and SSD, and now it runs like new. Fast, affordable, professional."', color:'#e65100' },
          ].map((t, i) => (
            <div key={i} className={`reveal reveal-delay-${i+1}`}
              style={{ background:'white',borderRadius:'20px',border:'2px solid #f0f0f0',padding:'30px',height:'100%',transition:'transform 0.3s' }}
              onMouseOver={(e) => e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform='translateY(0)'}>
              <div style={{ display:'flex',gap:'2px',marginBottom:'20px' }}>{'⭐'.repeat(5).split('').map((s,j) => <span key={j} style={{ fontSize:'18px' }}>{s}</span>)}</div>
              <p style={{ fontSize:'15px',color:'#333',lineHeight:1.8,marginBottom:'24px',fontStyle:'italic' }}>{t.text}</p>
              <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>
                <div style={{ width:'48px',height:'48px',borderRadius:'50%',background:`linear-gradient(135deg,${t.color},${t.color}cc)`,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:'18px',...fontStyle }}>{t.name[0]}</div>
                <div>
                  <div style={{ ...fontStyle,fontWeight:700,fontSize:'15px',color:'#0a0a0a' }}>{t.name}</div>
                  <div style={{ fontSize:'13px',color:'#999' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section-pad" style={{ background:'#0a0a0a',padding:'100px 80px',textAlign:'center',color:'white' }}>
        <div className="reveal" style={{ fontSize:'48px',marginBottom:'20px' }}>📨</div>
        <h2 className="reveal reveal-delay-1" style={{ fontWeight:800,fontSize:'42px',color:'white',marginBottom:'16px',...fontStyle }}>Let's work together.</h2>
        <p className="reveal reveal-delay-2" style={{ color:'rgba(255,255,255,0.7)',fontSize:'17px',maxWidth:'500px',margin:'0 auto 40px',lineHeight:1.7 }}>Whether you need a software solution, an e-commerce store, IT support, or mathematics tutoring — I'm ready to help.</p>
        <div className="contact-links reveal reveal-delay-3">
          {[
            { label:'📧 Email', href:'mailto:oyekolatoheeb@email.com' },
            { label:'📱 WhatsApp', href:'https://wa.me/234XXXXXXXXXX' },
            { label:'🌐 GitHub', href:'https://github.com/oyekolatoheeb' },
            { label:'💼 LinkedIn', href:'https://linkedin.com/in/oyekolatoheeb' },
          ].map((link, i) => (
            <a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex',alignItems:'center',gap:'10px',padding:'16px 28px',borderRadius:'8px',fontSize:'15px',fontWeight:600,border:'2px solid rgba(255,255,255,0.15)',color:'white',transition:'all 0.2s',...bodyFont }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor='#ff6f00'; e.currentTarget.style.background='rgba(255,111,0,0.1)'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translateY(0)'; }}>
              {link.label}
            </a>
          ))}
        </div>
        <div className="contact-cta-row reveal reveal-delay-4">
          <button onClick={() => window.open('https://wa.me/234XXXXXXXXXX','_blank')} style={{ background:'#ff6f00',color:'white',padding:'18px 48px',fontSize:'17px',fontWeight:700,borderRadius:'8px',border:'none',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'8px',boxShadow:'0 4px 15px rgba(255,111,0,0.3)',...bodyFont }}>Start a Conversation →</button>
          <button style={{ background:'transparent',color:'white',padding:'18px 48px',fontSize:'17px',fontWeight:600,borderRadius:'8px',border:'2px solid rgba(255,255,255,0.3)',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:'8px',...bodyFont }}>⬇ Download CV</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-pad grid-footer" style={{ background:'#050505',padding:'60px 80px',color:'white' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
          <span style={{ color:'#ff6f00' }}>🎓</span>
          <span style={{ ...fontStyle,fontWeight:800,fontSize:'16px' }}>Oyekola<span style={{ color:'#ff6f00' }}>Toheeb</span></span>
        </div>
        <span style={{ fontSize:'13px',color:'rgba(255,255,255,0.4)' }}>Software Engineer • Educator • Entrepreneur</span>
        <hr style={{ border:'none',borderTop:'1px solid rgba(255,255,255,0.08)',width:'100%',margin:'0' }} />
        <div style={{ width:'100%',textAlign:'center',fontSize:'13px',color:'rgba(255,255,255,0.3)' }}>© 2025 Oyekola Toheeb. All Rights Reserved. • Built with ❤️ on Nairafame Academy</div>
      </footer>

    </div>
  );
}

export default Portfolio;