import dayjs from 'dayjs';
export const calcPrice = (start, end, perDay) => {
  const days = Math.max(1, dayjs(end).diff(dayjs(start),'day'));
  const fees = Math.round(perDay * days * 0.1);
  const total = perDay * days + fees;
  return { days, perDay, fees, total, currency:'INR' };
};
