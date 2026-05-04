import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import contactRoutes from './src/contacts/routes/contactRoutes.js';
import analyticsRoutes from './src/analytics/routes/analyticsRoutes.js';
import authRoutes from './src/admin/routes/authRoutes.js';

dotenv.config();

const app = express();
// 5000 can be occupied by macOS AirTunes on some machines.
const PORT = Number(process.env.PORT || 5050);

const extraOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const baseOrigins = [
  'http://localhost:5173',
  'http://localhost:3333',
  'http://localhost:5180',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3333',
  'http://127.0.0.1:5180',
  'http://127.0.0.1:4173',
  'https://dj-myportfolio.vercel.app',
  'https://www.dj-myportfolio.vercel.app',
];

const allowedOrigins = [...new Set([...baseOrigins, ...extraOrigins])];

/** Локальная разработка: любой origin (иначе 403 на [::1], LAN IP, кастомный порт) */
const corsDevAllowAll =
  process.env.CORS_DEV_ALLOW_ALL === '1' ||
  (process.env.NODE_ENV !== 'production' && !process.env.VERCEL);

const isLocalhostOrigin = (o) => {
  try {
    const u = new URL(o);
    const h = u.hostname.toLowerCase();
    if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '::1') {
      return true;
    }
    if (h === '0.0.0.0') return true;
    if (h.endsWith('.local')) return true;
    // приватные сети (доступ с телефона в той же Wi‑Fi)
    if (
      h.startsWith('192.168.') ||
      h.startsWith('10.') ||
      /^(172\.(1[6-9]|2\d|3[0-1])\..+)/.test(h)
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

app.use(
  cors({
    // Не вызывать callback(err) — иначе preflight может уйти в error handler без CORS-заголовков
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (corsDevAllowAll) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (isLocalhostOrigin(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/contact', contactRoutes);
app.use('/api/admin', authRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error. Please try again later.',
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
