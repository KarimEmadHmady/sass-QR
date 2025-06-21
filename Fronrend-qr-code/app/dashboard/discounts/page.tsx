"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from 'next/image';
import { useAuth } from "@/contexts/AuthContext";

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
}

interface DiscountForm {
  discountPercentage: string;
  discountStartDate: string;
  discountEndDate: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const DiscountsPage = () => {
  const { restaurant, token } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [activeDiscounts, setActiveDiscounts] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<string>("");
  const [discountForm, setDiscountForm] = useState<DiscountForm>({
    discountPercentage: "",
    discountStartDate: "",
    discountEndDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');
  const router = useRouter();

  useEffect(() => {
    if (!restaurant) {
      router.push('/restaurant-login');
      return;
    }
    fetchMeals();
    fetchActiveDiscounts();
  }, [restaurant, router]);

  const fetchMeals = async () => {
    try {
      const response = await axios.get<Meal[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/meals`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMeals(response.data);
    } catch (error) {
      console.error("Error fetching meals:", error);
      toast.error(language === 'ar' ? 'فشل في تحميل الوجبات' : 'Failed to load meals');
    }
  };

  const fetchActiveDiscounts = async () => {
    try {
      const response = await axios.get<{ meals: Meal[] }>(
        `${process.env.NEXT_PUBLIC_API_URL}/meals/discounts/active`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setActiveDiscounts(response.data.meals);
    } catch (error) {
      console.error("Error fetching active discounts:", error);
      toast.error(language === 'ar' ? 'فشل في تحميل الخصومات النشطة' : 'Failed to load active discounts');
    }
  };

  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMeal) {
      toast.error(language === 'ar' ? 'يرجى اختيار وجبة' : 'Please select a meal');
      return;
    }

    if (!discountForm.discountPercentage || !discountForm.discountStartDate || !discountForm.discountEndDate) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع حقول الخصم' : 'Please fill all discount fields');
      return;
    }

    const percentage = parseFloat(discountForm.discountPercentage);
    if (percentage < 0 || percentage > 100) {
      toast.error(language === 'ar' ? 'نسبة الخصم يجب أن تكون بين 0 و 100' : 'Discount percentage must be between 0 and 100');
      return;
    }

    const startDate = new Date(discountForm.discountStartDate);
    const endDate = new Date(discountForm.discountEndDate);
    
    if (startDate >= endDate) {
      toast.error(language === 'ar' ? 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' : 'End date must be after start date');
      return;
    }

    if (startDate < new Date()) {
      toast.error(language === 'ar' ? 'تاريخ البداية لا يمكن أن يكون في الماضي' : 'Start date cannot be in the past');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/meals/${selectedMeal}/discount`,
        {
          discountPercentage: percentage,
          discountStartDate: startDate.toISOString(),
          discountEndDate: endDate.toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success(language === 'ar' ? 'تم إضافة الخصم بنجاح' : 'Discount added successfully');
      setDiscountForm({
        discountPercentage: "",
        discountStartDate: "",
        discountEndDate: "",
      });
      setSelectedMeal("");
      fetchMeals();
      fetchActiveDiscounts();
    } catch (error: unknown) {
      console.error('Error adding discount:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 
        (language === 'ar' ? 'حدث خطأ أثناء إضافة الخصم' : 'Error adding discount');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiscount = async (mealId: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من إزالة الخصم؟' : 'Are you sure you want to remove this discount?')) {
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/meals/${mealId}/discount`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(language === 'ar' ? 'تم إزالة الخصم بنجاح' : 'Discount removed successfully');
      fetchMeals();
      fetchActiveDiscounts();
    } catch (error: unknown) {
      console.error('Error removing discount:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 
        (language === 'ar' ? 'حدث خطأ أثناء إزالة الخصم' : 'Error removing discount');
      toast.error(errorMessage);
    }
  };

  const cleanupExpiredDiscounts = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/meals/discounts/cleanup`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(language === 'ar' ? 'تم تنظيف الخصومات المنتهية بنجاح' : 'Expired discounts cleaned up successfully');
      fetchMeals();
      fetchActiveDiscounts();
    } catch (error: unknown) {
      console.error('Error cleaning up discounts:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء تنظيف الخصومات' : 'Error cleaning up discounts');
    }
  };

  return (
    <div className="min-h-screen bg-[#eee] flex flex-col items-center py-8 px-4">
      <AnimatedBackground />
      
      {/* Language Switch */}
      <div className="w-full max-w-4xl mb-4 flex justify-end">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          {language === 'en' ? 'عربي' : 'English'}
        </button>
      </div>

      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {language === 'ar' ? 'إدارة الخصومات' : 'Discount Management'}
          </h1>
          <p className="text-gray-600">
            {language === 'ar' ? 'أضف خصومات للوجبات وأدر الخصومات النشطة' : 'Add discounts to meals and manage active discounts'}
          </p>
        </div>

        {/* Add Discount Form */}
        <div className={`bg-white p-8 rounded-2xl shadow-lg ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <h2 className="text-2xl font-bold mb-6">
            {language === 'ar' ? 'إضافة خصم جديد' : 'Add New Discount'}
          </h2>

          <form onSubmit={handleDiscountSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'اختر الوجبة' : 'Select Meal'}
              </label>
              <select
                value={selectedMeal}
                onChange={(e) => setSelectedMeal(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{language === 'ar' ? 'اختر وجبة...' : 'Select a meal...'}</option>
                {meals.map((meal) => (
                  <option key={meal._id} value={meal._id}>
                    {language === 'ar' ? meal.name.ar : meal.name.en} - {meal.price} {language === 'ar' ? 'جنيه' : 'EGP'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'نسبة الخصم (%)' : 'Discount Percentage (%)'}
                </label>
                <input
                  type="number"
                  value={discountForm.discountPercentage}
                  onChange={(e) => setDiscountForm({...discountForm, discountPercentage: e.target.value})}
                  min="0"
                  max="100"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                </label>
                <input
                  type="datetime-local"
                  value={discountForm.discountStartDate}
                  onChange={(e) => setDiscountForm({...discountForm, discountStartDate: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'تاريخ النهاية' : 'End Date'}
                </label>
                <input
                  type="datetime-local"
                  value={discountForm.discountEndDate}
                  onChange={(e) => setDiscountForm({...discountForm, discountEndDate: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading 
                  ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...') 
                  : (language === 'ar' ? 'إضافة الخصم' : 'Add Discount')}
              </button>
              
              <button
                type="button"
                onClick={cleanupExpiredDiscounts}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                {language === 'ar' ? 'تنظيف الخصومات المنتهية' : 'Cleanup Expired'}
              </button>
            </div>
          </form>
        </div>

        {/* Active Discounts */}
        <div className={`bg-white p-8 rounded-2xl shadow-lg ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <h2 className="text-2xl font-bold mb-6">
            {language === 'ar' ? 'الخصومات النشطة' : 'Active Discounts'} ({activeDiscounts.length})
          </h2>

          {activeDiscounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {language === 'ar' ? 'لا توجد خصومات نشطة حالياً' : 'No active discounts currently'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeDiscounts.map((meal) => (
                <div key={meal._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="relative h-32 mb-4">
                    <Image
                      src={meal.image || "/placeholder.svg"}
                      alt={language === 'ar' ? meal.name.ar : meal.name.en}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      -{meal.discountPercentage}%
                    </div>
                  </div>
                  
                  <h3 className="font-semibold mb-2">
                    {language === 'ar' ? meal.name.ar : meal.name.en}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 line-through">
                        {meal.price} {language === 'ar' ? 'جنيه' : 'EGP'}
                      </span>
                      <span className="font-bold text-green-600">
                        {meal.discountedPrice} {language === 'ar' ? 'جنيه' : 'EGP'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div>
                        {language === 'ar' ? 'من: ' : 'From: '}
                        {new Date(meal.discountStartDate!).toLocaleDateString()}
                      </div>
                      <div>
                        {language === 'ar' ? 'إلى: ' : 'To: '}
                        {new Date(meal.discountEndDate!).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveDiscount(meal._id)}
                      className="w-full mt-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      {language === 'ar' ? 'إزالة الخصم' : 'Remove Discount'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscountsPage; 