import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation'; 

function initSwiper(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

return new Swiper(container, {
  modules: [Navigation],

  loop: true,
  slidesPerView: 3,
  spaceBetween: 20,

  breakpoints: {
    0: { slidesPerView: 1 },
    760: { slidesPerView: 2 },
    1024: { slidesPerView: 3 },
  },

  navigation: {
    nextEl: container.querySelector('.swiper__btn--next'),
    prevEl: container.querySelector('.swiper__btn--prev'),
  },
});

}

export default function initAllSwipers() {
  initSwiper('.swiper-products');
  initSwiper('.swiper-blog');  
}



