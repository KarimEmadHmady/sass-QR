"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

interface Translation {
  en: string;
  ar: string;
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

interface MealState {
  name: Translation;
  description: Translation;
  price: string;
  image: File | null;
  imagePreview: string;
  categoryId: string;
}

interface CategoryState {
  name: Translation;
  description: Translation;
  image: File | null;
  imagePreview: string;
}

interface ApiResponse {
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

const AddMealPage = () => {
  const { restaurant, token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');
  const [newCategory, setNewCategory] = useState<CategoryState>({
    name: { en: "", ar: "" },
    description: { en: "", ar: "" },
    image: null,
    imagePreview: "",
  });

  const [meal, setMeal] = useState<MealState>({
    name: { en: "", ar: "" },
    description: { en: "", ar: "" },
    price: "",
    image: null,
    imagePreview: "",
    categoryId: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!restaurant) {
      router.push('/restaurant-login');
      return;
    }
    fetchCategories();
  }, [restaurant, router]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get<ApiResponse[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const transformedCategories: Category[] = response.data.map((category: ApiResponse) => ({
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
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(language === 'ar' ? 'فشل في تحميل الفئات' : 'Failed to load categories');
    }
  };

  const handleMealChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "price" || name === "categoryId") {
      setMeal((prevMeal) => ({ ...prevMeal, [name]: value }));
    } else {
      const [field, lang] = name.split("_");
      setMeal((prevMeal) => ({
        ...prevMeal,
        [field]: {
          ...prevMeal[field as keyof Pick<MealState, "name" | "description">],
          [lang]: value
        }
      }));
    }
  };

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const [field, lang] = name.split("_");
    setNewCategory((prevCategory) => ({
      ...prevCategory,
      [field]: {
        ...prevCategory[field as keyof Pick<CategoryState, "name" | "description">],
        [lang]: value
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (e.target.name === "categoryImage") {
        setNewCategory({
          ...newCategory,
          image: file,
          imagePreview: URL.createObjectURL(file),
        });
      } else {
        setMeal({
          ...meal,
          image: file,
          imagePreview: URL.createObjectURL(file),
        });
      }
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'You need to login first');
      return;
    }

    if (!newCategory.name.en || !newCategory.name.ar || !newCategory.image) {
      toast.error(language === 'ar' ? 'يرجى إدخال اسم الفئة باللغتين وصورة' : 'Please provide category name in both languages and an image');
      return;
    }

    const formData = new FormData();
    formData.append("name[en]", newCategory.name.en);
    formData.append("name[ar]", newCategory.name.ar);
    formData.append("description[en]", newCategory.description.en);
    formData.append("description[ar]", newCategory.description.ar);
    formData.append("image", newCategory.image);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/categories`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      if (response.data) {
        toast.success(language === 'ar' ? 'تمت إضافة الفئة بنجاح' : 'Category added successfully');
        setNewCategory({
          name: { en: "", ar: "" },
          description: { en: "", ar: "" },
          image: null,
          imagePreview: ""
        });
        fetchCategories();
      }
    } catch (error: any) {
      console.error('Error adding category:', error);
      const errorMessage = error.response?.data?.message || 
        (language === 'ar' ? 'حدث خطأ أثناء إضافة الفئة' : 'Error adding category');
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'You need to login first');
      return;
    }

    if (!meal.categoryId) {
      toast.error(language === 'ar' ? 'يرجى اختيار فئة' : 'Please select a category');
      return;
    }

    if (!meal.name.en || !meal.name.ar || !meal.description.en || !meal.description.ar) {
      toast.error(language === 'ar' ? 'يرجى إدخال اسم ووصف الوجبة باللغتين' : 'Please provide meal name and description in both languages');
      return;
    }

    const formData = new FormData();
    formData.append("name[en]", meal.name.en);
    formData.append("name[ar]", meal.name.ar);
    formData.append("description[en]", meal.description.en);
    formData.append("description[ar]", meal.description.ar);
    formData.append("price", meal.price);
    if (meal.image) formData.append("image", meal.image);
    formData.append("categoryId", meal.categoryId);

    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/meals`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );
      toast.success(language === 'ar' ? 'تمت إضافة الوجبة بنجاح' : 'Meal added successfully');
      router.push("/dashboard/meals");
    } catch (error: any) {
      console.error("Error adding meal:", error);
      const errorMessage = error.response?.data?.message || 
        (language === 'ar' ? 'حدث خطأ أثناء إضافة الوجبة' : 'Error adding meal');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eee] flex flex-col items-center py-8 px-4">
      <AnimatedBackground />
      
      {/* Language Switch */}
      <div className="w-full max-w-md mb-4 flex justify-end">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          {language === 'en' ? 'عربي' : 'English'}
        </button>
      </div>
      
      {/* Meal Form */}
      <form
        onSubmit={handleSubmit}
        className={`bg-white p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md transition-all z-10 mb-8 ${
          language === 'ar' ? 'rtl' : 'ltr'
        }`}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          {language === 'ar' ? 'إضافة وجبة جديدة' : 'Add New Meal'}
        </h2>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'الاسم (بالإنجليزية)' : 'Name (English)'}
          </label>
          <input
            type="text"
            name="name_en"
            value={meal.name.en}
            onChange={handleMealChange}
            placeholder={language === 'ar' ? 'اسم الوجبة بالإنجليزية' : 'Meal Name in English'}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'الاسم (بالعربية)' : 'Name (Arabic)'}
          </label>
          <input
            type="text"
            name="name_ar"
            value={meal.name.ar}
            onChange={handleMealChange}
            placeholder={language === 'ar' ? 'اسم الوجبة بالعربية' : 'Meal Name in Arabic'}
            required
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              language === 'ar' ? 'text-right' : 'text-left'
            }`}
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'الوصف (بالإنجليزية)' : 'Description (English)'}
          </label>
          <input
            type="text"
            name="description_en"
            value={meal.description.en}
            onChange={handleMealChange}
            placeholder={language === 'ar' ? 'وصف الوجبة بالإنجليزية' : 'Meal Description in English'}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'الوصف (بالعربية)' : 'Description (Arabic)'}
          </label>
          <input
            type="text"
            name="description_ar"
            value={meal.description.ar}
            onChange={handleMealChange}
            placeholder={language === 'ar' ? 'وصف الوجبة بالعربية' : 'Meal Description in Arabic'}
            required
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              language === 'ar' ? 'text-right' : 'text-left'
            }`}
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'السعر' : 'Price'}
          </label>
          <input
            type="number"
            name="price"
            value={meal.price}
            onChange={handleMealChange}
            placeholder={language === 'ar' ? 'السعر' : 'Price'}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'الفئة' : 'Category'}
          </label>
          <select
            name="categoryId"
            value={meal.categoryId}
            onChange={handleMealChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{language === 'ar' ? 'اختر الفئة' : 'Select Category'}</option>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                category && category.name ? (
                  <option key={category._id} value={category._id}>
                    {language === 'ar' ? category.name.ar : category.name.en}
                  </option>
                ) : null
              ))
            ) : (
              <option value="" disabled>
                {language === 'ar' ? 'لا توجد فئات متاحة' : 'No categories available'}
              </option>
            )}
          </select>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'صورة الوجبة' : 'Meal Image'}
          </label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            accept="image/*"
            required
            className="w-full"
          />
          {meal.imagePreview && (
            <div className="mt-2">
              <Image
                src={meal.imagePreview}
                alt={language === 'ar' ? 'معاينة' : 'Preview'}
                width={100}
                height={100}
                className="rounded-lg"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading 
            ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...') 
            : (language === 'ar' ? 'إضافة الوجبة' : 'Add Meal')}
        </button>
      </form>

      {/* Category Form */}
      <form
        onSubmit={handleAddCategory}
        className={`bg-white p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md transition-all z-10 mt-8 ${
          language === 'ar' ? 'rtl' : 'ltr'
        }`}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          {language === 'ar' ? 'إضافة فئة جديدة' : 'Add New Category'}
        </h2>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'الاسم (بالإنجليزية)' : 'Name (English)'}
          </label>
          <input
            type="text"
            name="name_en"
            value={newCategory.name.en}
            onChange={handleCategoryChange}
            placeholder={language === 'ar' ? 'اسم الفئة بالإنجليزية' : 'Category Name in English'}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'الاسم (بالعربية)' : 'Name (Arabic)'}
          </label>
          <input
            type="text"
            name="name_ar"
            value={newCategory.name.ar}
            onChange={handleCategoryChange}
            placeholder={language === 'ar' ? 'اسم الفئة بالعربية' : 'Category Name in Arabic'}
            required
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              language === 'ar' ? 'text-right' : 'text-left'
            }`}
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'الوصف (بالإنجليزية)' : 'Description (English)'}
          </label>
          <textarea
            name="description_en"
            value={newCategory.description.en}
            onChange={handleCategoryChange}
            placeholder={language === 'ar' ? 'وصف الفئة بالإنجليزية' : 'Category Description in English'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'الوصف (بالعربية)' : 'Description (Arabic)'}
          </label>
          <textarea
            name="description_ar"
            value={newCategory.description.ar}
            onChange={handleCategoryChange}
            placeholder={language === 'ar' ? 'وصف الفئة بالعربية' : 'Category Description in Arabic'}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              language === 'ar' ? 'text-right' : 'text-left'
            }`}
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'صورة الفئة' : 'Category Image'}
          </label>
          <input
            type="file"
            name="categoryImage"
            onChange={handleFileChange}
            accept="image/*"
            required
            className="w-full"
          />
          {newCategory.imagePreview && (
            <div className="mt-2">
              <Image
                src={newCategory.imagePreview}
                alt={language === 'ar' ? 'معاينة' : 'Preview'}
                width={100}
                height={100}
                className="rounded-lg"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {language === 'ar' ? 'إضافة الفئة' : 'Add Category'}
        </button>
      </form>
    </div>
  );
};

export default AddMealPage;
