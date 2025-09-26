import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { env } from '../config/env.js';
import { ah } from '../utils/asyncHandler.js';

const stripe = env.stripe.secret ? new Stripe(env.stripe.secret) : null;

export const createIntent = ah(async (req,res)=>{
  const { bookingId } = req.body;
  const b = await Booking.findById(bookingId);
  if(!b) return res.status(404).json({error:'Booking not found'});
  if(b.status!=='pending') return res.status(400).json({error:'Already paid/closed'});
  if(!stripe) return res.status(500).json({error:'Stripe not configured'});

  const pi = await stripe.paymentIntents.create({
    amount: Math.round(b.price.total * 100),
    currency: b.price.currency.toLowerCase(),
    metadata: { bookingId: String(b._id) }
  });

  const pay = await Payment.create({
    bookingId, gateway:'stripe', amount:b.price.total, currency:b.price.currency, status:'created', gatewayRef: pi.id
  });

  res.json({ clientSecret: pi.client_secret, paymentId: pay._id });
});

/** IMPORTANT: mount this route with express.raw() BEFORE json parser (see routes) */
export const stripeWebhook = ah(async (req,res)=>{
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(req.body, sig, env.stripe.wh);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if(event.type === 'payment_intent.succeeded'){
    const pi = event.data.object;
    const pay = await Payment.findOneAndUpdate(
      { gatewayRef: pi.id },
      { status:'paid', raw: pi },
      { new:true }
    );
    if(pay){ await Booking.findByIdAndUpdate(pay.bookingId, { status:'confirmed' }); }
  }
  res.json({ received:true });
});
