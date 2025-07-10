import { useState, useEffect } from 'react';
import { CustomerListView } from './CustomerListView';
import { CustomerDetailView } from './CustomerDetailView';

export const CustomerListDetailWrapper = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    // Hash değişikliklerini dinle
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#customer-detail-')) {
        const customerId = hash.replace('#customer-detail-', '');
        setSelectedCustomerId(customerId);
      } else {
        setSelectedCustomerId(null);
      }
    };

    // İlk yüklemede hash'i kontrol et
    handleHashChange();

    // Hash değişikliklerini dinle
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    window.location.hash = `customer-detail-${customerId}`;
  };

  const handleBack = () => {
    setSelectedCustomerId(null);
    window.location.hash = '';
  };

  if (selectedCustomerId) {
    return (
      <CustomerDetailView 
        customerId={selectedCustomerId} 
        onBack={handleBack}
      />
    );
  }

  return (
    <CustomerListView onCustomerSelect={handleCustomerSelect} />
  );
};