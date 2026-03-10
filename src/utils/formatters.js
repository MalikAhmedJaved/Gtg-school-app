/**
 * Format a date string (YYYY-MM-DD or ISO) to DD/MM/YYYY
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const str = typeof dateStr === 'string' ? dateStr : String(dateStr);
    // Handle ISO or YYYY-MM-DD
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

/**
 * Format time range as "HH:MM - HH:MM" or single time
 */
export const formatTimeRange = (time, endTime) => {
  if (!time) return '-';
  if (endTime) return `${time} - ${endTime}`;
  return time;
};
