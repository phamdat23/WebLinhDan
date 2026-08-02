/**
 * Format raw number to VND Currency string
 * @param {number} amount 
 * @returns {string} Formatted VND string
 */
export const formatCurrencyVND = (amount) => {
  if (typeof amount !== 'number') return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};
