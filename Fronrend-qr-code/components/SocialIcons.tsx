"use client";

import { FaFacebookF, FaInstagram, FaTiktok, FaGoogle } from "react-icons/fa";
import LanguageSwitcher from "./LanguageSwitcher";
import { useEffect, useState } from "react";
import { useSubdomain } from "@/contexts/SubdomainContext";

interface Restaurant {
  settings: {
    socialMedia: {
      facebook: string;
      instagram: string;
      tiktok: string;
    };
    location: string;
  };
}

const SocialIcons = () => {
  const { subdomain } = useSubdomain();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSubdomain, setHasSubdomain] = useState(false);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      let currentSubdomain = subdomain;
      if (!currentSubdomain) {
        const hostname = window.location.hostname;
        currentSubdomain = hostname.split('.')[0];
      }

      if (!currentSubdomain || currentSubdomain === 'localhost' || currentSubdomain === 'www') {
        console.log('No valid subdomain available');
        setHasSubdomain(false);
        setLoading(false);
        return;
      }

      setHasSubdomain(true);
      try {
        console.log('Fetching data for subdomain:', currentSubdomain);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/subdomain/${currentSubdomain}`);
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch restaurant data: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received restaurant data:', data);

        if (data && data.settings && data.settings.socialMedia) {
          setRestaurant(data);
        } else {
          console.log('No social media data found in restaurant settings');
        }
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [subdomain]);

  const renderSocialIcons = () => {
    if (loading) {
      return (
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900"></div>
      );
    }

    if (!hasSubdomain) {
      return (
        <>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-2 rounded-full shadow hover:bg-blue-100 transition"
          >
            <FaFacebookF className="text-blue-600 w-5 h-5" />
          </a>

          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-2 rounded-full shadow hover:bg-pink-100 transition"
          >
            <FaInstagram className="text-pink-500 w-5 h-5" />
          </a>

          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
          >
            <FaTiktok className="text-black w-5 h-5" />
          </a>

          <LanguageSwitcher />

          <div className="relative flex flex-col items-center">
            <span
              className="mb-2 text-sm text-gray-700 font-medium px-3 py-1 bg-white rounded shadow whitespace-nowrap relative
                         before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2
                         before:border-8 before:border-transparent before:border-t-white"
            >
              قيّمنا على جوجل
            </span>

            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-2 rounded-full shadow hover:bg-green-100 transition"
            >
              <FaGoogle className="text-green-600 w-5 h-5" />
            </a>
          </div>
        </>
      );
    }

    if (!restaurant?.settings?.socialMedia) {
      return null;
    }

    const { facebook, instagram, tiktok } = restaurant.settings.socialMedia;
    const location = restaurant.settings.location;

    return (
      <>
        <a
          href={facebook || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white p-2 rounded-full shadow hover:bg-blue-100 transition"
        >
          <FaFacebookF className="text-blue-600 w-5 h-5" />
        </a>

        <a
          href={instagram || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white p-2 rounded-full shadow hover:bg-pink-100 transition"
        >
          <FaInstagram className="text-pink-500 w-5 h-5" />
        </a>

        <a
          href={tiktok || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
        >
          <FaTiktok className="text-black w-5 h-5" />
        </a>

        <LanguageSwitcher />

        <div className="relative flex flex-col items-center">
          <span
            className="mb-2 text-sm text-gray-700 font-medium px-3 py-1 bg-white rounded shadow whitespace-nowrap relative
                       before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2
                       before:border-8 before:border-transparent before:border-t-white"
          >
            قيّمنا على جوجل
          </span>
            <a
              href={`https://search.google.com/local/writereview?placeid=${encodeURIComponent(location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-2 rounded-full shadow hover:bg-green-100 transition"
            >
              <FaGoogle className="text-green-600 w-5 h-5" />
            </a>
        </div>
      </>
    );
  };

  return (
    <div className="flex justify-center items-end gap-1 py-8 bg-[#eee]">
      {renderSocialIcons()}
    </div>
  );
};

export default SocialIcons;
