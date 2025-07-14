
import { PetronetSettings } from '@/components/PetronetSettings';

const PetronetSync = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Petronet Senkronizasyon</h1>
        <p className="text-gray-600">
          Petronet sisteminizden otomatik olarak vardiya dosyalarını çekin ve sisteminize aktarın
        </p>
      </div>
      
      <PetronetSettings />
    </div>
  );
};

export default PetronetSync;
