import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';
import { calcPrice } from '../utils/pricing.js';
import { ah } from '../utils/asyncHandler.js';
import { sendMail } from '../utils/email.js';

export const create = ah(async (req,res)=>{
  const { vehicleId, start, end } = req.body;
  const v = await Vehicle.findById(vehicleId);
  if(!v || v.status!=='approved') return res.status(404).json({error:'Vehicle not bookable'});

  const clash = await Booking.exists({
    vehicleId,
    status: { $in: ['pending','confirmed'] },
    $or: [{ start: { $lt: new Date(end) }, end: { $gt: new Date(start) } }]
  });
  if(clash) return res.status(409).json({ error:'Vehicle not available for selected dates' });

  const price = calcPrice(new Date(start), new Date(end), v.pricePerDay);

  const session = await mongoose.startSession();
  let booking;
  await session.withTransaction(async ()=>{
    const conflict = await Booking.exists({
      vehicleId,
      status: { $in: ['pending','confirmed'] },
      $or: [{ start: { $lt: new Date(end) }, end: { $gt: new Date(start) } }]
    }).session(session);
    if(conflict) throw new Error('Race conflict');
    const [b] = await Booking.create([{ userId:req.user.id, vehicleId, start, end, status:'pending', price }], { session });
    booking = b;
  });
  session.endSession();

  if(req.user?.email){
    await sendMail(req.user.email, 'Booking Created (Pending Payment)',
      `<p>Booking #${booking._id} created for ${v.make} ${v.model}.</p>`);
  }
  res.status(201).json(booking);
});

export const mine = ah(async (req,res)=>{
  const data = await Booking.find({ userId: req.user.id })
    .sort('-createdAt')
    .populate('vehicleId','make model images pricePerDay');
  res.json({ data });
});

export const updateStatus = ah(async (req,res)=>{
  const { status } = req.body;
  const b = await Booking.findById(req.params.id);
  if(!b) return res.status(404).json({error:'Not found'});
  b.status = status;
  await b.save();
  res.json(b);
});
