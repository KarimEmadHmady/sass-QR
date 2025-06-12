"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function RestaurantRegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    subdomain: "",
    settings: {
      socialMedia: {
        facebook: "",
        instagram: "",
        tiktok: ""
      },
      location: ""
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // توليد الصب دومين تلقائياً من اسم المطعم
  useEffect(() => {
    if (formData.name) {
      const generatedSubdomain = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, subdomain: generatedSubdomain }));
    }
  }, [formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format the data to match backend expectations
      const formattedData = {
        ...formData,
        settings: JSON.stringify({
          socialMedia: formData.settings.socialMedia,
          location: formData.settings.location
        })
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (language === 'ar' ? "فشل التسجيل" : "Registration failed"));
      }

      // توجيه المستخدم إلى صفحة النجاح
      router.push('/restaurant-register/success');
    } catch (error: unknown) {
      console.error('Registration error:', error);
      setError((error as Error).message || (language === 'ar' ? "حدث خطأ ما" : "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const translations = {
    title: {
      en: "Register Your Restaurant",
      ar: "تسجيل مطعمك"
    },
    name: {
      en: "Restaurant Name",
      ar: "اسم المطعم"
    },
    email: {
      en: "Email",
      ar: "البريد الإلكتروني"
    },
    password: {
      en: "Password",
      ar: "كلمة المرور"
    },
    phone: {
      en: "Phone Number",
      ar: "رقم الهاتف"
    },
    address: {
      en: "Address",
      ar: "العنوان"
    },
    subdomain: {
      en: "Restaurant URL",
      ar: "رابط المطعم"
    },
    subdomainHint: {
      en: (subdomain: string) => `Your restaurant will be available at: ${subdomain}.localhost:3000`,
      ar: (subdomain: string) => `سيكون مطعمك متاحاً على: ${subdomain}.localhost:3000`
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
      en: "Already have a restaurant account?",
      ar: "لديك حساب مطعم بالفعل؟"
    },
    login: {
      en: "Login",
      ar: "تسجيل الدخول"
    },
    facebook: {
      en: "Facebook Link",
      ar: "رابط الفيسبوك"
    },
    facebookPlaceholder: {
      en: "Optional - Enter your Facebook page URL",
      ar: "اختياري - أدخل رابط صفحة الفيسبوك"
    },
    instagram: {
      en: "Instagram Link",
      ar: "رابط الانستجرام"
    },
    instagramPlaceholder: {
      en: "Optional - Enter your Instagram profile URL",
      ar: "اختياري - أدخل رابط حساب الانستجرام"
    },
    tiktok: {
      en: "TikTok Link",
      ar: "رابط التيك توك"
    },
    tiktokPlaceholder: {
      en: "Optional - Enter your TikTok profile URL",
      ar: "اختياري - أدخل رابط حساب التيك توك"
    },
    location: {
      en: "ID Google Review (There is an explanation inside How to create an ID)",
      ar: "ID ريفيو جوجل (يوجد شرح بالداخل كيفية انشأ المعرف )"
    },
    locationPlaceholder: {
      en: "Optional - Enter your Google Review ID",
      ar: "اختياري - أدخل معرف مراجعة جوجل"
    }
  };

  return (
    <div className="min-h-screen bg-[#eee] flex items-center justify-center px-4">
      <AnimatedBackground />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          {translations.title[language]}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {translations.name[language]}
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {translations.email[language]}
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {translations.password[language]}
            </label>
            <input
              type="password"
              id="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              {translations.phone[language]}
            </label>
            <input
              type="tel"
              id="phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              {translations.address[language]}
            </label>
            <input
              type="text"
              id="address"
              required
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-1">
              {translations.subdomain[language]}
            </label>
            <input
              type="text"
              id="subdomain"
              required
              readOnly
              value={formData.subdomain}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <p className="mt-1 text-sm text-gray-500">
              {typeof translations.subdomainHint[language] === 'function' 
                ? translations.subdomainHint[language](formData.subdomain)
                : translations.subdomainHint[language]}
            </p>
          </div>

          <div>
            <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
              {translations.facebook[language]}
            </label>
            <input
              type="url"
              id="facebook"
              value={formData.settings.socialMedia.facebook}
              placeholder={translations.facebookPlaceholder[language]}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  socialMedia: {
                    ...prev.settings.socialMedia,
                    facebook: e.target.value
                  }
                }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
              {translations.instagram[language]}
            </label>
            <input
              type="url"
              id="instagram"
              value={formData.settings.socialMedia.instagram}
              placeholder={translations.instagramPlaceholder[language]}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  socialMedia: {
                    ...prev.settings.socialMedia,
                    instagram: e.target.value
                  }
                }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-1">
              {translations.tiktok[language]}
            </label>
            <input
              type="url"
              id="tiktok"
              value={formData.settings.socialMedia.tiktok}
              placeholder={translations.tiktokPlaceholder[language]}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  socialMedia: {
                    ...prev.settings.socialMedia,
                    tiktok: e.target.value
                  }
                }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              {translations.location[language]}
            </label>
            <input
              type="text"
              id="location"
              value={formData.settings.location}
              placeholder={translations.locationPlaceholder[language]}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  location: e.target.value
                }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 mt-6 rounded-lg text-white font-semibold transition ${
            loading ? "bg-blue-300 cursor-not-allowed" : "bg-[#222] hover:bg-[#333]"
          }`}
        >
          {loading ? translations.registering[language] : translations.register[language]}
        </button>

        <p className="text-sm text-center text-gray-500 mt-6">
          {translations.alreadyHaveAccount[language]}{" "}
          <a href="/restaurant-login" className="text-blue-600 hover:underline">
            {translations.login[language]}
          </a>
        </p>
      </form>
    </div>
  );
} 