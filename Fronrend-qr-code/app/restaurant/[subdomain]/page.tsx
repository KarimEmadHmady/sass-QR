'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSubdomain } from '@/contexts/SubdomainContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { QRCodeCanvas } from 'qrcode.react';
import { FaQrcode } from 'react-icons/fa';

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
    profileUpdateError: 'Failed to update profile. Please try again.',
    viewQR: 'View QR Code',
    downloadQR: 'Download QR Code',
    close: 'Close',
    scanQR: 'Scan this QR code to view the menu'
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
    profileUpdateError: 'فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.',
    viewQR: 'عرض رمز QR',
    downloadQR: 'تحميل رمز QR',
    close: 'إغلاق',
    scanQR: 'امسح رمز QR لعرض القائمة'
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
  const [showQR, setShowQR] = useState(false);

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

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${authRestaurant?.name}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <button
              onClick={() => setShowQR(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 mx-auto"
            >
              <FaQrcode />
              <span>{t.viewQR}</span>
            </button>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.name}</label>
                  <input
                    type="text"
                    value={editedRestaurant.name || ''}
                    onChange={(e) => setEditedRestaurant(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone}</label>
                  <input
                    type="text"
                    value={editedRestaurant.phone || ''}
                    onChange={(e) => setEditedRestaurant(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.address}</label>
                  <input
                    type="text"
                    value={editedRestaurant.address || ''}
                    onChange={(e) => setEditedRestaurant(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">{t.logo}</label>
                <div className="flex items-center space-x-6">
                  {(logoPreview || authRestaurant.logo) && (
                    <div className="relative w-32 h-32">
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
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">{t.banner}</label>
                <div className="flex items-center space-x-6">
                  {(bannerPreview || authRestaurant.banner) && (
                    <div className="relative w-48 h-32">
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

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setLogoPreview(null);
                    setBannerPreview(null);
                    setLogoFile(null);
                    setBannerFile(null);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {t.saveChanges}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Restaurant Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{authRestaurant.name}</h3>
                      <p className="text-gray-600">{authRestaurant.email}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-600">{authRestaurant.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-600">{authRestaurant.address}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{t.currency}</h3>
                      <p className="text-gray-600">{authRestaurant.settings.currency}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">{authRestaurant.active ? t.active : t.trialPeriod}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">{stats.totalMeals} {t.totalMeals}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Restaurant Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {authRestaurant.logo && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.logo}</h3>
                    <div className="flex justify-center">
                      <img
                        src={authRestaurant.logo}
                        alt="Restaurant Logo"
                        className="w-48 h-48 object-cover rounded-full shadow-lg"
                      />
                    </div>
                  </div>
                )}
                {authRestaurant.banner && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.banner}</h3>
                    <div className="flex justify-center">
                      <img
                        src={authRestaurant.banner}
                        alt="Restaurant Banner"
                        className="w-full h-48 object-cover rounded-lg shadow-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">{t.viewQR}</h3>
                <div className="flex justify-center mb-4">
                  <QRCodeCanvas
                    id="qr-code"
                    value={window.location.origin}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-gray-600 mb-6">{t.scanQR}</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleDownloadQR}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {t.downloadQR}
                  </button>
                  <button
                    onClick={() => setShowQR(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    {t.close}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 