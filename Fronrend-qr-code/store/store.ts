import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import subdomainReducer from './subdomainSlice';
import languageReducer from './languageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    subdomain: subdomainReducer,
    language: languageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.trialEndsAt'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.restaurant.subscription.trialEndsAt'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 