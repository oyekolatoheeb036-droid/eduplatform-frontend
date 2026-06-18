import React, { useState } from 'react';
import { Box, Typography, Divider, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  const isMobile = useMediaQuery('(max-width:768px)');
  const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
  const bodyFont = { fontFamily: "'Inter', sans-serif" };
  const [hoveredSection, setHoveredSection] = useState(null);

  const sections = [
    {
      number: '01',
      icon: '📋',
      title: 'Introduction',
      color: '#1a237e',
      content: `Nairafame Academy ("we", "our", "us") operates nairafame.net, a free online Mathematics learning platform designed specifically for Nigerian secondary school and university students.\n\nThis Privacy Policy explains how we collect, use, store, and protect your personal information when you use our platform. We are committed to protecting your privacy in full compliance with the Nigeria Data Protection Regulation (NDPR) 2019.\n\nBy registering or using Nairafame Academy, you agree to the terms described in this policy.`
    },
    {
      number: '02',
      icon: '📊',
      title: 'Information We Collect',
      color: '#0288d1',
      content: `We collect the following information when you use Nairafame Academy:\n\n• Full name and email address when you register\n• Password (stored in encrypted form — we never see your actual password)\n• Course enrollment and lesson progress data\n• Quiz scores and results\n• Login timestamps and activity logs\n• Device type and browser information for performance optimization\n\nIf you sign in with Google, we receive only your name and email address from Google — nothing else.`
    },
    {
      number: '03',
      icon: '🎯',
      title: 'How We Use Your Information',
      color: '#4caf50',
      content: `We use your information solely to provide and improve our educational services:\n\n• To create and manage your student account\n• To send email verification and important account notifications\n• To track your learning progress across courses and lessons\n• To display your quiz scores and earned badges\n• To personalize your learning experience\n• To improve our platform based on usage patterns\n• To communicate important updates about Nairafame Academy`
    },
    {
      number: '04',
      icon: '🔒',
      title: 'Data Protection & Security',
      color: '#9c27b0',
      content: `We take your privacy and security seriously:\n\n• All passwords are encrypted using industry-standard bcrypt hashing — we cannot read your password\n• All data is transmitted over HTTPS (secure encrypted connection)\n• We use secure, hosted databases with restricted access\n• We do not sell, trade, or share your personal data with third parties\n• We do not use your data for advertising profiling\n• Only authorized administrators can access user account information`
    },
    {
      number: '05',
      icon: '🇳🇬',
      title: 'NDPR Compliance',
      color: '#ff6f00',
      content: `Nairafame Academy operates in full compliance with the Nigeria Data Protection Regulation (NDPR) 2019 issued by the National Information Technology Development Agency (NITDA):\n\n• We collect only data that is necessary for our services\n• Your data is stored securely and never transferred outside secure servers without your consent\n• We do not process your data for any purpose beyond what is stated in this policy\n• You have the right to request access, correction, or deletion of your personal data at any time\n• We will respond to all data-related requests within 72 hours\n• In the event of a data breach, we will notify affected users within 72 hours as required by NDPR`
    },
    {
      number: '06',
      icon: '⚖️',
      title: 'Your Rights as a User',
      color: '#f44336',
      content: `As a Nairafame Academy user, you have the following rights:\n\n• Right to Access — You can request a copy of all personal data we hold about you\n• Right to Correction — You can request correction of inaccurate personal information\n• Right to Deletion — You can request deletion of your account and all associated data\n• Right to Withdraw Consent — You can withdraw consent to data processing at any time\n• Right to Data Portability — You can request your data in a readable format\n• Right to Object — You can object to how we process your data\n\nTo exercise any of these rights, email us at nairafameonline@gmail.com. We will respond within 48 hours.`
    },
    {
      number: '07',
      icon: '🔵',
      title: 'Google Sign In',
      color: '#0288d1',
      content: `When you use Google Sign In on Nairafame Academy:\n\n• We receive only your name and email address from Google\n• We do not access your Google Drive, Gmail, contacts, or any other Google services\n• Your Google account password is never shared with us\n• You can revoke Nairafame Academy's access anytime through your Google account settings at myaccount.google.com`
    },
    {
      number: '08',
      icon: '🤝',
      title: 'Third Party Services',
      color: '#4caf50',
      content: `Nairafame Academy uses the following trusted third-party services to operate:\n\n• Resend — for sending verification and notification emails\n• Google OAuth — for Google Sign In functionality\n• Render — for secure backend hosting\n• Vercel — for frontend hosting\n\nEach of these services has their own privacy policies and security standards. We only share the minimum necessary data with each service.`
    },
    {
      number: '09',
      icon: '🍪',
      title: 'Cookies & Local Storage',
      color: '#ff6f00',
      content: `We use browser local storage (similar to cookies) to:\n\n• Keep you logged in between sessions\n• Remember your learning preferences\n• Store your authentication token securely\n\nYou can clear this data at any time by logging out or clearing your browser data. We do not use third-party tracking cookies or advertising cookies.`
    },
    {
      number: '10',
      icon: '👶',
      title: "Children's Privacy",
      color: '#9c27b0',
      content: `Nairafame Academy is designed for secondary school and university students. We do not knowingly collect personal information from children under the age of 13 without parental consent.\n\nIf you are under 13, please have a parent or guardian register on your behalf. If we discover we have collected information from a child under 13 without consent, we will delete it immediately.`
    },
    {
      number: '11',
      icon: '💳',
      title: 'Payment & Premium Services',
      color: '#1a237e',
      content: `Nairafame Academy currently offers free access to all content. In the future, we may introduce premium features. When payment features are introduced:\n\n• Payments will be processed through secure, verified payment gateways\n• We will never store your card details on our servers\n• Refund policies will be clearly communicated before any purchase\n• You will be notified before any free features become paid`
    },
    {
      number: '12',
      icon: '🎓',
      title: 'Academic Integrity',
      color: '#0288d1',
      content: `Nairafame Academy is committed to honest learning:\n\n• Our quizzes are designed for learning, not just passing\n• We encourage students to attempt questions independently before using the AI tutor\n• Any attempt to manipulate quiz results or exploit the platform will result in account suspension\n• Our AI tutor is designed to guide, not to do your work for you`
    },
    {
      number: '13',
      icon: '📧',
      title: 'Contact Us',
      color: '#4caf50',
      content: `If you have any questions, concerns, or requests regarding your privacy or personal data, please contact us:\n\n• Email: nairafameonline@gmail.com\n• Website: nairafame.net\n\nWe will respond to all privacy-related inquiries within 48 hours.`
    },
    {
      number: '14',
      icon: '🔄',
      title: 'Changes to This Policy',
      color: '#ff6f00',
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.\n\nWhen we make significant changes, we will notify registered users by email. The "Last updated" date at the top of this page will always reflect the most recent version.\n\nContinued use of Nairafame Academy after changes constitutes acceptance of the updated policy.`
    },
  ];

  return (
    <Box style={{ background: '#fafafa', minHeight: '100vh', ...bodyFont }}>

      {/* Header */}
      <Box style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%)',
        padding: isMobile ? '40px 24px 60px' : '60px 80px 80px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <Box style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(26,35,126,0.3)' }} />
        <Box style={{ position: 'absolute', bottom: '-80px', right: '200px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(2,136,209,0.2)' }} />

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', position: 'relative' }}>
            <Box style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #1a237e, #0288d1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography style={{ color: 'white', fontWeight: '800', fontSize: '16px' }}>N</Typography>
            </Box>
            <Typography style={{ fontWeight: '700', color: 'white', fontSize: '16px', ...fontStyle }}>
              Nairafame Academy
            </Typography>
          </Box>
        </Link>

        <Box style={{ position: 'relative', maxWidth: '700px' }}>
          <Box style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255,111,0,0.15)',
            border: '1px solid rgba(255,111,0,0.4)',
            borderRadius: '30px',
            padding: '8px 20px',
            marginBottom: '24px'
          }}>
            <Typography variant="body2" style={{ color: '#ff6f00', fontWeight: '600', ...bodyFont }}>
              🔒 Your Privacy Matters
            </Typography>
          </Box>

          <Typography style={{
            fontWeight: '800',
            fontSize: isMobile ? '32px' : '48px',
            lineHeight: '1.15',
            marginBottom: '16px',
            ...fontStyle
          }}>
            Privacy{' '}
            <span style={{ background: 'linear-gradient(135deg, #0288d1, #4caf50)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Policy
            </span>
          </Typography>

          <Typography style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '12px', fontSize: '15px' }}>
            Last updated: June 17, 2026
          </Typography>

          <Typography style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', lineHeight: '1.8', fontSize: '16px' }}>
            At Nairafame Academy, your privacy is important to us. This policy explains clearly and honestly how we handle your personal information. We are committed to protecting your privacy in compliance with the Nigeria Data Protection Regulation (NDPR) 2019.
          </Typography>
        </Box>
      </Box>

      {/* Table of Contents */}
      <Box style={{
        background: 'white',
        padding: isMobile ? '24px' : '32px 80px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <Typography style={{ fontWeight: '700', color: '#0a0a0a', marginBottom: '16px', ...fontStyle }}>
          Table of Contents
        </Typography>
        <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {sections.map((section, index) => (
            <a key={index} href={`#section-${index}`} style={{ textDecoration: 'none' }}>
              <Box style={{
                background: '#f5f5f5',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '13px',
                color: '#555',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                ...bodyFont
              }}>
                {section.number}. {section.title}
              </Box>
            </a>
          ))}
        </Box>
      </Box>

      {/* Sections */}
      <Box style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '32px 20px' : '60px 40px' }}>
        {sections.map((section, index) => (
          <Box
            key={index}
            id={`section-${index}`}
            onMouseEnter={() => setHoveredSection(index)}
            onMouseLeave={() => setHoveredSection(null)}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: isMobile ? '24px' : '36px',
              marginBottom: '20px',
              boxShadow: hoveredSection === index ? '0 8px 30px rgba(0,0,0,0.1)' : '0 2px 12px rgba(0,0,0,0.05)',
              border: hoveredSection === index ? `2px solid ${section.color}22` : '2px solid #f0f0f0',
              transition: 'all 0.3s ease',
              transform: hoveredSection === index ? 'translateY(-3px)' : 'translateY(0)'
            }}
          >
            {/* Section Header */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <Box style={{
                width: isMobile ? '44px' : '52px',
                height: isMobile ? '44px' : '52px',
                borderRadius: '14px',
                background: `${section.color}15`,
                border: `2px solid ${section.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '20px' : '24px',
                flexShrink: 0
              }}>
                {section.icon}
              </Box>
              <Box>
                <Typography style={{ fontSize: '12px', color: section.color, fontWeight: '700', letterSpacing: '1px', ...bodyFont }}>
                  SECTION {section.number}
                </Typography>
                <Typography style={{ fontWeight: '800', fontSize: isMobile ? '16px' : '20px', color: '#0a0a0a', ...fontStyle }}>
                  {section.title}
                </Typography>
              </Box>
            </Box>

            <Divider style={{ marginBottom: '20px', borderColor: '#f5f5f5' }} />

            <Typography style={{
              color: '#555',
              lineHeight: '1.9',
              whiteSpace: 'pre-line',
              fontSize: isMobile ? '14px' : '15px',
              ...bodyFont
            }}>
              {section.content}
            </Typography>
          </Box>
        ))}

        {/* Contact Card */}
        <Box style={{
          background: 'linear-gradient(135deg, #1a237e, #0288d1)',
          borderRadius: '20px',
          padding: isMobile ? '28px' : '40px',
          textAlign: 'center',
          marginTop: '8px',
          color: 'white'
        }}>
          <Typography style={{ fontSize: '40px', marginBottom: '16px' }}>📬</Typography>
          <Typography style={{ fontWeight: '800', fontSize: isMobile ? '20px' : '24px', marginBottom: '10px', ...fontStyle }}>
            Questions about your privacy?
          </Typography>
          <Typography style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px', lineHeight: '1.7' }}>
            We're always happy to help. Reach out to us anytime and we'll respond within 48 hours.
          </Typography>
          <Box style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '14px 24px',
            display: 'inline-block'
          }}>
            <Typography style={{ fontWeight: '700', fontSize: '16px' }}>
              📧 nairafameonline@gmail.com
            </Typography>
          </Box>
        </Box>

        {/* Footer */}
        <Box style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '20px' }}>
          <Divider style={{ marginBottom: '24px' }} />
          <Typography style={{ color: '#999', fontSize: '14px', marginBottom: '12px', ...bodyFont }}>
            © 2026 Nairafame Academy. All rights reserved.
          </Typography>
          <Link to="/" style={{ color: '#1a237e', textDecoration: 'none', fontWeight: '700', fontSize: '14px', ...bodyFont }}>
            ← Back to Home
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

export default PrivacyPolicy;