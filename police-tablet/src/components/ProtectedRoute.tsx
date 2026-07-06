import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Outlet />;
}

export function RequirePermission({
  perm,
  children,
}: {
  perm: keyof import('../types').Permission;
  children: React.ReactNode;
}) {
  const { permissions } = useAuth();
  if (!permissions[perm]) return <Navigate to="/" replace />;
  return <>{children}</>;
}
