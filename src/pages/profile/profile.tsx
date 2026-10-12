import { selectUser, selectUserError, selectUserLoading } from '@selectors';
import { clearUserError, updateUser } from '@slices/userSlice';
import { ProfileUI } from '@ui-pages';
import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from '@services/store';

import type { SyntheticEvent } from 'react';

export const Profile = (): React.JSX.Element => {
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  const dispatch = useDispatch();

  const [formValue, setFormValue] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
  });

  useEffect(() => {
    setFormValue({ name: user?.name ?? '', email: user?.email ?? '', password: '' });
  }, [user]);

  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    if (!isFormChanged || isLoading) return;
    const changes = { name: formValue.name, email: formValue.email };
    void dispatch(
      updateUser(
        formValue.password ? { ...changes, password: formValue.password } : changes
      )
    );
  };

  const handleCancel = (e: SyntheticEvent): void => {
    e.preventDefault();
    setFormValue({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
    });
    dispatch(clearUserError());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isLoading={isLoading}
      updateUserError={error ?? undefined}
      isFormChanged={isFormChanged}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
