
/**
 * Format a number as Turkish Lira currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number with thousand separators (Turkish locale)
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('tr-TR').format(num);
};

/**
 * Parse a Turkish formatted number string to number
 */
export const parseNumber = (str: string): number => {
  return parseFloat(str.replace(/\./g, '').replace(',', '.'));
};

/**
 * Format percentage with Turkish locale
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};
