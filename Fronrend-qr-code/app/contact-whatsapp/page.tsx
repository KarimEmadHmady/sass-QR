"use client";

import Image from "next/image";
import { useLanguage } from "@/store";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function ContactWhatsapp() {
  const { language } = useLanguage();
  const t = {
    ar: {
      title: "جاهز للاشتراك أو عندك استفسار؟",
      desc: "نحن سعداء باهتمامك! بعد مراجعة الأسعار، تواصل معنا على الواتساب لإتمام الاشتراك أو لأي استفسار. فريقنا سيرد عليك فورًا.",
      btn: "تواصل عبر واتساب"
    },
    en: {
      title: "Ready to subscribe or have a question?",
      desc: "We are happy for your interest! After reviewing the prices, contact us on WhatsApp to complete your subscription or for any inquiry. Our team will respond promptly.",
      btn: "Contact via WhatsApp"
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center  py-6 md:py-12 px-2 md:px-4 relative overflow-hidden">
        <AnimatedBackground/>
      {/* دوائر ديكور */}
      <div className="absolute -top-10 -left-10 w-20 h-20 md:w-72 md:h-72 bg-green-400 opacity-20 rounded-full blur-3xl z-0"></div>
      <div className="absolute -bottom-10 -right-10 w-20 h-20 md:w-72 md:h-72 bg-purple-400 opacity-20 rounded-full blur-3xl z-0"></div>
      <div className="bg-white rounded-xl md:rounded-3xl shadow-2xl p-4 md:p-16 flex flex-col items-center max-w-xs md:max-w-xl w-full z-10">
        <div className="mb-4 md:mb-6 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 md:w-20 md:h-20 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A12.07 12.07 0 0 0 12 0C5.37 0 0 5.37 0 12a11.93 11.93 0 0 0 1.64 6.06L0 24l6.24-1.63A12.09 12.09 0 0 0 12 24c6.63 0 12-5.37 12-12a11.93 11.93 0 0 0-3.48-8.52zM12 22a10.07 10.07 0 0 1-5.19-1.42l-.37-.22-3.7.97.99-3.6-.24-.37A10.07 10.07 0 1 1 22 12c0 5.52-4.48 10-10 10zm5.47-7.14c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.5-.5-.67-.5h-.57c-.17 0-.44.06-.67.3-.23.23-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.3 3.68.6.2 1.07.32 1.43.41.6.15 1.15.13 1.58.08.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.13-1.18-.07-.1-.27-.15-.57-.3z"/></svg>
        </div>
        <h1 className="text-lg md:text-3xl font-extrabold text-gray-800 mb-1 md:mb-2 text-center drop-shadow-lg">{t[language].title}</h1>
        <p className="text-sm md:text-lg text-gray-600 text-center mb-4 md:mb-6 max-w-xs md:max-w-md leading-relaxed">{t[language].desc}</p>
        <a
          href="https://wa.me/201155993133"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 md:gap-4 bg-green-500 hover:bg-green-600 text-white px-4 py-3 md:px-10 md:py-5 rounded-xl md:rounded-2xl text-base md:text-2xl font-bold transition shadow-xl hover:scale-105 focus:ring-4 focus:ring-green-300 mb-4 md:mb-6 animate-bounce"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A12.07 12.07 0 0 0 12 0C5.37 0 0 5.37 0 12a11.93 11.93 0 0 0 1.64 6.06L0 24l6.24-1.63A12.09 12.09 0 0 0 12 24c6.63 0 12-5.37 12-12a11.93 11.93 0 0 0-3.48-8.52zM12 22a10.07 10.07 0 0 1-5.19-1.42l-.37-.22-3.7.97.99-3.6-.24-.37A10.07 10.07 0 1 1 22 12c0 5.52-4.48 10-10 10zm5.47-7.14c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.5-.5-.67-.5h-.57c-.17 0-.44.06-.67.3-.23.23-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.3 3.68.6.2 1.07.32 1.43.41.6.15 1.15.13 1.58.08.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.13-1.18-.07-.1-.27-.15-.57-.3z"/></svg>
          {t[language].btn}
        </a>
        <Image src="/technology-concept-wtih-qr-menu.jpg" alt="تواصل وادفع بسهولة" width={300} height={120} className="rounded-lg md:rounded-2xl shadow-md object-cover" />
      </div>
      {/* سيكشن التجربة المجانية */}
      <section className="w-full flex justify-center mt-6 md:mt-10">
        <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 flex flex-col items-center max-w-xs md:max-w-lg w-full gap-3 md:gap-5 border border-purple-200">
          <span className="text-xs md:text-base text-purple-100 font-semibold bg-purple-600 px-4 py-2 rounded-full shadow-sm mb-1 md:mb-2 text-center">{language === 'ar' ? 'جرب لمدة 7 أيام مجاناً' : 'Try for 7 days free'}</span>
          <a
            href="/restaurant-register"
            className="bg-white text-black px-6 py-2 md:px-8 md:py-3 rounded-lg text-sm md:text-lg font-bold shadow-md hover:from-green-600 hover:to-green-800 transition w-full text-center"
          >
            {language === 'ar' ? 'ابدأ التجربة المجانية' : 'Start Free Trial'}
          </a>
        </div>
      </section>
    </div>
  );
} 