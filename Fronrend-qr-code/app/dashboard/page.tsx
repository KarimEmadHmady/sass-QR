"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/store";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/store";
import AnimatedBackground from "@/components/AnimatedBackground";
import Image from 'next/image';
import { FaUtensils, FaTags, FaStar, FaQrcode, FaClock, FaEdit, FaTrash, FaMoneyBill, FaGlobe } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";

interface Meal {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  price: number;
  discountedPrice?: number;
  discountPercentage?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  isDiscountActive?: boolean;
  image: string;
  category: {
    _id: string;
    name: {
      en: string;
      ar: string;
    };
  };
  reviews?: Array<{
    _id: string;
    rating: number;
    comment: string;
    user: string;
  }>;
  rating?: number;
}

interface DashboardStats {
  totalReviews: number;
  totalMeals: number;
  totalCategories: number;
  averageMealPrice: number;
  averageRating: number;
  subscriptionStatus: string;
  trialDaysLeft: number;
}

export default function RestaurantDashboard() {
  const { token, isAuthenticated, login } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalReviews: 0,
    totalMeals: 0,
    totalCategories: 0,
    averageMealPrice: 0,
    averageRating: 0,
    subscriptionStatus: 'trial',
    trialDaysLeft: 0
  });
  const [loading, setLoading] = useState(true);
  const [showSubscriptionWarning, setShowSubscriptionWarning] = useState(false);

  // Memoized translations to prevent unnecessary recalculations
  const translations = useMemo(() => ({
    dashboard: {
      en: "Restaurant Dashboard",
      ar: "لوحة تحكم المطعم"
    },
    stats: {
      en: "Statistics",
      ar: "الإحصائيات"
    },
    totalReviews: {
      en: "Total Reviews",
      ar: "إجمالي التقييمات"
    },
    totalMeals: {
      en: "Total Meals",
      ar: "إجمالي الوجبات"
    },
    totalCategories: {
      en: "Total Categories",
      ar: "إجمالي الفئات"
    },
    averageMealPrice: {
      en: "Average Meal Price",
      ar: "متوسط سعر الوجبات"
    },
    averageRating: {
      en: "Average Rating",
      ar: "متوسط التقييم"
    },
    subscription: {
      en: "Subscription Status",
      ar: "حالة الاشتراك"
    },
    trialDaysLeft: {
      en: "Trial Days Left",
      ar: "أيام التجربة المتبقية"
    },
    quickActions: {
      en: "Quick Actions",
      ar: "إجراءات سريعة"
    },
    manageMeals: {
      en: "Manage Meals",
      ar: "إدارة الوجبات"
    },
    manageCategories: {
      en: "Manage Categories",
      ar: "إدارة الفئات"
    },
    viewQR: {
      en: "View QR Code",
      ar: "عرض رمز QR"
    },
    settings: {
      en: "Settings",
      ar: "الإعدادات"
    },
    recentMeals: {
      en: "Recent Meals",
      ar: "أحدث الوجبات"
    },
    edit: {
      en: "Edit",
      ar: "تعديل"
    },
    delete: {
      en: "Delete",
      ar: "حذف"
    },
    price: {
      en: "Price",
      ar: "السعر"
    },
    category: {
      en: "Category",
      ar: "الفئة"
    },
    addNewMeal: {
      en: "Add New Meal",
      ar: "إضافة وجبة جديدة"
    },
    contactWhatsapp: {
      en: "We are waiting for you",
      ar: "نحن فى انتظارك"
    }
  }), []); // Empty dependency array since translations are static

  // Memoized functions to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated || !token) {
        router.push('/restaurant-login');
        return;
      }

      // Fetch restaurant profile to get trial information
      const restaurantRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!restaurantRes.ok) {
        if (restaurantRes.status === 401) {
          // Token is invalid, redirect to login
          router.push('/restaurant-login');
          return;
        }
        // For other errors, show error but don't redirect
        console.error(`Failed to fetch restaurant profile: ${restaurantRes.status}`);
        setStats({
          totalReviews: 0,
          totalMeals: 0,
          totalCategories: 0,
          averageMealPrice: 0,
          averageRating: 0,
          subscriptionStatus: 'trial',
          trialDaysLeft: 0
        });
        setMeals([]);
        setLoading(false);
        return;
      }
  
      const restaurantData = await restaurantRes.json();
  
      // Calculate remaining trial days
      const trialEndsAt = new Date(restaurantData.subscription.trialEndsAt);
      const now = new Date();
      const diff = trialEndsAt.getTime() - now.getTime();
      const remainingDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      const remainingHours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const trialDaysLeft = remainingDays + (remainingHours > 0 ? 1 : 0);

      // Check subscription status
      if (restaurantData.subscription.status === 'expired') {
        setShowSubscriptionWarning(true);
      }
  
      // Fetch meals and categories in parallel
      const [mealsRes, categoriesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/meals`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!mealsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [mealsData, categoriesData] = await Promise.all([
        mealsRes.json(),
        categoriesRes.json(),
      ]);

      setMeals(mealsData);
      
      // Calculate stats
      const totalReviews = mealsData.reduce((sum: number, meal: Meal) => 
        sum + (meal.reviews?.length || 0), 0
      );
      
      const totalMealPrice = mealsData.reduce((sum: number, meal: Meal) => 
        sum + (meal.isDiscountActive && meal.discountedPrice ? meal.discountedPrice : meal.price), 0
      );
      
      const averageMealPrice = mealsData.length > 0 ? totalMealPrice / mealsData.length : 0;
      
      const totalRating = mealsData.reduce((sum: number, meal: Meal) => 
        sum + (meal.rating || 0), 0
      );
      
      const averageRating = mealsData.length > 0 ? totalRating / mealsData.length : 0;

      setStats({
        totalReviews,
        totalMeals: mealsData.length,
        totalCategories: categoriesData.length,
        averageMealPrice,
        averageRating,
        subscriptionStatus: restaurantData.subscription.status,
        trialDaysLeft
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(language === 'ar' ? 'فشل في تحميل البيانات' : 'Failed to load data');
      setLoading(false);
    }
  }, [isAuthenticated, token, router, language]);

  const initializeAuth = useCallback(async () => {
    // Check for token and restaurant data in URL (auto-login from main domain)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const restaurantData = urlParams.get('restaurant');
    
    if (urlToken && restaurantData && !isAuthenticated) {
      try {
        // Parse restaurant data
        const restaurant = JSON.parse(decodeURIComponent(restaurantData));
        
        // Save to localStorage
        localStorage.setItem('token', urlToken);
        localStorage.setItem('restaurant', JSON.stringify(restaurant));
        
        // Update auth context
        await login(restaurant, urlToken);
        
        // Remove data from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Fetch data immediately after login
        fetchData();
        return;
      } catch (error) {
        console.error('Error processing auto-login data:', error);
      }
    }

    // If no URL data but we have localStorage data, try to use it
    if (!isAuthenticated) {
      const storedToken = localStorage.getItem('token');
      const storedRestaurant = localStorage.getItem('restaurant');
      
      if (storedToken && storedRestaurant) {
        try {
          const restaurant = JSON.parse(storedRestaurant);
          await login(restaurant, storedToken);
          // Fetch data immediately after login
          fetchData();
          return;
        } catch (error) {
          console.error('Error processing stored data:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('restaurant');
        }
      }
    }
    
    // If we're already authenticated, fetch data
    if (isAuthenticated && token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token, login, fetchData]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const deleteMeal = useCallback(async (id: string) => {
    const confirmed = window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الوجبة؟' : 'Are you sure you want to delete this meal?');
    if (confirmed) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meals/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMeals(meals.filter(meal => meal._id !== id));
        toast.success(language === 'ar' ? 'تم حذف الوجبة بنجاح' : 'Meal deleted successfully');
      } catch (error) {
        console.error("Error deleting meal:", error);
        toast.error(language === 'ar' ? 'حدث خطأ أثناء حذف الوجبة' : 'Error deleting meal');
      }
    }
  }, [language, token, meals]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eee]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eee] p-4 sm:p-8 relative">
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto space-y-8">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <FaUtensils className="text-green-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">{translations.totalMeals[language]}</h3>
                <p className="text-2xl font-bold">{stats.totalMeals}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <FaTags className="text-purple-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">{translations.totalCategories[language]}</h3>
                <p className="text-2xl font-bold">{stats.totalCategories}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaStar className="text-yellow-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">{translations.totalReviews[language]}</h3>
                <p className="text-2xl font-bold">{stats.totalReviews}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaStar className="text-yellow-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">{translations.averageRating[language]}</h3>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <FaMoneyBill className="text-green-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">{translations.averageMealPrice[language]}</h3>
                <p className="text-2xl font-bold">{stats.averageMealPrice.toFixed(2)} EGP</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaGlobe className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">{language === 'ar' ? 'عرض قائمة الطعام' : 'View Your Menu'}</h3>
                <Link href="/" className="text-blue-600 hover:text-blue-800 text-lg font-semibold">
                  {language === 'ar' ? 'اضغط هنا' : 'Click Here'}
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-full">
                <FaClock className="text-red-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">{translations.trialDaysLeft[language]}</h3>
                <p className="text-2xl font-bold">{stats.trialDaysLeft}</p>
              </div>
            </div>
            {stats.subscriptionStatus === 'trial' && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <a 
                    href="https://wa.me/0201551133253" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-600 hover:text-green-700"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>{translations.contactWhatsapp[language]}</span>
                  </a>
                </div>
                <p className="mt-2 text-gray-600 text-sm">
                  {language === 'ar' ? 'هل تريد تفعيل الحساب؟ تواصل معنا' : 'Want to activate your account? Contact us'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-[15px] sm:text-2xl font-bold mb-6">{translations.quickActions[language]}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/meals"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <FaUtensils className="text-green-600 text-xl" />
              <span>{translations.manageMeals[language]}</span>
            </Link>
            <Link
              href="/dashboard/categories"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <FaTags className="text-purple-600 text-xl" />
              <span>{translations.manageCategories[language]}</span>
            </Link>
            <Link
              href="/dashboard/discounts"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <FaMoneyBill className="text-orange-600 text-xl" />
              <span>{language === 'ar' ? 'إدارة الخصومات' : 'Manage Discounts'}</span>
            </Link>
            <Link
              href="/dashboard/qr"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <FaQrcode className="text-indigo-600 text-xl" />
              <span>{translations.viewQR[language]}</span>
            </Link>
          </div>
        </div>

        {/* Recent Meals */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[14px] sm:text-2xl font-bold">{translations.recentMeals[language]}</h2>
            <Link
              href="/dashboard/meals/add"
              className="bg-[#222] text-[14px] sm:text-1xl text-white px-4 py-2 rounded-lg hover:bg-[#333] transition"
            >
              {translations.addNewMeal[language]}
            </Link>
          </div>
          
          {meals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FaUtensils className="text-6xl mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {language === 'ar' ? 'لا توجد وجبات بعد' : 'No meals yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {language === 'ar' 
                  ? 'ابدأ بإضافة وجبتك الأولى لعرضها هنا' 
                  : 'Start by adding your first meal to display it here'}
              </p>
              <Link
                href="/dashboard/meals/add"
                className="bg-[#222] text-white px-6 py-3 rounded-lg hover:bg-[#333] transition inline-block"
              >
                {translations.addNewMeal[language]}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meals.slice(0, 6).map((meal) => (
                <div key={meal._id} className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={meal.image || "/placeholder.svg"}
                      alt={language === 'ar' ? meal.name.ar : meal.name.en}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      {language === 'ar' ? meal.name.ar : meal.name.en}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {language === 'ar' ? meal.description.ar : meal.description.en}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-bold">
                        {meal.isDiscountActive && meal.discountedPrice ? (
                          <div className="flex items-center gap-2">
                            <span className="line-through text-gray-400">
                              {language === 'ar' ? `${meal.price} جنيه` : `${meal.price} EGP`}
                            </span>
                            <span>
                              {language === 'ar' ? `${meal.discountedPrice} جنيه` : `${meal.discountedPrice} EGP`}
                            </span>
                            <span className="text-orange-600 text-sm">
                              -{meal.discountPercentage}%
                            </span>
                          </div>
                        ) : (
                          language === 'ar' ? `${meal.price} جنيه` : `${meal.price} EGP`
                        )}
                      </span>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/meals/edit/${meal._id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEdit className="text-xl" />
                        </Link>
                        <button
                          onClick={() => deleteMeal(meal._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash className="text-xl" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

