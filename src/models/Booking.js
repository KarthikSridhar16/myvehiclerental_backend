import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref:'User', index:true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref:'Vehicle', index:true },
  start: { type: Date, required:true, index:true },
  end: { type: Date, required:true, index:true },
  status: { type:String, enum:['pending','confirmed','cancelled','completed'], default:'pending', index:true },
  price: {
    days: Number, perDay: Number, fees: Number, total: Number, currency: { type:String, default:'INR' }
  },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref:'Payment' }
}, { timestamps:true });

BookingSchema.index({ vehicleId:1, start:1, end:1, status:1 });

export default mongoose.model('Booking', BookingSchema);
