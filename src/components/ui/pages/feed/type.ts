import type { TOrder } from '@utils-types';

export type FeedUIProps = {
  orders: TOrder[];
  handleGetFeeds: () => void;
  isLoading?: boolean;
  error?: string | null;
};
