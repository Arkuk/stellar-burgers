import {
  ConstructorElement,
  MoveButton,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { memo } from 'react';

import type { BurgerConstructorElementUIProps } from './type';

import styles from './burger-constructor-element.module.css';

export const BurgerConstructorElementUI = memo(function BurgerConstructorElementUI({
  ingredient,
  index,
  totalItems,
  handleMoveUp,
  handleMoveDown,
  handleClose,
  isDisabled = false,
}: BurgerConstructorElementUIProps): React.JSX.Element {
  return (
    <li className={clsx(styles.element, 'mb-4 mr-2')}>
      <MoveButton
        handleMoveDown={handleMoveDown}
        handleMoveUp={handleMoveUp}
        isUpDisabled={isDisabled || index === 0}
        isDownDisabled={isDisabled || index === totalItems - 1}
      />
      <div className={clsx(styles.element_fullwidth, 'ml-2')}>
        <ConstructorElement
          text={ingredient.name}
          price={ingredient.price}
          thumbnail={ingredient.image}
          handleClose={handleClose}
          isLocked={isDisabled}
        />
      </div>
    </li>
  );
});
