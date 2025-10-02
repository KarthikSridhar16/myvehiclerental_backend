import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import { ah } from "../utils/asyncHandler.js";

export const listVehiclesPublic = ah(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  const filter = { status: "approved" };
  if (q) {
    const rx = new RegExp(String(q), "i");
    filter.$or = [
      { make: rx },
      { model: rx },
      { type: rx },
      { location: rx },
      { description: rx },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Vehicle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Vehicle.countDocuments(filter),
  ]);

  res.json({ page: Number(page), limit: Number(limit), total, data: items });
});

export const getVehiclePublic = ah(async (req, res) => {
  const v = await Vehicle.findById(req.params.id).lean();
  if (!v || v.status !== "approved") {
    return res.status(404).json({ message: "Vehicle not found" });
  }
  res.json({ data: v });
});

export const getVehicleBlockedRanges = ah(async (req, res) => {
  const now = new Date();
  const books = await Booking.find({
    vehicleId: req.params.id,
    $or: [
      { status: "confirmed" },
      { status: "pending", pendingHoldUntil: { $gt: now } },
    ],
  })
    .select("start end")
    .lean();

  const ranges = books.map((b) => {
    const from = new Date(b.start); from.setHours(0, 0, 0, 0);
    const to = new Date(b.end);     to.setHours(23, 59, 59, 999);
    return { from, to };
  });

  res.json({ data: ranges });
});

export const getVehicleReviewsPublic = ah(async (req, res) => {
  const docs = await Review.find({ vehicleId: req.params.id, status: "approved" })
    .populate("userId", "name")
    .sort({ createdAt: -1 })
    .lean();

  const data = docs.map((r) => ({
    _id: r._id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    user: r.userId ? { name: r.userId.name } : undefined,
  }));

  res.json({ data });
});
