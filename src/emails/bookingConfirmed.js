// server/src/emails/bookingConfirmed.js
import { wrapEmail } from './layout.js';
import { buildMaps } from '../utils/maps.js';  

export function bookingConfirmedHtml({ user, booking, vehicle, payment }) {
  const title = 'Payment Successful – Booking Confirmed';

  
  const p = booking?.pickup || {};
  const fallbackAddress = vehicle?.location || '';
  const maps = buildMaps({
    lat: p.lat,
    lng: p.lng,
    address: p.address || fallbackAddress,
  });

  const pickupDepotLine = p.name ? `<div style="font-weight:600;">${p.name}</div>` : '';
  const pickupAddrLine =
    (p.address || p.city)
      ? `<div>${[p.address, p.city].filter(Boolean).join(', ')}</div>`
      : (fallbackAddress ? `<div>${fallbackAddress}</div>` : '');
  const pickupHours = p.hours ? `<div style="color:#64748b;">Hours: ${p.hours}</div>` : '';
  const pickupPhone = p.phone ? `<div style="color:#64748b;">Phone: ${p.phone}</div>` : '';
  const mapsBtn = `
    <div style="margin-top:10px;">
      <a href="${maps.directions}" target="_blank"
         style="display:inline-block;padding:10px 14px;background:#e9cb7c;color:#0e1424;
                text-decoration:none;border-radius:8px;font-weight:600;">
        Open in Google Maps
      </a>
    </div>`;

  const body = `
    <h2 style="margin:0 0 10px;font-size:20px;">${title}</h2>
    <p style="margin:0 0 16px;">Hi ${user?.name || 'there'},</p>
    <p style="margin:0 0 16px;">
      Your payment has been received successfully. Your booking is now <b>confirmed</b>.
    </p>

    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px 0;color:#334155;width:180px;">Booking ID</td><td style="padding:8px 0;"><b>${booking._id}</b></td></tr>
      <tr><td style="padding:8px 0;color:#334155;">Vehicle</td><td style="padding:8px 0;">${vehicle.make} ${vehicle.model}${vehicle.year ? ` (${vehicle.year})` : ''}</td></tr>
      <tr><td style="padding:8px 0;color:#334155;">Pickup method</td><td style="padding:8px 0;">Depot pickup</td></tr>
      <tr><td style="padding:8px 0;color:#334155;vertical-align:top;">Pickup location</td>
          <td style="padding:8px 0;">
            ${pickupDepotLine}
            ${pickupAddrLine}
            ${pickupHours}
            ${pickupPhone}
            ${mapsBtn}
          </td>
      </tr>
      <tr><td style="padding:8px 0;color:#334155;">Amount</td><td style="padding:8px 0;">₹${Number(booking.price?.total || 0).toFixed(2)} ${booking.price?.currency || 'INR'}</td></tr>
      <tr><td style="padding:8px 0;color:#334155;">Payment ID</td><td style="padding:8px 0;">${payment?.paymentId || '-'}</td></tr>
      <tr><td style="padding:8px 0;color:#334155;">From</td><td style="padding:8px 0;">${new Date(booking.start).toLocaleString()}</td></tr>
      <tr><td style="padding:8px 0;color:#334155;">To</td><td style="padding:8px 0;">${new Date(booking.end).toLocaleString()}</td></tr>
      <tr><td style="padding:8px 0;color:#334155;">Status</td><td style="padding:8px 0;"><b>confirmed</b></td></tr>
    </table>

    <p style="margin:8px 0;color:#64748b;">Thank you for choosing us. Have a great ride!</p>
  `;
  return wrapEmail({ title, bodyHtml: body });
}
