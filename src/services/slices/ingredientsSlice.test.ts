import ingredientsReducer, { fetchIngredients } from './ingredientsSlice';

import type { IngredientsState } from '../types';
import type { TIngredient } from '@utils-types';

const bun: TIngredient = {
  _id: 'bun-1',
  name: 'Космическая булка',
  type: 'bun',
  proteins: 12,
  fat: 8,
  carbohydrates: 30,
  calories: 240,
  price: 100,
  image: '/bun.png',
  image_large: '/bun-large.png',
  image_mobile: '/bun-mobile.png',
};

const filling: TIngredient = {
  ...bun,
  _id: 'main-1',
  name: 'Космическая котлета',
  type: 'main',
  price: 150,
};

const initialState: IngredientsState = {
  ingredients: [],
  isLoading: false,
  isLoaded: false,
  error: null,
  requestId: null,
};

const loadingState: IngredientsState = {
  ...initialState,
  isLoading: true,
  requestId: 'request-current',
};

describe('ingredientsReducer', () => {
  describe('начальное состояние и неизвестные действия', () => {
    test('возвращает начальное состояние для undefined и UNKNOWN', () => {
      expect(ingredientsReducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
    });

    test('сохраняет существующее состояние при UNKNOWN', () => {
      const state: IngredientsState = {
        ...initialState,
        ingredients: [bun],
        isLoaded: true,
      };

      expect(ingredientsReducer(state, { type: 'UNKNOWN' })).toBe(state);
    });
  });

  describe('fetchIngredients.pending', () => {
    test('начинает первую загрузку и сохраняет идентификатор запроса', () => {
      const action = fetchIngredients.pending('request-current', undefined);

      expect(ingredientsReducer(undefined, action)).toEqual(loadingState);
    });

    test('при повторной загрузке сохраняет каталог и isLoaded, очищая прошлую ошибку', () => {
      const state: IngredientsState = {
        ...initialState,
        ingredients: [bun],
        isLoaded: true,
        error: 'Предыдущая ошибка',
      };

      expect(
        ingredientsReducer(state, fetchIngredients.pending('request-next', undefined))
      ).toEqual({
        ingredients: [bun],
        isLoading: true,
        isLoaded: true,
        error: null,
        requestId: 'request-next',
      });
    });
  });

  describe('fetchIngredients.fulfilled', () => {
    test('сохраняет полученный каталог и завершает первую загрузку', () => {
      const action = fetchIngredients.fulfilled(
        [bun, filling],
        'request-current',
        undefined
      );

      expect(ingredientsReducer(loadingState, action)).toEqual({
        ingredients: [bun, filling],
        isLoading: false,
        isLoaded: true,
        error: null,
        requestId: null,
      });
    });

    test.each([
      { name: 'новым каталогом', ingredients: [filling] },
      { name: 'пустым каталогом', ingredients: [] },
    ])('заменяет прежние ингредиенты $name', ({ ingredients }) => {
      const state: IngredientsState = {
        ...loadingState,
        ingredients: [bun],
        isLoaded: true,
      };
      const action = fetchIngredients.fulfilled(
        ingredients,
        'request-current',
        undefined
      );

      expect(ingredientsReducer(state, action)).toEqual({
        ingredients,
        isLoading: false,
        isLoaded: true,
        error: null,
        requestId: null,
      });
      expect(state.ingredients).toEqual([bun]);
    });
  });

  describe('fetchIngredients.rejected', () => {
    test.each(['Сервер недоступен', ''])(
      'сохраняет payload ошибки %p и не удаляет ранее загруженные ингредиенты',
      (error) => {
        const state: IngredientsState = {
          ...loadingState,
          ingredients: [bun],
          isLoaded: true,
        };
        const action = fetchIngredients.rejected(
          null,
          'request-current',
          undefined,
          error
        );

        expect(ingredientsReducer(state, action)).toEqual({
          ingredients: [bun],
          isLoading: false,
          isLoaded: true,
          error,
          requestId: null,
        });
      }
    );

    test('при отсутствии payload показывает стандартную ошибку и завершает первую загрузку', () => {
      const action = fetchIngredients.rejected(
        new Error('Сообщение action.error'),
        'request-current',
        undefined
      );

      expect(ingredientsReducer(loadingState, action)).toEqual({
        ingredients: [],
        isLoading: false,
        isLoaded: true,
        error: 'Не удалось загрузить ингредиенты.',
        requestId: null,
      });
    });
  });

  describe('проверка requestId', () => {
    const completedActions = [
      {
        name: 'fulfilled',
        action: fetchIngredients.fulfilled([bun], 'request-old', undefined),
      },
      {
        name: 'rejected',
        action: fetchIngredients.rejected(
          null,
          'request-old',
          undefined,
          'Ошибка старого запроса'
        ),
      },
    ];

    test.each(completedActions)(
      'игнорирует запоздалый $name, сохраняя активный запрос',
      ({ action }) => {
        expect(ingredientsReducer(loadingState, action)).toBe(loadingState);
      }
    );

    test.each(completedActions)(
      'игнорирует $name без предшествующего pending',
      ({ action }) => {
        expect(ingredientsReducer(initialState, action)).toBe(initialState);
      }
    );
  });
});
