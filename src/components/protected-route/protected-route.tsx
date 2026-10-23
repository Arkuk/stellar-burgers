import { selectIsAuthChecked, selectUser } from '@selectors';
import { Preloader } from '@ui';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useSelector } from '@services/store';

import type { Location } from 'react-router-dom';

type ProtectedRouteProps = { onlyUnAuth?: boolean };

export const ProtectedRoute = ({
  onlyUnAuth = false,
}: ProtectedRouteProps): React.JSX.Element => {
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const user = useSelector(selectUser);
  const location = useLocation();
  if (!isAuthChecked) return <Preloader />;
  if (onlyUnAuth && user) {
    const from = (location.state as { from?: Location } | null)?.from;
    return <Navigate to={from ?? '/'} replace />;
  }
  if (!onlyUnAuth && !user)
    return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
};
