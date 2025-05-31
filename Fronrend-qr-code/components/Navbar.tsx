"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FaUserShield,
  FaUtensils,
  FaSignInAlt,
  FaUserPlus,
  FaPlus,
  FaTags,
  FaCog,
} from "react-icons/fa";
import Image from "next/image";
import { FiLogOut } from "react-icons/fi";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { restaurant, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();

  // Translations
  const translations = {
    dashboard: {
      en: "Dashboard",
      ar: "لوحة التحكم"
    },
    categoriesManagement: {
      en: "Categories Management",
      ar: "إدارة الفئات"
    },
    mealsManagement: {
      en: "Meals Management",
      ar: "إدارة الوجبات"
    },
    addMeal: {
      en: "Add Meal",
      ar: "إضافة وجبة"
    },
    settings: {
      en: "Settings",
      ar: "الإعدادات"
    },
    greeting: {
      en: "Welcome",
      ar: "مرحباً"
    },
    logout: {
      en: "Logout",
      ar: "تسجيل الخروج"
    },
    login: {
      en: "Login",
      ar: "تسجيل الدخول"
    },
    register: {
      en: "Register",
      ar: "تسجيل"
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className=" shadow-sm p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo"
              className="h-[50px] w-[50px]"
              width={75}
              height={75}
            />
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && restaurant ? (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  title={translations.dashboard[language]}
                >
                  <FaUserShield />
                  <span>{translations.dashboard[language]}</span>
                </Link>
                <Link
                  href="/dashboard/categories"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  title={translations.categoriesManagement[language]}
                >
                  <FaTags />
                  <span>{translations.categoriesManagement[language]}</span>
                </Link>
                <Link
                  href="/dashboard/meals"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  title={translations.mealsManagement[language]}
                >
                  <FaUtensils />
                  <span>{translations.mealsManagement[language]}</span>
                </Link>
                <Link
                  href="/dashboard/meals/add"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  title={translations.addMeal[language]}
                >
                  <FaPlus />
                  <span>{translations.addMeal[language]}</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  title={translations.settings[language]}
                >
                  <FaCog />
                  <span>{translations.settings[language]}</span>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-700">
                  {translations.greeting[language]}, {restaurant.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-[#222] text-white px-4 py-2 rounded hover:bg-[#000] transition"
                >
                  <FiLogOut />
                  {translations.logout[language]}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/restaurant-login"
                className="flex items-center gap-2 bg-[#222] text-white px-4 py-2 rounded hover:bg-[#000] transition"
              >
                <FaSignInAlt />
                {translations.login[language]}
              </Link>
              <Link
                href="/restaurant-register"
                className="flex items-center gap-2 bg-[#222] text-white px-4 py-2 rounded hover:bg-[#000] transition"
              >
                <FaUserPlus />
                {translations.register[language]}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
