import { FaFacebookF, FaInstagram, FaTiktok, FaGoogle } from "react-icons/fa";
import LanguageSwitcher from "./LanguageSwitcher";


const SocialIcons = () => {
  return (
    <div className="flex justify-center items-end gap-1 py-8 bg-[#eee]">
      <a
        href="https://www.facebook.com/#"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white p-2 rounded-full shadow hover:bg-blue-100 transition"
      >
        <FaFacebookF className="text-blue-600 w-5 h-5" />
      </a>

      <a
        href="https://www.instagram.com/#"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white p-2 rounded-full shadow hover:bg-pink-100 transition"
      >
        <FaInstagram className="text-pink-500 w-5 h-5" />
      </a>

      <a
        href="https://www.tiktok.com/#"
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
          href="https://www.google.com/maps/place/#location#here/review"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white p-2 rounded-full shadow hover:bg-green-100 transition"
        >
          <FaGoogle className="text-green-600 w-5 h-5" />
        </a>
      </div>
    </div>
  );
};

export default SocialIcons;
