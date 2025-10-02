import { Router } from "express";
import {
  listVehiclesPublic,
  getVehiclePublic,
  getVehicleBlockedRanges,
  getVehicleReviewsPublic,
} from "../controllers/vehicles.controller.js";

const router = Router();

// List/search MUST come before param routes
router.get("/", listVehiclesPublic);

// Param sub-routes must be ordered most-specific -> least-specific
router.get("/:id/blocked", getVehicleBlockedRanges);
router.get("/:id/reviews", getVehicleReviewsPublic);
router.get("/:id", getVehiclePublic);

export default router;
