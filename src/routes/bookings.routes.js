// server/src/routes/bookings.routes.js
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { create, mine, updateStatus } from '../controllers/bookings.controller.js';

const r = Router();
r.post('/', auth, create);
r.get('/me', auth, mine);
r.patch('/:id/status', auth, updateStatus);
export default r;
