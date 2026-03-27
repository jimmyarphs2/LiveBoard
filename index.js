import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');

// Serve static files from the 'dist' directory
app.use(express.static(distPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Handle SPA routing - serve index.html for all non-file requests
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send(`
        <html>
          <body style="font-family: sans-serif; padding: 2rem; background: #09090b; color: #fafafa;">
            <h1>Deployment Configuration Required</h1>
            <p>The <code>dist</code> folder was not found. This usually means the production build hasn't run yet.</p>
            <p>Please ensure your hosting environment runs <code>npm run build</code> before starting the server.</p>
            <hr style="border: 1px solid #27272a; margin: 2rem 0;" />
            <p style="color: #a1a1aa; font-size: 0.875rem;">Node.js Server is active on port ${PORT}</p>
          </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static files from: ${distPath}`);
});
