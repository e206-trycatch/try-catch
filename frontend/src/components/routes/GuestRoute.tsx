import { Navigate, Outlet } from 'react-router-dom';

import { useStore } from '../../stores/useStore';

const GuestRoute = () => {
  const isLogin = useStore((state) => state.isLogin);

  if (isLogin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
