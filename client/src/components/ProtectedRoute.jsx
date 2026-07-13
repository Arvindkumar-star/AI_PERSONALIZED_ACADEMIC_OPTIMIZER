import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { PageLoader } from '@/components/Spinner';

export function ProtectedRoute({ children }) {
  const { user, status } = useSelector((s) => s.auth);
  const location = useLocation();

  if (status === 'loading') return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export default ProtectedRoute;
