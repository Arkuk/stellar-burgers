import type {
  TConstructorState,
  TFeedState,
  TIngredient,
  TOrder,
  TUser,
} from '@utils-types';

export type IngredientsState = {
  ingredients: TIngredient[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  requestId: string | null;
};

export type UserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isLoading: boolean;
  error: string | null;
  requestId: string | null;
};

export type OrderState = {
  orderModalData: TOrder | null;
  orderRequest: boolean;
  error: string | null;
  requestId: string | null;
  orderDetails: TOrder | null;
  detailsLoading: boolean;
  detailsError: string | null;
  detailsRequestId: string | null;
  detailsNumber: number | null;
};

export type FeedState = TFeedState & {
  requestId: string | null;
};

export type ProfileOrdersState = {
  orders: TOrder[];
  isLoading: boolean;
  error: string | null;
  requestId: string | null;
};

export type ServicesState = {
  ingredients: IngredientsState;
  burgerConstructor: TConstructorState;
  user: UserState;
  order: OrderState;
  feed: FeedState;
  profileOrders: ProfileOrdersState;
};

export type AsyncThunkConfig = {
  state: ServicesState;
  rejectValue: string;
};
