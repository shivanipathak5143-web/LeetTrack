import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Toast from './components/ui/Toast';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LogProblem from './pages/LogProblem';
import History from './pages/History';
import Revise from './pages/Revise';
import Stats from './pages/Stats';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

function AppLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Toast />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected */}
              <Route element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/log" element={<LogProblem />} />
                <Route path="/history" element={<History />} />
                <Route path="/revise" element={<Revise />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
