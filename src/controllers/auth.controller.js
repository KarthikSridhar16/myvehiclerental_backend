import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import { ah } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";
import { sendMail } from "../utils/email.js";
import { passwordResetHtml } from "../emails/passwordReset.js";

function signToken(user) {
  const secret = env?.jwtSecret || env?.JWT_SECRET;
  const expiresIn = env?.jwtExpires || env?.JWT_EXPIRES || "7d";
  return jwt.sign(
    { id: user._id.toString(), role: user.role || "user", email: user.email },
    secret,
    { expiresIn }
  );
}

function publicUser(u) {
  return { _id: u._id, name: u.name, email: u.email, role: u.role || "user" };
}

export const register = ah(async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, password are required" });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already registered" });

  let user = new User({ name, email, role: "user" });
  if (typeof user.setPassword === "function") {
    await user.setPassword(password);
  } else {
    user.passwordHash = await bcrypt.hash(password, 10);
  }
  await user.save();

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

export const login = ah(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await User.findOne({ email }).select("+password +passwordHash +role +email");
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  let ok = false;
  if (typeof user.comparePassword === "function") {
    ok = await user.comparePassword(password);
  } else if (user.passwordHash) {
    ok = await bcrypt.compare(password, user.passwordHash || "");
  } else if (user.password) {
    ok = await bcrypt.compare(password, user.password || "");
  }
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

export const adminLogin = ah(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await User.findOne({ email }).select("+password +passwordHash +role +email");
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  let ok = false;
  if (typeof user.comparePassword === "function") {
    ok = await user.comparePassword(password);
  } else if (user.passwordHash) {
    ok = await bcrypt.compare(password, user.passwordHash || "");
  } else if (user.password) {
    ok = await bcrypt.compare(password, user.password || "");
  }
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: not an admin account" });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

export const forgotPassword = ah(async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email: String(email).toLowerCase() }).lean();
  if (!user) return res.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); 

  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt,
  });

  const appUrl = env.appUrl || process.env.APP_URL || "http://localhost:5173";
  const link = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    const html = passwordResetHtml({ user, link });
    await sendMail(email, "Reset your VehicleRent password", html);
  } catch (e) {
    console.warn("[mail] reset error:", e?.message);
  }

  res.json({ ok: true });
});

export const resetPassword = ah(async (req, res) => {
  const { email, token, password } = req.body || {};
  if (!email || !token || !password) {
    return res.status(400).json({ message: "email, token and password are required" });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(400).json({ message: "Invalid token or user" });

  const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
  const prt = await PasswordResetToken.findOne({
    userId: user._id,
    tokenHash,
    usedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });

  if (!prt) return res.status(400).json({ message: "Invalid or expired token" });

  if (typeof user.setPassword === "function") {
    await user.setPassword(password);
  } else if (user.passwordHash !== undefined) {
    user.passwordHash = await bcrypt.hash(password, 10);
  } else {
    user.password = await bcrypt.hash(password, 10);
  }

  await user.save();
  prt.usedAt = new Date();
  await prt.save();

  res.json({ ok: true, message: "Password updated" });
});
