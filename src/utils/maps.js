// Simple server-side helper used by email templates
export function buildMaps({ lat, lng, address = "" }) {
  const hasCoords = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
  const q = hasCoords ? `${Number(lat)},${Number(lng)}` : encodeURIComponent(String(address || "").trim());
  return {
    directions: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
    embed: `https://www.google.com/maps?q=${q}&z=15&output=embed`,
  };
}
