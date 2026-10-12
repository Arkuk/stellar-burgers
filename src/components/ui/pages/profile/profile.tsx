import { ProfileMenu } from '@components';
import { Button, Input } from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';

import type { ProfileUIProps } from './type';

import styles from './profile.module.css';

export const ProfileUI = ({
  isLoading = false,
  formValue,
  isFormChanged,
  updateUserError,
  handleSubmit,
  handleCancel,
  handleInputChange,
}: ProfileUIProps): React.JSX.Element => (
  <main className={styles.container}>
    <div className={clsx('mt-30 mr-15', styles.menu)}>
      <ProfileMenu />
    </div>
    <form
      className={clsx('mt-30', styles.form)}
      aria-busy={isLoading}
      onSubmit={handleSubmit}
    >
      <>
        <div className="pb-6">
          <Input
            disabled={isLoading}
            type={'text'}
            required
            placeholder={'Имя'}
            onChange={handleInputChange}
            value={formValue.name}
            name={'name'}
            error={false}
            errorText={''}
            size={'default'}
            icon={'EditIcon'}
          />
        </div>
        <div className="pb-6">
          <Input
            disabled={isLoading}
            type={'email'}
            required
            placeholder={'E-mail'}
            onChange={handleInputChange}
            value={formValue.email}
            name={'email'}
            error={false}
            errorText={''}
            size={'default'}
            icon={'EditIcon'}
          />
        </div>
        <div className="pb-6">
          <Input
            disabled={isLoading}
            type={'password'}
            minLength={6}
            placeholder={'Пароль'}
            onChange={handleInputChange}
            value={formValue.password}
            name={'password'}
            error={false}
            errorText={''}
            size={'default'}
            icon={'EditIcon'}
          />
        </div>
        {isFormChanged && (
          <div>
            <Button
              type="secondary"
              htmlType="button"
              size="medium"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="primary" size="medium" htmlType="submit" disabled={isLoading}>
              {isLoading ? 'Сохраняем…' : 'Сохранить'}
            </Button>
          </div>
        )}
        {updateUserError && (
          <p
            role="alert"
            className={clsx(styles.error, 'pt-5 text text_type_main-default')}
          >
            {updateUserError}
          </p>
        )}
      </>
    </form>
  </main>
);
