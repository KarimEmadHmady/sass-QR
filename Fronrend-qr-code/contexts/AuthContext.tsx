"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { setAuthData, getAuthData, clearAuthData } from '../utils/storage';


interface RegularUser {
  id: string;
  name?: string;
  email: string;
  role: 'user' | 'admin';
}

interface RestaurantUser {
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

interface AuthContextType {
  restaurant: RestaurantUser | null;
  user: RegularUser | null;
  token: string | null;
  login: (userData: RestaurantUser | RegularUser, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// إنشاء الكونتكست
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// بروڤايدر
export function AuthProvider({ children }: { children: ReactNode }) {
  const [restaurant, setRestaurant] = useState<RestaurantUser | null>(null);
  const [user, setUser] = useState<RegularUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // تهيئة حالة تسجيل الدخول عند تحميل التطبيق
  useEffect(() => {
    const initializeAuth = () => {
      const { token: storedToken, user: storedUser } = getAuthData();
      if (storedToken) {
        try {
          setToken(storedToken);
          if (storedUser) {
            if ('subdomain' in storedUser) setRestaurant(storedUser);
            else setUser(storedUser);
          }
          setIsAuthenticated(true);
        } catch (error) {
          console.error('AuthProvider: Error parsing stored data:', error);
          clearAuthData();
          setToken(null);
          setRestaurant(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setToken(null);
        setRestaurant(null);
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsInitialized(true);
    };
    initializeAuth();

    // Add event listener for restaurant updates
    const handleRestaurantUpdate = (event: CustomEvent) => {
      const updatedRestaurant = event.detail;
      setRestaurant(updatedRestaurant);
      if (token) {
        setAuthData(token, updatedRestaurant);
      }
    };

    window.addEventListener('restaurantUpdated', handleRestaurantUpdate as EventListener);

    return () => {
      window.removeEventListener('restaurantUpdated', handleRestaurantUpdate as EventListener);
    };
  }, []);

  const login = async (userData: RestaurantUser | RegularUser, token: string) => {
    setAuthData(token, userData);
    setToken(token);
    setIsAuthenticated(true);
    if ('subdomain' in userData) {
      // This is a restaurant
      try {
        // Check and update subscription status
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

        setRestaurant(restaurantData);
        setUser(null);
        setAuthData(token, restaurantData);
      } catch (error) {
        console.error('Error updating subscription:', error);
        // If there's an error, still set the restaurant data but with existing subscription
        setRestaurant(userData);
        setUser(null);
        setAuthData(token, userData);
      }
    } else {
      // This is a regular user
      setUser(userData);
      setRestaurant(null);
      setAuthData(token, userData);
    }
  };

  const logout = () => {
    setRestaurant(null);
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    clearAuthData();
  };

  const value = {
    restaurant,
    user,
    token,
    login,
    logout,
    isAuthenticated
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// هوك لاستخدام الكونتكست بسهولة
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
