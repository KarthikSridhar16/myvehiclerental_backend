import { Router } from 'express';
import { list, detail, availability } from '../controllers/vehicles.controller.js';
const r = Router();
r.get('/', list);
r.get('/:id', detail);
r.get('/:id/availability', availability);
export default r;
