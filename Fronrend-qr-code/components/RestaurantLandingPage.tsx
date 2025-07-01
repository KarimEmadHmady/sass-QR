"use client";

import { useLanguage } from "@/store";
import Link from "next/link";
import { FaQrcode, FaChartLine, FaUsers, FaMobileAlt, FaShieldAlt, FaClock, FaCheck, FaUtensils, FaStar, FaGlobe, FaCog, FaPercent } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';
import AnimatedBackground from "./AnimatedBackground";
import SystemPreviewSlider from "./SystemPreviewSlider";
import SystemPreviewSliderMop from "./SystemPreviewSliderMob";
import Image from "next/image";

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
          icon: <FaPercent className="w-8 h-8" />,
          title: "Discount Program",
          description: "Create and manage discount campaigns easily"
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
          description: "تعرف  على أكثر الأطباق طلبا"
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
          icon: <FaPercent className="w-8 h-8" />,
          title: "برنامج الخصم",
          description: "أنشئ وأدر حملات الخصم بسهولة"
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
          duration: " أيام 7",
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
          price: "3499",
          duration: "سنوياً",
          features: [
            "كل مميزات الباقة الشهرية",
            "أولوية في الدعم الفني",
            "توفير رسوم 3 اشهر",
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

  // ترجمة سيكشن التواصل
  const contactSection = {
    ar: {
      title: "تواصل معنا الآن",
      desc: "للاستفسار وطلب الخدمة تواصل معنا مباشرة على الواتساب، فريقنا جاهز لمساعدتك في أي وقت!",
      btn: "تواصل واتساب"
    },
    en: {
      title: "Contact Us Now",
      desc: "For inquiries and service requests, contact us directly on WhatsApp. Our team is ready to help you anytime!",
      btn: "Contact via WhatsApp"
    }
  };

  // ترجمة سيكشن الخصومات
  const discountSection = {
    ar: {
      title: "برنامج الخصومات الذكي",
      desc: "يمكنك بسهولة عمل خصم على أي وجبة أو مشروب في دقائق! حدد الوجبة، نسبة الخصم، الوقت والتاريخ ومدة الأيام، وسيظهر الخصم تلقائيًا للعميل مع السعر القديم والجديد ونسبة الخصم بشكل واضح وجذاب.",
      points: [
        "تحديد الخصم لأي صنف (وجبة أو مشروب)",
        "تخصيص وقت وتاريخ بداية ونهاية الخصم",
        "عرض نسبة الخصم والسعر القديم والجديد للعميل",
        "سهولة تفعيل وإلغاء الخصومات في أي وقت"
      ],
      example: {
        discount: "خصم 30%",
        meal: "بيتزا مارجريتا",
        oldPrice: "120 EGP",
        newPrice: "84 EGP",
        until: "الخصم ساري حتى 10 مساءً"
      }
    },
    en: {
      title: "Smart Discount Program",
      desc: "Easily create a discount on any meal or drink in minutes! Select the item, discount percentage, time, date, and duration. The discount will automatically appear to customers with the old and new prices and the discount percentage, all in a clear and attractive way.",
      points: [
        "Set a discount for any item (meal or drink)",
        "Customize start and end time and date for the discount",
        "Show discount percentage, old and new prices to customers",
        "Easily activate or cancel discounts anytime"
      ],
      example: {
        discount: "30% OFF",
        meal: "Margherita Pizza",
        oldPrice: "120 EGP",
        newPrice: "84 EGP",
        until: "Discount valid until 10 PM"
      }
    }
  };

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
      <section className="py-[35px] ">
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

          {/* Discount Program Section */}
          <section className="my-6 md:my-10 flex flex-col items-center justify-center">
            <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-12 w-full max-w-xs md:max-w-3xl flex flex-col md:flex-row items-center gap-4 md:gap-8 relative overflow-hidden">
              {/* أيقونة خصم */}
              <div className="flex flex-col items-center md:items-start flex-1 mb-4 md:mb-0">
                <div className="bg-white rounded-full p-2 md:p-4 mb-2 md:mb-4 shadow-lg border-4 border-black-500 animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-14 md:h-14 text-black-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.293 2.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-14 14a1 1 0 0 1-.497.263l-5 1a1 1 0 0 1-1.213-1.213l1-5a1 1 0 0 1 .263-.497l14-14zm1.414-1.414-14 14a3 3 0 0 0-.789 1.494l-1 5A3 3 0 0 0 3.22 23.78l5-1a3 3 0 0 0 1.494-.789l14-14a3 3 0 0 0 0-4.242l-3-3a3 3 0 0 0-4.242 0zM5.5 20.5l-2-2 0 0 2 2zm2.793-1.207 10-10-2-2-10 10 2 2zm11.207-11.207-2-2 2 2z"/></svg>
                </div>
                <h3 className="text-lg md:text-3xl font-bold text-white mb-1 md:mb-2 drop-shadow-lg text-center md:text-left">{discountSection[language].title}</h3>
                <p className="text-sm md:text-lg text-white/90 mb-2 md:mb-4 max-w-xs md:max-w-md leading-relaxed text-center md:text-left">{discountSection[language].desc}</p>
                <ul className="text-white/90 text-xs md:text-base list-disc pl-4 md:pl-5">
                  {discountSection[language].points.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
              {/* مثال مرئي */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 w-40 md:w-64 flex flex-col items-center border-2 border-black-400">
                  <span className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-black text-white text-xs md:text-lg font-bold px-2 md:px-4 py-1 rounded-full shadow-lg animate-bounce">{discountSection[language].example.discount}</span>
                  <Image src="/pizza.png" alt={discountSection[language].example.meal} width={80} height={80} className="w-12 h-12 md:w-20 md:h-20 object-cover rounded-full mb-2 md:mb-3 border-4 border-purple-300" />
                  <h4 className="text-base md:text-xl font-bold text-gray-800 mb-1 text-center">{discountSection[language].example.meal}</h4>
                  <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                    <span className="text-gray-400 line-through text-xs md:text-lg">{discountSection[language].example.oldPrice}</span>
                    <span className="text-black-600 text-lg md:text-2xl font-bold">{discountSection[language].example.newPrice}</span>
                  </div>
                  <span className="text-black text-xs md:text-sm font-semibold text-center">{discountSection[language].example.until}</span>
                </div>
              </div>
            </div>
          </section>

          <SystemPreviewSliderMop />
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-6 md:py-[35px]">
        <div className="container mx-auto px-2 md:px-4">
          <div className="relative bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 overflow-hidden">
            {/* واتساب أيقونة كبيرة */}
            <div className="flex flex-col items-center md:items-start flex-1 mb-4 md:mb-0">
              <div className="bg-white rounded-full p-2 md:p-4 mb-2 md:mb-4 shadow-lg border-4 border-green-500 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 md:w-16 md:h-16 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A12.07 12.07 0 0 0 12 0C5.37 0 0 5.37 0 12a11.93 11.93 0 0 0 1.64 6.06L0 24l6.24-1.63A12.09 12.09 0 0 0 12 24c6.63 0 12-5.37 12-12a11.93 11.93 0 0 0-3.48-8.52zM12 22a10.07 10.07 0 0 1-5.19-1.42l-.37-.22-3.7.97.99-3.6-.24-.37A10.07 10.07 0 1 1 22 12c0 5.52-4.48 10-10 10zm5.47-7.14c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.5-.5-.67-.5h-.57c-.17 0-.44.06-.67.3-.23.23-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.3 3.68.6.2 1.07.32 1.43.41.6.15 1.15.13 1.58.08.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.13-1.18-.07-.1-.27-.15-.57-.3z"/></svg>
              </div>
              <h2 className="text-lg md:text-3xl font-extrabold text-white mb-1 md:mb-2 drop-shadow-lg text-center md:text-left">{contactSection[language].title}</h2>
              <p className="text-sm md:text-lg text-gray-200 mb-2 md:mb-4 max-w-xs md:max-w-md leading-relaxed text-center md:text-left">{contactSection[language].desc}</p>
            </div>
            <a
              href="https://wa.me/201155993133"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 md:gap-4 bg-green-500 hover:bg-green-600 text-white px-4 py-3 md:px-10 md:py-5 rounded-xl md:rounded-2xl text-base md:text-2xl font-bold transition shadow-xl hover:scale-105 focus:ring-4 focus:ring-green-300 animate-bounce"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A12.07 12.07 0 0 0 12 0C5.37 0 0 5.37 0 12a11.93 11.93 0 0 0 1.64 6.06L0 24l6.24-1.63A12.09 12.09 0 0 0 12 24c6.63 0 12-5.37 12-12a11.93 11.93 0 0 0-3.48-8.52zM12 22a10.07 10.07 0 0 1-5.19-1.42l-.37-.22-3.7.97.99-3.6-.24-.37A10.07 10.07 0 1 1 22 12c0 5.52-4.48 10-10 10zm5.47-7.14c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.5-.5-.67-.5h-.57c-.17 0-.44.06-.67.3-.23.23-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.3 3.68.6.2 1.07.32 1.43.41.6.15 1.15.13 1.58.08.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.13-1.18-.07-.1-.27-.15-.57-.3z"/></svg>
              {contactSection[language].btn}
            </a>
            <div className="absolute -top-10 -left-10 w-20 h-20 md:w-40 md:h-40 bg-green-400 opacity-20 rounded-full blur-2xl z-0"></div>
            <div className="absolute -bottom-10 -right-10 w-20 h-20 md:w-40 md:h-40 bg-purple-400 opacity-20 rounded-full blur-2xl z-0"></div>
          </div>
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
                    href="/contact-whatsapp"
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