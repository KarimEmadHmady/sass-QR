"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Star } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Image from 'next/image';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/contexts/AuthContext";

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
  const { token, isAuthenticated } = useAuth();
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
        
        if (!isAuthenticated || !token) {
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
          discountedPrice: meal.discountedPrice,
          discountPercentage: meal.discountPercentage,
          discountStartDate: meal.discountStartDate,
          discountEndDate: meal.discountEndDate,
          isDiscountActive: meal.isDiscountActive,
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
  }, [token, isAuthenticated, language]);

  const deleteMeal = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this meal?")) {
      try {
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
        <h1 className="text-1xl font-bold">
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
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-gray-500">
            {language === 'ar' ? 'لا توجد وجبات' : 'No meals found'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="divide-y divide-gray-100">
            {filteredMeals.map((meal) => (
              <div
                key={meal._id}
                className={`p-4 hover:bg-gray-50 transition-all duration-200 ease-in-out transform hover:scale-[1.01] hover:shadow-md ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'} flex items-center gap-4 border-b border-gray-100 last:border-b-0`}
              >
                <div className="relative w-16 h-16 flex-shrink-0 group">
                  <Image
                    src={meal.image || "/placeholder.svg"}
                    alt={language === 'ar' ? meal.name?.ar : meal.name?.en}
                    width={100}
                    height={100}
                    className="object-cover rounded-md transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium text-gray-900 truncate group-hover:text-primary transition-colors duration-200">
                          {language === 'ar' ? meal.name?.ar : meal.name?.en}
                        </h3>
                        
                        {/* عرض السعر مع الخصم */}
                        <div className="flex items-center gap-1">
                          {meal.isDiscountActive && meal.discountedPrice ? (
                            <>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 group-hover:bg-red-200 transition-colors duration-200 line-through">
                                {meal.price} {language === 'ar' ? 'جنيه' : 'EGP'}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 group-hover:bg-green-200 transition-colors duration-200">
                                {meal.discountedPrice} {language === 'ar' ? 'جنيه' : 'EGP'}
                              </span>
                              <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                -{meal.discountPercentage}%
                              </span>
                            </>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 group-hover:bg-green-200 transition-colors duration-200">
                              {meal.price} {language === 'ar' ? 'جنيه' : 'EGP'}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {language === 'ar' ? meal.name?.en : meal.name?.ar}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {language === 'ar' ? 'الفئة: ' : 'Category: '}
                          {language === 'ar' ? meal.category?.name?.ar : meal.category?.name?.en}
                        </span>
                        {meal.reviews && meal.reviews.length > 0 && (
                          <div className="flex items-center gap-1">
                            {renderStars(
                              meal.reviews.reduce((sum, review) => sum + review.rating, 0) / meal.reviews.length
                            )}
                            <span className="text-xs text-gray-500">
                              ({meal.reviews.length})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/dashboard/meals/edit/${meal._id}`}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => {
                          if (window.confirm(language === 'ar' 
                            ? 'هل أنت متأكد من حذف هذه الوجبة؟' 
                            : 'Are you sure you want to delete this meal?')) {
                            deleteMeal(meal._id);
                          }
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {meal.description && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {language === 'ar' ? meal.description.ar : meal.description.en}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                        {language === 'ar' ? meal.description.en : meal.description.ar}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
