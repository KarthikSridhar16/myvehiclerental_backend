import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ah } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

export const register = ah(async (req,res)=>{
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error:'Email exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  const token = jwt.sign({ id:user.id, role:user.role, email:user.email }, env.jwtSecret, { expiresIn: env.jwtExpires });
  res.json({ token, user:{ id:user.id, name:user.name, email:user.email, role:user.role } });
});

export const login = ah(async (req,res)=>{
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(!user || !(await user.comparePassword(password))) return res.status(401).json({ error:'Invalid credentials' });
  const token = jwt.sign({ id:user.id, role:user.role, email:user.email }, env.jwtSecret, { expiresIn: env.jwtExpires });
  res.json({ token, user:{ id:user.id, name:user.name, email:user.email, role:user.role } });
});
