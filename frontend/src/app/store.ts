// src/app/store.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
// Later you’ll import sessionReducer, storyReducer, etc.

export const store = configureStore({
  reducer: {
    // Each key here corresponds to a slice of your global state
    auth: authReducer,
    // session: sessionReducer,
    // stories: storyReducer,
    // votes: voteReducer,
  },
});

// These types help throughout your app for `useSelector` and `useDispatch`
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;