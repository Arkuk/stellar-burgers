import { selectUserError, selectUserLoading } from '@selectors';
import { clearUserError, forgotPassword } from '@slices/userSlice';
import { ForgotPasswordUI } from '@ui-pages';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { SyntheticEvent } from 'react';

export const ForgotPassword = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    if (isLoading) return;
    void dispatch(forgotPassword({ email })).then((action) => {
      if (forgotPassword.fulfilled.match(action))
        void navigate('/reset-password', { replace: true });
    });
  };

  return (
    <ForgotPasswordUI
      errorText={error ?? undefined}
      isLoading={isLoading}
      email={email}
      setEmail={setEmail}
      handleSubmit={handleSubmit}
    />
  );
};
