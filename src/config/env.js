import 'dotenv/config';

export const env = {
  node: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 8099),
  mongo: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpires: process.env.JWT_EXPIRES ?? '7d',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  email: {
    from: process.env.EMAIL_FROM,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  stripe: {
    secret: process.env.STRIPE_SECRET,
    wh: process.env.STRIPE_WEBHOOK_SECRET
  },
  razorpay: {
    id: process.env.RAZORPAY_KEY_ID,
    secret: process.env.RAZORPAY_KEY_SECRET
  }
};
