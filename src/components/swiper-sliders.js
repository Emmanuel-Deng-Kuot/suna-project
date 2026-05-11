/**
 * Swiper Sliders Component
 * Initializes Swiper.js sliders for Categories, Collection, and Inspiration sections
 * Maintains premium design while adding smooth, professional sliding experience
 */

import { Swiper, Navigation, Pagination, Autoplay, Mousewheel } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/**
 * Initialize Categories Swiper
 * Responsive breakpoints: 1 slide (mobile), 2 (tablet), 3-4 (desktop)
 */
export function initCategoriesSwiper() {
  const categoriesSwiper = new Swiper('.categories .swiper-container', {
    modules: [Navigation, Pagination, Mousewheel],
    slidesPerView: 1.2,
    spaceBetween: 16,
    grabCursor: true,
    loop: true,
    mousewheel: {
      forceToAxis: true,
      invert: false,
    },
    navigation: {
      nextEl: '.categories .swiper-button-next',
      prevEl: '.categories .swiper-button-prev',
    },
    pagination: {
      el: '.categories .swiper-pagination',
      clickable: true,
      dynamicBullets: true,
    },
    breakpoints: {
      320: {
        slidesPerView: 1.2,
        spaceBetween: 16,
      },
      480: {
        slidesPerView: 1.4,
        spaceBetween: 16,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
        grabCursor: true,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 20,
        grabCursor: true,
      },
      1280: {
        slidesPerView: 4,
        spaceBetween: 20,
        grabCursor: true,
      },
    },
  });

  return categoriesSwiper;
}

/**
 * Initialize Collection Swiper
 * Luxury horizontal scroll with smooth animations
 * Responsive: 1 slide (mobile), 2 (tablet), 3 (desktop)
 */
export function initCollectionSwiper() {
  const collectionSwiper = new Swiper('.collection .swiper-container', {
    modules: [Navigation, Pagination, Mousewheel],
    slidesPerView: 1.1,
    spaceBetween: 20,
    grabCursor: true,
    loop: true,
    mousewheel: {
      forceToAxis: true,
      invert: false,
    },
    navigation: {
      nextEl: '.collection .swiper-button-next',
      prevEl: '.collection .swiper-button-prev',
    },
    pagination: {
      el: '.collection .swiper-pagination',
      clickable: true,
      dynamicBullets: false,
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      480: {
        slidesPerView: 1.2,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
        grabCursor: true,
      },
      1024: {
        slidesPerView: 2.5,
        spaceBetween: 20,
        grabCursor: true,
      },
      1280: {
        slidesPerView: 3,
        spaceBetween: 24,
        grabCursor: true,
      },
    },
  });

  return collectionSwiper;
}

/**
 * Initialize Inspiration Row Swiper
 * Instagram-style horizontal gallery with smooth autoplay
 * Responsive: 1 slide (mobile), 1.5 (tablet), 2-3 (desktop)
 */
export function initInspirationSwiper() {
  const inspirationSwiper = new Swiper('.inspirations .swiper-container', {
    modules: [Navigation, Pagination, Mousewheel, Autoplay],
    slidesPerView: 1.1,
    spaceBetween: 16,
    grabCursor: true,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: true,
      pauseOnMouseEnter: true,
    },
    mousewheel: {
      forceToAxis: true,
      invert: false,
    },
    navigation: {
      nextEl: '.inspirations .swiper-button-next',
      prevEl: '.inspirations .swiper-button-prev',
    },
    pagination: {
      el: '.inspirations .swiper-pagination',
      clickable: true,
      dynamicBullets: true,
    },
    breakpoints: {
      320: {
        slidesPerView: 1.1,
        spaceBetween: 16,
        centeredSlides: false,
      },
      480: {
        slidesPerView: 1.3,
        spaceBetween: 16,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
        grabCursor: true,
      },
      1024: {
        slidesPerView: 2.5,
        spaceBetween: 20,
        grabCursor: true,
      },
      1280: {
        slidesPerView: 3,
        spaceBetween: 24,
        grabCursor: true,
      },
    },
  });

  return inspirationSwiper;
}

/**
 * Initialize all Swiper sliders
 * Centralizes slider initialization with error handling
 */
export function initAllSwipers() {
  const sliders = {};

  try {
    // Categories slider
    const categoriesEl = document.querySelector('.categories .swiper-container');
    if (categoriesEl) {
      sliders.categories = initCategoriesSwiper();
      console.info('[Swiper] Categories slider initialized');
    }
  } catch (err) {
    console.warn('[Swiper] Categories slider initialization failed:', err);
  }

  try {
    // Collection slider
    const collectionEl = document.querySelector('.collection .swiper-container');
    if (collectionEl) {
      sliders.collection = initCollectionSwiper();
      console.info('[Swiper] Collection slider initialized');
    }
  } catch (err) {
    console.warn('[Swiper] Collection slider initialization failed:', err);
  }

  try {
    // Inspiration slider
    const inspirationEl = document.querySelector('.inspirations .swiper-container');
    if (inspirationEl) {
      sliders.inspiration = initInspirationSwiper();
      console.info('[Swiper] Inspiration slider initialized');
    }
  } catch (err) {
    console.warn('[Swiper] Inspiration slider initialization failed:', err);
  }

  return sliders;
}

export default { initAllSwipers, initCategoriesSwiper, initCollectionSwiper, initInspirationSwiper };
