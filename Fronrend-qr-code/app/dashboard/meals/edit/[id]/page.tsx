"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import Image from 'next/image';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/store";

interface Translation {
  en: string;
  ar: string;
}

interface Category {
  _id: string;
  name: Translation;
  image: string;
  description?: Translation;
}

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
}

interface Meal {
  _id: string;
  name: Translation;
  description: Translation;
  price: string;
  category: string;
  image: string | null;
  reviews: Review[];
  discountPercentage?: string;
  discountStartDate?: string;
  discountEndDate?: string;
  isDiscountActive?: boolean;
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
  price: string;
  image: string;
  category: {
    _id: string;
    name: {
      en: string;
      ar: string;
    };
  };
  reviews: Review[];
  discountPercentage?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  isDiscountActive?: boolean;
}

interface CategoryResponse {
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

const EditMealPage = () => {
  const { id } = useParams<{ id: string }>() || { id: "" };
  const { token, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!isAuthenticated || !token) {
          toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'You need to login first');
          router.push('/restaurant-login');
          return;
        }

        // Fetch meal data
        const mealResponse = await axios.get<ApiResponse>(`${process.env.NEXT_PUBLIC_API_URL}/meals/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const mealData = mealResponse.data;
        
        // Transform meal data with proper validation
        setMeal({
          _id: mealData._id,
          name: {
            en: mealData.name?.en || '',
            ar: mealData.name?.ar || ''
          },
          description: {
            en: mealData.description?.en || '',
            ar: mealData.description?.ar || ''
          },
          price: mealData.price?.toString() || '',
          category: mealData.category?._id || '',
          image: mealData.image || null,
          reviews: mealData.reviews || [],
          discountPercentage: mealData.discountPercentage?.toString() || '',
          discountStartDate: mealData.discountStartDate ? new Date(mealData.discountStartDate).toISOString().slice(0, 16) : '',
          discountEndDate: mealData.discountEndDate ? new Date(mealData.discountEndDate).toISOString().slice(0, 16) : '',
          isDiscountActive: mealData.isDiscountActive
        });

        // Fetch categories
        const categoriesResponse = await axios.get<CategoryResponse[]>(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const transformedCategories = categoriesResponse.data.map((category: CategoryResponse) => ({
          _id: category._id,
          name: {
            en: category.name?.en || '',
            ar: category.name?.ar || ''
          },
          image: category.image || '',
          description: category.description ? {
            en: category.description.en || '',
            ar: category.description.ar || ''
          } : undefined
        }));

        setCategories(transformedCategories);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(language === 'ar' ? 'حدث خطأ في تحميل بيانات الوجبة' : 'Failed to load meal data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, isAuthenticated, language, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!meal) return;

    const { name, value } = e.target;
    if (name === "price" || name === "category" || name === "discountPercentage" || name === "discountStartDate" || name === "discountEndDate") {
      setMeal({ ...meal, [name]: value });
    } else {
      // Handle translation fields
      const [field, lang] = name.split("_");
      setMeal({
        ...meal,
        [field]: {
          ...meal[field as keyof Pick<Meal, "name" | "description">],
          [lang]: value
        }
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!meal) return;
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMeal({ ...meal, image: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meal) return;

    if (!meal.name.en || !meal.name.ar || !meal.description.en || !meal.description.ar) {
      toast.error("Please provide meal name and description in both English and Arabic");
      return;
    }

    const formData = new FormData();
    formData.append("name[en]", meal.name.en);
    formData.append("name[ar]", meal.name.ar);
    formData.append("description[en]", meal.description.en);
    formData.append("description[ar]", meal.description.ar);
    formData.append("price", meal.price);
    formData.append("categoryId", meal.category);
    
    // إضافة حقول الخصم
    if (meal.discountPercentage) {
      formData.append("discountPercentage", meal.discountPercentage);
    }
    if (meal.discountStartDate) {
      formData.append("discountStartDate", meal.discountStartDate);
    }
    if (meal.discountEndDate) {
      formData.append("discountEndDate", meal.discountEndDate);
    }
    
    // Handle image upload properly
    const imageInput = document.querySelector('input[name="image"]') as HTMLInputElement;
    if (imageInput && imageInput.files && imageInput.files[0]) {
      formData.append("image", imageInput.files[0]);
    }

    setSubmitting(true);
    try {
      if (!token) {
        throw new Error("No token found");
      }
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/meals/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success("Meal updated successfully");
      router.push("/dashboard/meals");
    } catch (error) {
      console.error("Error updating meal:", error);
      toast.error("Failed to update meal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = async (reviewId: string) => {
    const updatedComment = prompt("Edit your review comment:");
    const updatedRating = prompt("Edit your review rating (1-5):");

    if (!meal) return;
    if (!updatedComment || !updatedRating) return;

    const rating = parseInt(updatedRating, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      toast.error("Please provide a rating between 1 and 5.");
      return;
    }

    try {
      if (!token) {
        throw new Error("No token found");
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/meals/${id}/reviews/${reviewId}`,
        { comment: updatedComment, rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Create a new meal object with updated reviews
      const updatedMeal: Meal = {
        ...meal,
        reviews: meal.reviews.map((rev) =>
          rev._id === reviewId
            ? { ...rev, comment: updatedComment, rating }
            : rev
        ),
      };

      setMeal(updatedMeal);
      toast.success("Review updated successfully");
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    if (!meal) return;
    
    try {
      if (!token) {
        throw new Error("No token found");
      }

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/meals/${id}/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Create a new meal object with the review removed
      const updatedMeal: Meal = {
        ...meal,
        reviews: meal.reviews.filter((rev) => rev._id !== reviewId),
      };

      setMeal(updatedMeal);
      toast.success("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eee]">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button
            onClick={() => router.push("/dashboard/meals")}
            className="mt-4 px-4 py-2 bg-[#222] text-white rounded-lg hover:bg-[#333]"
          >
            Back to Meals
          </button>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eee]">
        <div className="text-center text-gray-500">
          <p>Meal not found</p>
          <button
            onClick={() => router.push("/dashboard/meals")}
            className="mt-4 px-4 py-2 bg-[#222] text-white rounded-lg hover:bg-[#333]"
          >
            Back to Meals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eee] flex items-center justify-center px-4 flex-col">
      <AnimatedBackground />
      <form
        onSubmit={handleSubmit}
        className={`bg-white p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md transition-all z-10 ${
          language === 'ar' ? 'rtl' : 'ltr'
        }`}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Edit Meal
          </h2>
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {language === 'en' ? 'عربي' : 'English'}
          </button>
        </div>

        {meal.image && (
          <div className="mb-4">
            <Image 
              src={meal.image}
              alt="Meal Image"
              className="w-full h-auto rounded-lg mb-4"
              width={600}
              height={400}
            />
          </div>
        )}

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${
            language === 'ar' ? 'text-right' : 'text-left'
          }`}>
            {language === 'ar' ? 'الاسم (بالإنجليزية)' : 'Name (English)'}
          </label>
          <input
            type="text"
            name="name_en"
            value={meal.name.en}
            onChange={handleChange}
            placeholder={language === 'ar' ? 'اسم الوجبة بالإنجليزية' : 'Meal Name in English'}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${
            language === 'ar' ? 'text-right' : 'text-left'
          }`}>
            {language === 'ar' ? 'الاسم (بالعربية)' : 'Name (Arabic)'}
          </label>
          <input
            type="text"
            name="name_ar"
            value={meal.name.ar}
            onChange={handleChange}
            placeholder={language === 'ar' ? 'اسم الوجبة بالعربية' : 'Meal Name in Arabic'}
            required
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              language === 'ar' ? 'text-right' : 'text-left'
            }`}
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${
            language === 'ar' ? 'text-right' : 'text-left'
          }`}>
            {language === 'ar' ? 'الوصف (بالإنجليزية)' : 'Description (English)'}
          </label>
          <input
            type="text"
            name="description_en"
            value={meal.description.en}
            onChange={handleChange}
            placeholder={language === 'ar' ? 'وصف الوجبة بالإنجليزية' : 'Meal Description in English'}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${
            language === 'ar' ? 'text-right' : 'text-left'
          }`}>
            {language === 'ar' ? 'الوصف (بالعربية)' : 'Description (Arabic)'}
          </label>
          <input
            type="text"
            name="description_ar"
            value={meal.description.ar}
            onChange={handleChange}
            placeholder={language === 'ar' ? 'وصف الوجبة بالعربية' : 'Meal Description in Arabic'}
            required
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              language === 'ar' ? 'text-right' : 'text-left'
            }`}
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${
            language === 'ar' ? 'text-right' : 'text-left'
          }`}>
            {language === 'ar' ? 'السعر' : 'Price'}
          </label>
          <input
            type="number"
            name="price"
            value={meal.price}
            onChange={handleChange}
            placeholder={language === 'ar' ? 'السعر' : 'Price'}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${
            language === 'ar' ? 'text-right' : 'text-left'
          }`}>
            {language === 'ar' ? 'الفئة' : 'Category'}
          </label>
          <select
            name="category"
            value={meal.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{language === 'ar' ? 'اختر الفئة' : 'Select Category'}</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {language === 'ar' ? category.name.ar : category.name.en}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${
            language === 'ar' ? 'text-right' : 'text-left'
          }`}>
            {language === 'ar' ? 'تغيير الصورة' : 'Change Image'}
          </label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full"
          />
        </div>

        {/* ✅ قسم الخصم */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className={`text-lg font-semibold mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'خصم الوجبة (اختياري)' : 'Meal Discount (Optional)'}
          </h3>
          
          {meal.isDiscountActive && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className={`text-sm text-green-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? '✅ الخصم نشط حالياً' : '✅ Discount is currently active'}
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? 'نسبة الخصم (%)' : 'Discount Percentage (%)'}
            </label>
            <input
              type="number"
              name="discountPercentage"
              value={meal.discountPercentage || ''}
              onChange={handleChange}
              min="0"
              max="100"
              placeholder={language === 'ar' ? 'مثال: 20' : 'e.g., 20'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? 'تاريخ بداية الخصم' : 'Discount Start Date'}
            </label>
            <input
              type="datetime-local"
              name="discountStartDate"
              value={meal.discountStartDate || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? 'تاريخ انتهاء الخصم' : 'Discount End Date'}
            </label>
            <input
              type="datetime-local"
              name="discountEndDate"
              value={meal.discountEndDate || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className={language === 'ar' ? 'text-right' : 'text-left'}>
              {language === 'ar' 
                ? '💡 ملاحظة: إذا قمت بإدخال نسبة خصم، يجب تحديد تاريخي البداية والنهاية' 
                : '💡 Note: If you enter a discount percentage, you must specify start and end dates'}
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-end mt-6">
          <button
            type="button"
            onClick={() => router.push('/dashboard/meals')}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2 bg-[#222] text-white rounded-lg transition-colors cursor-pointer ${
              submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#000]'
            }`}
          >
            {submitting 
              ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
              : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
          </button>
        </div>
      </form>

      {/* Reviews Section */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md mt-8 z-10">
        <h3 className="text-2xl font-bold mb-4">Reviews</h3>
        {meal.reviews.length > 0 ? (
          meal.reviews.map((review) => (
            <div
              key={review._id}
              className="border-b border-gray-200 py-4 last:border-0"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{review.name}</p>
                  <p className="text-yellow-500">{"★".repeat(review.rating)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditReview(review._id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-600">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>
    </div>
  );
};

export default EditMealPage;