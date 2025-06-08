'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSubdomain } from '@/contexts/SubdomainContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface Restaurant {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  banner?: string;
  active: boolean;
  settings: {
    currency: string;
  };
}

interface Category {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  description?: {
    en: string;
    ar: string;
  };
  image?: string;
  meals: Meal[];
}

interface Meal {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  price: number;
  image?: string;
  category: string;
}

const translations = {
  en: {
    totalCategories: 'Total Categories',
    totalMeals: 'Total Meals',
    accountStatus: 'Account Status',
    active: 'Active',
    trialPeriod: 'Trial Period',
    aboutUs: 'About Us',
    editProfile: 'Edit Profile',
    name: 'Name',
    phone: 'Phone',
    address: 'Address',
    email: 'Email',
    currency: 'Currency',
    logo: 'Logo',
    banner: 'Banner',
    menuCategories: 'Menu Categories',
    noCategories: 'No categories found',
    mealsInCategory: 'meals in this category',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    restaurantNotFound: 'Restaurant Not Found',
    restaurantNotFoundDesc: 'The restaurant you\'re looking for doesn\'t exist.',
    loading: 'Loading...',
    authenticationError: 'Authentication error. Please login again.',
    profileUpdateSuccess: 'Profile updated successfully!',
    profileUpdateError: 'Failed to update profile. Please try again.'
  },
  ar: {
    totalCategories: 'إجمالي الفئات',
    totalMeals: 'إجمالي الوجبات',
    accountStatus: 'حالة الحساب',
    active: 'نشط',
    trialPeriod: 'فترة تجريبية',
    aboutUs: 'من نحن',
    editProfile: 'تعديل الملف الشخصي',
    name: 'الاسم',
    phone: 'الهاتف',
    address: 'العنوان',
    email: 'البريد الإلكتروني',
    currency: 'العملة',
    logo: 'الشعار',
    banner: 'اللافتة',
    menuCategories: 'فئات القائمة',
    noCategories: 'لا توجد فئات',
    mealsInCategory: 'وجبة في هذه الفئة',
    cancel: 'إلغاء',
    saveChanges: 'حفظ التغييرات',
    restaurantNotFound: 'المطعم غير موجود',
    restaurantNotFoundDesc: 'المطعم الذي تبحث عنه غير موجود.',
    loading: 'جاري التحميل...',
    authenticationError: 'خطأ في المصادقة. يرجى تسجيل الدخول مرة أخرى.',
    profileUpdateSuccess: 'تم تحديث الملف الشخصي بنجاح!',
    profileUpdateError: 'فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.'
  }
};

export default function RestaurantPage() {
  const params = useParams();
  const { subdomain } = useSubdomain();
  const { restaurant: authRestaurant, token } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalMeals: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedRestaurant, setEditedRestaurant] = useState<Partial<Restaurant>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data for restaurant:', authRestaurant);
        // Fetch categories
        const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesResponse.json();
        console.log('Received categories data:', categoriesData);

        // Fetch meals
        const mealsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meals`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!mealsResponse.ok) throw new Error('Failed to fetch meals');
        const mealsData = await mealsResponse.json();
        console.log('Received meals data:', mealsData);

        // Organize meals by category
        const categoriesWithMeals = categoriesData.map((category: Category) => ({
          ...category,
          meals: mealsData.filter((meal: Meal) => meal.category === category.id)
        }));

        setCategories(categoriesWithMeals);
        setStats({
          totalCategories: categoriesData.length,
          totalMeals: mealsData.length
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authRestaurant && token) {
      fetchData();
    }
  }, [authRestaurant, token]);

  const handleEdit = () => {
    if (authRestaurant) {
      setEditedRestaurant({
        name: authRestaurant.name,
        phone: authRestaurant.phone || '',
        address: authRestaurant.address || ''
      });
      setIsEditing(true);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      if (!token || !authRestaurant?.id) {
        console.error('No authentication token or restaurant ID available');
        alert(t.authenticationError);
        return;
      }

      const formData = new FormData();
      formData.append('name', editedRestaurant.name || '');
      formData.append('phone', editedRestaurant.phone || '');
      formData.append('address', editedRestaurant.address || '');
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      console.log('Sending update request with data:', {
        name: editedRestaurant.name,
        phone: editedRestaurant.phone,
        address: editedRestaurant.address,
        hasLogo: !!logoFile,
        hasBanner: !!bannerFile
      });
      console.log('Using token:', token);
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL}/restaurants/profile`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || t.profileUpdateError);
      }
      
      console.log('Profile updated successfully:', responseData);
      
      // Update the local state with the new data
      if (responseData.restaurant) {
        // Update the auth context with new restaurant data
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('restaurantUpdated', {
            detail: responseData.restaurant
          });
          window.dispatchEvent(event);
        }
      }

      alert(t.profileUpdateSuccess);
      setIsEditing(false);
      
      // Reset file states
      setLogoFile(null);
      setBannerFile(null);
      setLogoPreview(null);
      setBannerPreview(null);
      
      // Instead of reloading the page, update the local state
      if (responseData.restaurant) {
        setEditedRestaurant({
          name: responseData.restaurant.name,
          phone: responseData.restaurant.phone,
          address: responseData.restaurant.address
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof Error) {
        alert(`${t.profileUpdateError}: ${error.message}`);
      } else {
        alert(t.profileUpdateError);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <span className="ml-3">{t.loading}</span>
      </div>
    );
  }

  if (!authRestaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t.restaurantNotFound}</h1>
          <p className="text-gray-600">{t.restaurantNotFoundDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Restaurant Header */}
      <header className="relative h-64 bg-gray-900">
        {authRestaurant.banner && (
          <img
            src={authRestaurant.banner}
            alt={authRestaurant.name}
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            {authRestaurant.logo && (
              <img
                src={authRestaurant.logo}
                alt={authRestaurant.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
            )}
            <h1 className="text-4xl font-bold">{authRestaurant.name}</h1>
          </div>
        </div>
      </header>

      {/* Restaurant Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-600">{t.totalCategories}</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCategories}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-600">{t.totalMeals}</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalMeals}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-600">{t.accountStatus}</h3>
            <p className={`text-3xl font-bold ${authRestaurant.active ? 'text-green-600' : 'text-yellow-600'}`}>
              {authRestaurant.active ? t.active : t.trialPeriod}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Restaurant Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{t.aboutUs}</h2>
              {token && (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {t.editProfile}
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.name}</label>
                  <input
                    type="text"
                    value={editedRestaurant.name || ''}
                    onChange={(e) => setEditedRestaurant(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.phone}</label>
                  <input
                    type="text"
                    value={editedRestaurant.phone || ''}
                    onChange={(e) => setEditedRestaurant(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.address}</label>
                  <input
                    type="text"
                    value={editedRestaurant.address || ''}
                    onChange={(e) => setEditedRestaurant(prev => ({ ...prev, address: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.logo}</label>
                  <div className="mt-1 flex items-center space-x-4">
                    {(logoPreview || authRestaurant.logo) && (
                      <div className="relative w-24 h-24">
                        <img
                          src={logoPreview || authRestaurant.logo}
                          alt="Logo preview"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Banner Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.banner}</label>
                  <div className="mt-1 flex items-center space-x-4">
                    {(bannerPreview || authRestaurant.banner) && (
                      <div className="relative w-32 h-20">
                        <img
                          src={bannerPreview || authRestaurant.banner}
                          alt="Banner preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setLogoPreview(null);
                      setBannerPreview(null);
                      setLogoFile(null);
                      setBannerFile(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {t.saveChanges}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-semibold">{t.address}:</span> {authRestaurant.address}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">{t.phone}:</span> {authRestaurant.phone}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">{t.email}:</span> {authRestaurant.email}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">{t.currency}:</span> {authRestaurant.settings.currency}
                </p>
              </div>
            )}
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">{t.menuCategories}</h2>
            {categories.length === 0 ? (
              <p className="text-gray-500 text-center py-4">{t.noCategories}</p>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.name[language]}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{category.name[language]}</h3>
                        {category.description && (
                          <p className="text-gray-600 text-sm">{category.description[language]}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          {category.meals?.length || 0} {t.mealsInCategory}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 