'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSubdomain } from '@/contexts/SubdomainContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { QRCodeCanvas } from 'qrcode.react';
import { FaQrcode } from 'react-icons/fa';
import { toast } from "react-hot-toast";

interface MongoDate {
  $date: {
    $numberLong: string;
  };
}

interface Restaurant {
  _id: string;
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  banner?: string;
  active: boolean;
  subscription: {
    status: 'trial' | 'active' | 'expired';
    trialEndsAt: MongoDate;
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
  description?: {
    en: string;
    ar: string;
  };
}

type DescriptionType = {
  en: string;
  ar: string;
};

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

interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: string;
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
  reviews: Review[];
}

const translations = {
  en: {
    totalCategories: 'Total Categories',
    totalMeals: 'Total Meals',
    accountStatus: 'Account Status',
    active: 'Active',
    trialPeriod: 'Trial Period',
    remainingDays: 'Remaining Days',
    remainingTime: 'Remaining Time',
    aboutUs: 'About Us',
    editProfile: 'Edit Profile',
    name: 'Name',
    phone: 'Phone',
    address: 'Address',
    email: 'Email',
    description: 'Description',
    descriptionPlaceholder: 'Enter restaurant description',
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
    authenticationError: 'Authentication error. Please try logging in again.',
    profileUpdateSuccess: 'Profile updated successfully',
    profileUpdateError: 'Failed to update profile',
    viewQR: 'View QR Code',
    downloadQR: 'Download QR Code',
    close: 'Close',
    scanQR: 'Scan this QR code to view the menu',
    socialMedia: 'Social Media',
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    location: 'Location',
    locationPlaceholder: 'Enter your restaurant location',
    expired: 'Expired'
  },
  ar: {
    totalCategories: 'إجمالي الفئات',
    totalMeals: 'إجمالي الوجبات',
    accountStatus: 'حالة الحساب',
    active: 'نشط',
    trialPeriod: 'فترة تجريبية',
    remainingDays: 'الأيام المتبقية',
    remainingTime: 'الوقت المتبقي',
    aboutUs: 'من نحن',
    editProfile: 'تعديل الملف الشخصي',
    name: 'الاسم',
    phone: 'الهاتف',
    address: 'العنوان',
    email: 'البريد الإلكتروني',
    description: 'الوصف',
    descriptionPlaceholder: 'أدخل وصف المطعم',
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
    profileUpdateSuccess: 'تم تحديث الملف الشخصي بنجاح',
    profileUpdateError: 'فشل في تحديث الملف الشخصي',
    viewQR: 'عرض رمز QR',
    downloadQR: 'تحميل رمز QR',
    close: 'إغلاق',
    scanQR: 'امسح رمز QR لعرض القائمة',
    socialMedia: 'وسائل التواصل الاجتماعي',
    facebook: 'فيسبوك',
    instagram: 'انستجرام',
    tiktok: 'تيك توك',
    location: 'الموقع',
    locationPlaceholder: 'أدخل موقع المطعم',
    expired: 'منتهي'
  }
};

// Helper to always get description as object
function getDescriptionObj(desc: string | { en: string; ar: string; } | undefined): { en: string; ar: string } {
  if (typeof desc === 'object' && desc !== null && 'en' in desc && 'ar' in desc) {
    return desc;
  }
  return { en: '', ar: '' };
}

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
  const [showSubscriptionWarning, setShowSubscriptionWarning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      if (!token || !authRestaurant) {
        console.log('No auth data, redirecting to login');
        router.push('/restaurant-login');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching data for restaurant:', authRestaurant);

        // Fetch updated restaurant data
        const restaurantResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal
        });

        if (!isMounted) return;

        if (restaurantResponse.status === 401) {
          console.log('Token expired or invalid, redirecting to login');
          toast.error(language === 'ar' ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' : 'Session expired. Please login again.');
          router.push('/restaurant-login');
          return;
        }

        if (!restaurantResponse.ok) {
          throw new Error('Failed to fetch restaurant data');
        }

        const updatedRestaurant = await restaurantResponse.json();
        console.log('Updated restaurant data:', updatedRestaurant);

        // Check subscription status
        if (updatedRestaurant.subscription?.status === 'expired') {
          setShowSubscriptionWarning(true);
        }
        
        // Update the auth context with new restaurant data
        if (typeof window !== 'undefined' && isMounted) {
          const event = new CustomEvent('restaurantUpdated', {
            detail: updatedRestaurant
          });
          window.dispatchEvent(event);
        }

        // Fetch meals and categories in parallel
        const [mealsResponse, categoriesResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/meals`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
          })
        ]);

        if (!isMounted) return;

        if (mealsResponse.status === 401 || categoriesResponse.status === 401) {
          console.log('Token expired or invalid during data fetch, redirecting to login');
          toast.error(language === 'ar' ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' : 'Session expired. Please login again.');
          router.push('/restaurant-login');
          return;
        }

        if (!mealsResponse.ok) throw new Error('Failed to fetch meals');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');

        const mealsData = await mealsResponse.json();
        const categoriesData = await categoriesResponse.json();

        if (!isMounted) return;

        console.log('Received meals data:', mealsData);
        console.log('Received categories data:', categoriesData);

        // Transform the data with proper typing
        const transformedMeals: Meal[] = mealsData.map((meal: any) => ({
          id: meal._id,
          name: {
            en: meal.name?.en || '',
            ar: meal.name?.ar || ''
          },
          description: {
            en: meal.description?.en || '',
            ar: meal.description?.ar || ''
          },
          price: meal.price || 0,
          image: meal.image || '',
          category: meal.category?._id || '',
          reviews: meal.reviews || []
        }));

        const transformedCategories: Category[] = categoriesData.map((category: any) => ({
          id: category._id,
          name: {
            en: category.name?.en || '',
            ar: category.name?.ar || ''
          },
          description: category.description ? {
            en: category.description.en || '',
            ar: category.description.ar || ''
          } : undefined,
          image: category.image || '',
          meals: transformedMeals.filter(meal => meal.category === category._id)
        }));

        if (isMounted) {
          setCategories(transformedCategories);
          setStats({
            totalCategories: transformedCategories.length,
            totalMeals: transformedMeals.length
          });
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Error fetching data:', error);
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.log('Fetch aborted');
            return;
          }
          if (error.message.includes('Failed to fetch')) {
            toast.error(language === 'ar' ? 'فشل في الاتصال بالخادم. يرجى المحاولة مرة أخرى.' : 'Failed to connect to server. Please try again.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.error(language === 'ar' ? 'لا توجد عناصر حالياً، يرجى إضافة وجبة أو صنف.' : 'No items available at the moment. Please add a meal or item.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [token, language, router]);

  // Add a separate effect to handle authRestaurant changes
  useEffect(() => {
    if (!authRestaurant && token) {
      console.log('No restaurant data, redirecting to login');
      router.push('/restaurant-login');
    }
  }, [authRestaurant, token, router]);

  const handleEdit = () => {
    if (authRestaurant) {
      const description = getDescriptionObj(authRestaurant.description as any);
      setEditedRestaurant({
        name: authRestaurant.name,
        phone: authRestaurant.phone || '',
        address: authRestaurant.address || '',
        description,
        settings: {
          currency: authRestaurant.settings.currency,
          language: authRestaurant.settings.language,
          socialMedia: {
            facebook: authRestaurant.settings.socialMedia?.facebook || '',
            instagram: authRestaurant.settings.socialMedia?.instagram || '',
            tiktok: authRestaurant.settings.socialMedia?.tiktok || ''
          },
          location: authRestaurant.settings.location || ''
        }
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

  const handleSocialMediaChange = (platform: 'facebook' | 'instagram' | 'tiktok', value: string) => {
    setEditedRestaurant(prev => ({
      ...prev,
      settings: {
        currency: prev.settings?.currency || 'EGP',
        language: prev.settings?.language || 'ar',
        socialMedia: {
          facebook: platform === 'facebook' ? value : (prev.settings?.socialMedia?.facebook || ''),
          instagram: platform === 'instagram' ? value : (prev.settings?.socialMedia?.instagram || ''),
          tiktok: platform === 'tiktok' ? value : (prev.settings?.socialMedia?.tiktok || '')
        },
        location: prev.settings?.location || ''
      }
    }));
  };

  const handleLocationChange = (value: string) => {
    setEditedRestaurant(prev => ({
      ...prev,
      settings: {
        currency: prev.settings?.currency || 'EGP',
        language: prev.settings?.language || 'ar',
        socialMedia: {
          facebook: prev.settings?.socialMedia?.facebook || '',
          instagram: prev.settings?.socialMedia?.instagram || '',
          tiktok: prev.settings?.socialMedia?.tiktok || ''
        },
        location: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Check authentication
      if (!token) {
        console.log('No token found, redirecting to login');
        toast.error(language === 'ar' ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' : 'Session expired. Please login again.');
        router.push('/restaurant-login');
        return;
      }

      if (!authRestaurant?._id) {
        console.log('No restaurant ID found');
        toast.error(language === 'ar' ? 'لم يتم العثور على بيانات المطعم. يرجى تسجيل الدخول مرة أخرى.' : 'Restaurant data not found. Please login again.');
        router.push('/restaurant-login');
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append('name', editedRestaurant.name || '');
      formData.append('phone', editedRestaurant.phone || '');
      formData.append('address', editedRestaurant.address || '');
      formData.append('description', JSON.stringify(getDescriptionObj(editedRestaurant.description ?? { en: '', ar: '' })));
      
      // Add settings data with the updated currency
      const settings = {
        currency: editedRestaurant.settings?.currency || authRestaurant.settings.currency,
        language: editedRestaurant.settings?.language || authRestaurant.settings.language,
        socialMedia: {
          facebook: editedRestaurant.settings?.socialMedia?.facebook || '',
          instagram: editedRestaurant.settings?.socialMedia?.instagram || '',
          tiktok: editedRestaurant.settings?.socialMedia?.tiktok || ''
        },
        location: editedRestaurant.settings?.location || ''
      };
      formData.append('settings', JSON.stringify(settings));
      
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
        description: editedRestaurant.description,
        settings: settings,
        hasLogo: !!logoFile,
        hasBanner: !!bannerFile
      });

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

      if (response.status === 401) {
        console.log('Token expired during save, redirecting to login');
        toast.error(language === 'ar' ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' : 'Session expired. Please login again.');
        router.push('/restaurant-login');
        return;
      }

      if (!response.ok) {
        throw new Error(responseData.message || t.profileUpdateError);
      }
      
      console.log('Profile updated successfully:', responseData);
      
      // Update the local state with the new data
      if (responseData.restaurant) {
        // Preserve subscription data when updating
        const updatedRestaurant = {
          ...responseData.restaurant,
          subscription: authRestaurant.subscription // Keep existing subscription data
        };
        
        // Update the auth context with new restaurant data
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('restaurantUpdated', {
            detail: updatedRestaurant
          });
          window.dispatchEvent(event);
        }
      }

      toast.success(t.profileUpdateSuccess);
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
          address: responseData.restaurant.address,
          description: responseData.restaurant.description,
          settings: {
            currency: responseData.restaurant.settings.currency,
            language: responseData.restaurant.settings.language,
            socialMedia: {
              facebook: responseData.restaurant.settings.socialMedia?.facebook || '',
              instagram: responseData.restaurant.settings.socialMedia?.instagram || '',
              tiktok: responseData.restaurant.settings.socialMedia?.tiktok || ''
            },
            location: responseData.restaurant.settings.location || ''
          }
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof Error) {
        toast.error(`${t.profileUpdateError}: ${error.message}`);
      } else {
        toast.error(t.profileUpdateError);
      }
    } finally {
      setLoading(false);
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

  const getRemainingTrialTime = () => {
    console.log('=== Debug Subscription Status ===');
    console.log('Full restaurant data:', JSON.stringify(authRestaurant, null, 2));
    console.log('Subscription data:', JSON.stringify(authRestaurant?.subscription, null, 2));
    
    if (!authRestaurant?.subscription) {
      console.log('No subscription data found');
      return null;
    }

    if (!authRestaurant.subscription.trialEndsAt) {
      console.log('No trial end date found');
      return null;
    }

    const now = new Date();
    let trialEnd: Date;

    // Handle both MongoDB date format and ISO string format
    if (typeof authRestaurant.subscription.trialEndsAt === 'string') {
      trialEnd = new Date(authRestaurant.subscription.trialEndsAt);
    } else {
      const mongoDate = authRestaurant.subscription.trialEndsAt as unknown as MongoDate;
      if (mongoDate.$date?.$numberLong) {
        trialEnd = new Date(parseInt(mongoDate.$date.$numberLong));
      } else {
        console.log('Invalid trial end date format:', authRestaurant.subscription.trialEndsAt);
        return null;
      }
    }

    const diff = trialEnd.getTime() - now.getTime();

    console.log('Time calculations:', {
      currentTime: now.toISOString(),
      trialEndTime: trialEnd.toISOString(),
      timeDifference: diff,
      subscriptionStatus: authRestaurant.subscription.status,
      rawTrialEndsAt: authRestaurant.subscription.trialEndsAt
    });

    if (diff <= 0) {
      console.log('Trial has expired');
      return null;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    console.log('Remaining time:', { days, hours, minutes });
    return { days, hours, minutes };
  };

  // Calculate remaining time once
  const remainingTime = getRemainingTrialTime();

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
        {/* Subscription Warning */}
        {showSubscriptionWarning && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6" role="alert">
            <div className="flex items-center">
              <div className="py-1">
                <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">
                  {language === 'ar' ? 'انتهت الفترة التجريبية' : 'Trial Period Expired'}
                </p>
                <p className="text-sm">
                  {language === 'ar' 
                    ? 'يرجى الاشتراك للاستمرار في استخدام الخدمة' 
                    : 'Please subscribe to continue using the service'}
                </p>
              </div>
            </div>
          </div>
        )}

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
            <button
              onClick={() => setShowQR(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 mx-auto"
            >
              <FaQrcode />
              <span>{t.viewQR}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center mb-5">
            <h3 className="text-lg font-semibold text-gray-600">{t.accountStatus}</h3>
            {authRestaurant.subscription?.status === 'trial' && remainingTime ? (
              <div>
                <p className="text-2xl font-bold text-yellow-600">{t.trialPeriod}</p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>{t.remainingDays}: {remainingTime.days}</p>
                  <p>{t.remainingTime}: {String(remainingTime.hours).padStart(2, '0')}:{String(remainingTime.minutes).padStart(2, '0')}</p>
                </div>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="mb-2 text-gray-600 text-sm">
                    {language === 'ar' ? 'هل تريد تفعيل الحساب؟ تواصل معنا' : 'Want to activate your account? Contact us'}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <a 
                      href="https://wa.me/0201551133253" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-600 hover:text-green-700"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span>نحن فى انتظارك</span>
                    </a>
                  </div>

                </div>
              </div>
            ) : authRestaurant.subscription?.status === 'active' ? (
              <p className="text-3xl font-bold text-green-600">{t.active}</p>
            ) : (
              <>
              <p className="text-3xl font-bold text-red-600">{t.expired}</p>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-3">
                <a 
                  href="https://wa.me/0201551133253" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-600 hover:text-green-700"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>نحن فى انتظارك</span>
                </a>
              </div>
              <p className="mt-2 text-gray-600 text-sm">
                {language === 'ar' ? 'هل تريد تفعيل الحساب؟ تواصل معنا' : 'Want to activate your account? Contact us'}
              </p>
            </div>
            </>
            )}
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.description}</label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">English</label>
                      <textarea
                        value={getDescriptionObj(editedRestaurant.description).en}
                        onChange={(e) => {
                          setEditedRestaurant(prev => {
                            const prevDesc = getDescriptionObj(prev.description);
                            return {
                              ...prev,
                              description: {
                                en: e.target.value,
                                ar: prevDesc.ar
                              }
                            };
                          });
                        }}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={4}
                        placeholder="Enter description in English"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">العربية</label>
                      <textarea
                        value={getDescriptionObj(editedRestaurant.description).ar}
                        onChange={(e) => {
                          setEditedRestaurant(prev => {
                            const prevDesc = getDescriptionObj(prev.description);
                            return {
                              ...prev,
                              description: {
                                en: prevDesc.en,
                                ar: e.target.value
                              }
                            };
                          });
                        }}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={4}
                        placeholder="أدخل الوصف بالعربية"
                        dir="rtl"
                      />
                    </div>
                  </div>
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

              {/* Currency Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{t.currency}</h3>
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    {t.currency}
                  </label>
                  <select
                    id="currency"
                    value={editedRestaurant.settings?.currency || 'EGP'}
                    onChange={(e) => setEditedRestaurant(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        currency: e.target.value as 'EGP' | 'SAR' | 'AED',
                        language: prev.settings?.language || 'ar',
                        socialMedia: {
                          facebook: prev.settings?.socialMedia?.facebook || '',
                          instagram: prev.settings?.socialMedia?.instagram || '',
                          tiktok: prev.settings?.socialMedia?.tiktok || ''
                        },
                        location: prev.settings?.location || ''
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="EGP">EGP - الجنيه المصري</option>
                    <option value="SAR">SAR - الريال السعودي</option>
                    <option value="AED">AED - الدرهم الإماراتي</option>
                  </select>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{t.socialMedia}</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
                      Facebook
                    </label>
                    <input
                      type="url"
                      id="facebook"
                      value={editedRestaurant.settings?.socialMedia?.facebook || ''}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="https://facebook.com/your-page"
                    />
                  </div>
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                      Instagram
                    </label>
                    <input
                      type="url"
                      id="instagram"
                      value={editedRestaurant.settings?.socialMedia?.instagram || ''}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="https://instagram.com/your-page"
                    />
                  </div>
                  <div>
                    <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700">
                      TikTok
                    </label>
                    <input
                      type="url"
                      id="tiktok"
                      value={editedRestaurant.settings?.socialMedia?.tiktok || ''}
                      onChange={(e) => handleSocialMediaChange('tiktok', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="https://tiktok.com/@your-account"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{t.location}</h3>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    {t.location}
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={editedRestaurant.settings?.location || ''}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder={language === 'ar' ? 'موقع المطعم' : 'Restaurant location'}
                  />
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
                  {authRestaurant.description && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{t.description}</h4>
                      <p className="text-gray-600 leading-relaxed">
                        {getDescriptionObj(authRestaurant.description)[language as 'en' | 'ar']}
                      </p>
                    </div>
                  )}
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
                      <span className="text-gray-600">
                        {authRestaurant.subscription?.status === 'trial' ? t.trialPeriod : 
                         authRestaurant.subscription?.status === 'active' ? t.active : t.expired}
                      </span>
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

              {/* Social Media and Location Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{t.socialMedia}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {authRestaurant.settings.socialMedia?.facebook && (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                      </svg>
                      <a href={authRestaurant.settings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {t.facebook}
                      </a>
                    </div>
                  )}
                  {authRestaurant.settings.socialMedia?.instagram && (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                      <a href={authRestaurant.settings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">
                        {t.instagram}
                      </a>
                    </div>
                  )}
                  {authRestaurant.settings.socialMedia?.tiktok && (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                      <a href={authRestaurant.settings.socialMedia.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline">
                        {t.tiktok}
                      </a>
                    </div>
                  )}
                  {authRestaurant.settings.location && (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span className="text-gray-600">{authRestaurant.settings.location} : ID</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <div className="flex flex-col">
                      <span 
                        className="text-gray-600 cursor-pointer hover:text-blue-600" 
                        onClick={() => {
                          const modal = document.createElement('div');
                          modal.className = 'fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50';
                          modal.innerHTML = `
                            <div class="bg-white p-4 rounded-lg w-11/12 h-5/6 ">
                              <div class="flex justify-between items-center mb-4">
                                <h3 class="text-lg font-bold">${language === 'ar' ? 'شرح كيفية اضافة ID' : 'How to add ID guide'}</h3>
                                <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              <div class="w-full h-full overflow-hidden ">
                                <embed
                                  src="${window.location.origin}/id.pdf#toolbar=0"
                                  type="application/pdf"
                                  width="100%"
                                  height="100%"
                                  style="border: none; "
                                />
                              </div>
                            </div>
                          `;
                          document.body.appendChild(modal);
                        }}
                      >
                        {language === 'ar' ? 'شرح كيفية اضافة ID لتقييم على جوجل' : 'How to add ID guide To rate on Google'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {language === 'ar' ? 'اضغط هنا لفتح الدليل' : 'Click here to open the guide'}
                      </span>
                    </div>
                  </div>
                </div>
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