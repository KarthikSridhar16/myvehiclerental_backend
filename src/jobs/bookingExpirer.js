// server/src/jobs/bookingExpirer.js
import Booking from '../models/Booking.js';
import { env } from '../config/env.js';

const HOLD_MIN = Number(env.PENDING_HOLD_MIN || process.env.PENDING_HOLD_MIN || 15);
const TICK_MS = 60 * 1000; 

export function startBookingExpiryJob() {
  async function tick() {
    const now = new Date();

    await Booking.updateMany(
      { status: 'pending', pendingHoldUntil: { $exists: false } },
      [{ $set: { pendingHoldUntil: { $add: ['$createdAt', HOLD_MIN * 60 * 1000] } } }]
    ).catch(() => null);

    const res = await Booking.updateMany(
      { status: 'pending', pendingHoldUntil: { $lte: now } },
      { $set: { status: 'failed', 'payment.status': 'failed' } }
    ).catch(() => null);

    if (res?.modifiedCount) {
      console.log(`[bookingExpirer] expired -> failed: ${res.modifiedCount}`);
    }
  }

  tick().catch(() => {});
  return setInterval(() => tick().catch(() => {}), TICK_MS);
}
