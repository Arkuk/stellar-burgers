import { getOrdersApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getErrorMessage } from '../request-error';
import { logoutUser } from './userSlice';

import type { AsyncThunkConfig, ProfileOrdersState } from '../types';
import type { TOrder } from '@utils-types';

const initialState: ProfileOrdersState = {
  orders: [],
  isLoading: false,
  error: null,
  requestId: null,
};

export const fetchProfileOrders = createAsyncThunk<TOrder[], void, AsyncThunkConfig>(
  'profileOrders/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await getOrdersApi();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) =>
      !!getState().user.user && !getState().profileOrders.isLoading,
  }
);

const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileOrders.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchProfileOrders.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.orders = [...action.payload].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        state.isLoading = false;
        state.requestId = null;
      })
      .addCase(fetchProfileOrders.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.isLoading = false;
        state.error = action.payload ?? 'Не удалось загрузить историю заказов.';
        state.requestId = null;
      })
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export default profileOrdersSlice.reducer;
