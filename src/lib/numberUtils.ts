
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

// Format date for input fields (use local time, not timezone converted)
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format time for input fields (use local time, not timezone converted)
export const formatTimeForInput = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Get current date in Istanbul timezone (for new entries)
export const getIstanbulTime = (date?: Date): Date => {
  const d = date || new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const istanbul = new Date(utc + (3 * 3600000)); // UTC+3
  return istanbul;
};

// Parse datetime string without timezone offset issues - show exact input
export const parseDateTime = (dateTimeString: string): Date => {
  // Create date directly from the ISO string without timezone conversion
  return new Date(dateTimeString);
};

// Format date and time for display - show exact stored time without timezone conversion
export const formatDateTimeForDisplay = (dateTimeString: string): Date => {
  // Parse the datetime string and return it as-is without timezone adjustments
  return new Date(dateTimeString);
};
