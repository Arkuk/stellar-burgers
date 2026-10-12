import { clsx } from 'clsx';
import { NavLink } from 'react-router-dom';

import type { ProfileMenuUIProps } from './type';

import styles from './profile-menu.module.css';

export const ProfileMenuUI = ({
  pathname,
  handleLogout,
  isLoading = false,
}: ProfileMenuUIProps): React.JSX.Element => (
  <>
    <NavLink
      to={'/profile'}
      className={({ isActive }) =>
        clsx('text text_type_main-medium text_color_inactive pt-4 pb-4', styles.link, {
          [styles.link_active]: isActive,
        })
      }
      end
    >
      Профиль
    </NavLink>
    <NavLink
      to={'/profile/orders'}
      className={({ isActive }) =>
        clsx('text text_type_main-medium text_color_inactive pt-4 pb-4', styles.link, {
          [styles.link_active]: isActive,
        })
      }
    >
      История заказов
    </NavLink>
    <button
      className={clsx(
        'text text_type_main-medium text_color_inactive pt-4 pb-4',
        styles.button
      )}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? 'Подождите…' : 'Выход'}
    </button>
    <p className="pt-20 text text_type_main-default text_color_inactive">
      {pathname === '/profile'
        ? 'В этом разделе вы можете изменить свои персональные данные'
        : 'В этом разделе вы можете просмотреть свою историю заказов'}
    </p>
  </>
);
