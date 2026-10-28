// Serverless API entrypoint for Vercel deployment
const app = require('../backend/server');

module.exports = (req, res) => {
  // If Vercel rewrote the request to /api/index.js, restore the original request path
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'] || req.headers['x-forwarded-uri'];
  if (matchedPath && (req.url.startsWith('/api/index.js') || req.url === '/api' || req.url === '/api/')) {
    const queryIdx = req.url.indexOf('?');
    const queryString = queryIdx !== -1 ? req.url.slice(queryIdx) : '';
    req.url = matchedPath + queryString;
  }
  return app(req, res);
};

