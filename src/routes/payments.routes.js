import express, { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { createIntent, stripeWebhook } from '../controllers/payments.controller.js';
const r = Router();

/** Stripe webhook requires raw body, so mount on a subpath BEFORE JSON parser in app.js */
r.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

r.use(auth);
r.post('/intent', createIntent);
export default r;
