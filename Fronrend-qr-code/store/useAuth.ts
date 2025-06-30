import { useAppSelector, useAppDispatch } from './hooks';
import { useCallback } from 'react';
import { loginUser, logout, updateRestaurant, clearError } from './authSlice';
import type { RestaurantUser, RegularUser } from './authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const login = useCallback((userData: RestaurantUser | RegularUser, token: string) => {
    dispatch(loginUser({ userData, token }));
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const updateRestaurantData = useCallback((restaurantData: RestaurantUser) => {
    dispatch(updateRestaurant(restaurantData));
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    ...auth,
    login,
    logout: logoutUser,
    updateRestaurant: updateRestaurantData,
    clearError: clearAuthError,
  };
}; 