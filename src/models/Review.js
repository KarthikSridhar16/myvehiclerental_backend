// src/models/Review.js
import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',     index: true, required: true },
    vehicleId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle',  index: true, required: true },
    bookingId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }, // optional but nice to have
    rating:     { type: Number, min: 1, max: 5, required: true },
    comment:    { type: String, maxlength: 2000 },
    status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ userId: 1, vehicleId: 1 }, { unique: true });

ReviewSchema.index({ vehicleId: 1, status: 1, createdAt: -1 });

export default mongoose.model('Review', ReviewSchema);
