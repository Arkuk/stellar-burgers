import {
  forgotPasswordApi,
  getUserApi,
  loginUserApi,
  logoutApi,
  refreshToken,
  registerUserApi,
  resetPasswordApi,
  updateUserApi,
} from '@api';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

import { getErrorMessage } from '../request-error';

import type { AsyncThunkConfig, UserState } from '../types';
import type { TLoginData, TRegisterData } from '@api';
import type { TUser } from '@utils-types';

const initialState: UserState = {
  user: null,
  isAuthChecked: false,
  isLoading: false,
  error: null,
  requestId: null,
};

const clearTokens = (): void => {
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};

const saveTokens = (data: { accessToken: string; refreshToken: string }): void => {
  setCookie('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
};

const canStartUserRequest = (
  _: unknown,
  { getState }: { getState: () => AsyncThunkConfig['state'] }
): boolean => !getState().user.isLoading;

export const checkUserAuth = createAsyncThunk<TUser | null, void, AsyncThunkConfig>(
  'user/checkAuth',
  async (_, { rejectWithValue, getState, requestId }) => {
    if (!getCookie('accessToken') && !localStorage.getItem('refreshToken')) return null;
    try {
      if (!getCookie('accessToken')) await refreshToken();
      const response = await getUserApi();
      if (!response.success) throw new Error('Не удалось восстановить сессию.');
      return response.user;
    } catch (error) {
      if (getState().user.requestId === requestId) clearTokens();
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) =>
      !getState().user.isLoading && !getState().user.isAuthChecked,
  }
);

export const loginUser = createAsyncThunk<TUser, TLoginData, AsyncThunkConfig>(
  'user/login',
  async (data, { rejectWithValue, getState, requestId }) => {
    try {
      const response = await loginUserApi(data);
      if (getState().user.requestId === requestId) saveTokens(response);
      return response.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  { condition: canStartUserRequest }
);

export const registerUser = createAsyncThunk<TUser, TRegisterData, AsyncThunkConfig>(
  'user/register',
  async (data, { rejectWithValue, getState, requestId }) => {
    try {
      const response = await registerUserApi(data);
      if (getState().user.requestId === requestId) saveTokens(response);
      return response.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  { condition: canStartUserRequest }
);

export const logoutUser = createAsyncThunk<void, void, AsyncThunkConfig>(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await logoutApi();
      if (!response.success) throw new Error('Не удалось выйти из аккаунта.');
      clearTokens();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  { condition: canStartUserRequest }
);

export const updateUser = createAsyncThunk<
  TUser,
  Partial<TRegisterData>,
  AsyncThunkConfig
>(
  'user/update',
  async (data, { rejectWithValue }) => {
    try {
      const response = await updateUserApi(data);
      if (!response.success) throw new Error('Не удалось сохранить профиль.');
      return response.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  { condition: canStartUserRequest }
);

export const forgotPassword = createAsyncThunk<
  void,
  { email: string },
  AsyncThunkConfig
>(
  'user/forgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      await forgotPasswordApi(data);
      localStorage.setItem('resetPassword', 'true');
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  { condition: canStartUserRequest }
);

export const resetPassword = createAsyncThunk<
  void,
  { password: string; token: string },
  AsyncThunkConfig
>(
  'user/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      await resetPasswordApi(data);
      localStorage.removeItem('resetPassword');
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  { condition: canStartUserRequest }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        if (state.requestId === action.meta.requestId) state.user = action.payload;
      })
      .addCase(checkUserAuth.rejected, (state, action) => {
        if (state.requestId === action.meta.requestId) state.user = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        if (state.requestId === action.meta.requestId) state.user = action.payload;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        if (state.requestId === action.meta.requestId) state.user = action.payload;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        if (state.requestId === action.meta.requestId) state.user = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        if (state.requestId === action.meta.requestId) state.user = null;
      })
      .addMatcher(
        isAnyOf(
          checkUserAuth.pending,
          loginUser.pending,
          registerUser.pending,
          logoutUser.pending,
          updateUser.pending,
          forgotPassword.pending,
          resetPassword.pending
        ),
        (state, action) => {
          state.isLoading = true;
          state.error = null;
          state.requestId = action.meta.requestId;
        }
      )
      .addMatcher(
        isAnyOf(
          checkUserAuth.fulfilled,
          loginUser.fulfilled,
          registerUser.fulfilled,
          logoutUser.fulfilled,
          updateUser.fulfilled,
          forgotPassword.fulfilled,
          resetPassword.fulfilled
        ),
        (state, action) => {
          if (state.requestId !== action.meta.requestId) return;
          state.isLoading = false;
          state.requestId = null;
          state.isAuthChecked = true;
        }
      )
      .addMatcher(
        isAnyOf(
          checkUserAuth.rejected,
          loginUser.rejected,
          registerUser.rejected,
          logoutUser.rejected,
          updateUser.rejected,
          forgotPassword.rejected,
          resetPassword.rejected
        ),
        (state, action) => {
          if (state.requestId !== action.meta.requestId) return;
          state.isLoading = false;
          state.requestId = null;
          state.isAuthChecked = true;
          state.error = action.payload ?? 'Не удалось выполнить запрос.';
        }
      );
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
