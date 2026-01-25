const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// 1. Check local dev path (matches angular.json)
let distPath = path.join(__dirname, 'dist', 'frontend', 'browser');

// 2. Fallback to current directory (Production/Azure)
if (!fs.existsSync(distPath)) {
    distPath = __dirname;
}

// Dynamic env.js endpoint
app.get('/env.js', (req, res) => {
    const env = {
        // ONLY use API_BASE_URL. Frontend__BaseUrl is wrong here!
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
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Error: index.html not found at ' + distPath);
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Serving app from: ${distPath}`);
});