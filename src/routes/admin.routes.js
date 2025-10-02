import { Router } from "express";
import { auth as requireAuth, requireRole } from "../middleware/auth.js";

import {
  listReviews, updateReviewStatus, deleteReview,
} from "../controllers/admin.reviews.controller.js";

import {
  listVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle,
} from "../controllers/admin.vehicles.controller.js";

import { listBookings, updateBooking } from "../controllers/admin.bookings.controller.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/bookings", listBookings);
router.patch("/bookings/:id", updateBooking); 

router.get("/reviews", listReviews);
router.patch("/reviews/:id", updateReviewStatus);
router.delete("/reviews/:id", deleteReview);

router.get("/vehicles", listVehicles);
router.get("/vehicles/:id", getVehicle);
router.post("/vehicles", createVehicle);
router.patch("/vehicles/:id", updateVehicle);
router.delete("/vehicles/:id", deleteVehicle);

export default router;
