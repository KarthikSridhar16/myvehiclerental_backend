import express, { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import { env } from '../config/env.js';
import { ah } from '../utils/asyncHandler.js';
import { sendMail } from '../utils/email.js';
import { bookingConfirmedHtml } from '../emails/bookingConfirmed.js';

const rzp = new Razorpay({
  key_id: env.razorpayKeyId,
  key_secret: env.razorpayKeySecret,
});

const r = Router();

function resolveBookingId(req) {
  const cand =
    req.body?.bookingId ||
    req.body?.id ||
    req.query?.bookingId ||
    req.query?.id ||
    req.params?.bookingId ||
    req.params?.id;
  if (!cand) return null;
  return /^[a-f\d]{24}$/i.test(String(cand)) ? String(cand) : null;
}

async function bookingWindowClash(booking) {
  const now = new Date();
  return !!(await Booking.exists({
    _id: { $ne: booking._id },
    vehicleId: booking.vehicleId,
    start: { $lt: new Date(booking.end) },
    end:   { $gt: new Date(booking.start) },
    $or: [
      { status: 'confirmed' },
      { status: 'pending', pendingHoldUntil: { $gt: now } },
    ],
  }).lean());
}

async function sendConfirmationEmailOnce(booking, paymentId) {
  const guard = await Booking.findOneAndUpdate(
    {
      _id: booking._id,
      $or: [
        { 'meta.confirmationEmailSentAt': { $exists: false } },
        { 'meta.confirmationEmailSentAt': null }
      ]
    },
    {
      $set: {
        'meta.confirmationEmailSentAt': new Date(),
        'meta.confirmationEmailPaymentId': paymentId || booking?.payment?.paymentId || null
      }
    },
    { new: true }
  ).lean();

  if (!guard) return;

  const user = await User.findById(booking.userId).lean();
  const vehicle = await Vehicle.findById(booking.vehicleId).lean();
  const html = bookingConfirmedHtml({
    user,
    booking,
    vehicle,
    payment: { paymentId: paymentId || booking?.payment?.paymentId || '' }
  });

  await sendMail(user.email, 'Payment Successful – Booking Confirmed', html);
}

r.post(
  '/razorpay/order',
  express.json(),
  ah(async (req, res) => {
    const bookingId = resolveBookingId(req);
    if (!bookingId) return res.status(400).json({ error: 'bookingId required' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'pending')
      return res.status(400).json({ error: 'Booking not in pending state' });

    if (!booking.pendingHoldUntil) {
      const HOLD_MIN = Number(env.PENDING_HOLD_MIN || process.env.PENDING_HOLD_MIN || 15);
      booking.pendingHoldUntil = new Date(booking.createdAt.getTime() + HOLD_MIN * 60 * 1000);
      await booking.save();
    }
    if (booking.pendingHoldUntil <= new Date()) {
      booking.status = 'failed';
      booking.payment = { ...(booking.payment || {}), status: 'failed' };
      await booking.save();
      return res.status(409).json({ error: 'BOOKING_EXPIRED', message: 'Booking hold expired' });
    }
    if (await bookingWindowClash(booking)) {
      booking.status = 'failed';
      await booking.save();
      return res.status(409).json({ error: 'ALREADY_BOOKED', message: 'Vehicle became unavailable' });
    }
  
    let rupees = Number(booking.price?.total);
    if (!rupees || Number.isNaN(rupees)) {
      const DAY = 24 * 60 * 60 * 1000;
      const s = booking.start ? new Date(booking.start) : null;
      const e = booking.end ? new Date(booking.end) : null;
      if (s && e && e > s) {
        const v = await Vehicle.findById(booking.vehicleId).select('pricePerDay').lean();
        if (v?.pricePerDay) {
          const days = Math.max(1, Math.ceil((e - s) / DAY));
          rupees = Number(v.pricePerDay) * days;
        }
      }
    }
    const amount = Math.round((rupees || 0) * 100);
    if (!amount) return res.status(400).json({ error: 'Invalid booking amount' });

    const order = await rzp.orders.create({
      amount,
      currency: booking.price?.currency || 'INR',
      receipt: String(booking._id),
      notes: { bookingId: String(booking._id) },
    });

    booking.payment = {
      ...booking.payment,
      provider: 'razorpay',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: 'created',
    };
    await booking.save();

    res.json({
      keyId: env.razorpayKeyId,
      order: { id: order.id, amount: order.amount, currency: order.currency },
    });
  })
);

r.post(
  '/razorpay/verify',
  express.json(),
  ah(async (req, res) => {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.status === 'confirmed') {

      try { await sendConfirmationEmailOnce(booking, razorpay_payment_id); } catch {}
      return res.json({ ok: true, data: booking });
    }

    if (!booking.pendingHoldUntil) {
      const HOLD_MIN = Number(env.PENDING_HOLD_MIN || process.env.PENDING_HOLD_MIN || 15);
      booking.pendingHoldUntil = new Date(booking.createdAt.getTime() + HOLD_MIN * 60 * 1000);
      await booking.save();
    }
    if (booking.pendingHoldUntil <= new Date()) {
      booking.status = 'failed';
      booking.payment = { ...(booking.payment || {}), status: 'failed' };
      await booking.save();
      return res.status(409).json({ error: 'BOOKING_EXPIRED', message: 'Booking hold expired' });
    }
    if (await bookingWindowClash(booking)) {
      booking.status = 'failed';
      booking.payment = { ...(booking.payment || {}), status: 'failed' };
      await booking.save();
      return res.status(409).json({ error: 'ALREADY_BOOKED', message: 'Vehicle became unavailable' });
    }

    const expected = crypto
      .createHmac('sha256', env.razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'BAD_SIGNATURE' });
    }

    booking.payment = {
      ...booking.payment,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: 'captured',
    };
    booking.status = 'confirmed';
    await booking.save();

    await Payment.create({
      provider: 'razorpay',
      bookingId: booking._id,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: 'captured',
      amount: booking.payment?.amount,
      currency: booking.payment?.currency || 'INR',
    }).catch(() => {}); 

    try {
      await sendConfirmationEmailOnce(booking, razorpay_payment_id);
    } catch (e) {
      console.warn('[mail] booking confirmed email error:', e?.message);
    }

    res.json({ ok: true, data: booking });
  })
);

const rawJson = (req, res, next) => {
  if (req.headers['content-type']?.startsWith('application/json')) {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      req.rawBody = data;
      try { req.body = JSON.parse(data || '{}'); } catch { req.body = {}; }
      next();
    });
  } else next();
};

r.post(
  '/webhook/razorpay',
  rawJson,
  ah(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const secret = env.razorpayWebhookSecret;
    if (!signature || !secret) return res.status(400).json({ error: 'Missing signature/secret' });

    const digest = crypto.createHmac('sha256', secret).update(req.rawBody || '').digest('hex');
    const ok =
      digest.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
    if (!ok) return res.status(400).json({ error: 'Bad signature' });

    const event = req.body?.event;
    const entity = req.body?.payload?.payment?.entity;
    const orderId = entity?.order_id;
    const paymentId = entity?.id;
    if (!orderId) return res.json({ ok: true });

    const booking = await Booking.findOne({ 'payment.orderId': orderId });
    if (!booking) return res.json({ ok: true });

  
    if (booking.status === 'pending' && booking.pendingHoldUntil && booking.pendingHoldUntil <= new Date()) {
      booking.status = 'failed';
      booking.payment = { ...(booking.payment || {}), status: 'failed' };
      await booking.save();
      return res.json({ ok: true, note: 'Booking expired before payment confirmation' });
    }
    if (await bookingWindowClash(booking)) {
      booking.status = 'failed';
      booking.payment = { ...(booking.payment || {}), status: 'failed' };
      await booking.save();
      return res.json({ ok: true, note: 'Vehicle already booked for that time window' });
    }

    let payStatus = booking.payment?.status || 'created';
    if (event === 'payment.authorized') payStatus = 'authorized';
    if (event === 'payment.captured')   payStatus = 'captured';
    if (event === 'payment.failed')     payStatus = 'failed';

    booking.payment = {
      ...booking.payment,
      paymentId,
      status: payStatus,
      method: entity?.method,
      email: entity?.email,
      contact: entity?.contact,
      raw: entity,
    };
    if (payStatus === 'captured') booking.status = 'confirmed';
    if (payStatus === 'failed')   booking.status = 'cancelled';
    await booking.save();

    await Payment.create({
      provider: 'razorpay',
      bookingId: booking._id,
      orderId,
      paymentId,
      status: payStatus,
      amount: entity?.amount,
      currency: entity?.currency,
      method: entity?.method,
      email: entity?.email,
      contact: entity?.contact,
      raw: entity,
    }).catch(() => {});

    if (payStatus === 'captured') {
      try {
        await sendConfirmationEmailOnce(booking, paymentId);
      } catch (e) {
        console.warn('[mail] booking confirmed email error:', e?.message);
      }
    }

    res.json({ ok: true });
  })
);

export default r;
