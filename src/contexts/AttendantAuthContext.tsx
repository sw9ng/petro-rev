
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AttendantUser {
  id: string;
  name: string;
  station_id: string;
  email: string;
}

interface AttendantAuthContextType {
  attendant: AttendantUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => void;
}

const AttendantAuthContext = createContext<AttendantAuthContextType | undefined>(undefined);

export const useAttendantAuth = () => {
  const context = useContext(AttendantAuthContext);
  if (!context) {
    throw new Error('useAttendantAuth must be used within an AttendantAuthProvider');
  }
  return context;
};

export const AttendantAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [attendant, setAttendant] = useState<AttendantUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored attendant session
    const storedAttendant = localStorage.getItem('attendant_session');
    if (storedAttendant) {
      try {
        const parsedAttendant = JSON.parse(storedAttendant);
        setAttendant(parsedAttendant);
      } catch (error) {
        localStorage.removeItem('attendant_session');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.rpc('authenticate_pump_attendant', {
        email,
        password
      });

      if (error) {
        return { error };
      }

      if (data?.success) {
        const attendantData = data.attendant;
        setAttendant(attendantData);
        localStorage.setItem('attendant_session', JSON.stringify(attendantData));
        return { error: null };
      } else {
        return { error: { message: data?.error || 'Giriş başarısız' } };
      }
    } catch (error) {
      return { error };
    }
  };

  const signOut = () => {
    setAttendant(null);
    localStorage.removeItem('attendant_session');
  };

  return (
    <AttendantAuthContext.Provider value={{
      attendant,
      loading,
      signIn,
      signOut
    }}>
      {children}
    </AttendantAuthContext.Provider>
  );
};
