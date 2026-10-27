// Turns "2026-10-27T05:30:00Z" into something readable like "27 Oct 2026, 11:00 am".
export function formatDate(isoString) {
  if (!isoString) {
    return '-';
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString; // not a valid date, show it as it came
  }
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}
