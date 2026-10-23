import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading,
  selectProfileOrders,
} from '@selectors';
import { fetchProfileOrders } from '@slices/profileOrdersSlice';
import { ProfileOrdersUI } from '@ui-pages';
import { useCallback } from 'react';

import { useOrderRefresh } from '@hooks/use-order-refresh';
import { useDispatch, useSelector } from '@services/store';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector(selectProfileOrders);
  const ingredients = useSelector(selectIngredients);
  const ingredientsLoading = useSelector(selectIngredientsLoading);
  const ingredientsError = useSelector(selectIngredientsError);
  const requestOrders = useCallback(
    (): Promise<unknown> => dispatch(fetchProfileOrders()),
    [dispatch]
  );
  useOrderRefresh(requestOrders);

  return (
    <ProfileOrdersUI
      orders={ingredients.length ? orders : []}
      isLoading={isLoading || ingredientsLoading}
      error={
        error ??
        ingredientsError ??
        (!ingredientsLoading && !ingredients.length ? 'Список ингредиентов пуст.' : null)
      }
    />
  );
};
