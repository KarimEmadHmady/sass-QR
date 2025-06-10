"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import AnimatedBackground from "@/components/AnimatedBackground";
import Image from 'next/image';
import { FaUsers, FaUtensils, FaTags, FaStar, FaQrcode, FaChartLine, FaClock, FaEdit, FaTrash, FaMoneyBill } from 'react-icons/fa';
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
  const { restaurant, token, isAuthenticated } = useAuth();
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

  useEffect(() => {
    if (!isAuthenticated || !restaurant) {
      router.push('/restaurant-login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch restaurant profile to get trial information
        const restaurantRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!restaurantRes.ok) {
          throw new Error(`Failed to fetch restaurant profile: ${restaurantRes.status}`);
        }
    
        const restaurantData = await restaurantRes.json();
        console.log('Restaurant data:', restaurantData);
    
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
    
        if (!mealsRes.ok) {
          throw new Error(`Failed to fetch meals: ${mealsRes.status}`);
        }
        if (!categoriesRes.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesRes.status}`);
        }
    
        const mealsData = await mealsRes.json();
        const categoriesData = await categoriesRes.json();
    
        setMeals(mealsData);
    
        // Calculate statistics
        const totalMeals = mealsData.length;
        const totalCategories = categoriesData.length;
        const totalReviews = mealsData.reduce((acc: number, meal: Meal) => acc + (meal.reviews?.length || 0), 0);
        const averageRating = mealsData.length > 0 
          ? mealsData.reduce((acc: number, meal: Meal) => acc + (meal.rating || 0), 0) / mealsData.length 
          : 0;
        const averageMealPrice = mealsData.length > 0
          ? mealsData.reduce((acc: number, meal: Meal) => acc + meal.price, 0) / mealsData.length
          : 0;
    
        // Update stats
        setStats({
          totalReviews,
          totalMeals,
          totalCategories,
          averageMealPrice,
          averageRating,
          subscriptionStatus: restaurantData.subscription.status,
          trialDaysLeft
        });
    
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error(language === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading dashboard data');
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, restaurant, token, router]);

  const deleteMeal = async (id: string) => {
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
  };

  const translations = {
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
    }
  };

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
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">{translations.quickActions[language]}</h2>
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
              href="/dashboard/qr"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <FaQrcode className="text-indigo-600 text-xl" />
              <span>{translations.viewQR[language]}</span>
            </Link>
            <Link
              href={`/restaurant/${restaurant?.id}`}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <FaChartLine className="text-blue-600 text-xl" />
              <span>{translations.settings[language]}</span>
            </Link>
          </div>
        </div>

        {/* Recent Meals */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{translations.recentMeals[language]}</h2>
            <Link
              href="/dashboard/meals/add"
              className="bg-[#222] text-white px-4 py-2 rounded-lg hover:bg-[#333] transition"
            >
              {translations.addNewMeal[language]}
            </Link>
          </div>
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
                      {language === 'ar' ? `${meal.price} جنيه` : `${meal.price} EGP`}
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
            </div>
      </div>
    </div>
  );
}

