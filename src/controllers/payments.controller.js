import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { ah } from '../utils/asyncHandler.js';
import { sendMail } from '../utils/email.js';
import { bookingConfirmedHtml } from '../emails/bookingConfirmed.js';

const stripe = env.stripe?.secret ? new Stripe(env.stripe.secret) : null;

export const createIntent = ah(async (req, res) => {
  const { bookingId } = req.body;
  const b = await Booking.findById(bookingId);
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  if (b.status !== 'pending') return res.status(400).json({ error: 'Already paid/closed' });
  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

  
  const user = await User.findById(b.userId).lean().catch(() => null);
  const receiptEmail = user?.email || undefined;

  const pi = await stripe.paymentIntents.create({
    amount: Math.round(Number(b.price.total || 0) * 100),
    currency: String(b.price.currency || 'INR').toLowerCase(),
    metadata: { bookingId: String(b._id) },
    receipt_email: receiptEmail,
  });

  const pay = await Payment.create({
    bookingId,
    gateway: 'stripe',
    amount: b.price.total,
    currency: b.price.currency,
    status: 'created',
    gatewayRef: pi.id,
  });

  res.json({ clientSecret: pi.client_secret, paymentId: pay._id });
});

export const stripeWebhook = ah(async (req, res) => {
  if (!stripe || !env.stripe?.wh) {
    return res.status(500).json({ error: 'Stripe webhook not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(req.body, sig, env.stripe.wh);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;

    
    const pay = await Payment.findOneAndUpdate(
      { gatewayRef: pi.id },
      { status: 'paid', raw: pi },
      { new: true }
    );

    if (pay) {
      const b = await Booking.findById(pay.bookingId);
      if (b) {
        b.status = 'confirmed';
        b.payment = {
          provider: 'stripe',
          orderId: null,
          paymentId: pi.id,
          status: 'captured',
          amount: Number(pi.amount),
          currency: String(pi.currency || 'inr').toUpperCase(),
          method: Array.isArray(pi.payment_method_types) ? pi.payment_method_types[0] : undefined,
          email: pi.receipt_email || b?.payment?.email || undefined,
          contact: pi.charges?.data?.[0]?.billing_details?.phone || undefined,
          raw: undefined, 
        };
        await b.save();

        const alreadySent = b.meta?.confirmationEmailSentAt && b.meta?.confirmationEmailPaymentId === pi.id;
        if (!alreadySent) {
          const vehicle = await Vehicle.findById(b.vehicleId).lean();
          const user = await User.findById(b.userId).lean().catch(() => null);
          const to = user?.email || b.payment?.email || pi.receipt_email;

          if (to) {
            const html = bookingConfirmedHtml({
              user: user || { name: 'there', email: to },
              booking: b.toObject ? b.toObject() : b,
              vehicle,
              payment: b.payment,
            });
            await sendMail(to, 'Booking Confirmed', html);
          }

          await Booking.updateOne(
            { _id: b._id },
            { $set: { 'meta.confirmationEmailSentAt': new Date(), 'meta.confirmationEmailPaymentId': pi.id } }
          );
        }
      }
    }
  }


  res.json({ received: true });
});
