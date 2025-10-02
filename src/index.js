import "dotenv/config";
import dns from "dns";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

dns.setDefaultResultOrder?.("ipv4first");

async function main() {
  try {
    await connectDB();
    const server = app.listen(env.port, () => {
      console.log(`API running on :${env.port}`);
    });
    process.on("SIGTERM", () => server.close(() => process.exit(0)));
    process.on("SIGINT", () => server.close(() => process.exit(0)));
  } catch (err) {
    console.error("DB connect error:", err);
    process.exit(1);
  }
}

main();
