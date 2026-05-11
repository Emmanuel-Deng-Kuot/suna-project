
import { query, queryAll, addClass, removeClass } from '../js/utils.js';
import { Swiper } from 'swiper';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

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
    this.speed = options.speed || 0.45;
    this.rafId = null;
    this.lastTimestamp = 0;
    this.loopWidth = 0;
    this.isPaused = false;
    this.isActive = false;
    this.resizeObserver = null;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init() {
    if (!this.track || this.reducedMotion) return;

    this._resetClones();
    this._duplicateContent();
    this._measure();

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this._measure());
      this.resizeObserver.observe(this.track);
    } else {
      window.addEventListener('resize', () => this._measure(), { passive: true });
    }

    this._resume();
  }

  _resetClones() {
    queryAll('[data-track-clone="true"]', this.track).forEach((clone) => clone.remove());
  }

  _duplicateContent() {
    const items = Array.from(this.track.children);

    items.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('data-track-clone', 'true');
      clone.setAttribute('aria-hidden', 'true');
      this.track.appendChild(clone);
    });
  }

  _measure() {
    this.loopWidth = this.track.scrollWidth / 2;
    this.isActive = this.loopWidth > this.track.clientWidth;

    if (!this.isActive) {
      this._pause();
      this.track.scrollLeft = 0;
      return;
    }

    if (!this.rafId && !this.isPaused) {
      this._resume();
    }
  }

  _tick = (timestamp) => {
    if (!this.isActive || this.isPaused) {
      this.rafId = null;
      this.lastTimestamp = 0;
      return;
    }

    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }

    const delta = timestamp - this.lastTimestamp;
    const distance = (this.speed * delta) / 16.666;
    this.track.scrollLeft += distance;

    if (this.track.scrollLeft >= this.loopWidth) {
      this.track.scrollLeft -= this.loopWidth;
    }

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

  return heroSwiper;
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

  // Testimonials draggable slider
  const testimonialsSlider = new DraggableSlider('.testimonials-slider');
  testimonialsSlider.init();

  // Inspiration dots
  const inspirationDots = new DotSlider('.inspiration-wrapper .carousel-pagination-dots span', { autoPlayDelay: 3500 });
  inspirationDots.init();

  // Feature tracks marquee
  const featureTracks = new AutoScrollingTrack('.features-carousel', { speed: 0.5 });
  featureTracks.init();

  return { heroSwiper, collectionCarousel, testimonialsSlider, inspirationDots, featureTracks };
}

export default DotSlider;