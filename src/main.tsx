import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { FreelancerDashboard } from './pages/FreelancerDashboard'
import { ClientGuestView } from './pages/ClientGuestView'
import { AccessDenied } from './pages/AccessDenied'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth & Home Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected Freelancer Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <FreelancerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Public Guest Routes */}
        <Route path="/view/:projectId" element={<ClientGuestView />} />
        <Route path="/denied" element={<AccessDenied />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            border: '2px solid #3F3F46',
            borderRadius: '0px',
            backgroundColor: '#09090B',
            color: '#FAFAFA',
            fontFamily: '"Space Grotesk", sans-serif',
            textTransform: 'uppercase',
          },
          success: {
            iconTheme: {
              primary: '#DFE104',
              secondary: '#09090B',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#09090B',
            },
          },
        }}
      />
      <App />
    </AuthProvider>
  </StrictMode>,
)
