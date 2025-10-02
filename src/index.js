import "dotenv/config";
import dns from "dns";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { sendMail } from "./utils/email.js";

dns.setDefaultResultOrder?.("ipv4first");

// --- Debug routes (remove after testing) ---
app.get("/debug/mail-info", (_req, res) => {
  const hasSendGrid = Boolean(process.env.SENDGRID_API_KEY);
  const emailFrom = process.env.EMAIL_FROM || env.emailFrom || null;
  const frontendUrl = process.env.FRONTEND_URL || env.frontendUrl || null;
  res.json({ ok: true, hasSendGrid, emailFrom, frontendUrl });
});

app.get("/debug/send-test-email", async (req, res) => {
  try {
    const to = req.query.to || process.env.EMAIL_FROM || env.emailFrom;
    if (!to) return res.status(400).send("Provide ?to=recipient or set EMAIL_FROM.");
    await sendMail(
      to,
      "VRUMA test (debug)",
      '<b>Hello from VRUMA!</b><br/><img src="cid:brandlogo" alt="brand" />'
    );
    res.send("ok");
  } catch (e) {
    res.status(500).send(e?.message || "send failed");
  }
});
// --- End debug routes ---

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
