// scripts/seed-depots.js (ESM)
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Depot from "../src/models/Depot.js";

const MONGO_URI = process.env.MONGO_URI;

const SEED = [
  {
    name: "Chennai Depot",
    city: "Chennai",
    address: "Mount Road, Chennai, Tamil Nadu 600002",
    lat: 13.067439, lng: 80.237617, phone: "+91-44-0000000", hours: "9am–7pm",
  },
  {
    name: "Hyderabad Depot",
    city: "Hyderabad",
    address: "Banjara Hills, Hyderabad, Telangana 500034",
    lat: 17.4200, lng: 78.4483, phone: "+91-40-0000000", hours: "9am–7pm",
  },
  {
    name: "Pune Depot",
    city: "Pune",
    address: "FC Road, Pune, Maharashtra 411004",
    lat: 18.5273, lng: 73.8543, phone: "+91-20-0000000", hours: "9am–7pm",
  },
  {
    name: "Bengaluru Depot",
    city: "Bengaluru",
    address: "MG Road, Bengaluru, Karnataka 560001",
    lat: 12.9758, lng: 77.6050, phone: "+91-80-0000000", hours: "9am–7pm",
  },
  {
    name: "Delhi Depot",
    city: "Delhi",
    address: "Connaught Place, New Delhi 110001",
    lat: 28.6329, lng: 77.2195, phone: "+91-11-0000000", hours: "9am–7pm",
  },
  {
    name: "Mumbai Depot",
    city: "Mumbai",
    address: "Nariman Point, Mumbai, Maharashtra 400021",
    lat: 18.9256, lng: 72.8242, phone: "+91-22-0000000", hours: "9am–7pm",
  },
];

(async () => {
  await mongoose.connect(MONGO_URI);
  for (const d of SEED) {
    await Depot.findOneAndUpdate(
      { city: d.city },
      { $setOnInsert: d },
      { upsert: true, new: true }
    );
  }
  console.log("Depots seeded/ensured:", SEED.map(d => d.city).join(", "));
  await mongoose.disconnect();
})();
