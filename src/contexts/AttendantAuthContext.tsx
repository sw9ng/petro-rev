
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

interface AuthResponse {
  success: boolean;
  attendant?: AttendantUser;
  error?: string;
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
        console.log('Found stored attendant session:', parsedAttendant);
        setAttendant(parsedAttendant);
      } catch (error) {
        console.error('Error parsing stored attendant session:', error);
        localStorage.removeItem('attendant_session');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting attendant sign in for:', email);
    try {
      const { data, error } = await supabase.rpc('authenticate_pump_attendant', {
        email,
        password
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        return { error };
      }

      console.log('Authentication response:', data);

      // Type cast the JSON response
      const response = data as unknown as AuthResponse;

      if (response?.success) {
        const attendantData = response.attendant!;
        console.log('Setting attendant data:', attendantData);
        setAttendant(attendantData);
        localStorage.setItem('attendant_session', JSON.stringify(attendantData));
        return { error: null };
      } else {
        console.error('Authentication failed:', response?.error);
        return { error: { message: response?.error || 'Giriş başarısız' } };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signOut = () => {
    console.log('Attendant signing out');
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
