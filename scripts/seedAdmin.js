// server/scripts/seedAdmin.js
// Robust seeder: no app-model imports needed.
// Creates/updates an admin user with email 18ib09@gmail.com and password Naruna@73.

import "dotenv/config";          // loads .env in this folder
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ---- Desired admin account ----
const ADMIN_EMAIL = "18ib09@gmail.com";
const ADMIN_PASSWORD = "Naruna@73";
const ADMIN_NAME = "Administrator";

// Pick Mongo URI from env (.env you shared) or fallback
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/vehiclerental";

// Minimal schema that matches common fields in your app
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, index: true },
    role: { type: String, default: "user" },
    // your app reads passwordHash in login; we'll populate it
    passwordHash: { type: String, select: true },
  },
  { collection: "users", timestamps: true }
);

// Reuse if already registered
const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function main() {
  console.log("[seedAdmin] Connecting to", MONGO_URI);
  await mongoose.connect(MONGO_URI);

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const result = await User.updateOne(
    { email: ADMIN_EMAIL },
    {
      $set: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        role: "admin",
        passwordHash: hash,
      },
    },
    { upsert: true }
  );

  if (result.upsertedCount || result.upsertedId) {
    console.log("✔ Admin created");
  } else if (result.modifiedCount) {
    console.log("✔ Admin updated");
  } else {
    console.log("✔ Admin already up-to-date");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Admin seed failed:", err);
  process.exit(1);
});

