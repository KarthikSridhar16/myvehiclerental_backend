import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";
import { env } from "../config/env.js";

dns.setDefaultResultOrder?.("ipv4first");

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const port = Number(env.smtpPort || 465);
  const secure = port === 465;
  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port,
    secure,
    auth: { user: env.smtpUser, pass: env.smtpPass },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 15000,
    socketTimeout: 20000,
    greetingTimeout: 10000,
    requireTLS: !secure,
  });
  return transporter;
}

export async function sendMail(to, subject, html, extraAttachments = []) {
  try {
    const t = getTransporter();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const logoPath = path.resolve(__dirname, "../../assets/logo.png");

    const attachments = [...extraAttachments];
    if (fs.existsSync(logoPath)) {
      attachments.push({ filename: "Vruma_logo.png", path: logoPath, cid: "brandlogo" });
    }

    await t.sendMail({
      from: env.emailFrom || env.smtpUser,
      to,
      subject,
      html,
      attachments,
    });
  } catch (e) {
    console.warn("sendMail failed:", e?.message);
  }
}

