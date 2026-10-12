import { getFeedsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getErrorMessage } from '../request-error';

import type { AsyncThunkConfig, FeedState } from '../types';
import type { TOrdersData } from '@utils-types';

const initialState: FeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null,
  requestId: null,
};

export const fetchFeed = createAsyncThunk<TOrdersData, void, AsyncThunkConfig>(
  'feed/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await getFeedsApi();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  { condition: (_, { getState }) => !getState().feed.isLoading }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
        state.isLoading = false;
        state.requestId = null;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.isLoading = false;
        state.error = action.payload ?? 'Не удалось загрузить ленту заказов.';
        state.requestId = null;
      });
  },
});

export default feedSlice.reducer;
