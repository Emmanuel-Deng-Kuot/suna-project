
import { query, queryAll, addClass, removeClass } from '../js/utils.js';
import gsap from 'gsap';
import { Swiper } from 'swiper';
import { Autoplay, EffectFade, Pagination, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateHeroSlide(heroElement) {
  const activeSlide = heroElement?.querySelector('.swiper-slide-active');
  if (!activeSlide) return;

  const content = activeSlide.querySelector('.hero-content');
  const background = activeSlide.querySelector('.hero-slide-bg');
  const contentPieces = content ? Array.from(content.children) : [];

  if (!contentPieces.length) return;

  if (prefersReducedMotion) {
    gsap.set([background, ...contentPieces], { autoAlpha: 1, opacity: 1, y: 0, scale: 1, clearProps: 'transform,opacity' });
    return;
  }

  gsap.killTweensOf([background, ...contentPieces]);
  gsap.set(contentPieces, { autoAlpha: 0, y: 18 });

  if (background) {
    gsap.set(background, { opacity: 0.92, transformOrigin: 'center center' });
  }

  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (background) {
    timeline.to(background, { opacity: 1, duration: 1.1, ease: 'power2.out' }, 0);
  }

  timeline.to(
    contentPieces,
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.1,
    },
    0.12
  );
}

/**
 * Dot-based slider (Hero, Inspiration)
 */
export class DotSlider {
  constructor(dotSelector, options = {}) {
    this.dots = queryAll(dotSelector);
    this.current = 0;
    this.autoPlayInterval = null;
    this.autoPlayDelay = options.autoPlayDelay || 4000;
    this.enabled = options.enabled !== false;
  }

  init() {
    if (!this.dots.length || !this.enabled) return;

    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this._goTo(index, true));
    });

    if (this.autoPlayDelay > 0) {
      this._startAutoPlay();
    }
  }

  /**
   * Navigate to specific dot
   */
  _goTo(index, stopAutoPlay = false) {
    removeClass(this.dots[this.current], 'active');
    this.current = (index + this.dots.length) % this.dots.length;
    addClass(this.dots[this.current], 'active');

    if (stopAutoPlay) {
      this._stopAutoPlay();
      this._startAutoPlay();
    }
  }

  /**
   * Start automatic progression
   */
  _startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this._goTo(this.current + 1);
    }, this.autoPlayDelay);
  }

  /**
   * Stop automatic progression
   */
  _stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  destroy() {
    this._stopAutoPlay();
  }
}

/**
 * Carousel with prev/next navigation
 */
export class Carousel {
  constructor(containerSelector, prevSelector, nextSelector) {
    this.container = query(containerSelector);
    this.prevBtn = query(prevSelector);
    this.nextBtn = query(nextSelector);
  }

  init() {
    if (!this.container || !this.prevBtn || !this.nextBtn) return;

    this.prevBtn.addEventListener('click', () => this._scroll(-1));
    this.nextBtn.addEventListener('click', () => this._scroll(1));
  }

  /**
   * Calculate card width with margins
   */
  _getCardWidth() {
    const card = query('.set-card', this.container);
    if (!card) return 320;
    
    const style = window.getComputedStyle(card);
    const margin = parseInt(style.marginRight || 0, 10);
    return card.offsetWidth + margin + 24;
  }

  /**
   * Scroll carousel
   */
  _scroll(direction) {
    const distance = this._getCardWidth() * direction;
    this.container.scrollBy({ left: distance, behavior: 'smooth' });
  }
}

/**
 * Draggable/touchable slider
 */
export class DraggableSlider {
  constructor(sliderSelector) {
    this.slider = query(sliderSelector);
    this.isDragging = false;
    this.startX = 0;
    this.dragThreshold = 50;
  }

  init() {
    if (!this.slider) return;

    // Mouse events
    this.slider.addEventListener('mousedown', (e) => this._onDragStart(e));
    this.slider.addEventListener('mousemove', (e) => this._onDragMove(e));
    this.slider.addEventListener('mouseup', () => this._onDragEnd());
    this.slider.addEventListener('mouseleave', () => this._onDragEnd());

    // Touch events
    this.slider.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: true });
    this.slider.addEventListener('touchend', (e) => this._onTouchEnd(e), { passive: true });
  }

  _onDragStart(e) {
    this.isDragging = true;
    this.startX = e.pageX - this.slider.scrollLeft;
    this.slider.style.cursor = 'grabbing';
  }

  _onDragMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.slider.scrollLeft = e.pageX - this.startX;
  }

  _onDragEnd() {
    this.isDragging = false;
    this.slider.style.cursor = 'grab';
  }

  _onTouchStart(e) {
    this.startX = e.touches[0].clientX;
  }

  _onTouchEnd(e) {
    const diff = this.startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > this.dragThreshold) {
      const distance = diff > 0 ? 320 : -320;
      this.slider.scrollBy({ left: distance, behavior: 'smooth' });
    }
  }
}

/**
 * Seamless auto-scrolling track
 */
export class AutoScrollingTrack {
  constructor(trackSelector, options = {}) {
    this.track = query(trackSelector);
    this.speed = options.speed || 0.28;
    this.rafId = null;
    this.lastTimestamp = 0;
    this.loopWidth = 0;
    this.originalWidth = 0;
    this.isPaused = false;
    this.isActive = false;
    this.resizeObserver = null;
    this.baseOffset = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartOffset = 0;
    this.isHovering = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init() {
    if (!this.track || this.reducedMotion) return;

    this._refreshTrack();
    this._applyTrackStyles();
    this._bindInteractions();

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this._refreshTrack());
      this.resizeObserver.observe(this.track);
    } else {
      window.addEventListener('resize', () => this._refreshTrack(), { passive: true });
    }

    this._resume();
  }

  _refreshTrack() {
    this._resetClones();
    this._duplicateContent();
    this._measure();
  }

  _resetClones() {
    queryAll('[data-track-clone="true"]', this.track).forEach((clone) => clone.remove());
  }

  _duplicateContent() {
    const originalItems = Array.from(this.track.children);

    if (!originalItems.length) {
      this.originalWidth = 0;
      return;
    }

    this.originalWidth = this.track.scrollWidth;
    const targetWidth = this.track.clientWidth + this.originalWidth;
    let currentWidth = this.originalWidth;

    while (currentWidth < targetWidth) {
      originalItems.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('data-track-clone', 'true');
        clone.setAttribute('aria-hidden', 'true');
        this.track.appendChild(clone);
      });

      currentWidth = this.track.scrollWidth;
    }
  }

  _applyTrackStyles() {
    this.track.style.willChange = 'transform';
    this.track.style.transform = 'translate3d(0, 0, 0)';
    this.track.style.userSelect = 'none';
    this.track.style.touchAction = 'pan-y';
    this.track.style.cursor = 'grab';
  }

  _measure() {
    this.loopWidth = this.originalWidth || this.track.scrollWidth;
    this.isActive = this.loopWidth > 0;

    if (!this.isActive) {
      this._pause();
      this.baseOffset = 0;
      this._applyTransform();
      return;
    }

    this.baseOffset = this._normalizeOffset(this.baseOffset);
    this._applyTransform();

    if (!this.rafId && !this.isPaused) {
      this._resume();
    }
  }

  _bindInteractions() {
    this.track.addEventListener('pointerenter', this._onPointerEnter);
    this.track.addEventListener('pointerleave', this._onPointerLeave);
    this.track.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('pointercancel', this._onPointerUp);
  }

  _normalizeOffset(offset) {
    if (!this.loopWidth) return 0;

    let normalized = offset % this.loopWidth;
    if (normalized < 0) {
      normalized += this.loopWidth;
    }

    return normalized;
  }

  _applyTransform() {
    const offset = this._normalizeOffset(this.baseOffset);
    this.baseOffset = offset;
    this.track.style.transform = `translate3d(${-offset}px, 0, 0)`;
  }

  _onPointerEnter = () => {
    this.isHovering = true;
    this._pause();
  };

  _onPointerLeave = () => {
    this.isHovering = false;

    if (!this.isDragging) {
      this._resume();
    }
  };

  _onPointerDown = (event) => {
    if (!this.isActive || event.button !== 0) return;

    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartOffset = this.baseOffset;
    this._pause();

    if (this.track.setPointerCapture) {
      this.track.setPointerCapture(event.pointerId);
    }
  };

  _onPointerMove = (event) => {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.dragStartX;
    this.baseOffset = this.dragStartOffset - deltaX;
    this._applyTransform();
  };

  _onPointerUp = () => {
    if (!this.isDragging) return;

    this.isDragging = false;

    if (!this.isHovering) {
      this._resume();
    }
  };

  _tick = (timestamp) => {
    if (!this.isActive || this.isPaused || this.isDragging) {
      this.rafId = null;
      this.lastTimestamp = 0;
      return;
    }

    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }

    const delta = timestamp - this.lastTimestamp;
    const distance = (this.speed * delta) / 16.666;
    this.baseOffset += distance;
    this._applyTransform();

    this.lastTimestamp = timestamp;
    this.rafId = window.requestAnimationFrame(this._tick);
  };

  _pause() {
    this.isPaused = true;

    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  _resume() {
    this.isPaused = false;

    if (!this.isActive || this.rafId) return;

    this.lastTimestamp = 0;
    this.rafId = window.requestAnimationFrame(this._tick);
  }

  destroy() {
    this._pause();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

/**
 * Initialize Hero Swiper with fade effect and autoplay
 */
export function initHeroSwiper() {
  const heroElement = query('#hero');
  const paginationEl = query('.swiper-pagination');
  
  if (!heroElement) {
    console.warn('[Slider] Hero element not found');
    return null;
  }

  // Initialize Swiper for hero section
  const heroSwiper = new Swiper('#hero', {
    modules: [EffectFade, Autoplay, Pagination],
    effect: 'fade',
    loop: true,
    autoplay: {
      delay: 4500,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    fadeEffect: {
      crossFade: true,
    },
    allowTouchMove: true,
    speed: 800,
  });

  animateHeroSlide(heroElement);

  const placePaginationInActiveContent = () => {
    if (!paginationEl) return;

    const activeContent = heroElement.querySelector('.swiper-slide-active .hero-content');
    if (!activeContent) return;

    if (paginationEl.parentElement !== activeContent) {
      activeContent.appendChild(paginationEl);
    }
  };

  placePaginationInActiveContent();
  heroSwiper.on('init', placePaginationInActiveContent);
  heroSwiper.on('slideChangeTransitionEnd', placePaginationInActiveContent);
  heroSwiper.on('resize', placePaginationInActiveContent);
  heroSwiper.on('slideChangeTransitionEnd', () => animateHeroSlide(heroElement));

  return heroSwiper;
}

/**
 * Initialize Category Swiper with responsive breakpoints
 */
export function initCategorySwiper() {
  const categoryElement = query('#categories .cards');

  if (!categoryElement) {
    console.warn('[Slider] Categories element not found');
    return null;
  }

  const categorySwiper = new Swiper(categoryElement, {
    modules: [FreeMode],
    slidesPerView: 1.2,
    spaceBetween: 16,
    freeMode: true,
    watchSlidesProgress: true,
    grabCursor: true,
    breakpoints: {
      320: {
        slidesPerView: 1.05,
        spaceBetween: 12,
      },
      640: {
        slidesPerView: 1.3,
        spaceBetween: 14,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 16,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
      1280: {
        slidesPerView: 3.5,
        spaceBetween: 24,
      },
    },
  });

  return categorySwiper;
}

/**
 * Initialize Inspiration Swiper with cinematic feel
 */
export function initInspirationSwiper() {
  const inspirationElement = query('#inspirations .inspiration-row');

  if (!inspirationElement) {
    console.warn('[Slider] Inspiration section not found');
    return null;
  }

  const inspirationSwiper = new Swiper(inspirationElement, {
    modules: [FreeMode],
    slidesPerView: 1.1,
    spaceBetween: 12,
    freeMode: true,
    watchSlidesProgress: true,
    grabCursor: true,
    speed: 600,
    breakpoints: {
      320: {
        slidesPerView: 1.05,
        spaceBetween: 10,
      },
      480: {
        slidesPerView: 1.2,
        spaceBetween: 12,
      },
      640: {
        slidesPerView: 1.5,
        spaceBetween: 12,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 14,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 16,
      },
      1280: {
        slidesPerView: 4,
        spaceBetween: 20,
      },
    },
  });

  return inspirationSwiper;
}

/**
 * Initialize Testimonials Swiper with responsive breakpoints
 */
export function initTestimonialsSwiper() {
  const testimonialsElement = query('.testimonials-slider');

  if (!testimonialsElement) {
    console.warn('[Slider] Testimonials element not found');
    return null;
  }

  const testimonialsSwiper = new Swiper(testimonialsElement, {
    modules: [FreeMode],
    slidesPerView: 1,
    spaceBetween: 16,
    freeMode: true,
    watchSlidesProgress: true,
    grabCursor: true,
    speed: 600,
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 12,
      },
      640: {
        slidesPerView: 1.2,
        spaceBetween: 14,
      },
      768: {
        slidesPerView: 1.5,
        spaceBetween: 16,
      },
      1024: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
    },
  });

  return testimonialsSwiper;
}

/**
 * Factory function to initialize all sliders
 */
export function initAllSliders() {
  // Hero Swiper (fade effect with autoplay)
  const heroSwiper = initHeroSwiper();

  // Collection carousel
  const collectionCarousel = new Carousel('.collection-cards', '.collection .btn-prev', '.collection .btn-next');
  collectionCarousel.init();

  // Testimonials Swiper
  const testimonialsSwiper = initTestimonialsSwiper();

  // Inspiration dots
  const inspirationDots = new DotSlider('.inspiration-wrapper .carousel-pagination-dots span', { autoPlayDelay: 3500 });
  inspirationDots.init();

  // Feature tracks marquee
  const featureTracks = new AutoScrollingTrack('.features-carousel', { speed: 0.8 });
  featureTracks.init();

  // Brand logos marquee
  const brandTracks = new AutoScrollingTrack('.brand-wrapper', { speed: 0.8 });
  brandTracks.init();

  // Category cards Swiper
  const categorySwiper = initCategorySwiper();

  // Inspiration cards Swiper
  const inspirationSwiper = initInspirationSwiper();

  return { heroSwiper, collectionCarousel, testimonialsSwiper, inspirationDots, featureTracks, brandTracks, categorySwiper, inspirationSwiper };
}

export default DotSlider;