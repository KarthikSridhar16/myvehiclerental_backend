import 'dotenv/config';
import sgMail from '@sendgrid/mail';

const KEY = process.env.SENDGRID_API_KEY;
const FROM = process.env.EMAIL_FROM;
const TO = process.argv[2] || FROM; // pass recipient as CLI arg

if (!KEY || !FROM) {
  console.error('Missing SENDGRID_API_KEY or EMAIL_FROM in .env');
  process.exit(1);
}

sgMail.setApiKey(KEY);

try {
  const [resp] = await sgMail.send({
    to: TO,
    from: FROM,                         // MUST be your verified sender
    subject: 'VRUMA test (local)',
    html: '<b>Hello from VRUMA (local)</b>',
  });
  console.log('Sent:', resp.statusCode);
} catch (e) {
  console.error('Failed:', e.code || e.message);
  console.error('Details:', e.response?.statusCode, e.response?.body);
}
