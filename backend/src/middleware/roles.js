// Role-based access control middleware
// 'donor' role = Admin-level permissions (can manage system)
// 'receiver' role = General user permissions (can browse, order, donate, etc.)
module.exports = (roles = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!roles.length || roles.includes(req.user.role)) {
    return next();
  }

  return res.status(403).json({ message: 'Forbidden' });
};

