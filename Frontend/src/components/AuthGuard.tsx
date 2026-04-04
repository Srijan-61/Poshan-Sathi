import { Navigate } from 'react-router-dom';

interface RouteProps {
  children: React.ReactElement;
  user: any;
}

// Wrapper to protect routes from unauthenticated users
export const ProtectedRoute = ({ children, user }: RouteProps) => {
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  return children;
};

// Wrapper to redirect authenticated users away from public routes
export const PublicRoute = ({ children, user }: RouteProps) => {
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    return <Navigate to="/" />;
  }
  return children;
};

// Wrapper for Admin-only routes
export const AdminRoute = ({ children, user }: RouteProps) => {
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return children;
};
