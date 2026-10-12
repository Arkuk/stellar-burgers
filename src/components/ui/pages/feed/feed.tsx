import { OrdersList, FeedInfo } from '@components';
import { RefreshButton } from '@krgaa/react-developer-burger-ui-components';
import { Preloader } from '@ui';
import { clsx } from 'clsx';
import { memo } from 'react';

import type { FeedUIProps } from './type';

import styles from './feed.module.css';

export const FeedUI = memo(function FeedUI({
  orders,
  handleGetFeeds,
  isLoading = false,
  error = null,
}: FeedUIProps): React.JSX.Element {
  return (
    <main className={styles.containerMain}>
      <div className={clsx(styles.titleBox, 'mt-10 mb-5')}>
        <h1 className="text text_type_main-large">Лента заказов</h1>
        <RefreshButton
          text={isLoading ? 'Загрузка...' : 'Обновить'}
          onClick={handleGetFeeds}
          extraClass="ml-30"
        />
      </div>
      <div className={styles.main}>
        <div className={styles.columnOrders}>
          {error && (
            <p className="text text_type_main-default mb-5" role="alert">
              Не удалось обновить ленту: {error}. Нажмите «Обновить», чтобы повторить
              запрос.
            </p>
          )}
          {isLoading && !orders.length && <Preloader />}
          {!isLoading && !error && !orders.length && (
            <p className="text text_type_main-default text_color_inactive">
              В ленте пока нет заказов.
            </p>
          )}
          <OrdersList orders={orders} />
        </div>
        <div className={styles.columnInfo}>
          <FeedInfo />
        </div>
      </div>
    </main>
  );
});
