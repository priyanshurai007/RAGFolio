import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { authAPI } from './lib/api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import Chat from './pages/Chat';
import Settings from './pages/Settings';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { token, login, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      // If token exists, verify it's still valid
      if (token) {
        try {
          const response = await authAPI.me();
          const user = response.data.user;
          // Re-login to ensure state is synced
          login(user, token);
        } catch (error) {
          // Token is invalid, clear it
          logout();
        }
      }
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/upload" replace />} />
        <Route path="upload" element={<Upload />} />
        <Route path="chat/:id" element={<Chat />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
