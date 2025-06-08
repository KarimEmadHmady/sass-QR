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
      console.log('AuthProvider: Initializing auth state');
      const storedToken = localStorage.getItem('token');
      const storedRestaurant = localStorage.getItem('restaurant');
      const storedUser = localStorage.getItem('user');

      console.log('AuthProvider: Stored data:', { storedToken, storedRestaurant, storedUser });

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
      }
      setIsInitialized(true);
    };

    initializeAuth();

    // Add event listener for restaurant updates
    const handleRestaurantUpdate = (event: CustomEvent) => {
      console.log('AuthProvider: Restaurant update received:', event.detail);
      const updatedRestaurant = event.detail;
      setRestaurant(updatedRestaurant);
      localStorage.setItem('restaurant', JSON.stringify(updatedRestaurant));
    };

    window.addEventListener('restaurantUpdated', handleRestaurantUpdate as EventListener);

    return () => {
      window.removeEventListener('restaurantUpdated', handleRestaurantUpdate as EventListener);
    };
  }, []);

  const login = (userData: RestaurantUser | RegularUser, token: string) => {
    console.log('AuthProvider: Login called with:', { userData, token });
    
    // First update state
    if ('subdomain' in userData) {
      // This is a restaurant
      setRestaurant(userData);
      setUser(null);
      localStorage.setItem('restaurant', JSON.stringify(userData));
    } else {
      // This is a regular user
      setUser(userData);
      setRestaurant(null);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    // تحديث التوكن في الحالة
    setToken(token);
    setIsAuthenticated(true);
    
    console.log('AuthProvider: Login completed with token:', token);
  };

  const logout = () => {
    console.log('AuthProvider: Logout called');
    
    // First clear state
    setRestaurant(null);
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Then clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('restaurant');
    localStorage.removeItem('user');
    
    console.log('AuthProvider: Logout completed');
  };

  const value = {
    restaurant,
    user,
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
