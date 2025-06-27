
// Format numbers with Turkish locale (uses dots as thousand separators)
export const formatNumber = (num: number): string => {
  return num.toLocaleString('tr-TR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  });
};

// Format currency with Turkish Lira symbol
export const formatCurrency = (amount: number): string => {
  return `₺${formatNumber(amount)}`;
};

// Istanbul timezone helper (UTC+3)
export const getIstanbulTime = (date?: Date): Date => {
  const d = date || new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const istanbul = new Date(utc + (3 * 3600000)); // UTC+3
  return istanbul;
};

// Format date for input fields in Istanbul timezone
export const formatDateForInput = (date: Date): string => {
  const istanbul = getIstanbulTime(date);
  const year = istanbul.getFullYear();
  const month = String(istanbul.getMonth() + 1).padStart(2, '0');
  const day = String(istanbul.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format time for input fields in Istanbul timezone
export const formatTimeForInput = (date: Date): string => {
  const istanbul = getIstanbulTime(date);
  const hours = String(istanbul.getHours()).padStart(2, '0');
  const minutes = String(istanbul.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
