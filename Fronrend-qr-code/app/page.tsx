"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Star, Utensils, Clock, Search, Menu, X } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Image from "next/image";
import { useAuth } from "@/store";
import { useLanguage } from '@/store';
import { toast } from "react-hot-toast";
import Link from "next/link";
import RestaurantLandingPage from "@/components/RestaurantLandingPage";

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
  price: number;
  discountedPrice?: number;
  discountPercentage?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  isDiscountActive?: boolean;
  image: string;
  preparationTime?: number;
  isNew?: boolean;
  category: Category | null;
  reviews: Review[];
}

interface Restaurant {
  _id: string;
  name: string;
  logo: string;
  banner: string;
  subdomain: string;
  description?: {
    en: string;
    ar: string;
  };
}

const HomePage: React.FC = () => {
  const { language } = useLanguage();
  const { isAuthenticated, user } = useAuth() as { isAuthenticated: boolean; user: { id: string; username: string } | null };
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTapIndicator, setShowTapIndicator] = useState(true);
  const [isFirstMealShown, setIsFirstMealShown] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [hasSubdomain, setHasSubdomain] = useState<boolean>(false);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(true);

  // Add custom styles for hiding scrollbar
  const scrollableStyle = {
    msOverflowStyle: 'none',  /* IE and Edge */
    scrollbarWidth: 'none',   /* Firefox */
    '&::-webkit-scrollbar': { 
      display: 'none'         /* Chrome, Safari and Opera */
    }
  } as React.CSSProperties;

  // Add this style block at the top of the component
  const customPointerSvg = (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="h-12 w-12 text-white animate-pointer mb-2"
    >
      <path d="M22 14a8 8 0 0 1-8 8"/>
      <path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/>
      <path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/>
      <path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/>
      <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
    </svg>
  );

  // Memoized values to prevent unnecessary recalculations
  const categoryNames = useMemo(() => ["all", ...categories.map(category => category._id)], [categories]);

  const filteredMeals = useMemo(() => {
    return meals.filter(meal => {
      const matchesSearch =
        (meal.name?.ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.name?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.description?.ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.description?.en?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false;
      
      const matchesCategory =
        activeCategory === "all" || 
        meal.category?._id === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [meals, searchTerm, activeCategory]);

  const getCategoryLabel = (categoryId: string) => {
    if (categoryId === "all") {
      return language === 'ar' ? "عرض الكل" : "All";
    }
    const category = categories.find(c => c._id === categoryId);
    return language === 'ar' ? category?.name?.ar || "غير مصنف" : category?.name?.en || "Uncategorized";
  };

  useEffect(() => {
    const checkSubdomain = () => {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      
      // Check for localhost subdomain (e.g., restaurant33.localhost:3000)
      if (hostname.includes('localhost')) {
        const subdomain = parts[0];
        if (subdomain !== 'localhost' && subdomain !== 'www') {
          setHasSubdomain(true);
        } else {
          setHasSubdomain(false);
        }
      } 
      // Check for production subdomain (e.g., restaurant.example.com)
      else if (parts.length > 2) {
        setHasSubdomain(true);
      } else {
        setHasSubdomain(false);
      }
      
      setIsCheckingSubdomain(false);
    };

    checkSubdomain();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!hasSubdomain) return; // Don't fetch if no subdomain
      
      try {
        setLoading(true);
        
        // Get current subdomain
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        
        // Fetch meals for the specific restaurant
        const mealsResponse = await axios.get<Meal[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/meals/restaurant/${subdomain}`
        );
        
        // Transform the data to ensure consistent object structure
        const transformedMeals = mealsResponse.data
          .filter(meal => meal && meal._id) // Filter out invalid meals
          .map(meal => ({
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
            image: meal.image || '/placeholder.svg',
            preparationTime: meal.preparationTime,
            isNew: meal.isNew,
            category: meal.category ? {
              _id: meal.category._id,
              name: {
                en: meal.category.name?.en || '',
                ar: meal.category.name?.ar || ''
              },
              image: meal.category.image || '/placeholder.svg',
              description: meal.category.description ? {
                en: meal.category.description.en || '',
                ar: meal.category.description.ar || ''
              } : undefined
            } : null,
            reviews: Array.isArray(meal.reviews) ? meal.reviews.map(review => ({
              _id: review._id || '',
              name: review.name || '',
              rating: Number(review.rating) || 0,
              comment: review.comment || ''
            })) : []
          }));

        setMeals(transformedMeals);

        // Fetch categories for the specific restaurant
        const categoriesResponse = await axios.get<Category[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/categories/restaurant/${subdomain}`
        );

        // Transform categories data with validation
        const transformedCategories = categoriesResponse.data
          .filter(category => category && category._id) // Filter out invalid categories
          .map(category => ({
            _id: category._id,
            name: {
              en: category.name?.en || '',
              ar: category.name?.ar || ''
            },
            image: category.image || '/placeholder.svg',
            description: category.description ? {
              en: category.description.en || '',
              ar: category.description.ar || ''
            } : undefined
          }));

        setCategories(transformedCategories);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        toast.error(language === 'ar' ? 'لا توجد عناصر حالياً، يرجى إضافة وجبة أو صنف.' : 'No items available at the moment. Please add a meal or item.');
      }
    };

    fetchData();
  }, [hasSubdomain]);

  useEffect(() => {
    const fetchRestaurantBySubdomain = async () => {
      try {
        // Get current subdomain from URL
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];

        // Skip if we're on localhost or main domain
        if (hostname === 'localhost' || !hostname.includes('.')) {
          return;
        }

        // Fetch restaurant data by subdomain
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/subdomain/${subdomain}`);
        if (response.ok) {
          const data = await response.json();
          setCurrentRestaurant(data);
        } else {
          console.error('Failed to fetch restaurant data');
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      }
    };

    fetchRestaurantBySubdomain();
  }, []);

  useEffect(() => {
    // Hide tap indicator after 15 seconds
    const timer = setTimeout(() => {
      setShowTapIndicator(false);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const renderStars = (rating: number, lang: string): React.ReactNode => {
    return (
      <div className="flex" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
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

  const submitReview = async () => {
    if (!isAuthenticated || !user || !selectedMeal) return;
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      
      // تحويل التقييم إلى رقم
      const ratingNumber = Number(rating);
      
      // التحقق من صحة التقييم
      if (isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
        toast.error(language === 'ar' ? "يرجى اختيار تقييم صحيح من 1 إلى 5" : "Please select a valid rating from 1 to 5");
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/meals/${selectedMeal._id}/reviews`,
        {
          rating: ratingNumber,
          comment,
          user: user.id,
          name: user.username
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );


      // Create the new review object
      const newReview = {
        _id: response.data.review._id,
        rating: ratingNumber,
        comment: comment,
        name: user.username,
        user: user.id,
        createdAt: new Date().toISOString()
      };

      // Update the meals state with the new review
      const updatedMeals = meals.map(meal => {
        if (meal._id === selectedMeal._id) {
          return {
            ...meal,
            reviews: [...meal.reviews, newReview]
          };
        }
        return meal;
      });
      setMeals(updatedMeals);

      // Update selected meal with new review
      setSelectedMeal({
        ...selectedMeal,
        reviews: [...selectedMeal.reviews, newReview]
      });

      // Reset form
      setRating(0);
      setComment("");
      toast.success(language === 'ar' ? "تم إضافة التقييم بنجاح" : "Review added successfully");
    } catch (error: unknown) {
      console.error("Error submitting review:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        console.error("Error response:", axiosError.response?.data);
        const finalErrorMessage = axiosError.response?.data?.message || errorMessage;
        toast.error(language === 'ar' 
          ? `حدث خطأ أثناء إضافة التقييم: ${finalErrorMessage}` 
          : `Error adding review: ${finalErrorMessage}`);
      } else {
        toast.error(language === 'ar' 
          ? `حدث خطأ أثناء إضافة التقييم: ${errorMessage}` 
          : `Error adding review: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // Render logic after all hooks
  if (isCheckingSubdomain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eee]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  if (!hasSubdomain) {
    return <RestaurantLandingPage />;
  }

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
    <div className={`min-h-screen bg-[#eee] ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <AnimatedBackground />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/90 to-primary text-[#222] py-4 px-3 bg-[#eee]">
        <div className="container mx-auto max-w-6xl relative">
          <Image
            src={currentRestaurant?.banner || "/bannerHome.jpg"}
            alt="Banner"
            className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[300px] lg:w-[500px] object-cover object-[25%_28%] block mx-auto mb-6 transition-transform duration-500 group-hover:scale-105 rounded-[15px]"
            width={500}
            height={400}
            onError={(e) => {
              // If the restaurant banner fails to load, fallback to default banner
              const target = e.target as HTMLImageElement;
              target.src = "/bannerHome.jpg";
            }}
          />

            <p className="text-center text-[#222] max-w-2xl mx-auto mb-5">
              {
                currentRestaurant?.description && typeof currentRestaurant.description === 'object'
                  ? (currentRestaurant.description[language] || (
                      language === 'ar'
                        ? "استمتع بألذ الأطعمة والمشروبات في أجواء راقية وخدمة مميزة تُرضي جميع الأذواق."
                        : "Enjoy the finest food and drinks in an elegant atmosphere with exceptional service that suits all tastes."
                    ))
                  : (
                    language === 'ar'
                      ? "استمتع بألذ الأطعمة والمشروبات في أجواء راقية وخدمة مميزة تُرضي جميع الأذواق."
                      : "Enjoy the finest food and drinks in an elegant atmosphere with exceptional service that suits all tastes."
                  )
              }
            </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-5 w-5 text-[#fff]" />
            </div>
            <input
              type="text"
              className="block w-full p-3 pr-10 text-right bg-[#222] border border-[#222] rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder={language === 'ar' ? "ابحث عن وجبتك المفضلة..." : "Search for your favorite meal..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4">
        {/* Categories - Fixed on Scroll */}
        <div className="sticky top-0 z-50 bg-[#eee] p-4">
          <div className="flex items-center">
            {/* Hamburger Menu Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-200 rounded-lg mr-2 cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Scrollable Categories */}
            <div className="overflow-x-auto flex-1" style={scrollableStyle}>
              <div className="flex gap-[4px] min-w-max">
                {categoryNames.map((categoryId) => (
                  <button
                    key={categoryId}
                    onClick={() => {
                      setActiveCategory(categoryId);
                      setIsSidebarOpen(false);
                    }}
                    className={`px-4 py-2 rounded-[8px] text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      activeCategory === categoryId
                        ? "bg-white text-[#222] hover:bg-gray-200"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {getCategoryLabel(categoryId)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">
                {language === 'ar' ? "الفئات" : "Categories"}
              </h2>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-100px)]">
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-center p-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeCategory === "all"
                    ? "bg-[#222] text-[#eee]"
                    : "hover:bg-gray-100"
                }`}
              >
                {language === 'ar' ? "عرض الكل" : "Show All"}
              </button>
              {categories.map((category) => (
                <div
                  key={category?._id}
                  className={`w-full flex flex-col items-center p-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeCategory === category._id
                      ? "bg-[#222] text-[#eee]"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setActiveCategory(category._id);
                    setIsSidebarOpen(false);
                  }}
                >
                  <div className="relative w-16 h-16 mb-2 overflow-hidden rounded-full">
                    <Image
                      src={category?.image || "/placeholder.svg"}
                      alt={language === 'ar' ? category?.name?.ar || "غير مصنف" : category?.name?.en || "Uncategorized"}
                      className="object-cover"
                      fill
                    />
                  </div>
                  <span>
                    {language === 'ar' ? category?.name?.ar || "غير مصنف" : category?.name?.en || "Uncategorized"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overlay for sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 backdrop-blur-xs bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Content with padding top to account for fixed header */}
        <div className="pt-4">
          {/* Meals Grid */}
          {filteredMeals.length === 0 ? (
            <div className="text-center py-12">
              <Utensils className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {language === 'ar' ? "لا توجد وجبات" : "No meals found"}
              </h3>
              <p className="text-gray-600">
                {language === 'ar' 
                  ? "لم نتمكن من العثور على وجبات تطابق بحثك. جرب بحثًا مختلفًا أو تصفح جميع الفئات."
                  : "We couldn't find any meals matching your search. Try a different search or browse all categories."}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {activeCategory === "all" ? (
                // Show all categories
                categories.map((category, categoryIndex) => {
                  if (!category || !category._id) return null;

                  const categoryMeals = filteredMeals.filter(meal => 
                    meal.category && meal.category._id === category._id
                  );

                  if (categoryMeals.length === 0) return null;

                  return (
                    <div key={category._id} className="space-y-4">
                      <div className="flex items-center space-x-4 mb-4">
                        <h2 className="text-l font-bold text-gray-800 pr-4">
                          {language === 'ar' ? category.name?.ar || 'غير مصنف' : category.name?.en || 'Uncategorized'}
                        </h2>
                        <div className="h-[1px] flex-grow bg-gray-200"></div>
                      </div>
                      <div className="grid grid-cols-1 gap-4" dir="ltr">
                        {categoryMeals.map((meal, index) => {
                          const isVeryFirstMeal = categoryIndex === 0 && index === 0 && !isFirstMealShown;
                          if (isVeryFirstMeal) {
                            setTimeout(() => setIsFirstMealShown(true), 15000);
                          }

                          return (
                            <div
                              key={meal._id}
                              onClick={() => setSelectedMeal(meal)}
                              className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative"
                            >
                              {/* Discount Badge - Top Ribbon */}
                              {meal.isDiscountActive && meal.discountPercentage && (
                                <div className="absolute -top-[5px] -left-[24px] z-10">
                                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-5 pt-[9px] pb-[2px] shadow-md transform -rotate-[46deg] origin-center">
                                    -{meal.discountPercentage}%
                                  </div>
                                </div>
                              )}
                              
                              {isVeryFirstMeal && showTapIndicator && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 animate-pulse z-10">
                                  {customPointerSvg}
                                  <span className="text-white text-sm font-medium">
                                    {language === 'ar' ? 'انقر للتفاصيل' : 'Tap for details'}
                                  </span>
                                </div>
                              )}
                              <div className="flex">
                                <div className="w-1/3 relative overflow-hidden h-full">
                                  <Image
                                    src={meal.image || "/placeholder.svg"}
                                    alt={language === 'ar' ? meal.name?.ar || '' : meal.name?.en || ''}
                                    className="h-[110px] w-[110px] object-cover object-center group-hover:scale-105 transition-transform duration-500 p-[12px] rounded-[15px]"
                                    width={200}
                                    height={200}
                                  />
                                  {meal.isNew && (
                                    <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                      {language === 'ar' ? "جديد" : "New"}
                                    </div>
                                  )}
                                </div>

                                <div className="w-2/3 p-3 flex flex-col justify-between">
                                  <div>
                                    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="mb-1">
                                      <h2 className="text-[12px] font-bold text-gray-800 mb-1">
                                        {language === 'ar' ? meal.name?.ar || '' : meal.name?.en || ''}
                                      </h2>
                                      <p className="text-gray-600 text-xs line-clamp-2 mb-[7px]">
                                        {language === 'ar' ? meal.description?.ar || '' : meal.description?.en || ''}
                                      </p>
                                    </div>

                                    {/* Price moved here - directly under description */}
                                    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="text-[12px] font-bold text-primary mb-1">
                                      {meal.isDiscountActive && meal.discountedPrice ? (
                                        <div className="flex items-center gap-1">
                                          <span className="line-through text-gray-400">
                                            {meal.price} EGP
                                          </span>
                                          <span>
                                            {meal.discountedPrice} EGP
                                          </span>
                                        </div>
                                      ) : (
                                        `${meal.price} EGP`
                                      )}
                                    </div>

                                    {meal.preparationTime && (
                                      <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="flex items-center text-gray-500 text-xs mb-1">
                                        <Clock className="w-3 h-3 mx-1" />
                                        <span>
                                          {language === 'ar' 
                                            ? `${meal.preparationTime} دقيقة`
                                            : `${meal.preparationTime} minutes`
                                          }
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'} items-end`}>
                                    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="flex items-center gap-2">
                                      {meal.reviews && meal.reviews.length > 0 ? (
                                        <>
                                          <span className="text-[10px] text-gray-500">
                                            ({meal.reviews.length})
                                          </span>
                                          {renderStars(
                                            meal.reviews.reduce(
                                              (sum, review) => sum + review.rating,
                                              0
                                            ) / meal.reviews.length,
                                            language
                                          )}
                                        </>
                                      ) : (
                                        <span className="text-[10px] text-gray-500">
                                          {language === 'ar' ? "لا توجد تقييمات" : "No reviews"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Show meals for selected category only
                <div className="grid grid-cols-1 gap-4" dir="ltr">
                  {filteredMeals.map((meal, index) => {
                    const isVeryFirstMeal = index === 0 && !isFirstMealShown;
                    if (isVeryFirstMeal) {
                      setTimeout(() => setIsFirstMealShown(true), 15000);
                    }
                    
                    return (
                      <div
                        key={meal._id}
                        onClick={() => setSelectedMeal(meal)}
                        className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative"
                      >
                        {/* Discount Badge - Top Ribbon */}
                        {meal.isDiscountActive && meal.discountPercentage && (
                          <div className="absolute -top-[5px] -left-[24px] z-10">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-5 pt-[9px] pb-[2px] shadow-md transform -rotate-[46deg] origin-center">
                              -{meal.discountPercentage}%
                            </div>
                          </div>
                        )}
                        
                        {isVeryFirstMeal && showTapIndicator && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 animate-pulse z-10">
                            {customPointerSvg}
                            <span className="text-white text-sm font-medium">
                              {language === 'ar' ? 'انقر للتفاصيل' : 'Tap for details'}
                            </span>
                          </div>
                        )}
                        <div className="flex">
                          <div className="w-1/3 relative overflow-hidden h-full">
                            <Image
                              src={meal.image || "/placeholder.svg"}
                              alt={language === 'ar' ? meal.name?.ar || '' : meal.name?.en || ''}
                              className="h-[110px] w-[110px] object-cover object-center group-hover:scale-105 transition-transform duration-500 p-[12px] rounded-[15px]"
                              width={200}
                              height={200}
                            />
                            {meal.isNew && (
                              <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {language === 'ar' ? "جديد" : "New"}
                              </div>
                            )}
                          </div>

                          <div className="w-2/3 p-3 flex flex-col justify-between">
                            <div>
                              <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="mb-1">
                                <h2 className="text-[12px] font-bold text-gray-800 mb-1">
                                  {language === 'ar' ? meal.name?.ar || '' : meal.name?.en || ''}
                                </h2>
                                <p className="text-gray-600 text-xs line-clamp-2 mb-[7px]">
                                  {language === 'ar' ? meal.description?.ar || '' : meal.description?.en || ''}
                                </p>
                              </div>
                              <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="text-[12px] font-bold text-primary mb-1">
                                {meal.isDiscountActive && meal.discountedPrice ? (
                                  <div className="flex items-center gap-1">
                                    <span className="line-through text-gray-400">
                                      {meal.price} EGP
                                    </span>
                                    <span>
                                      {meal.discountedPrice} EGP
                                    </span>
                                  </div>
                                ) : (
                                  `${meal.price} EGP`
                                )}
                              </div>

                              {meal.preparationTime && (
                                <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="flex items-center text-gray-500 text-xs mb-1">
                                  <Clock className="w-3 h-3 mx-1" />
                                  <span>
                                    {language === 'ar' 
                                      ? `${meal.preparationTime} دقيقة`
                                      : `${meal.preparationTime} minutes`
                                    }
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'} items-end`}>
                              <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="flex items-center gap-2">
                                {meal.reviews && meal.reviews.length > 0 ? (
                                  <>
                                    <span className="text-[10px] text-gray-500">
                                      ({meal.reviews.length})
                                    </span>
                                    {renderStars(
                                      meal.reviews.reduce(
                                        (sum, review) => sum + review.rating,
                                        0
                                      ) / meal.reviews.length,
                                      language
                                    )}
                                  </>
                                ) : (
                                  <span className="text-[10px] text-gray-500">
                                    {language === 'ar' ? "لا توجد تقييمات" : "No reviews"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Meal Details Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <button
              onClick={() => {
                setSelectedMeal(null);
                setRating(0);
                setComment("");
              }}
              className="absolute bottom-4  p-1 hover:bg-gray-100 rounded-full cursor-pointer z-50 flex items-center gap-1 border-black border-1 "
            >
               <span className="text-[13px]">Close</span> <X  className="w-5 h-5 text-red-500" />
            </button>
          <div className="bg-white w-[90%] max-h-[80vh] overflow-y-auto rounded-[8px] shadow-xl relative scrollbar-hide">
            <button
              onClick={() => {
                setSelectedMeal(null);
                setRating(0);
                setComment("");
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="md:w-1/3">
                  <Image
                    src={selectedMeal.image || "/placeholder.svg"}
                    alt={language === 'ar' ? selectedMeal.name?.ar : selectedMeal.name?.en}
                    width={400}
                    height={400}
                    className="rounded-lg object-cover w-full h-[181px]"
                  />
                </div>
                <div className="md:w-2/3">
                  <h2 className="text-2xl font-bold mb-2">
                    {language === 'ar' ? selectedMeal.name?.ar : selectedMeal.name?.en}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {language === 'ar' ? selectedMeal.description?.ar : selectedMeal.description?.en}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    {selectedMeal.isDiscountActive && selectedMeal.discountedPrice ? (
                      <div className="flex flex-col">
                        <span className="font-bold text-xl text-green-600">
                          {selectedMeal.discountedPrice} EGP
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {selectedMeal.price} EGP
                        </span>
                        <span className="text-xs text-orange-600 font-medium">
                          -{selectedMeal.discountPercentage}%
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-xl text-green-600">
                        {selectedMeal.price} EGP
                      </span>
                    )}
                  </div>
                  {selectedMeal.category && (
                    <div className="mb-4">
                      <span className="text-gray-600">
                        {language === 'ar' ? 'التصنيف: ' : 'Category: '}
                      </span>
                      <span className="font-semibold">
                        {language === 'ar' ? selectedMeal.category.name?.ar : selectedMeal.category.name?.en}
                      </span>
                    </div>
                  )}
                  {selectedMeal.preparationTime && (
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>
                        {language === 'ar' 
                          ? `وقت التحضير: ${selectedMeal.preparationTime} دقيقة`
                          : `Preparation Time: ${selectedMeal.preparationTime} minutes`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Existing Reviews Section */}
              {selectedMeal.reviews.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {language === 'ar' ? 'التقييمات' : 'Reviews'}
                  </h3>
                  <div className="space-y-4">
                    {selectedMeal.reviews.map((review) => (
                      <div key={review._id} className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex text-yellow-400">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                          <span className="font-semibold">{review.name}</span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-600">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Review Section */}
              <div className="mt-8  ">
                <h3 className="text-xl font-semibold mb-4">
                  {language === 'ar' ? 'إضافة تقييم' : 'Add Review'}
                </h3>
                
                {isAuthenticated ? (
                  <div className="space-y-4">
                    {/* Star Rating */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-8 h-8 cursor-pointer transition-colors ${
                            star <= (hoveredRating || rating)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>

                    {/* Comment Input */}
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={language === 'ar' ? "اكتب تعليقك هنا..." : "Write your comment here..."}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      rows={4}
                    />

                    {/* Submit Button */}
                    <button
                      onClick={submitReview}
                      disabled={!rating || isSubmitting}
                      className={`px-6 py-2 bg-[#222] text-white rounded-lg transition-colors cursor-pointer ${
                        !rating || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'
                      }`}
                    >
                      {isSubmitting 
                        ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') 
                        : (language === 'ar' ? 'إرسال التقييم' : 'Submit Review')}
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">
                      {language === 'ar' 
                        ? 'يجب تسجيل الدخول لإضافة تقييم' 
                        : 'Please login to add a review'}
                    </p>
                    <Link
                      href="/login"
                      className="inline-block px-6 py-2 bg-[#222] text-white rounded-lg transition-colors hover:bg-[#000]"
                    >
                      {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                    </Link>
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;

<style jsx global>{`
  @keyframes fadeInOut {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes pointer {
    0% { 
      transform: scale(0.4);
      opacity: 0.8;
    }
    50% { 
      transform: scale(1.6);
      opacity: 1;
    }
    100% { 
      transform: scale(0.4);
      opacity: 0.8;
    }
  }

  .animate-pointer {
    animation: pointer 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    transform-origin: center;
  }

  .first-meal-animation {
    position: relative;
  }

  .first-meal-animation::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    animation: fadeInOut 2s infinite;
    pointer-events: none;
  }
`}</style>
