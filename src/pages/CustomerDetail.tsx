
import { useParams, useNavigate } from 'react-router-dom';
import { CustomerDetailView } from '@/components/CustomerDetailView';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/');
  };

  console.log('CustomerDetail - ID from params:', id);

  if (!id || id === ':id') {
    console.error('CustomerDetail - Invalid ID provided:', id);
    return (
      <div className="p-8 text-center">
        <p>Geçersiz müşteri ID.</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" 
          onClick={handleBack}
        >
          Geri Dön
        </button>
      </div>
    );
  }

  return <CustomerDetailView customerId={id} onBack={handleBack} />;
};

export default CustomerDetail;
