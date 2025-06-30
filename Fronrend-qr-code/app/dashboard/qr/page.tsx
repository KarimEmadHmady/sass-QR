"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/store";
import { QRCodeCanvas } from "qrcode.react";
import { FaDownload } from "react-icons/fa";

export default function QRCodePage() {
  const { restaurant } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    // Get the origin (protocol + hostname + port)
    const origin = window.location.origin;
    
    // Construct the full URL using the origin
    const fullUrl = `${origin}/`;
    setQrUrl(fullUrl);
  }, []);

  const handleDownload = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${restaurant?.name || 'restaurant'}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const translations = {
    title: {
      en: "Restaurant QR Code",
      ar: "رمز QR للمطعم"
    },
    download: {
      en: "Download QR Code",
      ar: "تحميل رمز QR"
    },
    scan: {
      en: "Scan this QR code to view the restaurant menu",
      ar: "امسح رمز QR لعرض قائمة المطعم"
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[90%] h-[90%] rounded-xl shadow-2xl p-8 flex flex-col items-center justify-center relative">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">{translations.title[language]}</h1>
          <p className="text-gray-600">{translations.scan[language]}</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <QRCodeCanvas
            id="qr-code"
            value={qrUrl}
            size={400}
            level="H"
            includeMargin={true}
          />
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-[#222] text-white px-6 py-3 rounded-lg hover:bg-[#333] transition"
        >
          <FaDownload className="w-5 h-5" />
          <span>{translations.download[language]}</span>
        </button>

        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
} 