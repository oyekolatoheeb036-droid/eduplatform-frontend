import React, { useState, useRef } from 'react';
import { Box, Typography, Button, Paper, Tabs, Tab, Divider } from '@mui/material';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ImageIcon from '@mui/icons-material/Image';

const mathExamples = [
  { label: 'Fraction', value: '\\frac{a}{b}' },
  { label: 'Square Root', value: '\\sqrt{x}' },
  { label: 'Power', value: 'x^{2}' },
  { label: 'Sum', value: '\\sum_{i=1}^{n}' },
  { label: 'Integral', value: '\\int_{a}^{b}' },
  { label: 'Pi', value: '\\pi' },
  { label: 'Infinity', value: '\\infty' },
  { label: 'Alpha', value: '\\alpha' },
  { label: 'Beta', value: '\\beta' },
  { label: 'Theta', value: '\\theta' },
  { label: 'Delta', value: '\\delta' },
  { label: 'Sigma', value: '\\sigma' },
];

const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

// ── Inline renderer ──
function renderInline(text) {
  if (!text) return null;
  const parts = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    const inlineMathMatch = remaining.match(/^\$([^$]+)\$/);
    if (inlineMathMatch) {
      try { parts.push(<InlineMath key={keyIndex++} math={inlineMathMatch[1]} />); }
      catch { parts.push(<span key={keyIndex++} style={{ color: 'red' }}>Invalid math</span>); }
      remaining = remaining.slice(inlineMathMatch[0].length);
      continue;
    }
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={keyIndex++} style={{ fontWeight: '700' }}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }
    const italicMatch = remaining.match(/^\*(.+?)\*/);
    if (italicMatch) {
      parts.push(<em key={keyIndex++}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }
    const nextSpecial = remaining.search(/\$|\*|\[/);
    if (nextSpecial === -1) { parts.push(<span key={keyIndex++}>{remaining}</span>); remaining = ''; }
    else if (nextSpecial === 0) { parts.push(<span key={keyIndex++}>{remaining[0]}</span>); remaining = remaining.slice(1); }
    else { parts.push(<span key={keyIndex++}>{remaining.slice(0, nextSpecial)}</span>); remaining = remaining.slice(nextSpecial); }
  }
  return parts;
}

// ── Main content renderer ──
function renderContent(content) {
  if (!content) return null;
  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      elements.push(<Box key={`space-${i}`} style={{ height: '10px' }} />);
      i++; continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <Typography key={i} style={{ fontWeight: '800', fontSize: '22px', color: '#0a0a0a', marginTop: '24px', marginBottom: '8px', ...fontStyle }}>
          {renderInline(line.slice(2))}
        </Typography>
      );
      i++; continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <Typography key={i} style={{ fontWeight: '800', fontSize: '18px', color: '#1a237e', marginTop: '18px', marginBottom: '6px', ...fontStyle }}>
          {renderInline(line.slice(3))}
        </Typography>
      );
      i++; continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <Typography key={i} style={{ fontWeight: '700', fontSize: '16px', color: '#333', marginTop: '14px', marginBottom: '4px', ...fontStyle }}>
          {renderInline(line.slice(4))}
        </Typography>
      );
      i++; continue;
    }
    if (line.trim() === '---') {
      elements.push(<Divider key={i} style={{ margin: '16px 0' }} />);
      i++; continue;
    }
    if (line.startsWith('$$') && line.endsWith('$$') && line.length > 4) {
      try { elements.push(<Box key={i} style={{ margin: '12px 0', overflowX: 'auto' }}><BlockMath math={line.slice(2, -2)} /></Box>); }
      catch { elements.push(<span key={i} style={{ color: 'red' }}>Invalid equation</span>); }
      i++; continue;
    }
    if (line.trim() === '$$') {
      i++;
      const mathLines = [];
      while (i < lines.length && lines[i].trim() !== '$$') { mathLines.push(lines[i]); i++; }
      i++;
      try { elements.push(<Box key={i} style={{ margin: '12px 0', overflowX: 'auto' }}><BlockMath math={mathLines.join('\n')} /></Box>); }
      catch { elements.push(<span key={i} style={{ color: 'red' }}>Invalid equation</span>); }
      continue;
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const bulletLines = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('• '))) {
        bulletLines.push(lines[i].slice(2)); i++;
      }
      elements.push(
        <Box key={`ul-${i}`} component="ul" style={{ paddingLeft: '24px', margin: '6px 0 12px 0' }}>
          {bulletLines.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>
              <Typography variant="body1" style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', ...bodyFont }}>
                {renderInline(item)}
              </Typography>
            </li>
          ))}
        </Box>
      );
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const numberedLines = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { numberedLines.push(lines[i].replace(/^\d+\.\s/, '')); i++; }
      elements.push(
        <Box key={`ol-${i}`} component="ol" style={{ paddingLeft: '24px', margin: '6px 0 12px 0' }}>
          {numberedLines.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>
              <Typography variant="body1" style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', ...bodyFont }}>
                {renderInline(item)}
              </Typography>
            </li>
          ))}
        </Box>
      );
      continue;
    }
    if (line.startsWith('> ')) {
      elements.push(
        <Box key={i} style={{ borderLeft: '4px solid #1a237e', backgroundColor: '#f5f7ff', borderRadius: '0 8px 8px 0', padding: '10px 16px', margin: '10px 0' }}>
          <Typography style={{ fontSize: '16px', lineHeight: '1.8', color: '#1a237e', fontStyle: 'italic', ...bodyFont }}>
            {renderInline(line.slice(2))}
          </Typography>
        </Box>
      );
      i++; continue;
    }
    const imageMatch = line.match(/^\[IMAGE:(.*)\]$/);
    if (imageMatch) {
      elements.push(
        <Box key={i} style={{ margin: '12px 0' }}>
          <img src={imageMatch[1]} alt="lesson content" style={{ maxWidth: '100%', borderRadius: '10px', display: 'block', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }} />
        </Box>
      );
      i++; continue;
    }
    elements.push(
      <Typography key={i} variant="body1" style={{ fontSize: '16px', lineHeight: '1.9', color: '#333', marginBottom: '4px', ...bodyFont }}>
        {renderInline(line)}
      </Typography>
    );
    i++;
  }
  return elements;
}

function MathEditor({ value, onChange, label }) {
  const [tab, setTab] = useState(0);
  const [mathInput, setMathInput] = useState('');
  const [mathPreview, setMathPreview] = useState('');
  const [mathError, setMathError] = useState('');
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleMathPreview = () => {
    if (mathInput) { setMathPreview(mathInput); setMathError(''); }
  };

  const insertMath = () => {
    if (mathInput) {
      onChange((value || '') + '\n' + `$$${mathInput}$$`);
      setMathInput('');
      setMathPreview('');
      setTab(0);
    }
  };

  // Insert formatting at cursor position
  const insertAtCursor = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = (value || '').slice(start, end);
    const newValue = (value || '').slice(0, start) + before + selected + after + (value || '').slice(end);
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file, preview: URL.createObjectURL(file),
      uploading: false, url: null, name: file.name
    }));
    setImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  };

  const handleUploadImage = async (index) => {
    const img = images[index];
    if (!img || img.uploading || img.url) return;
    setImages(prev => prev.map((im, i) => i === index ? { ...im, uploading: true } : im));
    try {
      const formData = new FormData();
      formData.append('image', img.file);
      const res = await fetch('https://eduplatform-api-pol1.onrender.com/api/upload/image', { method: 'POST', body: formData });
      const data = await res.json();
      const imageUrl = data.url;
      setImages(prev => prev.map((im, i) => i === index ? { ...im, uploading: false, url: imageUrl } : im));
      onChange((value || '') + `\n[IMAGE:${imageUrl}]\n`);
    } catch (err) {
      setImages(prev => prev.map((im, i) => i === index ? { ...im, uploading: false } : im));
      alert('Image upload failed. Please try again.');
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Box style={{ marginBottom: '20px' }}>
      {label && (
        <Typography variant="subtitle1" style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1a237e' }}>
          {label}
        </Typography>
      )}

      <Tabs value={tab} onChange={(e, v) => setTab(v)} style={{ marginBottom: '10px' }}>
        <Tab label="Write Content" />
        <Tab label="Add Math Equation" />
        <Tab label="Add Image" />
        <Tab label="Preview" />
      </Tabs>

      {/* Write Content Tab */}
      {tab === 0 && (
        <Box>
          {/* Formatting toolbar */}
          <Box style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            {[
              { label: 'H1', tip: 'Big Heading', action: () => insertAtCursor('# ') },
              { label: 'H2', tip: 'Subheading', action: () => insertAtCursor('## ') },
              { label: 'H3', tip: 'Small Heading', action: () => insertAtCursor('### ') },
              { label: 'B', tip: 'Bold', action: () => insertAtCursor('**', '**') },
              { label: 'I', tip: 'Italic', action: () => insertAtCursor('*', '*') },
              { label: '• List', tip: 'Bullet List', action: () => insertAtCursor('- ') },
              { label: '1. List', tip: 'Numbered List', action: () => insertAtCursor('1. ') },
              { label: '❝', tip: 'Blockquote', action: () => insertAtCursor('> ') },
              { label: '─', tip: 'Divider', action: () => onChange((value || '') + '\n---\n') },
            ].map((btn) => (
              <Button key={btn.label} size="small" variant="outlined"
                onClick={btn.action}
                title={btn.tip}
                style={{ minWidth: '40px', padding: '2px 8px', fontSize: '12px', fontWeight: '700', borderColor: '#ddd', color: '#333', textTransform: 'none' }}>
                {btn.label}
              </Button>
            ))}
          </Box>
          <textarea
            ref={textareaRef}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={`Write your lesson content here...\n\nTips:\n# Heading 1\n## Heading 2\n- Bullet point\n1. Numbered list\n**bold** *italic*\n> blockquote`}
            style={{
              width: '100%', height: '220px', padding: '15px',
              border: '1px solid #ccc', borderRadius: '8px',
              fontSize: '15px', lineHeight: '1.7',
              boxSizing: 'border-box', fontFamily: 'monospace', resize: 'vertical'
            }}
          />
          <Typography variant="caption" style={{ color: '#999', marginTop: '4px', display: 'block' }}>
            Use toolbar buttons above or type # for headings, - for bullets, **text** for bold
          </Typography>
        </Box>
      )}

      {/* Math Equation Tab */}
      {tab === 1 && (
        <Paper elevation={2} style={{ padding: '20px', borderRadius: '10px' }}>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: '10px' }}>
            Click an example to insert it, or type your own LaTeX equation:
          </Typography>
          <Box style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
            {mathExamples.map(example => (
              <Button key={example.label} variant="outlined" size="small"
                onClick={() => setMathInput(prev => prev + example.value)}
                style={{ borderColor: '#1a237e', color: '#1a237e', fontSize: '12px' }}>
                {example.label}
              </Button>
            ))}
          </Box>
          <textarea
            value={mathInput}
            onChange={e => setMathInput(e.target.value)}
            placeholder="Type equation e.g: \frac{a}{b} or x^2 + y^2 = z^2"
            style={{
              width: '100%', height: '80px', padding: '10px',
              border: '1px solid #ccc', borderRadius: '8px',
              fontSize: '16px', fontFamily: 'monospace', boxSizing: 'border-box'
            }}
          />
          <Box style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <Button variant="outlined" onClick={handleMathPreview} style={{ borderColor: '#1a237e', color: '#1a237e' }}>
              Preview Equation
            </Button>
            <Button variant="contained" onClick={insertMath} style={{ backgroundColor: '#1a237e' }}>
              Insert into Content
            </Button>
          </Box>
          {mathPreview && (
            <Box style={{ marginTop: '15px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
              <Typography variant="body2" style={{ marginBottom: '8px', color: '#666' }}>Preview:</Typography>
              <BlockMath math={mathPreview} />
            </Box>
          )}
          {mathError && <Typography style={{ color: 'red', marginTop: '10px' }}>{mathError}</Typography>}
        </Paper>
      )}

      {/* Add Image Tab */}
      {tab === 2 && (
        <Paper elevation={2} style={{ padding: '20px', borderRadius: '10px' }}>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: '16px' }}>
            Select one or more images. Click <strong>Insert</strong> on each one you want to add.
          </Typography>
          <Box
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #0288d1', borderRadius: '12px',
              padding: '32px', textAlign: 'center', cursor: 'pointer',
              backgroundColor: '#e3f2fd', marginBottom: '20px'
            }}>
            <ImageIcon style={{ fontSize: '48px', color: '#0288d1', marginBottom: '8px' }} />
            <Typography style={{ fontWeight: '700', color: '#0288d1' }}>Click to select images</Typography>
            <Typography variant="body2" style={{ color: '#666', marginTop: '4px' }}>
              PNG, JPG, GIF supported · Multiple files allowed
            </Typography>
            <input ref={fileInputRef} type="file" accept="image/*" multiple
              style={{ display: 'none' }} onChange={handleImageSelect} />
          </Box>
          {images.length > 0 && (
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {images.map((img, index) => (
                <Box key={index} style={{
                  border: `2px solid ${img.url ? '#4caf50' : '#f0f0f0'}`,
                  borderRadius: '12px', overflow: 'hidden', width: '160px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <img src={img.preview} alt={img.name}
                    style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} />
                  <Box style={{ padding: '8px' }}>
                    <Typography variant="caption" style={{
                      color: '#666', display: 'block', marginBottom: '6px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {img.name}
                    </Typography>
                    <Box style={{ display: 'flex', gap: '4px' }}>
                      {img.url ? (
                        <Button size="small" variant="outlined"
                          onClick={() => onChange((value || '') + `\n[IMAGE:${img.url}]\n`)}
                          style={{ color: '#4caf50', borderColor: '#4caf50', fontSize: '10px', textTransform: 'none', padding: '2px 6px', flex: 1 }}>
                          ✅ Insert Again
                        </Button>
                      ) : (
                        <Button size="small" variant="contained"
                          onClick={() => handleUploadImage(index)}
                          disabled={img.uploading}
                          style={{ backgroundColor: '#0288d1', fontSize: '11px', textTransform: 'none', padding: '2px 8px', flex: 1 }}>
                          {img.uploading ? 'Uploading...' : 'Insert'}
                        </Button>
                      )}
                      <Button size="small" variant="outlined"
                        onClick={() => handleRemoveImage(index)}
                        style={{ color: '#f44336', borderColor: '#f44336', fontSize: '11px', textTransform: 'none', padding: '2px 6px' }}>
                        ✕
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {/* Preview Tab — uses full renderContent */}
      {tab === 3 && (
        <Paper elevation={2} style={{ padding: '24px', borderRadius: '10px', minHeight: '200px' }}>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: '16px', fontWeight: '600' }}>
            Content Preview — this is exactly what students will see:
          </Typography>
          <Divider style={{ marginBottom: '16px' }} />
          {value ? renderContent(value) : (
            <Typography style={{ color: '#ccc', fontStyle: 'italic' }}>Nothing to preview yet. Write content in the first tab.</Typography>
          )}
        </Paper>
      )}
    </Box>
  );
}

export default MathEditor;