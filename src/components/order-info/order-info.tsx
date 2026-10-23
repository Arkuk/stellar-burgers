import { Button } from '@krgaa/react-developer-burger-ui-components';
import {
  selectFeed,
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading,
  selectOrderDetails,
  selectOrderDetailsError,
  selectOrderDetailsLoading,
  selectProfileOrders,
} from '@selectors';
import { fetchIngredients } from '@slices/ingredientsSlice';
import { fetchOrderByNumber } from '@slices/orderSlice';
import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import { getOrderComposition } from './order-info-utils';

import type { Location } from 'react-router-dom';

export const OrderInfo = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { number: numberParam } = useParams();
  const location = useLocation();
  const number = Number(numberParam);
  const isValidNumber =
    /^\d+$/.test(numberParam ?? '') && Number.isSafeInteger(number) && number > 0;
  const isModal = Boolean(
    (location.state as { background?: Location } | null)?.background
  );
  const isProfileOrder = location.pathname.startsWith('/profile/orders');

  const feed = useSelector(selectFeed);
  const profileOrders = useSelector(selectProfileOrders);
  const details = useSelector(selectOrderDetails);
  const detailsLoading = useSelector(selectOrderDetailsLoading);
  const detailsError = useSelector(selectOrderDetailsError);
  const ingredients = useSelector(selectIngredients);
  const ingredientsLoading = useSelector(selectIngredientsLoading);
  const ingredientsError = useSelector(selectIngredientsError);
  const primaryOrders = isProfileOrder ? profileOrders.orders : feed.orders;
  const secondaryOrders = isProfileOrder ? feed.orders : profileOrders.orders;
  const orderData =
    primaryOrders.find((order) => order.number === number) ??
    secondaryOrders.find((order) => order.number === number) ??
    (details?.number === number ? details : null);

  useEffect(() => {
    if (isValidNumber && !orderData) void dispatch(fetchOrderByNumber(number));
  }, [dispatch, isValidNumber, number, orderData]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const { ingredientsWithCount, total } = getOrderComposition(orderData, ingredients);
    return {
      ...orderData,
      ingredientsInfo: ingredientsWithCount,
      date: new Date(orderData.createdAt),
      total,
    };
  }, [orderData, ingredients]);

  const handleRetry = (): void => {
    if (isValidNumber && !orderData) void dispatch(fetchOrderByNumber(number));
    if (ingredientsError || !ingredients.length) void dispatch(fetchIngredients());
  };

  if (!isValidNumber) {
    return (
      <p className="text text_type_main-default p-10" role="alert">
        Некорректный номер заказа.
      </p>
    );
  }

  if (!orderInfo && (detailsLoading || ingredientsLoading)) return <Preloader />;

  const error =
    (orderData ? null : detailsError) ??
    ingredientsError ??
    (!ingredientsLoading && !ingredients.length ? 'Список ингредиентов пуст.' : null);
  if (!orderInfo && error) {
    return (
      <div className="p-10">
        <p className="text text_type_main-default mb-6" role="alert">
          Не удалось загрузить заказ: {error}
        </p>
        <Button htmlType="button" onClick={handleRetry}>
          Повторить запрос
        </Button>
      </div>
    );
  }

  if (!orderInfo) return <Preloader />;

  return <OrderInfoUI orderInfo={orderInfo} showNumber={!isModal} />;
};
