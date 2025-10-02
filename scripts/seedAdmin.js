

import "dotenv/config";          
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_NAME = "Administrator";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/vehiclerental";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, index: true },
    role: { type: String, default: "user" },
    
    passwordHash: { type: String, select: true },
  },
  { collection: "users", timestamps: true }
);

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

