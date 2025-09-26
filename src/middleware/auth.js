import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { env } from '../config/env.js';

export function auth(req, _res, next){
  const token = (req.headers.authorization ?? '').replace('Bearer ','');
  if(!token) return next(createError(401, 'Unauthorized'));
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    next();
  } catch {
    next(createError(401, 'Invalid token'));
  }
}

export const requireRole = (...roles) => (req,_res,next)=>{
  if(!req.user || !roles.includes(req.user.role)) return next(createError(403,'Forbidden'));
  next();
};
