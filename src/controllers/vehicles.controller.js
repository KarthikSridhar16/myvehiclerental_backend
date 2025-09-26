import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';
import { ah } from '../utils/asyncHandler.js';

export const list = ah(async (req,res)=>{
  const { q, type, min, max, location, sort='-createdAt', page=1, limit=12 } = req.query;
  const filter = { status:'approved' };
  if(q) filter.$text = { $search: q };
  if(type) filter.type = type;
  if(location) filter.location = location;
  if(min || max) filter.pricePerDay = { ...(min?{$gte:+min}:{}) , ...(max?{$lte:+max}:{}) };
  const data = await Vehicle.find(filter).sort(String(sort)).skip((+page-1)*+limit).limit(+limit);
  const count = await Vehicle.countDocuments(filter);
  res.json({ data, count });
});

export const detail = ah(async (req,res)=>{
  const v = await Vehicle.findById(req.params.id);
  if(!v || v.status!=='approved') return res.status(404).json({error:'Not found'});
  res.json(v);
});

export const availability = ah(async (req,res)=>{
  const { from, to } = req.query;
  const vehicleId = req.params.id;
  const blocks = await Booking.find({
    vehicleId,
    status: { $in: ['pending','confirmed'] },
    $or: [{ start: { $lt: new Date(to) }, end: { $gt: new Date(from) } }]
  }).select('start end');
  res.json({ blocks });
});
