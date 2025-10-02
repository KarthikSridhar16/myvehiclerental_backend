// src/models/Depot.js
import mongoose from 'mongoose';

const DepotSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },           
  city:    { type: String, required: true, trim: true },           
  address: { type: String, required: true, trim: true },           
  lat:     { type: Number, min: -90, max: 90 },                    
  lng:     { type: Number, min: -180, max: 180 },                  
  phone:   { type: String, trim: true },                           
  hours:   { type: String, trim: true },                           
}, { timestamps: true });

DepotSchema.index({ city: 1, name: 1 });

export default mongoose.model('Depot', DepotSchema);
