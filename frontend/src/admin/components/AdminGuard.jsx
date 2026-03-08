import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const AdminGuard = () => {
  const { user, initialized } = useSelector((state) => state.auth);

  if (!initialized) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If not logged in, or logged in but NOT an admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
