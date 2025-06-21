"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { FaQrcode, FaChartLine, FaUsers, FaMobileAlt, FaShieldAlt, FaClock, FaCheck, FaUtensils, FaStar, FaGlobe, FaCog } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';
import AnimatedBackground from "./AnimatedBackground";
import SystemPreviewSlider from "./SystemPreviewSlider";
import SystemPreviewSliderMop from "./SystemPreviewSliderMob";

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
          icon: <SiGoogle className="w-8 h-8" />,
          title: "Google Reviews",
          description: "Direct integration with Google reviews"
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
          name: "Monthly Plan",
          price: "499",
          duration: "per month",
          features: [
            "Unlimited categories and items",
            "Full control (No technical skills needed)",
            "Customer ratings system",
            "QR code generation",
            "Complete analytics dashboard",
            "Custom subdomain",
            "Continuous technical support"
          ],
          cta: "Get Started"
        },
        {
          name: "Annual Plan",
          price: "4999",
          duration: "per year",
          features: [
            "All Monthly Plan features",
            "Priority technical support",
            "Save 2 months worth of fees",
            "Long-term commitment discount"
          ],
          cta: "Get Started"
        }
      ]
    },
    cta: {
      title: "Ready to Go Digital?",
      subtitle: "Join many restaurants and cafés that trust and use our platform daily",
      button: "Start Free Trial"
    },
    systemPreview: {
      title: "Explore MenuTag System",
      subtitle: "See how the system looks from the inside – simple design, full control, and comfort for your customers.",
    },
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
          icon: <SiGoogle className="w-8 h-8" />,
          title: "تقييم جوجل",
          description: "تقييم العملاء لمطعمك بضغطة واحدة "
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
          name: "الباقة الشهرية",
          price: "499",
          duration: "شهرياً",
          features: [
            "إضافة تصنيفات وأصناف بلا حدود",
            "تحكم كامل (بدون خبرة تقنية)",
            "نظام تقييمات العملاء",
            "إنشاء رمز QR",
            "لوحة تحليلات شاملة",
            "نطاق فرعي مخصص",
            "دعم فني مستمر"
          ],
          cta: "ابدأ الآن"
        },
        {
          name: "الباقة السنوية",
          price: "4999",
          duration: "سنوياً",
          features: [
            "كل مميزات الباقة الشهرية",
            "أولوية في الدعم الفني",
            "توفير رسوم شهرين",
            "خصم الالتزام طويل الأمد"
          ],
          cta: "ابدأ الآن"
        }
      ]
    },
    cta: {
      title: "هل أنت مستعد للتحول الرقمي؟",
      subtitle: "انضم إلى مطاعم و كافيهات كثيرة تثق بمنصتنا وتستخدمها يوميًا",
      button: "ابدأ تجربة مجانية"
    },
    systemPreview: {
      title: "استكشف نظام MenuTag",
      subtitle: "جرب كيف يبدو النظام من الداخل – تصميم بسيط، تحكم كامل، وراحة لعملائك.",
    },
  }
};

export default function RestaurantLandingPage() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen ">
<AnimatedBackground/>
      {/* Hero Section */}
      <section className="relative bg-cover bg-center bg-no-repeat text-white py-20 m-[15px] rounded-[50px]" style={{ backgroundImage: 'url(/banner.jpg)' }}>
        <div className="absolute inset-0 bg-black opacity-[0.4] rounded-[50px]"></div>
        <div className="container mx-auto px-4 relative z-10">
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
      <section className="py-[35px]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">{t.features.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {t.features.items.map((feature, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 text-center">
                <div className="text-purple-600 mb-3 flex justify-center items-center">{feature.icon}</div>
                <h3 className="text-sm font-semibold mb-2 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-[12px] text-center">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-8 mt-[25px]">
            {t.additionalFeatures.items.map((feature, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 text-center">
                <div className="text-purple-600 mb-3 flex justify-center items-center">{feature.icon}</div>
                <h3 className="text-sm font-semibold mb-2 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-[12px] text-center">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Additional Features Section */}
          <section className="py-[40px]">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">
                {language === 'ar' ? 'كيف يعمل' : 'How It Works'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Step 1 */}
                <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">
                      {language === 'ar' ? 'سجل حسابك' : 'Create Account'}
                    </h3>
                    <p className="text-gray-600">
                      {language === 'ar' 
                        ? 'قم بإنشاء حسابك بسهولة وابدأ رحلتك معنا'
                        : 'Create your account easily and start your journey with us'}
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">
                      {language === 'ar' ? 'أضف قائمة الطعام' : 'Add Menu Items'}
                    </h3>
                    <p className="text-gray-600">
                      {language === 'ar'
                        ? 'أضف وجباتك وأطباقك مع الصور والأسعار'
                        : 'Add your meals and dishes with images and prices'}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">
                      {language === 'ar' ? 'اطبع رمز QR' : 'Print QR Code'}
                    </h3>
                    <p className="text-gray-600">
                      {language === 'ar'
                        ? 'قم بطباعة رمز QR الخاص بك لكل طاولة'
                        : 'Print your QR code for each table'}
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform duration-300">
                    4
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">
                      {language === 'ar' ? 'ضع الرمز على الطاولات' : 'Place on Tables'}
                    </h3>
                    <p className="text-gray-600">
                      {language === 'ar'
                        ? 'ضع رمز QR على طاولاتك وابدأ في استقبال الطلبات'
                        : 'Place QR codes on your tables and start receiving orders'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

      </section>

      {/* System Preview Section */}
      <section className="py-[35px]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">
            {t.systemPreview.title}
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            {t.systemPreview.subtitle}
          </p>
          
          <SystemPreviewSlider />
          <br></br>
          <SystemPreviewSliderMop/>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-[35px]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent">{t.pricing.title}</h2>
          <p className="text-xl text-gray-600 text-center mb-12">{t.pricing.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.pricing.plans.map((plan, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-900 to-indigo-900 bg-clip-text text-transparent text-center">{plan.name}</h3>
                  <div className="mb-6 text-center">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">EGP {plan.price}</span>
                    <span className="text-gray-600">/{plan.duration}</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center justify-center text-gray-600 text-center">
                        <FaCheck className="w-5 h-5 text-purple-500 mx-2 flex-shrink-0" />
                        <span className="text-center">{feature}</span>
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
      <section className="relative bg-cover bg-center bg-no-repeat text-white py-20 m-[15px] rounded-[50px]" style={{ backgroundImage: 'url(/banner2.webp)' }}>
        <div className="absolute inset-0 bg-black opacity-[0.4] rounded-[50px]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
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