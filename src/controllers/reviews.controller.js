import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import { ah } from "../utils/asyncHandler.js";

function getUserId(req) {
  const raw =
    req.userId ??
    req.user?._id ??
    req.user?.id ??
    req.auth?._id ??
    req.auth?.id;
  return raw ? raw.toString() : null;
}

export const getVehicleReviews = ah(async (req, res) => {
  const { id: vehicleId } = req.params;
  const docs = await Review.find({ vehicleId, status: "approved" })
    .populate("userId", "name")
    .sort({ createdAt: -1 })
    .lean();

  const result = docs.map((d) => ({
    ...d,
    user: d.userId ? { _id: d.userId._id, name: d.userId.name } : undefined,
  }));
  res.json(result);
});

/** GET /reviews/me?vehicleId=... (auth) */
export const getMyReview = ah(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { vehicleId } = req.query;
  if (!vehicleId) return res.json(null);

  const doc = await Review.findOne({ userId, vehicleId }).lean();
  res.json(doc || null);
});

/** POST /reviews (auth) */
export const createReview = ah(async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { vehicleId, bookingId, rating, comment } = req.body;
  if (!vehicleId || !rating) {
    return res.status(400).json({ message: "vehicleId and rating are required." });
  }

  // 1) Already reviewed?
  const existing = await Review.findOne({ userId, vehicleId });
  if (existing) {
    return res.status(403).json({
      error: "ALREADY_REVIEWED",
      message: "You have already reviewed this vehicle.",
    });
  }

  // 2) Confirmed booking exists
  const confirmedBooking = await Booking.findOne({
    userId,
    vehicleId,
    status: "confirmed",
  })
    .sort({ end: -1 })
    .lean();

  if (!confirmedBooking) {
    return res.status(403).json({
      error: "NO_CONFIRMED_BOOKING",
      message: "You can only review after a confirmed booking.",
    });
  }

  // 3) Booking has ended
  const now = new Date();
  const bookingEnd = new Date(confirmedBooking.end);
  if (bookingEnd > now) {
    return res.status(403).json({
      error: "BOOKING_NOT_ENDED",
      message: `You can write a review after your rental ends (ends at ${bookingEnd.toISOString()}).`,
    });
  }

  const doc = await Review.create({
    userId,
    vehicleId,
    bookingId: bookingId || confirmedBooking._id,
    rating: Number(rating),
    comment: (comment || "").trim(),
    status: "approved",
  });

  res.status(201).json(doc);
});

/* ---- Aliases to match your existing routes ---- */
export const create = createReview;
export const listForVehicle = getVehicleReviews;
export const mineForVehicle = getMyReview;
