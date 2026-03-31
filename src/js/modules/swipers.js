import Swiper from "swiper";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

function initSwiper(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const isBlog = selector === ".swiper-blog";
  return new Swiper(container, {
    modules: isBlog ? [Navigation, Autoplay] : [Navigation],
    loop: true,
    slidesPerView: 3,
    spaceBetween: 20,

    breakpoints: {
      0: { slidesPerView: 1 },
      760: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },

    ...(!isBlog
      ? {
          navigation: {
            nextEl: container.querySelector(".swiper__btn--next"),
            prevEl: container.querySelector(".swiper__btn--prev"),
          },
        }
      : {}),

    ...(isBlog
      ? {
          autoplay: {
            delay: 2500,
            disableOnInteraction: false,
            reverseDirection: false,
            pauseOnMouseEnter: true,
          },
          speed: 700,
        }
      : {}),
  });
}

export default function initAllSwipers() {
  initSwiper(".swiper-products");
  initSwiper(".swiper-blog");
}
