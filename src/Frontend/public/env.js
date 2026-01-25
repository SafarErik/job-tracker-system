(function (window) {
  window.__env = window.__env || {};

  // Default values (can be overridden at deploy time)
  window.__env.API_BASE_URL = 'http://localhost:5053/api';
  window.__env.GOOGLE_CLIENT_ID = '';
})(this);
