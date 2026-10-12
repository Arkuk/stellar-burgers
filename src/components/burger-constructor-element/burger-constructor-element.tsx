import { selectOrderRequest } from '@selectors';
import { moveIngredient, removeIngredient } from '@slices/constructorSlice';
import { BurgerConstructorElementUI } from '@ui';
import { memo } from 'react';

import { useDispatch, useSelector } from '@services/store';

import type { BurgerConstructorElementProps } from './type';

export const BurgerConstructorElement = memo(function BurgerConstructorElement({
  ingredient,
  index,
  totalItems,
}: BurgerConstructorElementProps): React.JSX.Element {
  const dispatch = useDispatch();
  const isDisabled = useSelector(selectOrderRequest);

  const handleMoveDown = (): void => {
    if (!isDisabled) dispatch(moveIngredient({ id: ingredient.id, direction: 'down' }));
  };

  const handleMoveUp = (): void => {
    if (!isDisabled) dispatch(moveIngredient({ id: ingredient.id, direction: 'up' }));
  };

  const handleClose = (): void => {
    if (!isDisabled) dispatch(removeIngredient(ingredient.id));
  };

  return (
    <BurgerConstructorElementUI
      ingredient={ingredient}
      index={index}
      totalItems={totalItems}
      handleMoveUp={handleMoveUp}
      handleMoveDown={handleMoveDown}
      handleClose={handleClose}
      isDisabled={isDisabled}
    />
  );
});
