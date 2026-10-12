import { ProfileMenu, OrdersList } from '@components';
import { Preloader } from '@ui';
import { clsx } from 'clsx';

import type { ProfileOrdersUIProps } from './type';

import styles from './profile-orders.module.css';

export const ProfileOrdersUI = ({
  orders,
  isLoading = false,
  error = null,
}: ProfileOrdersUIProps): React.JSX.Element => (
  <main className={styles.main}>
    <div className={clsx('mt-30 mr-15', styles.menu)}>
      <ProfileMenu />
    </div>
    <div className={clsx('mt-10', styles.orders)}>
      {error && (
        <p className="text text_type_main-default mb-5" role="alert">
          Не удалось обновить историю: {error}
        </p>
      )}
      {isLoading && !orders.length && <Preloader />}
      {!isLoading && !error && !orders.length && (
        <p className="text text_type_main-default text_color_inactive">
          Вы ещё не сделали ни одного заказа.
        </p>
      )}
      <div className={styles.orderList}>
        <OrdersList orders={orders} />
      </div>
    </div>
  </main>
);
