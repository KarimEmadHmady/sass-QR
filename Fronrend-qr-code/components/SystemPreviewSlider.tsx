import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function SystemPreviewSlider() {
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
        className="mySwiper rounded-[50px] shadow-xl"
        dir="ltr"
      >
        <SwiperSlide>
          <div className="relative h-[400px] rounded-2xl overflow-hidden">
            <Image
              src="/1.PNG"
              alt="MenuTag System Preview 1"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-[400px] rounded-2xl overflow-hidden">
            <Image
              src="/2.PNG"
              alt="MenuTag System Preview 2"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-[400px] rounded-2xl overflow-hidden">
            <Image
              src="/3.PNG"
              alt="MenuTag System Preview 3"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-[400px] rounded-2xl overflow-hidden">
            <Image
              src="/4.PNG"
              alt="MenuTag System Preview 4"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-[400px] rounded-2xl overflow-hidden">
            <Image
              src="/5.PNG"
              alt="MenuTag System Preview 4"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-[400px] rounded-2xl overflow-hidden">
            <Image
              src="/6.PNG"
              alt="MenuTag System Preview 4"
              width={369}
              height={200}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-[400px] rounded-2xl overflow-hidden">
            <Image
              src="/7.PNG"
              alt="MenuTag System Preview 4"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative h-[400px] rounded-2xl overflow-hidden">
            <Image
              src="/8.PNG"
              alt="MenuTag System Preview 4"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
} 