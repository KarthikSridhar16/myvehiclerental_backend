import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import { ah } from '../utils/asyncHandler.js';

export const create = ah(async (req,res)=>{
  const { vehicleId, rating, comment } = req.body;
  const done = await Booking.exists({ userId:req.user.id, vehicleId, status:'completed' });
  if(!done) return res.status(400).json({error:'You can review only after completing a rental'});
  const r = await Review.create({ userId:req.user.id, vehicleId, rating, comment, status:'pending' });
  res.status(201).json(r);
});

export const listForVehicle = ah(async (req,res)=>{
  const data = await Review.find({ vehicleId:req.params.id, status:'approved' }).sort('-createdAt');
  res.json({ data });
});
