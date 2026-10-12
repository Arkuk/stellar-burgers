import { selectFeed } from '@selectors';
import { FeedInfoUI } from '@ui';

import { useSelector } from '@services/store';

import type { TOrder } from '@utils-types';

const getOrders = (orders: TOrder[], status: string): number[] =>
  orders
    .filter((item) => item.status === status)
    .map((item) => item.number)
    .slice(0, 20);

export const FeedInfo = (): React.JSX.Element => {
  const feed = useSelector(selectFeed);
  const { orders } = feed;

  const readyOrders = getOrders(orders, 'done');

  const pendingOrders = orders
    .filter((order) => order.status === 'pending' || order.status === 'created')
    .map((order) => order.number)
    .slice(0, 20);

  return (
    <FeedInfoUI readyOrders={readyOrders} pendingOrders={pendingOrders} feed={feed} />
  );
};
