export function calcPrice(start, end, perDay) {
  const s = new Date(start); s.setHours(0,0,0,0);
  const e = new Date(end);   e.setHours(0,0,0,0);
  let days = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
  if (days < 1) days = 1;
  const fees = Math.round(perDay * days * 0.1);
  const total = perDay * days + fees;
  return { days, perDay, fees, total, currency: 'INR' };
}
