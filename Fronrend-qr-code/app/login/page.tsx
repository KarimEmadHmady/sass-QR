"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store";
import { useLanguage } from "@/store";
import AnimatedBackground from "@/components/AnimatedBackground";
import { setAuthData } from "@/utils/storage";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { language } = useLanguage();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Translations
  const translations = {
    welcomeBack: {
      en: "Welcome Back",
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
    dontHaveAccount: {
      en: "Don't have an account?",
      ar: "ليس لديك حساب؟"
    },
    register: {
      en: "Register",
      ar: "تسجيل"
    },
    emailPlaceholder: {
      en: "name@email.com",
      ar: "name@email.com"
    },
    passwordPlaceholder: {
      en: "••••••••",
      ar: "••••••••"
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(
          data.message || (language === 'ar' ? "فشل تسجيل الدخول" : "Login failed")
        );
      }
  
      const { token, user } = data;
  
  
      // تخزين التوكن واليوزر
      setAuthData(token, user);
  
      // استدعاء دالة login لتحديث الكونتكست
      login(user, token);
  
      router.push("/");
    } catch (error: unknown) {
      console.error('Login error:', error);
      setError(
        (error as Error).message || (language === 'ar' ? "حدث خطأ ما" : "Something went wrong")
      );
    } finally {
      setLoading(false);
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
          {translations.dontHaveAccount[language]}{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            {translations.register[language]}
          </a>
        </p>
      </form>
    </div>
  );
}
