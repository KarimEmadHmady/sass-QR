"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Star } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Image from 'next/image';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/store";
import useSWR from 'swr';
import { showApiErrorToast } from '@/utils/apiError';

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
}

interface MealData {
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

interface CategoryData {
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

const fetcher = async (url: string) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  
  const response = await axios.get(url, { 
    headers: { Authorization: `Bearer ${token}` } 
  });
  return response.data;
};

const MealsPage = () => {
  const { restaurant, token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState('all');
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountData, setDiscountData] = useState({ percentage: 10, startDate: '', endDate: '' });
  const [bulkLoading, setBulkLoading] = useState(false);
  const [isTrialExpired, setIsTrialExpired] = useState(false);

  // SWR for meals and categories
  const { data: meals = [], error: mealsError, isLoading: mealsLoading, mutate: mutateMeals } = useSWR(
    token ? `${process.env.NEXT_PUBLIC_API_URL}/meals` : null, 
    fetcher
  );
  const { data: categories = [], error: categoriesError, isLoading: categoriesLoading } = useSWR(
    token ? `${process.env.NEXT_PUBLIC_API_URL}/categories` : null, 
    fetcher
  );

  // Check trial expiration
  useEffect(() => {
    if (restaurant?.subscription) {
      const now = new Date();
      let trialEnd: Date;

      if (typeof restaurant.subscription.trialEndsAt === 'string') {
        trialEnd = new Date(restaurant.subscription.trialEndsAt);
      } else {
        const mongoDate = restaurant.subscription.trialEndsAt as { $date?: { $numberLong: string } };
        if (mongoDate.$date?.$numberLong) {
          trialEnd = new Date(parseInt(mongoDate.$date.$numberLong));
        } else {
          return;
        }
      }

      const diff = trialEnd.getTime() - now.getTime();
      if (diff <= 0) {
        setIsTrialExpired(true);
      }
    }
  }, [restaurant]);

  useEffect(() => {
    setShowBulkActions(selectedMeals.length > 0);
  }, [selectedMeals]);

  // Handle errors
  useEffect(() => {
    if (mealsError) {
      showApiErrorToast(mealsError, 'فشل في تحميل الوجبات');
    }
    if (categoriesError) {
      showApiErrorToast(categoriesError, 'فشل في تحميل الفئات');
    }
  }, [mealsError, categoriesError]);

  const deleteMeal = async (id: string) => {
    if (isTrialExpired) {
      toast.error(language === 'ar' ? 'انتهت الفترة التجريبية. لا يمكن حذف الوجبات.' : 'Trial period expired. Cannot delete meals.');
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this meal?")) {
      try {
        if (!token) {
          toast.error("You need to be logged in!");
          return;
        }
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/meals/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        mutateMeals();
        toast.success("Meal deleted successfully");
      } catch (err) {
        showApiErrorToast(err, "Failed to delete meal. Please try again later.");
      }
    }
  };

  // Bulk operations functions
  const handleSelectAll = () => {
    if (isTrialExpired) {
      toast.error(language === 'ar' ? 'انتهت الفترة التجريبية. لا يمكن تحديد الوجبات.' : 'Trial period expired. Cannot select meals.');
      return;
    }
    
    if (selectAll) {
      setSelectedMeals([]);
      setSelectAll(false);
    } else {
      setSelectedMeals(filteredMeals.map((meal: MealData) => meal._id));
      setSelectAll(true);
    }
  };

  const handleSelectMeal = (mealId: string) => {
    if (isTrialExpired) {
      toast.error(language === 'ar' ? 'انتهت الفترة التجريبية. لا يمكن تحديد الوجبات.' : 'Trial period expired. Cannot select meals.');
      return;
    }
    
    if (selectedMeals.includes(mealId)) {
      setSelectedMeals(selectedMeals.filter(id => id !== mealId));
      setSelectAll(false);
    } else {
      setSelectedMeals([...selectedMeals, mealId]);
      // Check if all filtered meals are selected
      if (selectedMeals.length + 1 === filteredMeals.length) {
        setSelectAll(true);
      }
    }
  };

  const handleBulkDiscount = async () => {
    if (isTrialExpired) {
      toast.error(language === 'ar' ? 'انتهت الفترة التجريبية. لا يمكن تطبيق الخصم.' : 'Trial period expired. Cannot apply discount.');
      return;
    }
    
    if (!discountData.startDate || !discountData.endDate) {
      toast.error(language === 'ar' ? 'يرجى تحديد تاريخ البداية والنهاية' : 'Please select start and end dates');
      return;
    }
    try {
      setBulkLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/meals/bulk-discount`,
        {
          mealIds: selectedMeals,
          discountPercentage: discountData.percentage,
          discountStartDate: discountData.startDate,
          discountEndDate: discountData.endDate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(language === 'ar' 
        ? `تم تطبيق الخصم على ${response.data.modifiedCount} وجبة بنجاح`
        : `Discount applied successfully to ${response.data.modifiedCount} meals`
      );
      mutateMeals();
    } catch (err) {
      showApiErrorToast(err, language === 'ar' ? 'فشل في تطبيق الخصم' : 'Failed to apply discount');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (isTrialExpired) {
      toast.error(language === 'ar' ? 'انتهت الفترة التجريبية. لا يمكن حذف الوجبات.' : 'Trial period expired. Cannot delete meals.');
      return;
    }
    
    if (!window.confirm(language === 'ar' 
      ? `هل أنت متأكد من حذف ${selectedMeals.length} وجبة؟`
      : `Are you sure you want to delete ${selectedMeals.length} meals?`
    )) {
      return;
    }
    try {
      setBulkLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/meals/bulk-delete`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { mealIds: selectedMeals }
        }
      );
      toast.success(language === 'ar' 
        ? `تم حذف ${response.data.deletedCount} وجبة بنجاح`
        : `Successfully deleted ${response.data.deletedCount} meals`
      );
      mutateMeals();
      setSelectedMeals([]);
      setSelectAll(false);
    } catch (err: unknown) {
      showApiErrorToast(err, language === 'ar' ? 'فشل في حذف الوجبات. يرجى المحاولة مرة أخرى.' : 'Failed to delete meals. Please try again later.');
    } finally {
      setBulkLoading(false);
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

  if (mealsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eee]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  
  if (mealsError || categoriesError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eee]">
        <div className="text-center">
          <div className="text-red-600 font-medium">
            {mealsError ? 'فشل في تحميل الوجبات' : 'فشل في تحميل الفئات'}
          </div>
        </div>
      </div>
    );
  }

  const filteredMeals = meals.filter((meal: MealData) => {
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

      {/* Trial Expired Warning */}
      {isTrialExpired && (
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
                  ? 'لا يمكنك إضافة أو تعديل أو حذف الوجبات. يرجى الاشتراك للاستمرار في استخدام الخدمة' 
                  : 'You cannot add, edit, or delete meals. Please subscribe to continue using the service'}
              </p>
            </div>
          </div>
        </div>
      )}

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
          {categories.map((category: CategoryData) => (
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

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-800">
                {language === 'ar' 
                  ? `${selectedMeals.length} وجبة محددة`
                  : `${selectedMeals.length} meals selected`
                }
              </span>
              <button
                onClick={() => {
                  setSelectedMeals([]);
                  setSelectAll(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {language === 'ar' ? 'إلغاء التحديد' : 'Clear selection'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDiscountModal(true)}
                disabled={bulkLoading || isTrialExpired}
                className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                  isTrialExpired ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {language === 'ar' ? 'إضافة خصم' : 'Add Discount'}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkLoading || isTrialExpired}
                className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                  isTrialExpired ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {language === 'ar' ? 'حذف المحدد' : 'Delete Selected'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meals Grid */}
      {mealsError ? (
        <div className="text-center text-red-500 py-8">
          {language === 'ar' ? 'حدث خطأ في تحميل الوجبات' : mealsError.message}
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
          {/* Select All Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <label className={`flex items-center gap-3 cursor-pointer group ${
                isTrialExpired ? 'opacity-50 cursor-not-allowed' : ''
              }`}>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    disabled={isTrialExpired}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 rounded-md transition-all duration-200 flex items-center justify-center ${
                    selectAll 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'bg-white border-gray-300 group-hover:border-blue-400'
                  }`}>
                    {selectAll && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {language === 'ar' ? 'تحديد الكل' : 'Select All'}
                </span>
              </label>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredMeals.map((meal: MealData) => (
              <div
                key={meal._id}
                className={`p-4 hover:bg-gray-50 transition-all duration-200 ease-in-out transform hover:scale-[1.01] hover:shadow-md ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'} flex items-center gap-4 border-b border-gray-100 last:border-b-0`}
              >
                {/* Checkbox */}
                <label className={`flex items-center cursor-pointer group ${
                  isTrialExpired ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedMeals.includes(meal._id)}
                      onChange={() => handleSelectMeal(meal._id)}
                      disabled={isTrialExpired}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded-md transition-all duration-200 flex items-center justify-center ${
                      selectedMeals.includes(meal._id)
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-white border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {selectedMeals.includes(meal._id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </label>
                
                <div className="relative w-[auto] h-[auto] flex-shrink-0 group">
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
                              meal.reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / meal.reviews.length
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
                        className={`p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer ${
                          isTrialExpired ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                        onClick={(e) => {
                          if (isTrialExpired) {
                            e.preventDefault();
                            toast.error(language === 'ar' ? 'انتهت الفترة التجريبية. لا يمكن تعديل الوجبات.' : 'Trial period expired. Cannot edit meals.');
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => {
                          if (isTrialExpired) {
                            toast.error(language === 'ar' ? 'انتهت الفترة التجريبية. لا يمكن حذف الوجبات.' : 'Trial period expired. Cannot delete meals.');
                            return;
                          }
                          if (window.confirm(language === 'ar' 
                            ? 'هل أنت متأكد من حذف هذه الوجبة؟' 
                            : 'Are you sure you want to delete this meal?')) {
                            deleteMeal(meal._id);
                          }
                        }}
                        disabled={isTrialExpired}
                        className={`p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer ${
                          isTrialExpired ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
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
        className={`fixed bottom-8 right-8 bg-[#222] text-white p-4 rounded-full shadow-lg hover:bg-[#333] transition-colors ${
          isTrialExpired ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={(e) => {
          if (isTrialExpired) {
            e.preventDefault();
            toast.error(language === 'ar' ? 'انتهت الفترة التجريبية. لا يمكن إضافة وجبات جديدة.' : 'Trial period expired. Cannot add new meals.');
          }
        }}
      >
        {language === 'ar' ? '+ إضافة وجبة جديدة' : '+ Add New Meal'}
      </Link>

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'ar' ? 'إضافة خصم جماعي' : 'Add Bulk Discount'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'نسبة الخصم (%)' : 'Discount Percentage (%)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={discountData.percentage}
                  onChange={(e) => setDiscountData({...discountData, percentage: parseInt(e.target.value) || 0})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                </label>
                <input
                  type="datetime-local"
                  value={discountData.startDate}
                  onChange={(e) => setDiscountData({...discountData, startDate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'تاريخ النهاية' : 'End Date'}
                </label>
                <input
                  type="datetime-local"
                  value={discountData.endDate}
                  onChange={(e) => setDiscountData({...discountData, endDate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowDiscountModal(false);
                  setDiscountData({ percentage: 10, startDate: '', endDate: '' });
                }}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleBulkDiscount}
                disabled={bulkLoading || isTrialExpired}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 ${
                  isTrialExpired ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {bulkLoading 
                  ? (language === 'ar' ? 'جاري التطبيق...' : 'Applying...')
                  : (language === 'ar' ? 'تطبيق الخصم' : 'Apply Discount')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealsPage;
