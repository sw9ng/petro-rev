import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { AttendantAuthProvider } from './contexts/AttendantAuthContext'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <AttendantAuthProvider>
      <App />
    </AttendantAuthProvider>
  </AuthProvider>
);
