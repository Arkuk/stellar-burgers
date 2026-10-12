import type { RootState } from '../store';
import type { FeedState, ProfileOrdersState } from '../types';
import type { TConstructorState, TIngredient, TOrder, TUser } from '@utils-types';

export const selectIngredients = (state: RootState): TIngredient[] =>
  state.ingredients.ingredients;
export const selectIngredientsLoading = (state: RootState): boolean =>
  state.ingredients.isLoading || !state.ingredients.isLoaded;
export const selectIngredientsError = (state: RootState): string | null =>
  state.ingredients.error;
export const selectConstructorItems = (state: RootState): TConstructorState =>
  state.burgerConstructor;
export const selectUser = (state: RootState): TUser | null => state.user.user;
export const selectIsAuthChecked = (state: RootState): boolean =>
  state.user.isAuthChecked;
export const selectUserLoading = (state: RootState): boolean => state.user.isLoading;
export const selectUserError = (state: RootState): string | null => state.user.error;
export const selectOrderModalData = (state: RootState): TOrder | null =>
  state.order.orderModalData;
export const selectOrderRequest = (state: RootState): boolean =>
  state.order.orderRequest;
export const selectOrderError = (state: RootState): string | null => state.order.error;
export const selectOrderDetails = (state: RootState): TOrder | null =>
  state.order.orderDetails;
export const selectOrderDetailsLoading = (state: RootState): boolean =>
  state.order.detailsLoading;
export const selectOrderDetailsError = (state: RootState): string | null =>
  state.order.detailsError;
export const selectFeed = (state: RootState): FeedState => state.feed;
export const selectProfileOrders = (state: RootState): ProfileOrdersState =>
  state.profileOrders;
