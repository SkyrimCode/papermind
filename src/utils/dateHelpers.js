/**
 * Utility functions for date formatting
 */

/**
 * Get ordinal suffix for a day (st, nd, rd, th)
 * @param {number} day - Day of the month
 * @returns {string} Ordinal suffix
 */
export const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

/**
 * Format date with ordinal suffix (e.g., "27th Oct, 2025")
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateWithOrdinal = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  
  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
};

/**
 * Format date for display (e.g., "Oct 27, 2025, 2:30 PM")
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
