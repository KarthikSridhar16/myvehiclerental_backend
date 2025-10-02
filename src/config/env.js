export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8099),
  mongoUri: process.env.MONGO_URI,

  corsOrigin: process.env.CORS_ORIGIN || '',

  jwtSecret: process.env.JWT_SECRET,
  jwtExpires: process.env.JWT_EXPIRES || '7d',

  emailFrom: process.env.EMAIL_FROM,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,

  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,

  pendingHoldMin: Number(process.env.PENDING_HOLD_MIN || 15),

  stripeSecret: process.env.STRIPE_SECRET,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
};
