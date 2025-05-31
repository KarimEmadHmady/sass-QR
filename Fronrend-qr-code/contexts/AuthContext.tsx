"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// شكل بيانات المستخدم العادي
interface RegularUser {
  id: string;
  name: string;
  email: string;
  role: 'user';
}

// شكل بيانات المطعم
interface RestaurantUser {
  id: string;
  name: string;
  email: string;
  subdomain: string;
  phone?: string;
  address?: string;
  logo?: string;
  banner?: string;
  active: boolean;
  settings: {
    theme: 'light' | 'dark';
    currency: 'EGP' | 'SAR' | 'AED';
    language: 'ar' | 'en';
  };
  role: 'restaurant';
  createdAt?: string;
  updatedAt?: string;
}

// نوع بيانات اليوزر (يمكن أن يكون مستخدم عادي أو مطعم)
type User = RegularUser | RestaurantUser;

// شكل بيانات الكونتكست
interface AuthContextType {
  restaurant: RestaurantUser | null;
  token: string | null;
  login: (restaurant: RestaurantUser, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// إنشاء الكونتكست
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// بروڤايدر
export function AuthProvider({ children }: { children: ReactNode }) {
  const [restaurant, setRestaurant] = useState<RestaurantUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // تهيئة حالة تسجيل الدخول عند تحميل التطبيق
  useEffect(() => {
    const initializeAuth = () => {
      console.log('AuthProvider: Initializing auth state');
      const storedToken = localStorage.getItem('token');
      const storedRestaurant = localStorage.getItem('restaurant');

      console.log('AuthProvider: Stored data:', { storedToken, storedRestaurant });

      if (storedToken && storedRestaurant) {
        try {
          const parsedRestaurant = JSON.parse(storedRestaurant);
          console.log('AuthProvider: Parsed restaurant data:', parsedRestaurant);
          setToken(storedToken);
          setRestaurant(parsedRestaurant);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('AuthProvider: Error parsing stored restaurant data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('restaurant');
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  const login = (restaurant: RestaurantUser, token: string) => {
    console.log('AuthProvider: Login called with:', { restaurant, token });
    
    // First update state
    setRestaurant(restaurant);
    setToken(token);
    setIsAuthenticated(true);
    
    // Then save to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('restaurant', JSON.stringify(restaurant));
    
    console.log('AuthProvider: Login completed');
  };

  const logout = () => {
    console.log('AuthProvider: Logout called');
    
    // First clear state
    setRestaurant(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Then clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('restaurant');
    
    console.log('AuthProvider: Logout completed');
  };

  const value = {
    restaurant,
    token,
    login,
    logout,
    isAuthenticated
  };

  console.log('AuthProvider: Current state:', value);

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
