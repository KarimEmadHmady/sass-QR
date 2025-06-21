"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";


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
      const storedToken = localStorage.getItem('token');
      const storedRestaurant = localStorage.getItem('restaurant');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        try {
          // تحديث التوكن في الحالة
          setToken(storedToken);
          
          if (storedRestaurant) {
            const parsedRestaurant = JSON.parse(storedRestaurant);
            setRestaurant(parsedRestaurant);
          }
          
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          }
          
          setIsAuthenticated(true);
        } catch (error) {
          console.error('AuthProvider: Error parsing stored data:', error);
          // مسح البيانات المخزنة في حالة حدوث خطأ
          localStorage.removeItem('token');
          localStorage.removeItem('restaurant');
          localStorage.removeItem('user');
          setToken(null);
          setRestaurant(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // No token found, ensure we're logged out
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
      localStorage.setItem('restaurant', JSON.stringify(updatedRestaurant));
    };

    window.addEventListener('restaurantUpdated', handleRestaurantUpdate as EventListener);

    return () => {
      window.removeEventListener('restaurantUpdated', handleRestaurantUpdate as EventListener);
    };
  }, []);

  const login = async (userData: RestaurantUser | RegularUser, token: string) => {
    // First save token to localStorage immediately
    localStorage.setItem('token', token);
    setToken(token);
    
    // Set authenticated state immediately
    setIsAuthenticated(true);
    
    // Then handle user data
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
        localStorage.setItem('restaurant', JSON.stringify(restaurantData));
      } catch (error) {
        console.error('Error updating subscription:', error);
        // If there's an error, still set the restaurant data but with existing subscription
        setRestaurant(userData);
        setUser(null);
        localStorage.setItem('restaurant', JSON.stringify(userData));
      }
    } else {
      // This is a regular user
      setUser(userData);
      setRestaurant(null);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    // First clear state
    setRestaurant(null);
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Then clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('restaurant');
    localStorage.removeItem('user');
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
