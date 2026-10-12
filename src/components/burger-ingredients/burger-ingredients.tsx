import { Button } from '@krgaa/react-developer-burger-ui-components';
import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading,
} from '@selectors';
import { fetchIngredients } from '@slices/ingredientsSlice';
import { BurgerIngredientsUI, Preloader } from '@ui';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { useDispatch, useSelector } from '@services/store';

import type { TIngredient, TTabMode } from '@utils-types';

import styles from './burger-ingredients.module.css';

export const BurgerIngredients = (): React.JSX.Element => {
  const [currentTab, setCurrentTab] = useState<TTabMode>('bun');
  const dispatch = useDispatch();
  const titleBunRef = useRef<HTMLHeadingElement>(null);
  const titleMainRef = useRef<HTMLHeadingElement>(null);
  const titleSaucesRef = useRef<HTMLHeadingElement>(null);
  const ingredients = useSelector(selectIngredients);
  const isLoading = useSelector(selectIngredientsLoading);
  const error = useSelector(selectIngredientsError);

  const [bunsRef, inViewBuns] = useInView({
    threshold: 0,
  });

  const [mainsRef, inViewFilling] = useInView({
    threshold: 0,
  });

  const [saucesRef, inViewSauces] = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inViewBuns) {
      setCurrentTab('bun');
    } else if (inViewSauces) {
      setCurrentTab('sauce');
    } else if (inViewFilling) {
      setCurrentTab('main');
    }
  }, [inViewBuns, inViewFilling, inViewSauces]);

  const onTabClick = (tab: string): void => {
    setCurrentTab(tab as TTabMode);
    if (tab === 'bun') titleBunRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (tab === 'main') titleMainRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (tab === 'sauce') titleSaucesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const buns = useMemo(
    () => ingredients.filter((item: TIngredient) => item.type === 'bun'),
    [ingredients]
  );

  const mains = useMemo(
    () => ingredients.filter((item: TIngredient) => item.type === 'main'),
    [ingredients]
  );

  const sauces = useMemo(
    () => ingredients.filter((item: TIngredient) => item.type === 'sauce'),
    [ingredients]
  );

  if (isLoading && !ingredients.length) {
    return (
      <section className={styles.status} aria-label="Загрузка ингредиентов">
        <Preloader />
      </section>
    );
  }

  if (error && !ingredients.length) {
    return (
      <section className={styles.status}>
        <p className="text text_type_main-default" role="alert">
          Не удалось загрузить ингредиенты: {error}
        </p>
        <Button
          htmlType="button"
          onClick={() => {
            void dispatch(fetchIngredients());
          }}
        >
          Попробовать снова
        </Button>
      </section>
    );
  }

  if (!ingredients.length) {
    return (
      <section className={styles.status}>
        <p className="text text_type_main-default">Ингредиенты пока недоступны.</p>
      </section>
    );
  }

  return (
    <BurgerIngredientsUI
      currentTab={currentTab}
      buns={buns}
      mains={mains}
      sauces={sauces}
      titleBunRef={titleBunRef}
      titleMainRef={titleMainRef}
      titleSaucesRef={titleSaucesRef}
      bunsRef={bunsRef}
      mainsRef={mainsRef}
      saucesRef={saucesRef}
      onTabClick={onTabClick}
    />
  );
};
