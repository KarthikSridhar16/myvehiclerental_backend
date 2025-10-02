import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  if (!env.mongoUri || typeof env.mongoUri !== 'string') {
    throw new Error('MONGO_URI is missing or invalid. Check your .env');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  console.log('Mongo connected');
}
