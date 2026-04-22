import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const getPlainPassword = () => String(process.env.ADMIN_PASSWORD || '');
const getPasswordHash = () => String(process.env.ADMIN_PASSWORD_HASH || '').trim();

const safeEqualString = (a, b) => {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

const verifyPassword = async (candidate) => {
  const hash = getPasswordHash();
  if (hash) {
    return bcrypt.compare(candidate, hash);
  }
  const plain = getPlainPassword();
  if (!plain) return false;
  return safeEqualString(candidate, plain);
};

export const login = async (req, res) => {
  try {
    const loginValue = String(req.body?.login || '').trim();
    const password = String(req.body?.password || '');

    const adminLogin = String(process.env.ADMIN_LOGIN || '').trim();
    const jwtSecret = String(process.env.JWT_SECRET || '').trim();
    const hasHash = Boolean(getPasswordHash());
    const hasPlain = getPlainPassword().length > 0;

    if (!adminLogin || !jwtSecret || (!hasHash && !hasPlain)) {
      return res.status(500).json({
        success: false,
        message: 'Admin login is not configured (ADMIN_LOGIN, JWT_SECRET, ADMIN_PASSWORD_HASH or ADMIN_PASSWORD).',
      });
    }

    if (!loginValue || !password) {
      return res.status(400).json({
        success: false,
        message: 'Login and password are required',
      });
    }

    if (loginValue !== adminLogin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const ok = await verifyPassword(password);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      { sub: 'admin', login: adminLogin },
      jwtSecret,
      { expiresIn: '7d' },
    );

    return res.json({
      success: true,
      token,
      expiresIn: 7 * 24 * 60 * 60,
    });
  } catch (err) {
    console.error('[auth] login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};
