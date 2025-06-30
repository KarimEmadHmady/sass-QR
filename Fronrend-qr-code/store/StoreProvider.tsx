'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect } from 'react';
import { useAppDispatch } from './hooks';
import { initializeAuth } from './authSlice';
import { initializeSubdomain } from './subdomainSlice';
import { initializeLanguage } from './languageSlice';

interface StoreProviderProps {
  children: React.ReactNode;
}

function StoreInitializer({ children }: StoreProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize all slices
    dispatch(initializeAuth());
    dispatch(initializeSubdomain());
    dispatch(initializeLanguage());
  }, [dispatch]);

  return <>{children}</>;
}

export function StoreProvider({ children }: StoreProviderProps) {
  return (
    <Provider store={store}>
      <StoreInitializer>
        {children}
      </StoreInitializer>
    </Provider>
  );
} 