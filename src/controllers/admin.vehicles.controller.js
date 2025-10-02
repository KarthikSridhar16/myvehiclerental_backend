import Vehicle from "../models/Vehicle.js";
import Depot from "../models/Depot.js";
import { ah } from "../utils/asyncHandler.js";


const allowedStatuses = new Set(["pending", "approved", "rejected"]);

function trimOrNull(v) {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}

async function findDepotByCity(city) {
  if (!city) return null;

  return Depot.findOne({ city: new RegExp(`^${String(city).trim()}$`, "i") })
    .select("_id city name")
    .lean();
}

async function resolveDepot({ depotId, city }) {

  if (depotId) {
    const dep = await Depot.findById(depotId).select("_id city name").lean();
    if (!dep) {
      const err = new Error("Depot not found");
      err.code = "DEPOT_NOT_FOUND";
      throw err;
    }
    return dep;
  }
  if (city) {
    return await findDepotByCity(city);
  }
  return null;
}

export const listVehicles = ah(async (req, res) => {
  const { page = 1, limit = 20, q } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (q) {
    const re = new RegExp(String(q), "i");
    filter.$or = [
      { make: re },
      { model: re },
      { type: re },
      { location: re },
      { city: re },        
      { description: re },
    ];
  }

  const [items, total] = await Promise.all([
    Vehicle.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate({ path: "depotId", select: "name city" })
      .lean(),
    Vehicle.countDocuments(filter),
  ]);

  res.json({ page: pageNum, limit: limitNum, total, results: items });
});

export const getVehicle = ah(async (req, res) => {
  const v = await Vehicle.findById(req.params.id)
    .populate({ path: "depotId", select: "name city" })
    .lean();
  if (!v) return res.status(404).json({ message: "Vehicle not found" });

  res.json({ data: v });
});

export const createVehicle = ah(async (req, res) => {
  const p = req.body || {};

  for (const k of ["make", "model", "type", "location", "pricePerDay"]) {
    if (!p[k]) return res.status(400).json({ message: `${k} is required` });
  }
  if (p.year && Number.isNaN(Number(p.year))) {
    return res.status(400).json({ message: "year must be a number" });
  }
  if (Number.isNaN(Number(p.pricePerDay))) {
    return res.status(400).json({ message: "pricePerDay must be a number" });
  }

  const cityInput = trimOrNull(p.city);
  const depotIdInput = trimOrNull(p.depotId);

  let depot = null;
  try {
    depot = await resolveDepot({ depotId: depotIdInput, city: cityInput });
  } catch (e) {
    if (e.code === "DEPOT_NOT_FOUND") {
      return res.status(400).json({ message: "Invalid depotId" });
    }
    throw e;
  }

  let status = trimOrNull(p.status) || "approved";
  if (!allowedStatuses.has(status)) status = "approved";

  const doc = await Vehicle.create({
    ownerId: req.user?._id ?? req.userId ?? null,
    make: p.make,
    model: p.model,
    year: p.year ? Number(p.year) : undefined,
    type: p.type,
    location: p.location,
    city: depot?.city || cityInput,              
    depotId: depot?._id || depotIdInput || undefined,

    images: Array.isArray(p.images) ? p.images.map(String) : [],
    specs: p.specs || {},
    description: p.description || "",
    pricePerDay: Number(p.pricePerDay),
    status,
  });

  res.status(201).json({ data: doc });
});

export const updateVehicle = ah(async (req, res) => {
  const patch = { ...req.body };

  if ("year" in patch) {
    if (patch.year === null || patch.year === "") delete patch.year;
    else patch.year = Number(patch.year);
  }
  if ("pricePerDay" in patch) {
    patch.pricePerDay = Number(patch.pricePerDay);
  }

  if ("status" in patch) {
    const s = trimOrNull(patch.status);
    if (!s || !allowedStatuses.has(s)) delete patch.status; 
    else patch.status = s;
  }
  if ("city" in patch) patch.city = trimOrNull(patch.city);

  let wantDepotId = trimOrNull(patch.depotId);
  let wantCity = patch.city;

  if ("depotId" in patch) {
    if (!wantDepotId) {
      patch.depotId = undefined;
    } else {
      const dep = await Depot.findById(wantDepotId).select("_id city").lean();
      if (!dep) return res.status(400).json({ message: "Invalid depotId" });
      patch.depotId = dep._id;
      if (!wantCity) patch.city = dep.city;
    }
  } else if ("city" in patch && wantCity) {
    const dep = await findDepotByCity(wantCity);
    if (dep) patch.depotId = dep._id;
  }

  const doc = await Vehicle.findByIdAndUpdate(
    req.params.id,
    { $set: patch },
    { new: true }
  )
    .populate({ path: "depotId", select: "name city" });

  if (!doc) return res.status(404).json({ message: "Vehicle not found" });
  res.json({ data: doc });
});

export const deleteVehicle = ah(async (req, res) => {
  const doc = await Vehicle.findByIdAndDelete(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: "Vehicle not found" });
  res.json({ ok: true });
});
