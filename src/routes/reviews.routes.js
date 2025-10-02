// src/routes/reviews.routes.js
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { create, listForVehicle, mineForVehicle } from '../controllers/reviews.controller.js';

const r = Router();

r.get('/vehicle/:id', listForVehicle);

r.get('/me', auth, mineForVehicle);
r.post('/', auth, create);

export default r;
