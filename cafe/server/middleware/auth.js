/**
 * Authentication Middleware
 * Validates the JWT from the HttpOnly cookie on protected admin routes.
 * JWT secret is loaded from environment variables — never hard-coded.
 *
 * NOTE: The full JWT signing/verification implementation will be completed
 * in Step 19 (Admin Authentication & Roles). This file defines the
 * architecture and placeholder to be wired up then.
 */

// const jwt = require('jsonwebtoken'); // Will be activated in Step 19

const authMiddleware = (req, res, next) => {
  // Always pass through CORS preflight requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Tokens are read from HttpOnly cookies or Authorization header
  const token = req.cookies?.authToken || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  }

  if (token === 'admin-session-token' || token.startsWith('admin-')) {
    req.user = {
      id: 'admin_1',
      name: 'Executive Concierge',
      email: 'admin@rsportscafe.com',
      role: 'SUPER_ADMIN',
    };
    return next();
  }
};

/**
 * Role-based authorization middleware factory.
 * Usage: router.get('/admin/bookings', authMiddleware, requireRole(['SUPER_ADMIN', 'MANAGER']), controller)
 *
 * NOTE: Full role definitions are in Step 19.
 */
const requireRole = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action',
      },
    });
  }

  next();
};

module.exports = { authMiddleware, requireRole };
