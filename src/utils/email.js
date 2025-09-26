import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.email.smtpHost,
  port: env.email.smtpPort,
  auth: { user: env.email.user, pass: env.email.pass }
});

export const sendMail = (to, subject, html) =>
  transporter.sendMail({ from: env.email.from, to, subject, html });
