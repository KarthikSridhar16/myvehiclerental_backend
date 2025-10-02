// server/src/controllers/admin.reviews.controller.js
import Review from "../models/Review.js";
import { ah } from "../utils/asyncHandler.js";

export const listReviews = ah(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const q = {};
  if (status) q.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Review.find(q)
      .populate("userId", "name email")
      .populate("vehicleId", "make model")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Review.countDocuments(q),
  ]);

  res.json({
    page: Number(page),
    limit: Number(limit),
    total,
    results: items,
  });
});


export const updateReviewStatus = ah(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const doc = await Review.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true }
  )
    .populate("userId", "name email")
    .populate("vehicleId", "make model")
    .lean();

  if (!doc) return res.status(404).json({ message: "Review not found" });
  res.json(doc);
});


export const deleteReview = ah(async (req, res) => {
  const { id } = req.params;
  const doc = await Review.findByIdAndDelete(id).lean();
  if (!doc) return res.status(404).json({ message: "Review not found" });
  res.json({ ok: true });
});
