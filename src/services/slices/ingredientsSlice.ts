import { getIngredientsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getErrorMessage } from '../request-error';

import type { AsyncThunkConfig, IngredientsState } from '../types';
import type { TIngredient } from '@utils-types';

const initialState: IngredientsState = {
  ingredients: [],
  isLoading: false,
  isLoaded: false,
  error: null,
  requestId: null,
};

export const fetchIngredients = createAsyncThunk<TIngredient[], void, AsyncThunkConfig>(
  'ingredients/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await getIngredientsApi();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  { condition: (_, { getState }) => !getState().ingredients.isLoading }
);

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.ingredients = action.payload;
        state.isLoading = false;
        state.isLoaded = true;
        state.requestId = null;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.isLoading = false;
        state.isLoaded = true;
        state.error = action.payload ?? 'Не удалось загрузить ингредиенты.';
        state.requestId = null;
      });
  },
});

export default ingredientsSlice.reducer;
