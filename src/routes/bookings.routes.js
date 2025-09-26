import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { create, mine, updateStatus } from '../controllers/bookings.controller.js';
const r = Router();
r.use(auth);
r.post('/', create);
r.get('/me', mine);
r.patch('/:id', updateStatus);
export default r;
