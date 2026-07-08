import React, { useState } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const bodyFont = { fontFamily: "'Inter', sans-serif" };
const fontStyle = { fontFamily: "'Space Grotesk', sans-serif" };

const MATHJAX_SCRIPT = `
<script>
  window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
      displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
    },
    options: {
      skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
    }
  };
</script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/dist/tex-mml-chtml.js"></script>
`;

function cleanGoogleDocsHtml(html) {
  if (!html) return html;

  // 1. Remove polyfill.io script (causes login prompts)
  html = html.replace(/<script[^>]*polyfill\.io[^>]*><\/script>/gi, '');

  // 2. Remove any existing MathJax scripts to avoid duplicates
  html = html.replace(/<script[^>]*MathJax[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*mathjax[^>]*><\/script>/gi, '');

  // 3. Replace broken local image paths with a placeholder notice
  html = html.replace(
    /src="images\/[^"]+"/gi,
    'src="" alt="[Image not available - please upload images separately]" style="display:inline-block;background:#fff3e0;border:1px dashed #ff6f00;padding:4px 8px;border-radius:4px;font-size:12px;color:#ff6f00;" onerror="this.style.display=\'inline-block\'"'
  );

  // 4. Inject MathJax into <head> if it exists
  if (html.includes('<head>')) {
    html = html.replace('<head>', '<head>' + MATHJAX_SCRIPT);
  } else if (html.includes('</head>')) {
    html = html.replace('</head>', MATHJAX_SCRIPT + '</head>');
  } else {
    // No head tag — prepend MathJax
    html = MATHJAX_SCRIPT + html;
  }

  // 5. Add responsive base styles if not present
  const baseStyle = `
<style>
  body { 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    line-height: 1.7 !important;
    padding: 16px !important;
    color: #333 !important;
    max-width: 100% !important;
  }
  img { max-width: 100% !important; height: auto !important; }
  table { max-width: 100% !important; overflow-x: auto !important; display: block !important; }
</style>`;

  if (html.includes('</head>')) {
    html = html.replace('</head>', baseStyle + '</head>');
  } else {
    html = baseStyle + html;
  }

  return html;
}

function HtmlFields({ data, setData }) {
  const [preview, setPreview] = useState(false);
  const [cleaned, setCleaned] = useState(false);

  const handleClean = () => {
    const fixedHtml = cleanGoogleDocsHtml(data.html_content);
    setData({ ...data, html_content: fixedHtml });
    setCleaned(true);
    setTimeout(() => setCleaned(false), 3000);
  };

  const previewHtml = data.html_content || '';

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
              Paste your Google Docs HTML here, then click <strong>"Auto-Fix HTML"</strong> to clean it up and enable math rendering automatically.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Toolbar */}
      <Box style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
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
          variant="outlined"
          size="small"
          startIcon={<AutoFixHighIcon />}
          onClick={handleClean}
          style={{
            borderColor: '#ff6f00', color: '#ff6f00',
            textTransform: 'none', fontWeight: '700', ...bodyFont
          }}>
          Auto-Fix HTML ✨
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

      {cleaned && (
        <Alert severity="success" style={{ marginBottom: '10px', borderRadius: '8px' }}>
          ✅ HTML fixed! MathJax injected, broken images flagged. Click Preview to see it.
        </Alert>
      )}

      {!preview ? (
        <Box>
          <textarea
            value={data.html_content || ''}
            onChange={e => setData({ ...data, html_content: e.target.value })}
            placeholder="Paste your full Google Docs HTML here, then click Auto-Fix HTML..."
            style={{
              width: '100%', height: '300px', padding: '14px',
              border: '1px solid #ccc', borderRadius: '8px',
              fontSize: '13px', lineHeight: '1.6',
              fontFamily: 'monospace', resize: 'vertical',
              boxSizing: 'border-box', backgroundColor: '#1e1e1e',
              color: '#d4d4d4'
            }}
          />
          <Typography variant="caption" style={{ color: '#999', marginTop: '6px', display: 'block', ...bodyFont }}>
            Tip: Paste HTML → click Auto-Fix HTML → click Preview to verify → Save Section
          </Typography>
        </Box>
      ) : (
        <Box style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
          {previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              style={{ width: '100%', height: '500px', border: 'none', display: 'block' }}
              title="HTML Preview"
              sandbox="allow-scripts"
            />
          ) : (
            <Box style={{ padding: '40px', textAlign: 'center' }}>
              <Typography style={{ color: '#999', ...bodyFont }}>
                No HTML content yet. Paste HTML in the Edit tab first.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default HtmlFields;