import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';

import { startBookingExpiryJob } from './jobs/bookingExpirer.js';
import authRoutes from './routes/auth.routes.js';
import vehiclesRoutes from './routes/vehicles.routes.js';
import bookingsRoutes from './routes/bookings.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { notFound, errorHandler } from './middleware/error.js';
import { sendMail } from './utils/email.js';

const app = express();

app.set('trust proxy', 1);
app.set('etag', false);

app.use((req, res, next) => {
  if (req.headers.authorization) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Vary', 'Authorization');
  }
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = env.nodeEnv === 'production';
const parsedAllowList = (env.corsOrigin || '')
  .split(',')
  .map(s => s.trim().replace(/\/$/, ''))
  .filter(Boolean);
const devDefaults = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
];
const allowList = parsedAllowList.length ? parsedAllowList : (isProd ? [] : devDefaults);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const o = origin.replace(/\/$/, '');
  if (!allowList.length) return !isProd;
  return allowList.includes(o);
}

function setPreflightHeaders(req, res, origin) {
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  const reqHdrs = req.headers['access-control-request-headers'];
  res.header('Access-Control-Allow-Headers', reqHdrs || 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma');
  res.header('Access-Control-Max-Age', '86400');
}

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin || '';
    if (isAllowedOrigin(origin)) {
      setPreflightHeaders(req, res, origin);
      return res.sendStatus(204);
    }
    return res.sendStatus(403);
  }
  next();
});

const corsMw = cors({
  origin(origin, cb) {
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(new Error('CORS: origin not allowed'), false);
  },
  credentials: true,
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  allowedHeaders(req, cb) {
    const hdrs = req.header('Access-Control-Request-Headers');
    cb(null, hdrs || 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma');
  },
  exposedHeaders: ['ETag','Content-Length'],
  maxAge: 86400,
  optionsSuccessStatus: 204
});

app.use(corsMw);

app.use(helmet());
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/assets', express.static(path.resolve(__dirname, '../assets')));
app.use('/payments', paymentsRoutes);
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'vehicle-rental-api',
    backend: 'https://myvehiclerental-backend.onrender.com',
    frontend: 'https://vrumacars.netlify.app',
    time: new Date().toISOString(),
  });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/debug/mail-info', (_req, res) => {
  const hasSendGrid = Boolean(process.env.SENDGRID_API_KEY);
  const emailFrom = process.env.EMAIL_FROM || env.emailFrom || null;
  const frontendUrl = process.env.FRONTEND_URL || env.frontendUrl || null;
  res.json({ ok: true, hasSendGrid, emailFrom, frontendUrl });
});

app.get('/debug/send-test-email', async (req, res) => {
  try {
    const to = req.query.to || process.env.EMAIL_FROM || env.emailFrom;
    if (!to) return res.status(400).send('Provide ?to=recipient or set EMAIL_FROM.');
    await sendMail(
      to,
      'VRUMA test (debug)',
      '<b>Hello from VRUMA!</b><br/><img src="cid:brandlogo" alt="brand" />'
    );
    res.send('ok');
  } catch (e) {
    res.status(500).send(e?.message || 'send failed');
  }
});

app.use('/auth', authRoutes);
app.use('/vehicles', vehiclesRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/admin', adminRoutes);

startBookingExpiryJob();

app.use(notFound);
app.use(errorHandler);

export default app;
