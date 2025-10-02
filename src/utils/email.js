import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const HAS_SG = !!process.env.SENDGRID_API_KEY;
if (HAS_SG) sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function resolveLogo() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const logoPath = path.resolve(__dirname, "../../assets/logo.png");
  return fs.existsSync(logoPath) ? logoPath : null;
}

function sgAttachments(extra = []) {
  const out = [];
  const logo = resolveLogo();
  if (logo) {
    out.push({
      content: fs.readFileSync(logo).toString("base64"),
      filename: "Vruma_logo.png",
      type: "image/png",
      disposition: "inline",
      content_id: "brandlogo",
    });
  }
  for (const a of extra) {
    if (!a?.path || !fs.existsSync(a.path)) continue;
    const b64 = fs.readFileSync(a.path).toString("base64");
    out.push({
      content: b64,
      filename: a.filename || path.basename(a.path),
      type: "application/octet-stream",
      disposition: a.cid ? "inline" : "attachment",
      content_id: a.cid || undefined,
    });
  }
  return out;
}

let smtpTransport;
function getSmtpTransport() {
  if (smtpTransport) return smtpTransport;
  const port = Number(env.smtpPort || 465);
  const secure = port === 465;
  smtpTransport = nodemailer.createTransport({
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
  return smtpTransport;
}

function smtpAttachments(extra = []) {
  const out = [...extra];
  const logo = resolveLogo();
  if (logo) out.push({ filename: "Vruma_logo.png", path: logo, cid: "brandlogo" });
  return out;
}

export async function sendMail(to, subject, html, extraAttachments = []) {
  const from = process.env.EMAIL_FROM || env.emailFrom || env.smtpUser;

  if (HAS_SG) {
    await sgMail.send({
      to,
      from,          // must match your verified Single Sender
      subject,
      html,
      attachments: sgAttachments(extraAttachments),
    });
    return;
  }

  const t = getSmtpTransport();
  await t.sendMail({
    from,
    to,
    subject,
    html,
    attachments: smtpAttachments(extraAttachments),
  });
}
