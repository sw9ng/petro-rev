
export const formatNumber = (value: number): string => {
  return value.toLocaleString('tr-TR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

export const formatCurrency = (value: number): string => {
  return `₺${formatNumber(value)}`;
};
