import constructorReducer, {
  addIngredient,
  moveIngredient,
  removeIngredient,
} from './constructorSlice';
import { createOrder } from './orderSlice';

import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
  TOrder,
} from '@utils-types';

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

const main: TIngredient = {
  ...bun,
  _id: 'main-1',
  name: 'Космическая котлета',
  type: 'main',
  price: 150,
};

const sauce: TIngredient = {
  ...bun,
  _id: 'sauce-1',
  name: 'Космический соус',
  type: 'sauce',
  price: 25,
};

const bunInstance: TConstructorIngredient = { ...bun, id: 'bun-instance' };
const firstMain: TConstructorIngredient = { ...main, id: 'main-instance-1' };
const secondMain: TConstructorIngredient = { ...main, id: 'main-instance-2' };
const sauceInstance: TConstructorIngredient = { ...sauce, id: 'sauce-instance' };

const initialState: TConstructorState = { bun: null, ingredients: [] };
const populatedState: TConstructorState = {
  bun: bunInstance,
  ingredients: [firstMain, sauceInstance, secondMain],
};

const order: TOrder = {
  _id: 'order-1',
  number: 42,
  name: 'Космический бургер',
  status: 'done',
  createdAt: '2026-10-23T10:00:00.000Z',
  updatedAt: '2026-10-23T10:00:00.000Z',
  ingredients: [bun._id, main._id, sauce._id, main._id, bun._id],
};

describe('constructorReducer', () => {
  describe('начальное состояние и неизвестные действия', () => {
    test('возвращает пустой конструктор для undefined и UNKNOWN', () => {
      expect(constructorReducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
    });

    test('сохраняет заполненный конструктор при UNKNOWN', () => {
      expect(constructorReducer(populatedState, { type: 'UNKNOWN' })).toBe(
        populatedState
      );
    });
  });

  describe('addIngredient', () => {
    test('добавляет булку в пустой конструктор отдельно от начинок', () => {
      const action = addIngredient(bun);

      expect(constructorReducer(undefined, action)).toEqual({
        bun: action.payload,
        ingredients: [],
      });
    });

    test('заменяет выбранную булку, сохраняя состав и порядок начинок', () => {
      const action = addIngredient({ ...bun, _id: 'bun-2', name: 'Новая булка' });

      expect(constructorReducer(populatedState, action)).toEqual({
        bun: action.payload,
        ingredients: [firstMain, sauceInstance, secondMain],
      });
      expect(populatedState.bun).toEqual(bunInstance);
    });

    test.each([main, sauce])(
      'добавляет ингредиент типа $type в конец списка, сохраняя булку',
      (ingredient) => {
        const action = addIngredient(ingredient);

        expect(constructorReducer(populatedState, action)).toEqual({
          bun: bunInstance,
          ingredients: [firstMain, sauceInstance, secondMain, action.payload],
        });
        expect(populatedState.ingredients).toEqual([
          firstMain,
          sauceInstance,
          secondMain,
        ]);
      }
    );

    test('создаёт отдельные instance ID для повторяющегося ингредиента без изменения исходных данных', () => {
      const first = addIngredient(main);
      const second = addIngredient(main);
      const state = constructorReducer(constructorReducer(undefined, first), second);

      const { id, ...preparedIngredient } = first.payload;

      expect(preparedIngredient).toEqual(main);
      expect(typeof id).toBe('string');
      expect(first.payload.id).not.toBe('');
      expect(second.payload.id).not.toBe('');
      expect(second.payload.id).not.toBe(first.payload.id);
      expect(main).not.toHaveProperty('id');
      expect(state).toEqual({
        bun: null,
        ingredients: [first.payload, second.payload],
      });
    });
  });

  describe('removeIngredient', () => {
    test('удаляет выбранную начинку, сохраняя булку и порядок остальных ингредиентов', () => {
      expect(
        constructorReducer(populatedState, removeIngredient(sauceInstance.id))
      ).toEqual({
        bun: bunInstance,
        ingredients: [firstMain, secondMain],
      });
    });

    test('удаляет только выбранный экземпляр повторяющегося ингредиента по instance ID', () => {
      expect(constructorReducer(populatedState, removeIngredient(firstMain.id))).toEqual(
        {
          bun: bunInstance,
          ingredients: [sauceInstance, secondMain],
        }
      );
    });

    test.each([main._id, bunInstance.id, 'missing-instance'])(
      'не меняет состав при отсутствии ID %s в начинках',
      (id) => {
        expect(constructorReducer(populatedState, removeIngredient(id))).toEqual(
          populatedState
        );
      }
    );

    test('сохраняет пустой конструктор при удалении неизвестного экземпляра', () => {
      expect(
        constructorReducer(initialState, removeIngredient('missing-instance'))
      ).toEqual(initialState);
    });
  });

  describe('moveIngredient', () => {
    test('перемещает выбранную начинку на одну позицию вверх', () => {
      const action = moveIngredient({ id: sauceInstance.id, direction: 'up' });

      expect(constructorReducer(populatedState, action)).toEqual({
        bun: bunInstance,
        ingredients: [sauceInstance, firstMain, secondMain],
      });
      expect(populatedState.ingredients).toEqual([firstMain, sauceInstance, secondMain]);
    });

    test('перемещает выбранный экземпляр повторяющегося ингредиента на одну позицию вниз', () => {
      const action = moveIngredient({ id: firstMain.id, direction: 'down' });

      expect(constructorReducer(populatedState, action)).toEqual({
        bun: bunInstance,
        ingredients: [sauceInstance, firstMain, secondMain],
      });
    });

    test.each([
      { name: 'первый ингредиент вверх', id: firstMain.id, direction: 'up' },
      { name: 'последний ингредиент вниз', id: secondMain.id, direction: 'down' },
      { name: 'неизвестный ID вверх', id: 'missing-instance', direction: 'up' },
      { name: 'неизвестный ID вниз', id: 'missing-instance', direction: 'down' },
    ] as const)('сохраняет состав: $name', ({ id, direction }) => {
      expect(constructorReducer(populatedState, moveIngredient({ id, direction }))).toBe(
        populatedState
      );
    });

    test.each(['up', 'down'] as const)(
      'сохраняет пустой конструктор при перемещении %s',
      (direction) => {
        expect(
          constructorReducer(
            initialState,
            moveIngredient({ id: 'missing-instance', direction })
          )
        ).toBe(initialState);
      }
    );
  });

  describe('результат оформления заказа', () => {
    test('очищает булку и все начинки после createOrder.fulfilled', () => {
      const action = createOrder.fulfilled(order, 'order-request', order.ingredients);

      expect(constructorReducer(populatedState, action)).toEqual(initialState);
    });

    test('сохраняет собранный бургер во время createOrder.pending', () => {
      const action = createOrder.pending('order-request', order.ingredients);

      expect(constructorReducer(populatedState, action)).toBe(populatedState);
    });

    test('сохраняет собранный бургер после createOrder.rejected', () => {
      const action = createOrder.rejected(
        null,
        'order-request',
        order.ingredients,
        'Не удалось оформить заказ'
      );

      expect(constructorReducer(populatedState, action)).toBe(populatedState);
    });
  });
});
