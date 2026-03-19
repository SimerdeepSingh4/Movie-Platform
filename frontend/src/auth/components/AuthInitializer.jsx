import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../../components/ScrollToTop';

const AuthInitializer = () => {
  const { initialized, handleGetMe } = useAuth();

  useEffect(() => {
    if (!initialized) {
      handleGetMe();
    }
  }, [initialized, handleGetMe]);

  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
};

export default AuthInitializer;
