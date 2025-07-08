
import { useParams, useNavigate } from 'react-router-dom';
import { CustomerDetailView } from '@/components/CustomerDetailView';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/');
  };

  console.log('CustomerDetail - ID from params:', id);

  if (!id) {
    console.error('CustomerDetail - No ID provided');
    return (
      <div className="p-8 text-center">
        <p>Müşteri ID bulunamadı.</p>
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
