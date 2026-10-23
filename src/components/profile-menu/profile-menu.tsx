import { selectUserError, selectUserLoading } from '@selectors';
import { logoutUser } from '@slices/userSlice';
import { ProfileMenuUI } from '@ui';
import { useLocation } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

export const ProfileMenu = (): React.JSX.Element => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);

  const handleLogout = (): void => {
    if (!isLoading) void dispatch(logoutUser());
  };

  return (
    <>
      <ProfileMenuUI
        handleLogout={handleLogout}
        pathname={pathname}
        isLoading={isLoading}
      />
      {error && pathname !== '/profile' && (
        <p role="alert" className="text text_type_main-default mt-4">
          {error}
        </p>
      )}
    </>
  );
};
