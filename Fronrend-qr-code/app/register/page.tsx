"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { language } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Translations
  const translations = {
    createAccount: {
      en: "Create Account",
      ar: "إنشاء حساب"
    },
    name: {
      en: "Name",
      ar: "الاسم"
    },
    email: {
      en: "Email",
      ar: "البريد الإلكتروني"
    },
    password: {
      en: "Password",
      ar: "كلمة المرور"
    },
    register: {
      en: "Register",
      ar: "تسجيل"
    },
    registering: {
      en: "Registering...",
      ar: "جاري التسجيل..."
    },
    alreadyHaveAccount: {
      en: "Already have an account?",
      ar: "لديك حساب بالفعل؟"
    },
    login: {
      en: "Login",
      ar: "تسجيل الدخول"
    },
    yourName: {
      en: "Your name",
      ar: "اسمك"
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (language === 'ar' ? "فشل التسجيل" : "Registration failed"));
      }

      const { token, user } = data;

      if (token && user) {
        login(user, token);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        router.push("/");
      } else {
        throw new Error(language === 'ar' ? "فشل في استرداد بيانات المستخدم" : "Failed to retrieve user data");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || (language === 'ar' ? "حدث خطأ ما" : "Something went wrong"));
      } else {
        setError(language === 'ar' ? "حدث خطأ ما" : "Something went wrong");
      }
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
          {translations.createAccount[language]}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {translations.name[language]}
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder={translations.yourName[language]}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {translations.email[language]}
          </label>
          <input
            id="email"
            type="email"
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
            id="password"
            type="password"
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
          {loading ? translations.registering[language] : translations.register[language]}
        </button>

        <p className="text-sm text-center text-gray-500 mt-6">
          {translations.alreadyHaveAccount[language]}{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            {translations.login[language]}
          </a>
        </p>
      </form>
    </div>
  );
}
