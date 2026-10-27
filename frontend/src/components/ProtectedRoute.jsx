// Wraps pages that need a logged-in user. If nobody is logged in, go to /login.
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // <Outlet /> shows whichever child route matched (Dashboard, Tasks, ...).
  return <Outlet />;
}

export default ProtectedRoute;
