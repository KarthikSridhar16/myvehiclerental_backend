import Booking from "../models/Booking.js";
import { ah } from "../utils/asyncHandler.js";
import mongoose from "mongoose";


function parseSort(sortStr) {
  const out = {};
  if (!sortStr) { out.createdAt = -1; return out; }
  for (const key of String(sortStr).split(",")) {
    const k = key.trim();
    if (!k) continue;
    const dir = k.startsWith("-") ? -1 : 1;
    const f = k.replace(/^[+-]/, "");
    if (["createdAt","start","end","amount"].includes(f)) {
      out[f === "amount" ? "price.total" : f] = dir;
    }
  }
  if (!Object.keys(out).length) out.createdAt = -1;
  return out;
}


export const listBookings = ah(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
  const skip = (page - 1) * limit;

  const match = {};
  const { status, from, to, q } = req.query;

  if (status && status !== "all") match.status = status;

  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from + "T00:00:00.000Z");
    if (to)   match.createdAt.$lte = new Date(to   + "T23:59:59.999Z");
  }

  const sort = parseSort(req.query.sort);

  const pipeline = [
    { $match: match },
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "vehicles", localField: "vehicleId", foreignField: "_id", as: "vehicle" } },
    { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },
    { $addFields: {
        userName: "$user.name",
        userEmail: "$user.email",
        vehicleMake: "$vehicle.make",
        vehicleModel: "$vehicle.model",
        vehicleLocation: "$vehicle.location",
        amount: "$price.total",
        currency: "$price.currency",
      } },
  ];

  if (q) {
    const re = new RegExp(String(q), "i");
    pipeline.push({
      $match: {
        $or: [
          { userName: re },
          { userEmail: re },
          { vehicleMake: re },
          { vehicleModel: re },
          { vehicleLocation: re },
          { _id: { $in: mongoose.Types.ObjectId.isValid(q) ? [new mongoose.Types.ObjectId(q)] : [] } },
        ],
      },
    });
  }

  pipeline.push({ $sort: sort });
  pipeline.push({
    $facet: {
      items: [{ $skip: skip }, { $limit: limit }],
      totalArr: [{ $count: "n" }],
    },
  });

  const [out] = await Booking.aggregate(pipeline);
  const items = out?.items || [];
  const total = out?.totalArr?.[0]?.n || 0;

  const metricsAgg = await Booking.aggregate([
    { $group: {
        _id: "$status",
        count: { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, "$price.total", 0] } },
      } },
  ]);

  const metrics = metricsAgg.reduce((acc, r) => {
    acc[r._id] = { count: r.count };
    if (r._id === "confirmed") acc.revenue = r.revenue || 0;
    return acc;
  }, { all: { count: metricsAgg.reduce((s,r)=>s+r.count,0) }, revenue: 0 });

  const mapped = items.map((b) => ({
    _id: b._id,
    status: b.status,
    start: b.start,
    end: b.end,
    createdAt: b.createdAt,
    amount: b.price?.total ?? b.amount ?? 0,
    currency: b.price?.currency ?? b.currency ?? "INR",
    user: b.user ? { _id: b.user._id, name: b.user.name, email: b.user.email } : null,
    vehicle: b.vehicle ? {
      _id: b.vehicle._id,
      make: b.vehicle.make,
      model: b.vehicle.model,
      location: b.vehicle.location,
    } : null,
    payment: b.payment || null,
  }));

  res.json({ page, limit, total, items: mapped, metrics });
});

export const updateBooking = ah(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  const ALLOWED = ["pending", "confirmed", "cancelled", "failed", "completed"];
  if (!ALLOWED.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const set = { status };
  if (status === "failed") set["payment.status"] = "failed";

  const b = await Booking.findByIdAndUpdate(id, { $set: set }, { new: true })
    .populate("userId", "name email")
    .populate("vehicleId", "make model location")
    .lean();

  if (!b) return res.status(404).json({ message: "Booking not found" });

  res.json({ data: b });
});