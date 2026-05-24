import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// --- Public sayfalar — landing direkt import (ilk yükleme hızı için) ---
import LandingPage from './pages/public/LandingPage';

// --- Diğer tüm sayfalar lazy: kullanıcı o route'a gidince inecek ---
// Public
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const ClientRegisterPage = lazy(() => import('./pages/public/ClientRegisterPage'));
const DieticianRegisterPage = lazy(() => import('./pages/public/DieticianRegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/public/ResetPasswordPage'));
const SupportPage = lazy(() => import('./pages/public/SupportPage'));
// /kvkk artık Django SSR ile servisleniyor (SEO için) — React route'u kaldırıldı.
// /foods/kac-kalori (root) artık Django SSR ile servisleniyor.
// Arama (/foods/kac-kalori/arama/:query) hâlâ React, JS interaktif arama lazım.
const FoodsCalorieGuidePage = lazy(() => import('./pages/public/FoodsCalorieGuidePage'));
const VerifyEmailPage = lazy(() => import('./pages/public/VerifyEmailPage'));

// Client
const ChoosePlanPage = lazy(() => import('./pages/client/ChoosePlanPage'));
const AISubscribePage = lazy(() => import('./pages/client/AISubscribePage'));
const ClientAIDashboard = lazy(() => import('./pages/client/ClientAIDashboard'));
const ClientDieticianDashboard = lazy(() => import('./pages/client/ClientDieticianDashboard'));
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));
const ClientDietPlan = lazy(() => import('./pages/client/ClientDietPlan'));
const ClientActiveDietPlan = lazy(() => import('./pages/client/ClientActiveDietPlan'));
const ClientDieticians = lazy(() => import('./pages/client/ClientDieticians'));
const ClientAiDietPlan = lazy(() => import('./pages/client/ClientAiDietPlan'));
const ClientMealAnalysis = lazy(() => import('./pages/client/ClientMealAnalysis'));
const ClientAppointments = lazy(() => import('./pages/client/ClientAppointments'));
const ClientChat = lazy(() => import('./pages/client/ClientChat'));
const ClientProfile = lazy(() => import('./pages/client/ClientProfile'));

// Dietician
const DieticianDashboard = lazy(() => import('./pages/dietician/DieticianDashboard'));
const DieticianClients = lazy(() => import('./pages/dietician/DieticianClients'));
const DieticianClientDetail = lazy(() => import('./pages/dietician/DieticianClientDetail'));
const DieticianDietPlanCreate = lazy(() => import('./pages/dietician/DieticianDietPlanCreate'));
const DieticianAvailability = lazy(() => import('./pages/dietician/DieticianAvailability'));
const DieticianAppointments = lazy(() => import('./pages/dietician/DieticianAppointments'));
const DieticianChat = lazy(() => import('./pages/dietician/DieticianChat'));
const DieticianProfile = lazy(() => import('./pages/dietician/DieticianProfile'));

// Lazy route'lar yüklenirken gösterilecek global spinner
function RouteFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--forest)',
      }}
    >
      <div className="spinner-gold" />
    </div>
  );
}

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <RouteFallback />;
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/client" element={<ClientRegisterPage />} />
        <Route path="/register/dietician" element={<DieticianRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/support" element={<SupportPage />} />
        {/* /kvkk ve /foods/kac-kalori (root) artık Django SSR — nginx üzerinden */}
        <Route path="/foods/kac-kalori/arama/:query" element={<FoodsCalorieGuidePage />} />
        <Route path="/verify-email/*" element={<VerifyEmailPage />} />

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
    </Suspense>
  );
}
