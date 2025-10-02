// server/src/utils/email.js
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: Number(env.smtpPort) === 465,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  });
  return transporter;
}

export async function sendMail(to, subject, html, extraAttachments = []) {
  try {
    const t = getTransporter();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const logoPath = path.resolve(__dirname, '../../assets/logo.png');

    const attachments = [...extraAttachments];
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: 'Vruma_logo.png',
        path: logoPath,
        cid: 'brandlogo',
      });
    }

    await t.sendMail({ from: env.emailFrom, to, subject, html, attachments });
  } catch (e) {
    console.warn('sendMail failed:', e?.message);
  }
}
