// scripts/link-vehicles-to-depots.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Vehicle from "../src/models/Vehicle.js";
import Depot from "../src/models/Depot.js";

const MONGO_URI = process.env.MONGO_URI;

const CITY_MAP = new Map([
  ["chennai", "Chennai"],
  ["hyderabad", "Hyderabad"],
  ["hyderbad", "Hyderabad"], // common typo fallback
  ["pune", "Pune"],
  ["bengaluru", "Bengaluru"],
  ["bangalore", "Bengaluru"],
  ["delhi", "Delhi"],
  ["new delhi", "Delhi"],
  ["mumbai", "Mumbai"],
  ["bombay", "Mumbai"],
]);

function normalizeCity(s) {
  if (!s) return null;
  const key = String(s).trim().toLowerCase();
  return CITY_MAP.get(key) || null;
}

(async () => {
  await mongoose.connect(MONGO_URI);

  // Build city -> depotId
  const depots = await Depot.find({}).lean();
  const depotByCity = new Map(depots.map(d => [d.city, d._id]));

  const vehicles = await Vehicle.find({}).lean();
  let updated = 0;

  for (const v of vehicles) {
    // Prefer explicit city if present; else try to derive from location
    const city =
      normalizeCity(v.city) ||
      normalizeCity(v.location);

    if (!city) continue;
    const depotId = depotByCity.get(city);
    if (!depotId) continue;

    await Vehicle.updateOne(
      { _id: v._id },
      {
        $set: {
          city,
          depotId,
        },
      }
    );
    updated++;
  }

  console.log(`Linked ${updated} vehicles to depots.`);
  await mongoose.disconnect();
})();
