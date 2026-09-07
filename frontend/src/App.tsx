import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { TraceabilityPage } from './pages/TraceabilityPage';
import { FamiliesPage } from './pages/FamiliesPage';
import { VisitsPage } from './pages/VisitsPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/traceability"
              element={
                <ProtectedRoute>
                  <TraceabilityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/families"
              element={
                <ProtectedRoute>
                  <FamiliesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/visits"
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'WORKER']}>
                  <VisitsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
