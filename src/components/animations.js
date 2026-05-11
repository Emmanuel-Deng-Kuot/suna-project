/**
 * Animations Component
 * Handles scroll reveal, lazy loading, FAQs, product interactions, etc.
 * Modular and reusable patterns with event delegation
 */

import { query, queryAll, addClass, removeClass } from '../js/utils.js';

/**
 * Scroll Reveal on intersection
 */
export class ScrollReveal {
  constructor(selectors = [], options = {}) {
    this.selectors = Array.isArray(selectors) ? selectors : [selectors];
    this.threshold = options.threshold || 0.1;
    this.rootMargin = options.rootMargin || '0px 0px -20px 0px';
    this.revealClass = options.revealClass || 'reveal';
    this.visibleClass = options.visibleClass || 'reveal-visible';
  }

  init() {
    const targets = this.selectors.join(', ');
    const elements = queryAll(targets);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            addClass(entry.target, this.visibleClass);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: this.threshold, rootMargin: this.rootMargin }
    );

    elements.forEach((el) => {
      addClass(el, this.revealClass);
      observer.observe(el);
    });
  }
}

/**
 * Lazy Loading Images
 */
export class LazyLoadImages {
  constructor(selector = 'img[loading="lazy"]') {
    this.selector = selector;
  }

  init() {
    const images = queryAll(this.selector);

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            addClass(entry.target, 'loaded');
            imageObserver.unobserve(entry.target);
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));
    } else {
      // Fallback for older browsers
      images.forEach((img) => addClass(img, 'loaded'));
    }
  }
}

/**
 * FAQ Accordion
 */
export class FAQAccordion {
  constructor(containerSelector = '.faq-item') {
    this.container = query(containerSelector);
    this.items = queryAll(containerSelector);
  }

  init() {
    this.items.forEach((item) => {
      const checkbox = query('input[type="checkbox"]', item);
      const answer = query('.faq-answer', item);

      if (!checkbox || !answer) return;

      // Initialize styles
      answer.style.overflow = 'hidden';
      answer.style.transition = 'max-height 0.35s ease';
      this._updateHeight(checkbox, answer);

      // Handle changes
      checkbox.addEventListener('change', () => {
        this._updateHeight(checkbox, answer);
      });
    });
  }

  _updateHeight(checkbox, answer) {
    if (checkbox.checked) {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    } else {
      answer.style.maxHeight = '0px';
    }
  }
}

/**
 * Product Card Interactions
 */
export class ProductCardInteractions {
  constructor() {
    this.cartSelector = '.btn-add-to-cart, .buy-btn';
    this.quickViewSelector = '.btn-quick-view';
    this.variantSelector = '.variants img';
  }

  init() {
    this._initCartButtons();
    this._initQuickView();
    this._initVariants();
  }

  _initCartButtons() {
    document.addEventListener('click', (e) => {
      if (e.target.matches(this.cartSelector)) {
        this._handleAddToCart(e.target);
      }
    });
  }

  _handleAddToCart(btn) {
    const originalText = btn.textContent;
    const originalBgColor = btn.style.backgroundColor;

    btn.textContent = '✓ Added!';
    btn.style.backgroundColor = '#4CAF50';
    btn.disabled = true;

    const card = btn.closest('.product-card, .set-card');
    if (card) {
      const name = query('h3, h4', card)?.textContent || 'Product';
      const price = query('.product-price', card)?.textContent || '';
      console.log(`[Cart] Added: ${name} - ${price}`);
    }

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.backgroundColor = originalBgColor;
      btn.disabled = false;
    }, 1500);
  }

  _initQuickView() {
    document.addEventListener('click', (e) => {
      if (e.target.matches(this.quickViewSelector)) {
        this._handleQuickView(e.target);
      }
    });
  }

  _handleQuickView(btn) {
    const card = btn.closest('.product-card, .set-card');
    if (card) {
      const name = query('h3, h4', card)?.textContent || 'Product';
      const price = query('.product-price', card)?.textContent || '';
      console.log(`[Quick View] ${name} - ${price}`);
      alert(`Quick View: ${name}\n${price}`);
    }
  }

  _initVariants() {
    document.addEventListener('click', (e) => {
      if (e.target.matches(this.variantSelector)) {
        this._handleVariantClick(e.target);
      }
    });
  }

  _handleVariantClick(variant) {
    const card = variant.closest('.product-card, .set-card');
    // Support several main image containers used across pages
    const mainImg = card?.querySelector('.product-image img, .set-image img, .image-box img');

    if (mainImg && variant.src) {
      mainImg.src = variant.src;

      // Remove selected from siblings
      const allVariants = queryAll('img', variant.parentElement);
      allVariants.forEach((img) => removeClass(img, 'selected'));
      addClass(variant, 'selected');
    }

    variant.style.cursor = 'pointer';
  }
}

/**
 * Wishlist Toggle
 */
export class Wishlist {
  constructor(selector = '.inspiration-wrapper .like-counter') {
    this.likeEl = query(selector);
    this.count = 5;
    this.liked = false;
  }

  init() {
    if (!this.likeEl) return;

    const countMatch = this.likeEl.textContent.match(/\d+/);
    if (countMatch) {
      this.count = parseInt(countMatch[0]);
    }

    this.likeEl.style.cursor = 'pointer';
    this.likeEl.addEventListener('click', () => this._toggle());
  }

  _toggle() {
    this.liked = !this.liked;
    this.count += this.liked ? 1 : -1;
    this.likeEl.innerHTML = `${this.liked ? '♥' : '♡'} ${this.count}`;
    this.likeEl.style.color = this.liked ? '#DC412D' : '';
  }
}

/**
 * Inspiration dot popup helper
 * Shows the shared `.product-popup` positioned next to the hovered/focused hotspot
 */
export class InspirationPopup {
  constructor(wrapperSelector = '.inspiration-wrapper') {
    this.wrapper = query(wrapperSelector);
    this.dots = this.wrapper ? Array.from(this.wrapper.querySelectorAll('.product-hotspot')) : [];
    this.popup = this.wrapper ? query('.product-popup', this.wrapper) : null;
  }

  init() {
    if (!this.wrapper || !this.popup || !this.dots.length) return;

    // Ensure popup is positioned absolute and inside wrapper
    this.popup.style.position = 'absolute';
    this.popup.style.left = '0px';
    this.popup.style.top = '0px';

    const imgEl = query('img', this.popup);
    const titleEl = this.popup.querySelector('h4');
    const descEl = this.popup.querySelector('p');

    const show = (dot) => {
      // Use data attributes if present
      const src = dot.dataset.img || (imgEl && imgEl.dataset.orig) || (imgEl && imgEl.src);
      const title = dot.dataset.title || (titleEl && titleEl.textContent) || '';
      const desc = dot.dataset.desc || (descEl && descEl.textContent) || '';

      if (imgEl && src) {
        if (!imgEl.dataset.orig) imgEl.dataset.orig = imgEl.src;
        imgEl.src = src;
      }
      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;

      // Position popup near dot (above the dot)
      const wrapperRect = this.wrapper.getBoundingClientRect();
      const dotRect = dot.getBoundingClientRect();

      // Ensure popup dimensions are measured
      this.popup.classList.add('visible');
      const popupRect = this.popup.getBoundingClientRect();

      const left = dotRect.left - wrapperRect.left + dotRect.width / 2 - popupRect.width / 2;
      const top = dotRect.top - wrapperRect.top - popupRect.height - 10;

      // clamp within wrapper
      const clampedLeft = Math.max(8, Math.min(left, wrapperRect.width - popupRect.width - 8));
      const clampedTop = Math.max(8, top);

      this.popup.style.left = clampedLeft + 'px';
      this.popup.style.top = clampedTop + 'px';
    };

    const hide = () => {
      this.popup.classList.remove('visible');
    };

    this.dots.forEach((dot) => {
      dot.addEventListener('mouseenter', () => show(dot));
      dot.addEventListener('mouseleave', hide);
      dot.addEventListener('focus', () => show(dot));
      dot.addEventListener('blur', hide);
    });

    // Hide popup on scroll/resize to avoid misplacement
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('resize', hide);
  }
}


/**
 * Subscribe Forms
 */
export class SubscribeForms {
  constructor(selector = '.subscribe-box') {
    this.selector = selector;
  }

  init() {
    // Use event delegation
    document.addEventListener('click', (e) => {
      const btn = e.target.closest(this.selector + ' button');
      if (btn) {
        this._handleSubscribe(btn);
      }
    });

    // Handle Enter key
    document.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.matches(this.selector + ' input[type="email"]')) {
        const box = e.target.closest(this.selector);
        const btn = query('button', box);
        if (btn) this._handleSubscribe(btn);
      }
    });
  }

  _handleSubscribe(btn) {
    const box = btn.closest(this.selector);
    const input = query('input[type="email"]', box);

    if (!input) return;

    const email = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      input.style.border = '1px solid red';
      setTimeout(() => {
        input.style.border = '';
      }, 2000);
      return;
    }

    console.log(`[Subscribe] Email: ${email}`);

    const originalText = btn.textContent;
    btn.textContent = '✓ Subscribed!';
    btn.disabled = true;
    input.value = '';

    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 3000);
  }
}

/**
 * Factory function to initialize all animations
 */
export function initAllAnimations() {
  // Scroll reveal
  const revealSelectors = [
    '.category-card',
    '.product-card',
    '.set-card',
    '.story-card',
    '.material-card',
    '.feature-items',
    '.testimonial-card',
    '.design-item',
    '.offer-content',
    '.home-card',
    '.faq-item',
    '.inspiration-card',
  ];
  const scrollReveal = new ScrollReveal(revealSelectors);
  scrollReveal.init();

  // Lazy loading
  const lazyLoad = new LazyLoadImages();
  lazyLoad.init();

  // FAQ
  const faq = new FAQAccordion();
  faq.init();

  // Product interactions
  const products = new ProductCardInteractions();
  products.init();

  // Wishlist
  const wishlist = new Wishlist();
  wishlist.init();

  // Subscribe forms
  const subscribe = new SubscribeForms();
  subscribe.init();

  // Inspiration dot popups
  const inspirationPopups = new InspirationPopup();
  inspirationPopups.init();

  return { scrollReveal, lazyLoad, faq, products, wishlist, subscribe, inspirationPopups };
}

export default ScrollReveal;