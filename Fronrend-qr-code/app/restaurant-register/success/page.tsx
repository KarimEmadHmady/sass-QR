"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function SuccessPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const translations = {
    title: {
      en: "Registration Successful!",
      ar: "تم التسجيل بنجاح!"
    },
    message: {
      en: "Your restaurant account has been created successfully. You can now log in to manage your restaurant.",
      ar: "تم إنشاء حساب مطعمك بنجاح. يمكنك الآن تسجيل الدخول لإدارة مطعمك."
    },
    login: {
      en: "Login to Your Restaurant",
      ar: "تسجيل الدخول إلى مطعمك"
    }
  };

  const handleLogin = () => {
    router.push('/restaurant-login');
  };

  return (
    <div className="min-h-screen bg-[#eee] flex items-center justify-center px-4">
      <AnimatedBackground />
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-green-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {translations.title[language]}
        </h1>

        <p className="text-gray-600 mb-8">
          {translations.message[language]}
        </p>

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-[#222] text-white rounded-lg font-semibold hover:bg-[#333] transition cursor-pointer"
        >
          {translations.login[language]}
        </button>
      </div>
    </div>
  );
} 