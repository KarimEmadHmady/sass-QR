"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Star } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Image from 'next/image';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
}

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
  reviews: Review[];
}

interface ApiResponse {
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
  reviews: Review[];
}

interface Category {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  image: string;
  description?: {
    en: string;
    ar: string;
  };
}

const MealsPage = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'You need to login first');
          return;
        }

        // Fetch meals
        const mealsResponse = await axios.get<ApiResponse[]>(`${process.env.NEXT_PUBLIC_API_URL}/meals`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Transform the data with proper typing
        const transformedMeals: Meal[] = mealsResponse.data.map((meal: ApiResponse) => ({
          _id: meal._id,
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
          category: {
            _id: meal.category?._id || '',
            name: {
              en: meal.category?.name?.en || '',
              ar: meal.category?.name?.ar || ''
            }
          },
          reviews: meal.reviews || []
        }));

        setMeals(transformedMeals);

        // Fetch categories
        const categoriesResponse = await axios.get<Category[]>(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCategories(categoriesResponse.data);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(language === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Failed to load data. Please try again later.');
        setMeals([]);
        setCategories([]);
        setLoading(false);
      }
    };

    fetchMeals();
  }, [language]);

  const deleteMeal = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this meal?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("You need to be logged in!");
          return;
        }

        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/meals/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMeals(meals.filter((meal) => meal._id !== id));
        toast.success("Meal deleted successfully");
      } catch (err) {
        console.error("Error deleting meal:", err);
        toast.error("Failed to delete meal. Please try again later.");
      }
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={`star-${star}`}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eee]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600 font-medium">
            <Image 
              src="/logo.png"
              className="h-[150px] w-[150px] object-center block mx-auto mb-6 group-hover:scale-105 transition-transform duration-500"
              alt="Logo"
              width={600}
              height={400}
            />
          </div>
        </div>
      </div>
    );
  }

  const filteredMeals = meals.filter((meal) => {
    const matchesSearch = 
      (meal.name?.ar?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (meal.name?.en?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (meal.description?.ar?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (meal.description?.en?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      activeCategory === 'all' || 
      meal.category?._id === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-4">
      <AnimatedBackground />


      {/* Search Bar */}
      <div className="max-w-md mx-auto relative mb-6">
        <input
          type="text"
          className={`block w-full p-3 bg-gray-100 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary ${
            language === 'ar' ? 'text-right' : 'text-left'
          }`}
          placeholder={language === 'ar' ? 'ابحث هنا ...' : 'Search here...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          {language === 'ar' ? 'لوحة تحكم الوجبات' : 'Meals Dashboard'}
        </h1>
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          {language === 'en' ? 'عربي' : 'English'}
        </button>
      </div>

      {/* Categories Filter */}
      <div className="mb-8">
        <div className={`flex flex-wrap gap-4 overflow-x-auto ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
          <button
            key="all"
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? "bg-[#222] text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {language === 'ar' ? 'الكل' : 'All'}
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => setActiveCategory(category._id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                activeCategory === category._id
                  ? "bg-[#222] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {language === 'ar' ? category.name.ar : category.name.en}
            </button>
          ))}
        </div>
      </div>

   

      {/* Meals Grid */}
      {error ? (
        <div className="text-center text-red-500 py-8">
          {language === 'ar' ? 'حدث خطأ في تحميل الوجبات' : error}
        </div>
      ) : filteredMeals.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {language === 'ar' ? 'لا توجد وجبات' : 'No meals found'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => (
            <div
              key={meal._id}
              className={`bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 ${
                language === 'ar' ? 'rtl' : 'ltr'
              }`}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              <Image 
                src={meal.image || "/placeholder.svg"}
                alt={language === 'ar' ? meal.name?.ar : meal.name?.en}
                className="w-full h-32 object-cover"
                width={600}
                height={400}
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  {language === 'ar' ? meal.name?.ar : meal.name?.en}
                </h2>
                <h3 className="text-sm text-gray-600 mb-2">
                  {language === 'ar' ? meal.name?.en : meal.name?.ar}
                </h3>
                <p className="text-gray-600 mt-2 text-sm mb-1">
                  {language === 'ar' ? meal.description?.ar : meal.description?.en}
                </p>
                <p className="text-gray-500 text-xs mb-2">
                  {language === 'ar' ? meal.description?.en : meal.description?.ar}
                </p>
                <p className="text-lg font-bold text-green-500 mt-4">
                  {language === 'ar' ? `السعر: ${meal.price} جنيه` : `Price: ${meal.price} EGP`}
                </p>
                <p className="text-md text-gray-700 mt-2">
                  {language === 'ar' ? 'الفئة: ' : 'Category: '}
                  {language === 'ar' 
                    ? `${meal.category?.name?.ar || 'غير مصنف'}`
                    : `${meal.category?.name?.en || 'Uncategorized'}`
                  }
                </p>
                <div className="flex items-center justify-end gap-1 mb-1">
                  {meal.reviews && meal.reviews.length > 0 ? (
                    <>
                      {renderStars(
                        meal.reviews.reduce((sum, review) => sum + review.rating, 0) / meal.reviews.length
                      )}
                      <span className="text-xs text-gray-500 mr-1">
                        ({meal.reviews.length} {language === 'ar' ? 'تقييم' : 'reviews'})
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">
                      {language === 'ar' ? 'لا توجد تقييمات' : 'No reviews'}
                    </span>
                  )}
                </div>

                <div className={`flex gap-2 mt-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <Link
                    href={`/dashboard/meals/edit/${meal._id}`}
                    className="inline-block text-blue-500 hover:text-blue-700 bg-[#eee] p-2 rounded cursor-pointer"
                  >
                    {language === 'ar' ? 'تعديل' : 'Edit'}
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm(language === 'ar' 
                        ? 'هل أنت متأكد من حذف هذه الوجبة؟' 
                        : 'Are you sure you want to delete this meal?')) {
                        deleteMeal(meal._id);
                      }
                    }}
                    className="inline-block text-red-500 hover:text-red-700 bg-[#eee] p-2 rounded cursor-pointer"
                  >
                    {language === 'ar' ? 'حذف' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/dashboard/meals/add"
        className="fixed bottom-8 right-8 bg-[#222] text-white p-4 rounded-full shadow-lg hover:bg-[#333] transition-colors"
      >
        {language === 'ar' ? '+ إضافة وجبة جديدة' : '+ Add New Meal'}
      </Link>
    </div>
  );
};

export default MealsPage;
