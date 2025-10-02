import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';
import { ah } from '../utils/asyncHandler.js';
import { sendMail } from '../utils/email.js';
import { bookingPendingHtml } from '../emails/bookingPending.js';
import { env } from '../config/env.js';

const HOLD_MIN = Number(env.PENDING_HOLD_MIN || process.env.PENDING_HOLD_MIN || 15);

async function vehicleHasOverlap({ vehicleId, start, end, excludeId = null }) {
  const now = new Date();
  const q = {
    vehicleId,
    start: { $lt: new Date(end) },
    end:   { $gt: new Date(start) },
    $or: [
      { status: 'confirmed' },
      { status: 'pending', pendingHoldUntil: { $gt: now } },
    ],
  };
  if (excludeId) q._id = { $ne: excludeId };
  return !!(await Booking.exists(q).lean());
}

export const create = ah(async (req, res) => {
  const { vehicleId, start, end } = req.body;

  const s = new Date(start);
  const e = new Date(end);
  if (!(s instanceof Date) || isNaN(s) || !(e instanceof Date) || isNaN(e) || e <= s) {
    return res.status(400).json({ error: 'BAD_RANGE', message: 'Invalid start/end' });
  }

  const vehicle = await Vehicle.findById(vehicleId)
    .populate({ path: 'depotId', select: 'name city address lat lng phone hours' });

  if (!vehicle || vehicle.status !== 'approved') {
    return res.status(404).json({ error: 'Vehicle not available' });
  }

  if (!vehicle.depotId) {
    return res.status(400).json({ error: 'NO_DEPOT', message: 'Vehicle is not assigned to a pickup depot' });
  }

  const busy = await vehicleHasOverlap({ vehicleId, start: s, end: e });
  if (busy) {
    return res.status(409).json({ error: 'ALREADY_BOOKED', message: 'Vehicle is unavailable for these dates' });
  }

  const S = new Date(s); S.setHours(0,0,0,0);
  const E = new Date(e); E.setHours(0,0,0,0);
  const DAY = 24 * 60 * 60 * 1000;
  let days = Math.ceil((E - S) / DAY);
  if (!Number.isFinite(days) || days < 1) days = 1;

  const total = days * Number(vehicle.pricePerDay || 0);

  const d = vehicle.depotId; 
  const pickupSnapshot = {
    name: d.name,
    city: d.city,
    address: d.address,
    lat: d.lat,
    lng: d.lng,
    phone: d.phone,
    hours: d.hours,
  };

  const booking = await Booking.create({
    userId: req.user.id,
    vehicleId,
    start: s,
    end: e,
    status: 'pending',
    pendingHoldUntil: new Date(Date.now() + HOLD_MIN * 60 * 1000),
    price: {
      currency: 'INR',
      perDay: vehicle.pricePerDay,
      days,
      total,
    },
    pickupMethod: 'depot',
    pickupDepotId: d._id,
    pickup: pickupSnapshot,
  });

  try {
    const html = bookingPendingHtml({ user: req.user, booking, vehicle });
    await sendMail(req.user.email, 'Booking Created (Pending Payment)', html);
  } catch (e) {
    console.warn('[mail] booking pending email error:', e?.message);
  }

  res.status(201).json({ data: booking });
});


export const mine = ah(async (req, res) => {
  const now = new Date();
  await Booking.updateMany(
    { userId: req.user.id, status: 'pending', pendingHoldUntil: { $lte: now } },
    { $set: { status: 'failed', 'payment.status': 'failed' } }
  );

  const data = await Booking.find({ userId: req.user.id }).sort('-createdAt');
  res.json({ data });
});

export const updateStatus = ah(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 
  const b = await Booking.findByIdAndUpdate(id, { status }, { new: true });
  if (!b) return res.status(404).json({ error: 'Not found' });
  res.json({ data: b });
});
