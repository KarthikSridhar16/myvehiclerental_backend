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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowList = (env.corsOrigin || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsMw = cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);            
    if (!allowList.length) return cb(null, true);  
    if (allowList.includes(origin)) return cb(null, true);
    return cb(new Error('CORS: origin not allowed'), false);
  },
  credentials: true,
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
});

app.use(corsMw);
app.options(/.*/, corsMw);

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

app.use(notFound);
app.use(errorHandler);

export default app;
