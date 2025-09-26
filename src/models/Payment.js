import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref:'Booking', index:true },
  gateway: { type:String, enum:['stripe','razorpay'], required:true },
  amount: { type:Number, required:true },
  currency: { type:String, default:'INR' },
  status: { type:String, enum:['created','paid','failed','refunded'], default:'created', index:true },
  gatewayRef: String,
  invoiceUrl: String,
  raw: Object
}, { timestamps:true });

export default mongoose.model('Payment', PaymentSchema);
