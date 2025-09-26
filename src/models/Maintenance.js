import mongoose from 'mongoose';

const MaintenanceSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref:'Vehicle', index:true },
  date: { type: Date, required:true },
  description: String,
  cost: Number,
  nextDueDate: Date
}, { timestamps:true });

export default mongoose.model('Maintenance', MaintenanceSchema);
