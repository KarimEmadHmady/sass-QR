"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { FaQrcode, FaChartLine, FaUsers, FaMobileAlt, FaShieldAlt, FaClock, FaCheck, FaUtensils, FaBell, FaStar, FaGlobe, FaCog } from 'react-icons/fa';

const translations = {
  en: {
    hero: {
      title: "Digital Menu for Your Restaurant",
      subtitle: "Create your digital menu in minutes, no technical skills required",
      cta: "Start Free Trial"
    },
    features: {
      title: "Everything You Need",
      items: [
        {
          icon: <FaQrcode className="w-8 h-8" />,
          title: "QR Code Menu",
          description: "Generate QR codes instantly for your tables"
        },
        {
          icon: <FaChartLine className="w-8 h-8" />,
          title: "Real-time Analytics",
          description: "See what your customers love most"
        },
        {
          icon: <FaUsers className="w-8 h-8" />,
          title: "Customer Reviews",
          description: "Collect and manage customer feedback easily"
        },
        {
          icon: <FaMobileAlt className="w-8 h-8" />,
          title: "Mobile First",
          description: "Looks great on all devices"
        },
        {
          icon: <FaShieldAlt className="w-8 h-8" />,
          title: "Secure & Fast",
          description: "Your menu loads instantly"
        },
        {
          icon: <FaClock className="w-8 h-8" />,
          title: "Easy Updates",
          description: "Change your menu anytime, anywhere"
        }
      ]
    },
    additionalFeatures: {
      title: "More Amazing Features",
      items: [
        {
          icon: <FaUtensils className="w-8 h-8" />,
          title: "Menu Categories",
          description: "Organize your menu with beautiful categories"
        },
        {
          icon: <FaBell className="w-8 h-8" />,
          title: "Instant Notifications",
          description: "Get notified when customers place orders"
        },
        {
          icon: <FaStar className="w-8 h-8" />,
          title: "Rating System",
          description: "Let customers rate your dishes"
        },
        {
          icon: <FaGlobe className="w-8 h-8" />,
          title: "Multi-language",
          description: "Support multiple languages for your menu"
        },
        {
          icon: <FaCog className="w-8 h-8" />,
          title: "Easy Customization",
          description: "Customize your menu's look and feel"
        },
        {
          icon: <FaQrcode className="w-8 h-8" />,
          title: "Multiple QR Codes",
          description: "Generate different QR codes for different areas"
        }
      ]
    },
    pricing: {
      title: "Simple Pricing",
      subtitle: "Start free, upgrade anytime",
      plans: [
        {
          name: "Free Trial",
          price: "0",
          duration: "7 days",
          features: [
            "Digital menu creation",
            "QR code generation",
            "Basic analytics",
            "Email support"
          ],
          cta: "Start Free Trial"
        },
        {
          name: "Basic",
          price: "99",
          duration: "per month",
          features: [
            "Everything in Free Trial",
            "Unlimited menu items",
            "Advanced analytics",
            "Customer reviews",
            "Priority support"
          ],
          cta: "Get Started"
        },
        {
          name: "Premium",
          price: "199",
          duration: "per month",
          features: [
            "Everything in Basic",
            "Custom domain",
            "White-label solution",
            "API access",
            "Dedicated support"
          ],
          cta: "Get Started"
        }
      ]
    },
    cta: {
      title: "Ready to Go Digital?",
      subtitle: "Join 1000+ restaurants already using our platform",
      button: "Start Free Trial"
    }
  },
  ar: {
    hero: {
      title: "قائمة طعام رقمية لمطعمك",
      subtitle: "أنشئ قائمة طعامك الرقمية في دقائق، بدون خبرة تقنية",
      cta: "ابدأ تجربة مجانية"
    },
    features: {
      title: "كل ما تحتاجه",
      items: [
        {
          icon: <FaQrcode className="w-8 h-8" />,
          title: "قائمة QR",
          description: "أنشئ رموز QR لطاولاتك فوراً"
        },
        {
          icon: <FaChartLine className="w-8 h-8" />,
          title: "تحليلات مباشرة",
          description: "تعرف على على أكثر الأطباق شعبية"
        },
        {
          icon: <FaUsers className="w-8 h-8" />,
          title: "تقييمات العملاء",
          description: "جمع وإدارة تقييمات العملاء بسهولة"
        },
        {
          icon: <FaMobileAlt className="w-8 h-8" />,
          title: "متوافق مع الموبايل",
          description: "مظهر رائع على جميع الأجهزة"
        },
        {
          icon: <FaShieldAlt className="w-8 h-8" />,
          title: "آمن وسريع",
          description: "قائمتك تظهر فوراً"
        },
        {
          icon: <FaClock className="w-8 h-8" />,
          title: "تحديثات سهلة",
          description: "غير قائمتك في أي وقت وأي مكان"
        }
      ]
    },
    additionalFeatures: {
      title: "مميزات إضافية رائعة",
      items: [
        {
          icon: <FaUtensils className="w-8 h-8" />,
          title: "تصنيفات القائمة",
          description: "نظم قائمتك مع تصنيفات جميلة"
        },
        {
          icon: <FaBell className="w-8 h-8" />,
          title: "إشعارات فورية",
          description: "احصل على إشعارات عند طلب العملاء"
        },
        {
          icon: <FaStar className="w-8 h-8" />,
          title: "نظام التقييم",
          description: "دع العملاء يقيمون أطباقك"
        },
        {
          icon: <FaGlobe className="w-8 h-8" />,
          title: "متعدد اللغات",
          description: "دعم لغات متعددة لقائمتك"
        },
        {
          icon: <FaCog className="w-8 h-8" />,
          title: "تخصيص سهل",
          description: "خصص مظهر قائمتك بسهولة"
        },
        {
          icon: <FaQrcode className="w-8 h-8" />,
          title: "رموز QR متعددة",
          description: "أنشئ رموز QR مختلفة لمناطق مختلفة"
        }
      ]
    },
    pricing: {
      title: "أسعار بسيطة",
      subtitle: "ابدأ مجاناً، ارفع مستواك متى تريد",
      plans: [
        {
          name: "تجربة مجانية",
          price: "0",
          duration: "7 أيام",
          features: [
            "إنشاء قائمة رقمية",
            "إنشاء رمز QR",
            "تحليلات أساسية",
            "دعم بالبريد الإلكتروني"
          ],
          cta: "ابدأ تجربة مجانية"
        },
        {
          name: "الأساسي",
          price: "99",
          duration: "شهرياً",
          features: [
            "كل مميزات التجربة المجانية",
            "عناصر قائمة غير محدودة",
            "تحليلات متقدمة",
            "تقييمات العملاء",
            "دعم ذو أولوية"
          ],
          cta: "ابدأ الآن"
        },
        {
          name: "الاحترافي",
          price: "199",
          duration: "شهرياً",
          features: [
            "كل مميزات الخطة الأساسية",
            "نطاق فرعي مخصص",
            "حل white-label",
            "وصول API",
            "دعم مخصص"
          ],
          cta: "ابدأ الآن"
        }
      ]
    },
    cta: {
      title: "هل أنت مستعد للتحول الرقمي؟",
      subtitle: "انضم إلى أكثر من 1000 مطعم يستخدمون منصتنا",
      button: "ابدأ تجربة مجانية"
    }
  }
};

export default function RestaurantLandingPage() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{t.hero.title}</h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">{t.hero.subtitle}</p>
            <Link
              href="/restaurant-register"
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-600 hover:to-indigo-600 transition inline-block shadow-lg hover:shadow-xl"
            >
              {t.hero.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">{t.features.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.features.items.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="text-purple-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">{t.additionalFeatures.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.additionalFeatures.items.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="text-purple-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">{t.pricing.title}</h2>
          <p className="text-xl text-gray-600 text-center mb-12">{t.pricing.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.pricing.plans.map((plan, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">${plan.price}</span>
                    <span className="text-gray-600">/{plan.duration}</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-600">
                        <FaCheck className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/restaurant-register"
                    className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl"
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.cta.title}</h2>
          <p className="text-xl mb-8 text-gray-200">{t.cta.subtitle}</p>
          <Link
            href="/restaurant-register"
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-600 hover:to-indigo-600 transition inline-block shadow-lg hover:shadow-xl"
          >
            {t.cta.button}
          </Link>
        </div>
      </section>
    </div>
  );
} 