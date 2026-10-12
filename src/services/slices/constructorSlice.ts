import { createSlice, nanoid } from '@reduxjs/toolkit';

import { createOrder } from './orderSlice';

import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@utils-types';

const initialState: TConstructorState = { bun: null, ingredients: [] };

const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      prepare: (ingredient: TIngredient): { payload: TConstructorIngredient } => ({
        payload: { ...ingredient, id: nanoid() },
      }),
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') state.bun = action.payload;
        else state.ingredients.push(action.payload);
      },
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter((item) => item.id !== action.payload);
    },
    moveIngredient: (
      state,
      action: PayloadAction<{ id: string; direction: 'up' | 'down' }>
    ) => {
      const index = state.ingredients.findIndex((item) => item.id === action.payload.id);
      const nextIndex = index + (action.payload.direction === 'up' ? -1 : 1);
      if (index < 0 || nextIndex < 0 || nextIndex >= state.ingredients.length) return;
      [state.ingredients[index], state.ingredients[nextIndex]] = [
        state.ingredients[nextIndex],
        state.ingredients[index],
      ];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createOrder.fulfilled, () => initialState);
  },
});

export const { addIngredient, removeIngredient, moveIngredient } =
  constructorSlice.actions;
export default constructorSlice.reducer;
