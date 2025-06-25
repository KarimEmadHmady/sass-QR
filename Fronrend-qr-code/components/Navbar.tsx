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
  FaBars,
} from "react-icons/fa";
import Image from "next/image";
import { FiLogOut } from "react-icons/fi";
import LanguageSwitcher from "./LanguageSwitcher";
import { useEffect, useState } from "react";

interface Restaurant {
  _id: string;
  name: string;
  logo: string;
  subdomain: string;
}

export default function Navbar() {
  const { restaurant, user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [hasSubdomain, setHasSubdomain] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Add debugging logging
  useEffect(() => {
    // Debug logging removed
  }, [isAuthenticated, user, restaurant]);

  useEffect(() => {
    const fetchRestaurantBySubdomain = async () => {
      try {
        // Get current hostname
        const hostname = window.location.hostname;
        
        // Special handling for localhost
        if (hostname.includes('localhost')) {
          const parts = hostname.split('.');
          // If we have a subdomain before localhost (e.g., restaurant33.localhost)
          if (parts.length > 1 && parts[0] !== 'localhost') {
            const subdomain = parts[0];
            setHasSubdomain(true);
            
            // Fetch restaurant data by subdomain
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/subdomain/${subdomain}`);
            if (response.ok) {
              const data = await response.json();
              setCurrentRestaurant(data);
            } else {
              console.error('Failed to fetch restaurant data');
            }
            return;
          }
          setHasSubdomain(false);
          return;
        }

        // Regular domain handling
        const parts = hostname.split('.');
        
        // If we have less than 2 parts, it's not a subdomain
        if (parts.length < 2) {
          setHasSubdomain(false);
          return;
        }

        // Get the main domain (last two parts)
        const mainDomain = parts.slice(-2).join('.');
        
        // If we're on the main domain itself
        if (hostname === mainDomain) {
          setHasSubdomain(false);
          return;
        }

        // Extract subdomain (everything before the main domain)
        const subdomain = parts.slice(0, -2).join('.');
        
        // If no subdomain found, return
        if (!subdomain) {
          setHasSubdomain(false);
          return;
        }

        setHasSubdomain(true);

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
    <nav className=" p-4 bg-transition">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={currentRestaurant?.logo || "/logo.png"}
              alt={currentRestaurant?.name || "Logo"}
              className="h-[50px] w-[50px] object-cover rounded-full"
              width={75}
              height={75}
              onError={(e) => {
                // If the restaurant logo fails to load, fallback to default logo
                const target = e.target as HTMLImageElement;
                target.src = "/logo.png";
              }}
            />
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {restaurant && (
                <>
                  {/* Desktop Navigation */}
                  <div className="hidden md:flex items-center gap-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 group relative"
                    title={translations.dashboard[language]}
                  >
                    <FaUserShield className="w-5 h-5" />
                      <span>{translations.dashboard[language]}</span>
                  </Link>
                  <Link
                    href="/dashboard/categories"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 group relative"
                    title={translations.categoriesManagement[language]}
                  >
                    <FaTags className="w-5 h-5" />
                      <span>{translations.categoriesManagement[language]}</span>
                  </Link>
                  <Link
                    href="/dashboard/meals"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 group relative"
                    title={translations.mealsManagement[language]}
                  >
                    <FaUtensils className="w-5 h-5" />
                      <span>{translations.mealsManagement[language]}</span>
                  </Link>
                  <Link
                    href="/dashboard/meals/add"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 group relative"
                    title={translations.addMeal[language]}
                  >
                    <FaPlus className="w-5 h-5" />
                      <span>{translations.addMeal[language]}</span>
                  </Link>
                  <Link
                    href={`/restaurant/${restaurant?.id}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 group relative"
                    title={translations.settings[language]}
                  >
                    <FaCog className="w-5 h-5" />
                      <span>{translations.settings[language]}</span>
                    </Link>
                  </div>

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <FaBars className="w-6 h-6" />
                  </button>

                  {/* Mobile Menu Dropdown */}
                  {isMobileMenuOpen && (
                    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 z-50 md:hidden">
                      <div className="absolute top-0 right-0 h-full w-64 bg-white shadow-lg">
                        <div className="p-4">
                          <div className="flex justify-end">
                            <button
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="mt-4 flex flex-col gap-4">
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <FaUserShield className="w-5 h-5" />
                              <span>{translations.dashboard[language]}</span>
                            </Link>
                            <Link
                              href="/dashboard/categories"
                              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <FaTags className="w-5 h-5" />
                              <span>{translations.categoriesManagement[language]}</span>
                            </Link>
                            <Link
                              href="/dashboard/meals"
                              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <FaUtensils className="w-5 h-5" />
                              <span>{translations.mealsManagement[language]}</span>
                            </Link>
                            <Link
                              href="/dashboard/meals/add"
                              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <FaPlus className="w-5 h-5" />
                              <span>{translations.addMeal[language]}</span>
                            </Link>
                            <Link
                              href={`/restaurant/${restaurant?.id}`}
                              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <FaCog className="w-5 h-5" />
                              <span>{translations.settings[language]}</span>
                  </Link>
                </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center gap-4">
                <span className="text-gray-700 text-[12px] text-center">
                  {translations.greeting[language]}, {restaurant ? restaurant.name : (user?.name || user?.email?.split('@')[0] || 'User')}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-[#222] text-white px-2 py-1.5 md:px-4 md:py-2 rounded hover:bg-[#000] transition text-[10px] md:text-base"
                >
                  <FiLogOut />
                  {translations.logout[language]}
                </button>
              </div>
            </>
          ) : (
            <>
              {hasSubdomain ? (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 bg-[#222] text-white px-2 py-1.5 md:px-4 md:py-2 rounded hover:bg-[#000] transition text-[8px] md:text-base"
                  >
                    <FaSignInAlt className="w-4 h-4 md:w-5 md:h-5" />
                    {translations.login[language]}
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-2 bg-[#222] text-white px-2 py-1.5 md:px-4 md:py-2 rounded hover:bg-[#000] transition text-[10px] md:text-base"
                  >
                    <FaUserPlus className="w-4 h-4 md:w-5 md:h-5" />
                    {translations.register[language]}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/restaurant-login"
                    className="flex items-center gap-2 bg-[#222] text-white px-2 py-1.5 md:px-4 md:py-2 rounded hover:bg-[#000] transition text-[8px] md:text-base"
                  >
                    <FaSignInAlt className="w-4 h-4 md:w-5 md:h-5" />
                    {translations.login[language]}
                  </Link>
                  <Link
                    href="/restaurant-register"
                    className="flex items-center gap-2 bg-[#222] text-white px-2 py-1.5 md:px-4 md:py-2 rounded hover:bg-[#000] transition text-[10px] md:text-base"
                  >
                    <FaUserPlus className="w-4 h-4 md:w-5 md:h-5" />
                    {translations.register[language]}
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
