import {
  selectConstructorItems,
  selectOrderError,
  selectOrderModalData,
  selectOrderRequest,
  selectUser,
} from '@selectors';
import { createOrder, resetOrderModal } from '@slices/orderSlice';
import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor = (): React.JSX.Element | null => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const constructorItems = useSelector(selectConstructorItems);
  const orderRequest = useSelector(selectOrderRequest);
  const orderModalData = useSelector(selectOrderModalData);
  const orderError = useSelector(selectOrderError);
  const user = useSelector(selectUser);

  const onOrderClick = (): void => {
    if (!constructorItems.bun || orderRequest) return;
    if (!user) {
      void navigate('/login', { state: { from: location } });
      return;
    }

    void dispatch(
      createOrder([
        constructorItems.bun._id,
        ...constructorItems.ingredients.map((ingredient) => ingredient._id),
        constructorItems.bun._id,
      ])
    );
  };

  const closeOrderModal = (): void => {
    dispatch(resetOrderModal());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      orderError={orderError}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
