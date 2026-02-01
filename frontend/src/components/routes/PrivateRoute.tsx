import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useStore } from '../../stores/useStore';

const PrivateRoute = () => {
  const isLogin = useStore((state) => state.isLogin);
  const location = useLocation();

  if (!isLogin) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
