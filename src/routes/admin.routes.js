import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { approveVehicle, moderateReview } from '../controllers/admin.controller.js';
const r = Router();
r.use(auth, requireRole('admin'));
r.patch('/vehicles/:id/approve', approveVehicle);
r.patch('/reviews/:id', moderateReview);
export default r;
