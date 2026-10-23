import { selectUserError, selectUserLoading } from '@selectors';
import { clearUserError, resetPassword } from '@slices/userSlice';
import { ResetPasswordUI } from '@ui-pages';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { SyntheticEvent } from 'react';

export const ResetPassword = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const dispatch = useDispatch();
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    if (isLoading) return;
    void dispatch(resetPassword({ password, token })).then((action) => {
      if (resetPassword.fulfilled.match(action))
        void navigate('/login', { replace: true });
    });
  };

  useEffect(() => {
    dispatch(clearUserError());
    if (!localStorage.getItem('resetPassword')) {
      void navigate('/forgot-password', { replace: true });
    }
  }, [dispatch, navigate]);

  return (
    <ResetPasswordUI
      errorText={error ?? undefined}
      isLoading={isLoading}
      password={password}
      token={token}
      setPassword={setPassword}
      setToken={setToken}
      handleSubmit={handleSubmit}
    />
  );
};
