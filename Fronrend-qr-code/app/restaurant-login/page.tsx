"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import AnimatedBackground from "@/components/AnimatedBackground";
import { toast } from "react-hot-toast";

export default function RestaurantLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { language } = useLanguage();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [subdomain, setSubdomain] = useState<string>("");

  useEffect(() => {
    const subdomainParam = searchParams?.get('subdomain');
    if (subdomainParam) {
      setSubdomain(subdomainParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Login attempt with:', { email, password });
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('Login response:', data);

      if (!res.ok) {
        throw new Error(data.message || (language === 'ar' ? "فشل تسجيل الدخول" : "Login failed"));
      }

      const { token, restaurant } = data;
      console.log('Login successful:', { token, restaurant });
      
      // First save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('restaurant', JSON.stringify(restaurant));
      console.log('Data saved to localStorage');
      
      // Then update auth context
      login(restaurant, token);
      console.log('Auth state updated');
      
      // Wait a moment to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify data was saved
      const savedToken = localStorage.getItem('token');
      const savedRestaurant = localStorage.getItem('restaurant');
      console.log('Verification - Saved data:', { savedToken, savedRestaurant });
      
      toast.success(language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
      
      // Redirect to subdomain with auto-login
      const redirectUrl = `http://${restaurant.subdomain}.localhost:3000/dashboard?token=${token}&restaurant=${encodeURIComponent(JSON.stringify(restaurant))}`;
      console.log('Redirecting to subdomain with auto-login:', redirectUrl);
      window.location.replace(redirectUrl);
      
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError(language === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during login');
        toast.error(language === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Translations
  const translations = {
    welcomeBack: {
      en: "Welcome Back Restaurant Owner",
      ar: "مرحباً بعودتك"
    },
    email: {
      en: "Email",
      ar: "البريد الإلكتروني"
    },
    password: {
      en: "Password",
      ar: "كلمة المرور"
    },
    login: {
      en: "Login",
      ar: "تسجيل الدخول"
    },
    loggingIn: {
      en: "Logging in...",
      ar: "جاري تسجيل الدخول..."
    },
    dontHaveRestaurant: {
      en: "Don't have a restaurant account?",
      ar: "ليس لديك حساب مطعم؟"
    },
    register: {
      en: "Register Restaurant",
      ar: "تسجيل مطعم جديد"
    },
    emailPlaceholder: {
      en: "restaurant@email.com",
      ar: "restaurant@email.com"
    },
    passwordPlaceholder: {
      en: "••••••••",
      ar: "••••••••"
    }
  };

  return (
    <div className="min-h-screen bg-[#eee] flex items-center justify-center px-4">
      <AnimatedBackground />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md transition-all"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          {translations.welcomeBack[language]}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {translations.email[language]}
          </label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder={translations.emailPlaceholder[language]}
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {translations.password[language]}
          </label>
          <input
            type="password"
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder={translations.passwordPlaceholder[language]}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white font-semibold transition cursor-pointer ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-[#222] hover:bg-[#333]"
          }`}
        >
          {loading ? translations.loggingIn[language] : translations.login[language]}
        </button>

        <p className="text-sm text-center text-gray-500 mt-6">
          {translations.dontHaveRestaurant[language]}{" "}
          <a href="/restaurant-register" className="text-blue-600 hover:underline">
            {translations.register[language]}
          </a>
        </p>
      </form>
    </div>
  );
} 