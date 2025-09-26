import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref:'User', index:true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref:'Vehicle', index:true },
  rating: { type:Number, min:1, max:5, required:true },
  comment: { type:String, maxlength:2000 },
  status: { type:String, enum:['pending','approved','rejected'], default:'pending', index:true }
}, { timestamps:true });

export default mongoose.model('Review', ReviewSchema);
