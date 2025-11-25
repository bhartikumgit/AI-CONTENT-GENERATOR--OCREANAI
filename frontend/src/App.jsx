import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { apiService } from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Configure from './pages/Configure';
import Editor from './pages/Editor';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const isAuthenticated = !!apiService.getToken();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Public Route Wrapper (redirect if authenticated)
function PublicRoute({ children }) {
  const isAuthenticated = !!apiService.getToken();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/configure"
          element={
            <ProtectedRoute>
              <Configure />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}
