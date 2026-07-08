import React, { useState } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

const bodyFont = { fontFamily: "'Inter', sans-serif" };
const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };

function HtmlFields({ data, setData }) {
  const [preview, setPreview] = useState(false);

  return (
    <Box style={{ marginTop: '12px' }}>
      <Box style={{ backgroundColor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
        <Box style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <CodeIcon style={{ color: '#2e7d32', marginTop: '2px' }} />
          <Box>
            <Typography style={{ fontWeight: '700', color: '#2e7d32', marginBottom: '4px', ...fontStyle }}>
              HTML Content Section
            </Typography>
            <Typography variant="body2" style={{ color: '#388e3c', lineHeight: '1.6', ...bodyFont }}>
              Paste your full HTML file here. Math equations using <code>$...$</code> and <code>$$...$$</code> will render automatically via MathJax.
              Make sure to remove the <code>polyfill.io</code> script line if present.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <Button
          variant={!preview ? 'contained' : 'outlined'}
          size="small"
          startIcon={<EditIcon />}
          onClick={() => setPreview(false)}
          style={{
            backgroundColor: !preview ? '#1a237e' : 'transparent',
            color: !preview ? 'white' : '#1a237e',
            borderColor: '#1a237e',
            textTransform: 'none', fontWeight: '700', ...bodyFont
          }}>
          Edit HTML
        </Button>
        <Button
          variant={preview ? 'contained' : 'outlined'}
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => setPreview(true)}
          style={{
            backgroundColor: preview ? '#1a237e' : 'transparent',
            color: preview ? 'white' : '#1a237e',
            borderColor: '#1a237e',
            textTransform: 'none', fontWeight: '700', ...bodyFont
          }}>
          Preview
        </Button>
      </Box>

      {!preview ? (
        <textarea
          value={data.html_content || ''}
          onChange={e => setData({ ...data, html_content: e.target.value })}
          placeholder={`Paste your full HTML here...\n\nExample:\n<!DOCTYPE html>\n<html>\n<head>\n  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/dist/tex-mml-chtml.js"></script>\n</head>\n<body>\n  <h1>My Lesson</h1>\n  <p>Inline math: $x^2 + y^2$</p>\n  $$\\frac{a}{b} = c$$\n</body>\n</html>`}
          style={{
            width: '100%', height: '300px', padding: '14px',
            border: '1px solid #ccc', borderRadius: '8px',
            fontSize: '13px', lineHeight: '1.6',
            fontFamily: 'monospace', resize: 'vertical',
            boxSizing: 'border-box', backgroundColor: '#1e1e1e',
            color: '#d4d4d4'
          }}
        />
      ) : (
        <Box style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
          {data.html_content ? (
            <iframe
              srcDoc={data.html_content}
              style={{ width: '100%', height: '400px', border: 'none', display: 'block' }}
              title="HTML Preview"
              sandbox="allow-scripts"
            />
          ) : (
            <Box style={{ padding: '40px', textAlign: 'center' }}>
              <Typography style={{ color: '#999', ...bodyFont }}>No HTML content yet. Write some in the Edit tab.</Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default HtmlFields;