import jwt from 'jsonwebtoken';

const readBearerToken = (req) => {
  const bearer = req.get('authorization');
  if (!bearer?.startsWith('Bearer ')) return '';
  return bearer.slice('Bearer '.length).trim();
};

export const requireAdminJwt = (req, res, next) => {
  const secret = String(process.env.JWT_SECRET || '').trim();
  if (!secret) {
    return res.status(500).json({
      success: false,
      message: 'JWT_SECRET is not configured on server.',
    });
  }
  const token = readBearerToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }
  try {
    const payload = jwt.verify(token, secret);
    if (payload?.sub !== 'admin' || !payload?.login) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }
    req.admin = payload;
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }
};
