/**
 * Formats a standard number (Rupees) as Indian Rupee (INR)
 * Uses the Indian numbering system (Lakhs, Crores)
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0); // Safely formats the exact number given
};