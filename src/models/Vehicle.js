import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    make: String,
    model: String,
    year: Number,
    type: String,           
    location: String,

    
    city: { type: String, trim: true },                                       
    depotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot', index: true }, 

    images: [String],
    pricePerDay: Number,
    specs: Object,
    description: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

VehicleSchema.index({ status: 1, type: 1, location: 1, pricePerDay: 1 });

VehicleSchema.index({ city: 1 });

VehicleSchema.index(
  {
    make: 'text',
    model: 'text',
    type: 'text',
    location: 'text',
    description: 'text',
    city: 'text',              
  },
  {
    weights: {
      make: 5,
      model: 5,
      type: 3,
      location: 2,
      city: 2,                 
      description: 1,
    },
    name: 'vehicle_text_search',
    default_language: 'english',
  }
);

export default mongoose.model('Vehicle', VehicleSchema);
