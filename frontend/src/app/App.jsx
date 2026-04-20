import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import { useAuth } from '../contexts/useAuth.js';
import { ToastProvider } from '../components/Toast';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import LandingPage from '../pages/landing/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ClientRegisterPage from '../pages/auth/ClientRegisterPage.jsx';
import DieticianRegisterPage from '../pages/auth/DieticianRegisterPage';

// Client Pages
import ClientDashboard from '../pages/client/ClientDashboard';
import DieticianListPage from '../pages/client/DieticianListPage';
import DieticianDetailPage from '../pages/client/DieticianDetailPage';
import MyDietPlanPage from '../pages/client/MyDietPlanPage';
import HealthProfilePage from '../pages/client/HealthProfilePage';
import AppointmentPage from '../pages/client/AppointmentPage';
import AIDietPage from '../pages/client/AIDietPage';
import FoodSearchPage from '../pages/client/FoodSearchPage';

// Dietician Pages
import DieticianDashboard from '../pages/dietician/DieticianDashboard';
import ClientsPage from '../pages/dietician/ClientsPage';
import ClientDetailPage from '../pages/dietician/ClientDetailPage';
import CreateDietPlanPage from '../pages/dietician/CreateDietPlanPage';
import DietPlanDetailPage from '../pages/dietician/DietPlanDetailPage';

// Shared Pages
import ChatPage from '../pages/chat/ChatPage';
import ProfilePage from '../pages/profile/ProfilePage';

function AppLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const publicPaths = ['/', '/login', '/register', '/register/client', '/register/dietician'];
  const isPublicPage = publicPaths.includes(location.pathname);

  if (isPublicPage) {
    return (
      <>
        {!isAuthenticated && <Navbar />}
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/client" element={<ClientRegisterPage />} />
            <Route path="/register/dietician" element={<DieticianRegisterPage />} />
          </Routes>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="lg:ml-64 p-4 lg:p-6 pt-18 lg:pt-6 min-h-screen">
        <Routes>
          {/* Client Routes */}
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="Client"><ClientDashboard /></ProtectedRoute>} />
          <Route path="/dieticians" element={<ProtectedRoute requiredRole="Client"><DieticianListPage /></ProtectedRoute>} />
          <Route path="/dieticians/:id" element={<ProtectedRoute requiredRole="Client"><DieticianDetailPage /></ProtectedRoute>} />
          <Route path="/my-diet" element={<ProtectedRoute requiredRole="Client"><MyDietPlanPage /></ProtectedRoute>} />
          <Route path="/health-profile" element={<ProtectedRoute requiredRole="Client"><HealthProfilePage /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute requiredRole="Client"><AppointmentPage /></ProtectedRoute>} />
          <Route path="/ai-diet" element={<ProtectedRoute requiredRole="Client"><AIDietPage /></ProtectedRoute>} />

          {/* Dietician Routes */}
          <Route path="/dietician/dashboard" element={<ProtectedRoute requiredRole="Dietician"><DieticianDashboard /></ProtectedRoute>} />
          <Route path="/dietician/clients" element={<ProtectedRoute requiredRole="Dietician"><ClientsPage /></ProtectedRoute>} />
          <Route path="/dietician/clients/:id" element={<ProtectedRoute requiredRole="Dietician"><ClientDetailPage /></ProtectedRoute>} />
          <Route path="/dietician/create-plan" element={<ProtectedRoute requiredRole="Dietician"><CreateDietPlanPage /></ProtectedRoute>} />
          <Route path="/dietician/plans/:id" element={<ProtectedRoute requiredRole="Dietician"><DietPlanDetailPage /></ProtectedRoute>} />

          {/* Shared Routes */}
          <Route path="/foods" element={<ProtectedRoute><FoodSearchPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </AuthProvider>
  );
}
