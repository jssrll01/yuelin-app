import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { Spinner } from './Ui.jsx';

export default function RequireAuth({ children }) {
  const { session, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Spinner />;
  if (!session) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}
