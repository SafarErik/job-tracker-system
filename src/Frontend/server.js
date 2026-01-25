const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the dist directory
// angular.json outputPath: "dist/frontend/browser"
const distPath = path.join(__dirname, 'dist', 'frontend', 'browser');

// Dynamic env.js endpoint
app.get('/env.js', (req, res) => {
    const env = {
        API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5053/api',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || ''
    };

    res.set('Content-Type', 'application/javascript');
    res.send(`(function(window) {
    window.__env = window.__env || {};
    window.__env.API_BASE_URL = '${env.API_BASE_URL}';
    window.__env.GOOGLE_CLIENT_ID = '${env.GOOGLE_CLIENT_ID}';
  })(this);`);
});

// Serve static files
app.use(express.static(distPath));

// Fallback to index.html for Angular routing
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Serving app from: ${distPath}`);
});
