// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { sessionsApi } from '../api/sessionApi';
import { storiesApi } from '../api/storiesApi';
import { authApi } from '../features/auth/authApi';
import authReducer from '../features/auth/authSlice';
// Import your RTK Query API slices as you create them
// e.g. import { sessionsApi } from '../features/sessions/sessionsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [sessionsApi.reducerPath]: sessionsApi.reducer,
    [storiesApi.reducerPath]: storiesApi.reducer,
    // Add reducers here:
    // [sessionsApi.reducerPath]: sessionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
    .concat(authApi.middleware) // Add authApi middleware
    .concat(sessionsApi.middleware)
    .concat(storiesApi.middleware)
  ,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;