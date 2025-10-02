import mongoose from 'mongoose';

const PaymentSub = new mongoose.Schema({
  provider:  { type: String, default: 'razorpay' },
  orderId:   String,         
  paymentId: String,         
  status:    { type: String, default: 'created' }, 
  amount:    Number,         
  currency:  { type: String, default: 'INR' },
  method:    String,
  email:     String,
  contact:   String,
  raw:       Object,
}, { _id: false, timestamps: false });


const PickupSnapshotSub = new mongoose.Schema({
  name:    { type: String, trim: true },
  address: { type: String, trim: true },
  city:    { type: String, trim: true },
  lat:     { type: Number, min: -90, max: 90 },
  lng:     { type: Number, min: -180, max: 180 },
  phone:   { type: String, trim: true },
  hours:   { type: String, trim: true },
}, { _id: false, timestamps: false });

const bookingSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', index: true },

  start:     { type: Date, required: true, index: true },
  end:       { type: Date, required: true, index: true },

  status:    { type: String, default: 'pending', index: true }, 
  pendingHoldUntil: { type: Date, index: true },                

  price: {
    days:     Number,
    hours:    Number, 
    perDay:   Number,
    fees:     Number,
    total:    Number, 
    currency: { type: String, default: 'INR' }
  },

  payment: PaymentSub,


  pickupMethod: { type: String, enum: ['depot'], default: 'depot', index: true },
  pickupDepotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot', index: true },
  pickup: PickupSnapshotSub,  

  meta: {
    confirmationEmailSentAt: { type: Date, default: null },
    confirmationEmailPaymentId: { type: String, default: null },
  },
}, { timestamps: true });

bookingSchema.index({ 'payment.orderId': 1 });
bookingSchema.index({ vehicleId: 1, start: 1, end: 1 });
bookingSchema.index({ status: 1, pendingHoldUntil: 1 });

bookingSchema.index({ 'meta.confirmationEmailSentAt': 1 });


export default mongoose.model('Booking', bookingSchema);
