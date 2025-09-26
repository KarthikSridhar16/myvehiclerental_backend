import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import vehiclesRoutes from './routes/vehicles.routes.js';
import bookingsRoutes from './routes/bookings.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

// NOTE: Stripe webhook route needs raw body, so we mount payments router BEFORE json parser on that path.
// We’ll mount the webhook subpath directly here to guarantee order:
import paymentsRouter from './routes/payments.routes.js';
app.use('/payments/webhook', paymentsRouter); // only webhook subroute uses raw

// General parsers
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/health', (_req,res)=>res.json({ok:true}));

// Normal routers
app.use('/auth', authRoutes);
app.use('/vehicles', vehiclesRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/payments', paymentsRoutes); // (intent etc.)
app.use('/reviews', reviewsRoutes);
app.use('/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
