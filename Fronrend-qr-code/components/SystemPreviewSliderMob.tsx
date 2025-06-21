import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function SystemPreviewSliderMop() {
  return (
    <div className="max-w-4xl mx-auto" dir="ltr">
      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: #6B46C1 !important;
        }
        .swiper-pagination-bullet {
          background: #6B46C1 !important;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}</style>
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper rounded-[10px] "
        dir="ltr"
      >
<SwiperSlide>
  <div className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-2xl overflow-hidden">
    <Image
      src="/6.PNG"
      alt="MenuTag System Preview "
      fill
      className="object-contain"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  </div>
</SwiperSlide>
<SwiperSlide>
  <div className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-2xl overflow-hidden">
    <Image
      src="/7.PNG"
      alt="MenuTag System Preview "
      fill
      className="object-contain"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  </div>
</SwiperSlide>
<SwiperSlide>
  <div className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-2xl overflow-hidden">
    <Image
      src="/11.PNG"
      alt="MenuTag System Preview "
      fill
      className="object-contain"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  </div>
</SwiperSlide>
<SwiperSlide>
  <div className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-2xl overflow-hidden">
    <Image
      src="/12.PNG"
      alt="MenuTag System Preview "
      fill
      className="object-contain"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  </div>
</SwiperSlide>


      </Swiper>
    </div>
  );
} 