import React, { useState, useRef } from 'react';
import { Box, Typography, Button, Paper, Tabs, Tab } from '@mui/material';
import { BlockMath } from 'react-katex';
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

function MathEditor({ value, onChange, label }) {
  const [tab, setTab] = useState(0);
  const [mathInput, setMathInput] = useState('');
  const [mathPreview, setMathPreview] = useState('');
  const [mathError, setMathError] = useState('');
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

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

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      url: null,
      name: file.name
    }));
    setImages(prev => [...prev, ...newImages]);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleUploadImage = async (index) => {
    const img = images[index];
    if (!img || img.uploading || img.url) return;

    setImages(prev => prev.map((im, i) => i === index ? { ...im, uploading: true } : im));

    try {
      const formData = new FormData();
      formData.append('image', img.file);
      const res = await fetch('https://eduplatform-api-pol1.onrender.com//api/upload/image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      const imageUrl = data.url;

      // Mark as inserted but KEEP in list so others can still be inserted
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
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Write your lesson content here..."
          style={{
            width: '100%', height: '200px', padding: '15px',
            border: '1px solid #ccc', borderRadius: '8px',
            fontSize: '16px', lineHeight: '1.6',
            boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', resize: 'vertical'
          }}
        />
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
            Select one or more images. Click <strong>Insert</strong> on each one you want to add — inserted images stay visible so you can add others too.
          </Typography>

          {/* Upload area */}
          <Box
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #0288d1', borderRadius: '12px',
              padding: '32px', textAlign: 'center', cursor: 'pointer',
              backgroundColor: '#e3f2fd', marginBottom: '20px'
            }}
          >
            <ImageIcon style={{ fontSize: '48px', color: '#0288d1', marginBottom: '8px' }} />
            <Typography style={{ fontWeight: '700', color: '#0288d1' }}>Click to select images</Typography>
            <Typography variant="body2" style={{ color: '#666', marginTop: '4px' }}>
              PNG, JPG, GIF supported · Multiple files allowed
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />
          </Box>

          {/* Image previews — always visible, insert button re-enabled if not yet inserted */}
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
                        // Already inserted — show green label but still allow re-insert
                        <Button size="small" variant="outlined"
                          onClick={() => {
                            // Re-insert into content
                            onChange((value || '') + `\n[IMAGE:${img.url}]\n`);
                          }}
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

      {/* Preview Tab */}
      {tab === 3 && (
        <Paper elevation={2} style={{ padding: '20px', borderRadius: '10px', minHeight: '200px' }}>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: '10px' }}>Content Preview:</Typography>
          {(value || '').split('$$').map((part, index) => {
            if (index % 2 === 1) {
              try { return <BlockMath key={index} math={part} />; }
              catch (e) { return <span key={index} style={{ color: 'red' }}>Invalid equation</span>; }
            }
            return part.split('\n').map((line, li) => {
              const imageMatch = line.match(/^\[IMAGE:(.*)\]$/);
              if (imageMatch) {
                return <img key={`${index}-${li}`} src={imageMatch[1]} alt="lesson"
                  style={{ maxWidth: '100%', borderRadius: '8px', margin: '8px 0', display: 'block' }} />;
              }
              return (
                <Typography key={`${index}-${li}`} style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{line}</Typography>
              );
            });
          })}
        </Paper>
      )}
    </Box>
  );
}

export default MathEditor;