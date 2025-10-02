// src/utils/maps.js
export function buildMaps({ lat, lng, address = "" }) {
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const q = hasCoords ? `${lat},${lng}` : encodeURIComponent((address || "").trim());
  return {
    directions: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
    embed:      `https://www.google.com/maps?q=${q}&z=15&output=embed`,
  };
}
