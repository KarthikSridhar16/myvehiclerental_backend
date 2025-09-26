import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type:String, required:true },
  email: { type:String, required:true, unique:true, index:true },
  passwordHash: { type:String, required:true },
  role: { type:String, enum:['user','admin','owner'], default:'user', index:true },
  phone: String,
  address: String,
  kyc: { type: Object }
}, { timestamps:true });

UserSchema.methods.comparePassword = function(pw){
  return bcrypt.compare(pw, this.passwordHash);
};

export default mongoose.model('User', UserSchema);
