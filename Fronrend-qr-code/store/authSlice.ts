import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { setAuthData, getAuthData, clearAuthData } from '../utils/storage';

export interface RegularUser {
  id: string;
  name?: string;
  email: string;
  role: 'user' | 'admin';
}

export interface RestaurantUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  subdomain: string;
  phone?: string;
  address?: string;
  description?: string;
  logo?: string;
  banner?: string;
  active: boolean;
  subscription: {
    status: 'trial' | 'active' | 'expired';
    trialEndsAt: Date;
    plan: 'free' | 'basic' | 'premium';
  };
  settings: {
    currency: 'EGP' | 'SAR' | 'AED';
    language: 'ar' | 'en';
    socialMedia: {
      facebook: string;
      instagram: string;
      tiktok: string;
    };
    location: string;
  };
  role: 'restaurant';
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  restaurant: RestaurantUser | null;
  user: RegularUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  restaurant: null,
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  error: null,
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ userData, token }: { userData: RestaurantUser | RegularUser; token: string }) => {
    try {
      setAuthData(token, userData);
      
      if ('subdomain' in userData) {
        // This is a restaurant - check and update subscription status
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/subscription`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to update subscription status');
        }

        const { subscription } = await response.json();
        const restaurantData = {
          ...userData,
          subscription
        };

        setAuthData(token, restaurantData);
        return { userData: restaurantData, token, isRestaurant: true };
      } else {
        // This is a regular user
        setAuthData(token, userData);
        return { userData, token, isRestaurant: false };
      }
    } catch (error) {
      console.error('Error during login:', error);
      // If there's an error, still set the user data but with existing subscription
      setAuthData(token, userData);
      return { userData, token, isRestaurant: 'subdomain' in userData };
    }
  }
);

// Async thunk for initialization
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    const { token: storedToken, user: storedUser } = getAuthData();
    return { storedToken, storedUser };
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.restaurant = null;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      clearAuthData();
    },
    updateRestaurant: (state, action: PayloadAction<RestaurantUser>) => {
      state.restaurant = action.payload;
      if (state.token) {
        setAuthData(state.token, action.payload);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        const { storedToken, storedUser } = action.payload;
        state.loading = false;
        state.isInitialized = true;
        
        if (storedToken) {
          try {
            state.token = storedToken;
            if (storedUser) {
              if ('subdomain' in storedUser) {
                state.restaurant = storedUser;
              } else {
                state.user = storedUser;
              }
            }
            state.isAuthenticated = true;
          } catch (error) {
            console.error('AuthSlice: Error parsing stored data:', error);
            clearAuthData();
            state.token = null;
            state.restaurant = null;
            state.user = null;
            state.isAuthenticated = false;
          }
        } else {
          state.token = null;
          state.restaurant = null;
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.error = action.error.message || 'Failed to initialize auth';
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { userData, token, isRestaurant } = action.payload;
        state.loading = false;
        state.token = token;
        state.isAuthenticated = true;
        
        if (isRestaurant) {
          state.restaurant = userData as RestaurantUser;
          state.user = null;
        } else {
          state.user = userData as RegularUser;
          state.restaurant = null;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      });
  },
});

export const { logout, updateRestaurant, clearError } = authSlice.actions;
export default authSlice.reducer; 