import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Outlet } from 'react-router-dom';

const AuthInitializer = () => {
  const { initialized, handleGetMe } = useAuth();

  useEffect(() => {
    if (!initialized) {
      handleGetMe();
    }
  }, [initialized, handleGetMe]);

  return <Outlet />;
};

export default AuthInitializer;
