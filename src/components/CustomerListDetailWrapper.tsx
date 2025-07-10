
import { useState, useEffect } from 'react';
import { CustomerListView } from './CustomerListView';
import { CustomerDetailView } from './CustomerDetailView';

export const CustomerListDetailWrapper = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    // Hash değişikliklerini dinle
    const handleHashChange = () => {
      const hash = window.location.hash;
      console.log('Hash changed:', hash);
      
      if (hash.startsWith('#customer-detail-')) {
        const customerId = hash.replace('#customer-detail-', '');
        console.log('Setting customer ID:', customerId);
        
        // Geçersiz ID kontrolü
        if (customerId && customerId !== 'undefined' && customerId !== 'null') {
          setSelectedCustomerId(customerId);
        } else {
          console.warn('Invalid customer ID detected:', customerId);
          setSelectedCustomerId(null);
          window.location.hash = '';
        }
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
    console.log('Customer selected:', customerId);
    
    if (customerId && customerId !== 'undefined' && customerId !== 'null') {
      setSelectedCustomerId(customerId);
      window.location.hash = `customer-detail-${customerId}`;
    } else {
      console.error('Invalid customer ID provided:', customerId);
    }
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
