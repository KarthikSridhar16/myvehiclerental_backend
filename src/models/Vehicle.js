import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  make: String, model: String, year: Number, type: String,
  images: [String],
  pricePerDay: { type: Number, required:true, index:true },
  location: { type: String, index:true },
  specs: { seats: Number, fuel: String, transmission: String, mileage: Number },
  description: String,
  status: { type:String, enum:['pending','approved','rejected'], default:'pending', index:true },
  ratingAvg: { type:Number, default:0 },
  ratingCount: { type:Number, default:0 }
}, { timestamps:true });

VehicleSchema.index({ make:'text', model:'text', type:'text', location:'text' });

export default mongoose.model('Vehicle', VehicleSchema);
