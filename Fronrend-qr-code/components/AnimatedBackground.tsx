"use client";

import Image from "next/image";

const icons = [
  { src: "/bowl-food.png", alt: "bowl-food" },
  { src: "/bread.png", alt: "bread.png" },
  { src: "/fork-knife.png", alt: "fork-knife" },
  { src: "/hamburger.png", alt: "hamburger" },
  { src: "/martini.png", alt: "martini" },
  { src: "/pizza.png", alt: "pizza" },
];

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 15 }).map((_, index) => {
        const icon = icons[index % icons.length];
        const size = Math.floor(Math.random() * 40) + 30;
        const animationDuration = Math.random() * 20 + 10;
        const left = Math.random() * 100;
        const delay = Math.random() * 10;

        return (
          <Image
            key={index}
            src={icon.src}
            alt={icon.alt}
            width={size}
            height={size}
            className="absolute opacity-10 "
            style={{
              top: "100%",
              left: `${left}%`,
              animation: `floatUp ${animationDuration}s linear infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
      <style jsx global>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-120vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
