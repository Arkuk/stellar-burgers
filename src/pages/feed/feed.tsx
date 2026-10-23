import {
  selectFeed,
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading,
} from '@selectors';
import { fetchFeed } from '@slices/feedSlice';
import { fetchIngredients } from '@slices/ingredientsSlice';
import { FeedUI } from '@ui-pages';
import { useCallback } from 'react';

import { useOrderRefresh } from '@hooks/use-order-refresh';
import { useDispatch, useSelector } from '@services/store';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector(selectFeed);
  const ingredients = useSelector(selectIngredients);
  const ingredientsLoading = useSelector(selectIngredientsLoading);
  const ingredientsError = useSelector(selectIngredientsError);
  const requestFeed = useCallback(
    (): Promise<unknown> => dispatch(fetchFeed()),
    [dispatch]
  );
  const refresh = useOrderRefresh(requestFeed);

  const handleGetFeeds = (): void => {
    refresh();
    if (ingredientsError || !ingredients.length) void dispatch(fetchIngredients());
  };

  return (
    <FeedUI
      orders={ingredients.length ? orders : []}
      isLoading={isLoading || ingredientsLoading}
      error={
        error ??
        ingredientsError ??
        (!ingredientsLoading && !ingredients.length ? 'Список ингредиентов пуст.' : null)
      }
      handleGetFeeds={handleGetFeeds}
    />
  );
};
