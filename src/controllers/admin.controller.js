import Vehicle from '../models/Vehicle.js';
import Review from '../models/Review.js';
import { ah } from '../utils/asyncHandler.js';

export const approveVehicle = ah(async (req,res)=>{
  const v = await Vehicle.findByIdAndUpdate(req.params.id, { status:'approved' }, { new:true });
  if(!v) return res.status(404).json({error:'Not found'});
  res.json(v);
});

export const moderateReview = ah(async (req,res)=>{
  const { status } = req.body; 
  const r = await Review.findByIdAndUpdate(req.params.id, { status }, { new:true });
  if(!r) return res.status(404).json({error:'Not found'});
  if(status === 'approved'){
    const agg = await Review.aggregate([
      { $match: { vehicleId: r.vehicleId, status:'approved' } },
      { $group: { _id: '$vehicleId', avg: { $avg:'$rating' }, cnt:{ $sum:1 } } }
    ]);
    const avg = agg[0]?.avg ?? 0;
    const cnt = agg[0]?.cnt ?? 0;
    await Vehicle.findByIdAndUpdate(r.vehicleId, { ratingAvg: avg, ratingCount: cnt });
  }
  res.json(r);
});
