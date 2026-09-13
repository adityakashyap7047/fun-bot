function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Please log in' });
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.status(403).json({ error: 'Admin access required' });
}

module.exports = { ensureAuth, ensureAdmin };
