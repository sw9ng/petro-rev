
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { AttendantAuthProvider } from './contexts/AttendantAuthContext'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AttendantAuthProvider>
        <App />
      </AttendantAuthProvider>
    </AuthProvider>
  </StrictMode>
);
