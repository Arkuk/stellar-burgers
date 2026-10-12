import {
  BurgerIcon,
  ListIcon,
  ProfileIcon,
  Logo,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { Link, NavLink, useLocation } from 'react-router-dom';

import type { TAppHeaderUIProps } from './type';

import styles from './app-header.module.css';

export const AppHeaderUI = ({ userName }: TAppHeaderUIProps): React.JSX.Element => {
  const { pathname } = useLocation();
  const isConstructor = pathname === '/' || pathname.startsWith('/ingredients/');
  const isFeed = pathname === '/feed' || pathname.startsWith('/feed/');
  const isProfile = pathname === '/profile' || pathname.startsWith('/profile/');
  return (
    <header className={styles.header}>
      <nav className={clsx(styles.menu, 'p-4')} aria-label="Основная навигация">
        <div className={styles.menu_part_left}>
          <NavLink
            to="/"
            end
            className={clsx(styles.link, isConstructor && styles.link_active)}
            aria-current={isConstructor ? 'page' : undefined}
          >
            <BurgerIcon type={isConstructor ? 'primary' : 'secondary'} />
            <p className="text text_type_main-default ml-2 mr-10">Конструктор</p>
          </NavLink>
          <NavLink
            to="/feed"
            className={clsx(styles.link, isFeed && styles.link_active)}
          >
            <ListIcon type={isFeed ? 'primary' : 'secondary'} />
            <p className="text text_type_main-default ml-2">Лента заказов</p>
          </NavLink>
        </div>
        <Link to="/" className={styles.logo} aria-label="Stellar Burgers — главная">
          <Logo className="" />
        </Link>
        <NavLink
          to="/profile"
          className={clsx(
            styles.link,
            styles.link_position_last,
            isProfile && styles.link_active
          )}
        >
          <ProfileIcon type={isProfile ? 'primary' : 'secondary'} />
          <p className="text text_type_main-default ml-2">
            {userName ?? 'Личный кабинет'}
          </p>
        </NavLink>
      </nav>
    </header>
  );
};
