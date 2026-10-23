import { getOrderByNumberApi, orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getErrorMessage } from '../request-error';
import { fetchFeed } from './feedSlice';
import { fetchProfileOrders } from './profileOrdersSlice';
import { logoutUser } from './userSlice';

import type { AsyncThunkConfig, OrderState } from '../types';
import type { TOrder } from '@utils-types';

const initialState: OrderState = {
  orderModalData: null,
  orderRequest: false,
  error: null,
  requestId: null,
  orderDetails: null,
  detailsLoading: false,
  detailsError: null,
  detailsRequestId: null,
  detailsNumber: null,
};

export const createOrder = createAsyncThunk<TOrder, string[], AsyncThunkConfig>(
  'order/create',
  async (ingredients, { dispatch, getState, requestId, rejectWithValue }) => {
    try {
      const response = await orderBurgerApi(ingredients);
      if (getState().order.requestId !== requestId || !getState().user.user)
        return rejectWithValue('Сессия завершена. Войдите в аккаунт ещё раз.');
      void dispatch(fetchFeed());
      void dispatch(fetchProfileOrders());
      return response.order;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) =>
      !!getState().user.user && !getState().order.orderRequest,
  }
);

export const fetchOrderByNumber = createAsyncThunk<TOrder, number, AsyncThunkConfig>(
  'order/fetchByNumber',
  async (number, { rejectWithValue }) => {
    try {
      const response = await getOrderByNumberApi(number);
      if (!response.success || !response.orders[0]) throw new Error('Заказ не найден.');
      return response.orders[0];
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (number, { getState }) =>
      !(getState().order.detailsLoading && getState().order.detailsNumber === number),
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrderModal: (state) => {
      state.orderModalData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state, action) => {
        state.orderRequest = true;
        state.orderModalData = null;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.orderRequest = false;
        state.orderModalData = action.payload;
        state.requestId = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.orderRequest = false;
        state.error = action.payload ?? 'Не удалось оформить заказ.';
        state.requestId = null;
      })
      .addCase(fetchOrderByNumber.pending, (state, action) => {
        state.detailsLoading = true;
        state.detailsError = null;
        state.orderDetails = null;
        state.detailsRequestId = action.meta.requestId;
        state.detailsNumber = action.meta.arg;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        if (state.detailsRequestId !== action.meta.requestId) return;
        state.detailsLoading = false;
        state.orderDetails = action.payload;
        state.detailsRequestId = null;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        if (state.detailsRequestId !== action.meta.requestId) return;
        state.detailsLoading = false;
        state.detailsError = action.payload ?? 'Не удалось загрузить заказ.';
        state.detailsRequestId = null;
      })
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const { resetOrderModal } = orderSlice.actions;
export default orderSlice.reducer;
