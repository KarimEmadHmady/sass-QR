"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import AnimatedBackground from "@/components/AnimatedBackground";
import Image from 'next/image';
import { FaUsers, FaUtensils, FaTags, FaStar, FaQrcode, FaChartLine, FaClock, FaEdit, FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from "react-toastify";
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
}

interface DashboardStats {
  totalUsers: number;
  totalMeals: number;
  totalCategories: number;
  totalReviews: number;
  totalScans: number;
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
    totalUsers: 0,
    totalMeals: 0,
    totalCategories: 0,
    totalReviews: 0,
    totalScans: 0,
    averageRating: 0,
    subscriptionStatus: 'trial',
    trialDaysLeft: 7
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !restaurant) {
      router.push('/restaurant-login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch meals
        const mealsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meals`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!mealsRes.ok) {
          throw new Error(`Failed to fetch meals: ${mealsRes.status}`);
        }

        const mealsData = await mealsRes.json();
        console.log('Meals data:', mealsData);
        setMeals(mealsData);

        // Fetch categories
        const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!categoriesRes.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesRes.status}`);
        }

        const categoriesData = await categoriesRes.json();
        console.log('Categories data:', categoriesData);

        // Calculate statistics
        const totalMeals = mealsData.length;
        const totalCategories = categoriesData.length;
        const totalReviews = mealsData.reduce((acc, meal) => acc + (meal.reviews?.length || 0), 0);
        const averageRating = mealsData.length > 0 
          ? mealsData.reduce((acc, meal) => acc + (meal.rating || 0), 0) / mealsData.length 
          : 0;

        // Update stats
        setStats({
          totalUsers: 0, // TODO: Implement user tracking
          totalMeals,
          totalCategories,
          totalReviews,
          totalScans: 0, // TODO: Implement QR scan tracking
          averageRating,
          subscriptionStatus: 'trial',
          trialDaysLeft: 7
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error(language === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading dashboard data');
        // Set default values in case of error
        setStats({
          totalUsers: 0,
          totalMeals: 0,
          totalCategories: 0,
          totalReviews: 0,
          totalScans: 0,
          averageRating: 0,
          subscriptionStatus: 'trial',
          trialDaysLeft: 7
        });
        setMeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, restaurant, token, router]);

  const deleteMeal = async (id: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الوجبة؟' : 'Are you sure you want to delete this meal?')) {
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
    totalUsers: {
      en: "Total Users",
      ar: "إجمالي المستخدمين"
    },
    totalMeals: {
      en: "Total Meals",
      ar: "إجمالي الوجبات"
    },
    totalCategories: {
      en: "Total Categories",
      ar: "إجمالي الفئات"
    },
    totalReviews: {
      en: "Total Reviews",
      ar: "إجمالي التقييمات"
    },
    totalScans: {
      en: "Total QR Scans",
      ar: "إجمالي عمليات المسح"
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
          <Image 
            src="/logo.png"
            alt="Application logo"
            className="h-[150px] w-[150px] object-center block mx-auto mb-6 group-hover:scale-105 transition-transform duration-500"
            width={500} 
            height={300} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eee] p-4 sm:p-8 relative">
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaUsers className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">{translations.totalUsers[language]}</h3>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
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
              <div className="bg-indigo-100 p-3 rounded-full">
                <FaQrcode className="text-indigo-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">{translations.totalScans[language]}</h3>
                <p className="text-2xl font-bold">{stats.totalScans}</p>
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
              href="/dashboard/settings"
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

