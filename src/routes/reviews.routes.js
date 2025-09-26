import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { create, listForVehicle } from '../controllers/reviews.controller.js';
const r = Router();
r.get('/vehicle/:id', listForVehicle);
r.post('/', auth, create);
export default r;
