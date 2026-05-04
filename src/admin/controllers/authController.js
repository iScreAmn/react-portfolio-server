import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository.js';

const JWT_EXPIRES_IN = '12h';

const buildJwt = (user) => {
  const secret = String(process.env.JWT_SECRET || '').trim();
  if (!secret) throw new Error('JWT_SECRET is not configured');

  return jwt.sign(
    {
      sub: user.id,
      login: user.login,
      role: user.role,
      pwdAt: user.passwordUpdatedAt || user.updatedAt || '',
    },
    secret,
    { expiresIn: JWT_EXPIRES_IN },
  );
};

export const login = async (req, res) => {
  try {
    const loginValue = userRepository.normalizeLogin(req.body?.login);
    const password = String(req.body?.password || '');

    if (!loginValue || !password) {
      return res.status(400).json({ success: false, message: 'Login and password are required' });
    }

    const user = await userRepository.findByLogin(loginValue);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid login or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid login or password' });
    }

    const token = buildJwt(user);

    return res.status(200).json({
      success: true,
      data: {
        token,
        expiresIn: JWT_EXPIRES_IN,
        user: { login: user.login, role: user.role },
      },
    });
  } catch (err) {
    console.error('[auth] login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const currentAdmin = req.admin || {};
    const oldPassword = String(req.body?.oldPassword || '');
    const newPassword = String(req.body?.newPassword || '');
    const confirmNewPassword = String(req.body?.confirmNewPassword || '');

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'oldPassword, newPassword and confirmNewPassword are required',
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirmation do not match' });
    }

    const user = currentAdmin.sub
      ? await userRepository.findById(currentAdmin.sub)
      : await userRepository.findByLogin(currentAdmin.login);

    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const isOldValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldValid) {
      return res.status(403).json({ success: false, message: 'Old password is incorrect' });
    }

    const nextHash = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePasswordHash(user.id, nextHash);

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('[auth] changePassword error:', err);
    return res.status(500).json({ success: false, message: 'Unable to change password' });
  }
};
