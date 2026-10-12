import { selectUserError, selectUserLoading } from '@selectors';
import { clearUserError, loginUser } from '@slices/userSlice';
import { LoginUI } from '@ui-pages';
import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from '@services/store';

import type { SyntheticEvent } from 'react';

export const Login = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);

  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    if (!isLoading) void dispatch(loginUser({ email, password }));
  };

  return (
    <LoginUI
      errorText={error ?? undefined}
      isLoading={isLoading}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
