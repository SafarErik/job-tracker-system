module.exports = (req, res) => {
    const env = {
        API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5053/api',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || ''
    };

    res.setHeader('Content-Type', 'application/javascript');
    res.status(200).send(`(function(window) {
    window.__env = window.__env || {};
    window.__env.API_BASE_URL = '${env.API_BASE_URL}';
    window.__env.GOOGLE_CLIENT_ID = '${env.GOOGLE_CLIENT_ID}';
  })(this);`);
};
