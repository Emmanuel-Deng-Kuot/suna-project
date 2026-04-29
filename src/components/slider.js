/**
 * Slider Component
 * Reusable slider/carousel logic with multiple implementations
 * Factory pattern for different slider types
 */

import { query, queryAll, addClass, removeClass } from '../js/utils.js';

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
 * Factory function to initialize all sliders
 */
export function initAllSliders() {
  // Hero dots
  const heroDots = new DotSlider('.hero .dots span', { autoPlayDelay: 4000 });
  heroDots.init();

  // Collection carousel
  const collectionCarousel = new Carousel('.collection-cards', '.collection .prev', '.collection .next');
  collectionCarousel.init();

  // Testimonials draggable slider
  const testimonialsSlider = new DraggableSlider('.testimonials-slider');
  testimonialsSlider.init();

  // Inspiration dots
  const inspirationDots = new DotSlider('.inspiration-wrapper .side-dots span', { autoPlayDelay: 3500 });
  inspirationDots.init();

  return { heroDots, collectionCarousel, testimonialsSlider, inspirationDots };
}

export default DotSlider;