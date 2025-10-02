import { wrapEmail, brand } from "./layout.js";
import { env } from "../config/env.js";
import { buildMaps } from "../utils/maps.js";

const fmtINR = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })
    .format(Number(v || 0));
const fmtDT = (d) =>
  new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true });

export function bookingPendingHtml({ user, booking, vehicle }) {
  const base = (env.frontendUrl || process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  const payUrl = `${base}/checkout/${booking._id}`;

  const p = booking?.pickup || {};
  const fallbackAddress = vehicle?.location || "";
  const maps = buildMaps({
    lat: p.lat,
    lng: p.lng,
    address: p.address || fallbackAddress,
  });

  const pickupDepotLine = p.name ? `<div style="font-weight:600;">${p.name}</div>` : "";
  const pickupAddrLine =
    (p.address || p.city)
      ? `<div>${[p.address, p.city].filter(Boolean).join(", ")}</div>`
      : (fallbackAddress ? `<div>${fallbackAddress}</div>` : "");
  const pickupHours = p.hours ? `<div style="color:#64748b;">Hours: ${p.hours}</div>` : "";
  const pickupPhone = p.phone ? `<div style="color:#64748b;">Phone: ${p.phone}</div>` : "";
  const mapsBtn = `
    <div style="margin-top:10px;">
      <a href="${maps.directions}" target="_blank"
         style="display:inline-block;padding:10px 14px;background:#e9cb7c;color:#0e1424;text-decoration:none;border-radius:8px;font-weight:600;">
        Open in Google Maps
      </a>
    </div>`;

  const body = `
    <h1 style="margin:0 0 16px;color:#581c87;">Booking Created – Payment Pending</h1>
    <p style="margin:0 0 12px;">Hi ${user?.name || "there"}, your booking has been created. Please complete the payment to confirm your vehicle.</p>

    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:6px 0;color:#334155;width:160px;">Booking ID</td><td style="padding:6px 0;"><b>${booking._id}</b></td></tr>
      <tr><td style="padding:6px 0;color:#334155;">Vehicle</td><td style="padding:6px 0;">${vehicle?.make || ""} ${vehicle?.model || ""}${vehicle?.year ? ` (${vehicle.year})` : ""}</td></tr>
      <tr><td style="padding:6px 0;color:#334155;">Pickup method</td><td style="padding:6px 0;">Depot pickup</td></tr>
      <tr><td style="padding:6px 0;color:#334155;vertical-align:top;">Pickup location</td>
          <td style="padding:6px 0;">
            ${pickupDepotLine}
            ${pickupAddrLine}
            ${pickupHours}
            ${pickupPhone}
            ${mapsBtn}
          </td>
      </tr>
      <tr><td style="padding:6px 0;color:#334155;">Total</td><td style="padding:6px 0;"><b>${fmtINR(booking?.price?.total)}</b></td></tr>
      <tr><td style="padding:6px 0;color:#334155;">From</td><td style="padding:6px 0;">${fmtDT(booking.start)}</td></tr>
      <tr><td style="padding:6px 0;color:#334155;">To</td><td style="padding:6px 0;">${fmtDT(booking.end)}</td></tr>
    </table>

    <div style="text-align:center;margin:24px 0;">
      <a href="${payUrl}" style="background:#7c3aed;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;display:inline-block;font-weight:700">
        Pay Now
      </a>
    </div>

    <p style="margin:8px 0 0;color:#64748b;font-size:12px">
      If the button doesn’t work, copy & paste this link:<br/>
      <span style="word-break:break-all;">${payUrl}</span>
    </p>
  `;
  return wrapEmail({ title: `Booking Created – ${brand}`, bodyHtml: body });
}
