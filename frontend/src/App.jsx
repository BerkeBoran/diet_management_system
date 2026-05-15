import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ClientRegisterPage from './pages/public/ClientRegisterPage';
import DieticianRegisterPage from './pages/public/DieticianRegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import SupportPage from './pages/public/SupportPage';
import KvkkPage from './pages/public/KvkkPage';
import FoodsCalorieGuidePage from './pages/public/FoodsCalorieGuidePage';
import VerifyEmailPage from './pages/public/VerifyEmailPage';

import ChoosePlanPage from './pages/client/ChoosePlanPage';
import AISubscribePage from './pages/client/AISubscribePage';
import ClientAIDashboard from './pages/client/ClientAIDashboard';
import ClientDieticianDashboard from './pages/client/ClientDieticianDashboard';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientDietPlan from './pages/client/ClientDietPlan';
import ClientActiveDietPlan from './pages/client/ClientActiveDietPlan';
import ClientDieticians from './pages/client/ClientDieticians';
import ClientAiDietPlan from './pages/client/ClientAiDietPlan';
import ClientMealAnalysis from './pages/client/ClientMealAnalysis';
import ClientAppointments from './pages/client/ClientAppointments';
import ClientChat from './pages/client/ClientChat';
import ClientProfile from './pages/client/ClientProfile';

import DieticianDashboard from './pages/dietician/DieticianDashboard';
import DieticianClients from './pages/dietician/DieticianClients';
import DieticianClientDetail from './pages/dietician/DieticianClientDetail';
import DieticianDietPlanCreate from './pages/dietician/DieticianDietPlanCreate';
import DieticianAvailability from './pages/dietician/DieticianAvailability';
import DieticianAppointments from './pages/dietician/DieticianAppointments';
import DieticianChat from './pages/dietician/DieticianChat';
import DieticianProfile from './pages/dietician/DieticianProfile';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--forest)' }}>
        <div className="spinner-gold" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/client" element={<ClientRegisterPage />} />
      <Route path="/register/dietician" element={<DieticianRegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/kvkk" element={<KvkkPage />} />
      <Route path="/foods/kac-kalori" element={<FoodsCalorieGuidePage />} />
      <Route path="/verify-email/:key" element={<VerifyEmailPage />} />

      <Route
        path="/client/choose-plan"
        element={<ProtectedRoute allowedRole="Client"><ChoosePlanPage /></ProtectedRoute>}
      />
      <Route
        path="/client/subscribe-ai"
        element={<ProtectedRoute allowedRole="Client"><AISubscribePage /></ProtectedRoute>}
      />

      <Route element={<ProtectedRoute allowedRole="Client"><DashboardLayout /></ProtectedRoute>}>
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/client/ai-dashboard" element={<ClientAIDashboard />} />
        <Route path="/client/dietician-dashboard" element={<ClientDieticianDashboard />} />
        <Route path="/client/active-diet-plan" element={<ClientActiveDietPlan />} />
        <Route path="/client/diet-plans" element={<ClientDietPlan />} />
        <Route path="/client/dietitians" element={<ClientDieticians />} />
        <Route path="/client/ai-diet" element={<ClientAiDietPlan />} />
        <Route path="/client/meal-analysis" element={<ClientMealAnalysis />} />
        <Route path="/client/appointments" element={<ClientAppointments />} />
        <Route path="/client/messages" element={<ClientChat />} />
        <Route path="/client/profile" element={<ClientProfile />} />
      </Route>

      <Route element={<ProtectedRoute allowedRole="Dietician"><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dietician/dashboard" element={<DieticianDashboard />} />
        <Route path="/dietician/clients" element={<DieticianClients />} />
        <Route path="/dietician/clients/:id" element={<DieticianClientDetail />} />
        <Route path="/dietician/diet-plan-create" element={<DieticianDietPlanCreate />} />
        <Route path="/dietician/availability" element={<DieticianAvailability />} />
        <Route path="/dietician/appointments" element={<DieticianAppointments />} />
        <Route path="/dietician/messages" element={<DieticianChat />} />
        <Route path="/dietician/profile" element={<DieticianProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
