// دوال مساعدة للتعامل مع بيانات المصادقة في localStorage

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

type AuthUser = RegularUser | RestaurantUser;

export function setAuthData(token: string, user: AuthUser | null) {
  localStorage.setItem('token', token);
  if (user) {
    if ('subdomain' in user) {
      localStorage.setItem('restaurant', JSON.stringify(user));
      localStorage.removeItem('user');
    } else {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('restaurant');
    }
  }
}

export function getAuthData(): { token: string | null; user: AuthUser | null } {
  const token = localStorage.getItem('token');
  const restaurant = localStorage.getItem('restaurant');
  const user = localStorage.getItem('user');
  let parsedUser: AuthUser | null = null;
  if (restaurant) {
    try { parsedUser = JSON.parse(restaurant); } catch { parsedUser = null; }
  } else if (user) {
    try { parsedUser = JSON.parse(user); } catch { parsedUser = null; }
  }
  return { token, user: parsedUser };
}

export function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('restaurant');
  localStorage.removeItem('user');
} 