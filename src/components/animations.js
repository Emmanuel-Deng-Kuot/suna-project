
import { query, queryAll, addClass, removeClass } from '../js/utils.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEase = 'power3.out';
const buttonEase = 'power2.out';
const textRevealEase = 'power4.out';

function collectElements(selectors) {
  return selectors.flatMap((selector) => queryAll(selector)).filter(Boolean);
}

function collectScopedElements(scope, selectors) {
  return selectors.flatMap((selector) => queryAll(selector, scope)).filter(Boolean);
}

function isInInitialViewport(element, threshold = 0.15) {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  return rect.top < viewportHeight * (1 - threshold) && rect.bottom > 0;
}

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
    this.yOffset = options.yOffset || 28;
    this.duration = options.duration || 0.9;
  }

  init() {
    const elements = collectElements(this.selectors);

    if (!elements.length) return;

    // Disabled scroll reveal - set elements to visible immediately
    gsap.set(elements, { autoAlpha: 1, y: 0, clearProps: 'transform,opacity' });
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
 * Shopping Cart Management
 */
export class ShoppingCart {
  constructor() {
    this.items = [];
    this.cartCountEl = query('#cart-count');
    this.loadCart();
  }

  loadCart() {
    const stored = localStorage.getItem('suna-cart');
    if (stored) {
      try {
        this.items = JSON.parse(stored);
      } catch (e) {
        this.items = [];
      }
    }
    this.updateUI();
  }

  addItem(product) {
    const { name, price, image } = product;
    const existingItem = this.items.find((item) => item.name === name);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({ name, price, image, quantity: 1, id: Date.now() });
    }

    this.saveCart();
    this.updateUI();
    console.log(`[Cart] Added: ${name} (Total items: ${this.getTotalCount()})`);
  }

  saveCart() {
    localStorage.setItem('suna-cart', JSON.stringify(this.items));
  }

  updateUI() {
    const count = this.getTotalCount();
    if (this.cartCountEl) {
      this.cartCountEl.textContent = count;
      this.cartCountEl.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getItems() {
    return this.items;
  }

  clear() {
    this.items = [];
    this.saveCart();
    this.updateUI();
  }
}

/**
 * Product Card Interactions
 */
export class ProductCardInteractions {
  constructor(cart) {
    this.cart = cart;
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
      const button = e.target.closest(this.cartSelector);
      if (button) {
        this._handleAddToCart(button);
      }
    });
  }

  _handleAddToCart(btn) {
    const card = btn.closest('.product-card, .set-card');
    if (!card) return;

    const name = query('h3, h4', card)?.textContent?.trim() || 'Product';
    const priceText = query('.product-price', card)?.textContent?.trim() || '$0';
    const imageEl = query('.product-image img, .set-image img, .image-box img', card);
    const image = imageEl?.src || '';

    // Add to cart
    if (this.cart) {
      this.cart.addItem({ name, price: priceText, image });
    }

    const originalText = btn.textContent;
    const originalBgColor = btn.style.backgroundColor;

    btn.textContent = '✓ Added!';
    btn.style.backgroundColor = '#4CAF50';
    btn.disabled = true;

    if (!prefersReducedMotion) {
      gsap.fromTo(
        btn,
        { scale: 1 },
        {
          scale: 1.04,
          duration: 0.18,
          ease: buttonEase,
          yoyo: true,
          repeat: 1,
          overwrite: 'auto',
        }
      );
    }

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.backgroundColor = originalBgColor;
      btn.disabled = false;
    }, 1500);
  }

  _initQuickView() {
    document.addEventListener('click', (e) => {
      const button = e.target.closest(this.quickViewSelector);
      if (button) {
        this._handleQuickView(button);
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
      const variant = e.target.closest(this.variantSelector);
      if (variant) {
        this._handleVariantClick(variant);
      }
    });
  }

  _handleVariantClick(variant) {
    const card = variant.closest('.product-card, .set-card');
    // Support several main image containers used across pages
    const mainImg = card?.querySelector('.product-image img, .set-image img, .image-box img');

    if (mainImg && variant.src) {
      // Disabled fade animation - immediate image switch
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

    if (!prefersReducedMotion) {
      gsap.fromTo(
        this.likeEl,
        { scale: 1 },
        {
          scale: 1.08,
          duration: 0.18,
          ease: buttonEase,
          yoyo: true,
          repeat: 1,
          overwrite: 'auto',
        }
      );
    }
  }
}

/**
 * Premium hover/tap interactions
 */
export class PremiumUIInteractions {
  constructor() {
    this.buttonSelector = [
      'button',
      '.view-all',
      '.view-alls',
      '.like-counter',
      '.tabs span',
      '.carousel-pagination-dots span',
    ].join(', ');
    this.cardSelector = [
      '.category-card',
      '.product-card',
      '.set-card',
      '.home-card',
      '.story-card',
      '.material-card',
      '.design-item',
      '.testimonial-card',
      '.inspiration-card',
      '.feature-items',
    ].join(', ');
  }

  init() {
    if (prefersReducedMotion) return;

    this._initButtons();
    this._initCards();
  }

  _initButtons() {
    queryAll(this.buttonSelector).forEach((button) => {
      button.style.transformOrigin = 'center center';

      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          y: -2,
          scale: 1.01,
          duration: 0.28,
          ease: buttonEase,
          overwrite: 'auto',
        });
      });

      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          y: 0,
          scale: 1,
          duration: 0.32,
          ease: buttonEase,
          overwrite: 'auto',
        });
      });

      button.addEventListener('focus', () => {
        gsap.to(button, {
          y: -1,
          scale: 1.01,
          duration: 0.2,
          ease: buttonEase,
          overwrite: 'auto',
        });
      });

      button.addEventListener('blur', () => {
        gsap.to(button, {
          y: 0,
          scale: 1,
          duration: 0.24,
          ease: buttonEase,
          overwrite: 'auto',
        });
      });
    });
  }

  _initCards() {
    const supportsHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

    queryAll(this.cardSelector).forEach((card) => {
      const image = query('img', card);

      card.style.transformOrigin = 'center center';
      card.style.willChange = 'transform';
      card.style.backfaceVisibility = 'hidden';

      if (image) {
        image.style.transformOrigin = 'center center';
        image.style.willChange = 'transform';
        image.style.backfaceVisibility = 'hidden';
      }

      const enter = (e) => {
        if (e && e.pointerType && e.pointerType !== 'mouse') return;
        gsap.killTweensOf(card);
        gsap.to(card, {
          y: -6,
          duration: 0.36,
          ease: 'power3.out',
          overwrite: 'auto',
        });

        if (image) {
          gsap.killTweensOf(image);
          gsap.to(image, {
            y: -8,
            scale: 1.04,
            duration: 0.6,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        }
      };

      const leave = (e) => {
        if (e && e.pointerType && e.pointerType !== 'mouse') return;
        gsap.killTweensOf(card);
        gsap.to(card, {
          y: 0,
          duration: 0.45,
          ease: 'power3.out',
          overwrite: 'auto',
        });

        if (image) {
          gsap.killTweensOf(image);
          gsap.to(image, {
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'power4.out',
            overwrite: 'auto',
          });
        }
      };

      if (supportsHover) {
        card.addEventListener('pointerenter', enter);
        card.addEventListener('pointerleave', leave);
        card.addEventListener('focus', (e) => {
          // keyboard focus should also show a subtle lift
          gsap.killTweensOf(card);
          gsap.to(card, { y: -3, duration: 0.28, ease: buttonEase, overwrite: 'auto' });

          if (image) {
            gsap.killTweensOf(image);
            gsap.to(image, { y: -4, scale: 1.02, duration: 0.32, ease: buttonEase, overwrite: 'auto' });
          }
        });
        card.addEventListener('blur', leave);
      }
    });
  }
}

/**
 * Premium text reveal timelines
 */
export class TextReveal {
  constructor(groups = []) {
    this.groups = groups;
  }

  init() {
    if (!this.groups.length) return;

    // Disabled text reveal - set all elements to visible immediately
    this.groups.forEach(({ scope, selectors = [] }) => {
      queryAll(scope).forEach((container) => {
        const elements = collectScopedElements(container, selectors);
        gsap.set(elements, { opacity: 1, y: 0, clearProps: 'transform,opacity' });
      });
    });
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

    if (!prefersReducedMotion) {
      gsap.fromTo(
        btn,
        { scale: 1 },
        {
          scale: 1.04,
          duration: 0.18,
          ease: buttonEase,
          yoyo: true,
          repeat: 1,
          overwrite: 'auto',
        }
      );
    }

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

  const textReveal = new TextReveal([
    {
      scope: '.hero',
      selectors: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'button', '.hero-content .subtext', '.hero-content .label'],
      start: 'top 78%',
      y: 60,
      duration: 1.05,
      stagger: 0.14,
      ease: 'power3.out',
    },
    {
      scope: '.hero, .categories, .products, .inspiration, .materials, .stories, .collection, .testimonials, .faq, .footer, .highlight, .features, .home-card, .story-card, .material-card, .design-item, .testimonial-card, .category-card, .product-card, .set-card',
      selectors: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '.product-badge', '.card-footer span', '.category-card__overlay h3', '.category-card__overlay p'],
      start: 'top 86%',
      y: 44,
      duration: 0.95,
      stagger: 0.1,
      ease: textRevealEase,
    },
    {
      scope: '.categories, .products, .inspiration, .materials, .stories, .collection, .testimonials, .faq, .footer, .highlight, .features, .home-card, .story-card, .material-card, .design-item, .testimonial-card, .category-card, .product-card, .set-card',
      selectors: ['p', '.section-subtitle', '.materials-subtitle', '.tags', '.product-category', '.product-price', '.rating', '.faq-question span', '.faq-answer', '.footer-top .contact-item p', '.footer-left p', '.footer-links a', '.footer-bottom p', '.hover-actions button', '.product-info > *', '.set-info > *', '.category-card__overlay h3', '.category-card__overlay p', '.card-footer span'],
      start: 'top 86%',
      y: 28,
      duration: 0.85,
      stagger: 0.08,
      ease: textRevealEase,
    },
    {
      scope: '.collection-left',
      selectors: ['p', '.nav-buttons button'],
      start: 'top 82%',
      y: 54,
      duration: 0.95,
      stagger: 0.14,
      ease: 'power3.out',
    },
    {
      scope: '.product-card, .set-card',
      selectors: ['.product-info > *', '.set-info > *', '.hover-actions button'],
      start: 'top 84%',
      y: 32,
      duration: 0.8,
      stagger: 0.08,
      ease: textRevealEase,
    },
    {
      scope: '.category-card',
      selectors: ['.category-card__overlay h3', '.category-card__overlay p'],
      start: 'top 84%',
      y: 32,
      duration: 0.8,
      stagger: 0.1,
      ease: textRevealEase,
    },
    {
      scope: '.testimonial-card',
      selectors: ['.user span', '.stars', '.review', '.product span'],
      start: 'top 84%',
      y: 34,
      duration: 0.85,
      stagger: 0.1,
      ease: textRevealEase,
    },
    {
      scope: '.faq-left, .faq-item',
      selectors: ['p', '.faq-question span', '.faq-answer'],
      start: 'top 84%',
      y: 38,
      duration: 0.85,
      stagger: 0.12,
      ease: textRevealEase,
    },
    {
      scope: '.footer',
      selectors: [
        '.footer-top .contact-item p',
        '.footer-left p',
        '.footer-left .subscribe-box',
        '.footer-links a',
        '.footer-links .socials img',
        '.footer-bottom p',
        '.footer-bottom .payments img',
        '.footer-watermark',
      ],
      start: 'top 88%',
      y: 30,
      duration: 0.85,
      stagger: 0.08,
      ease: textRevealEase,
    },
  ]);
  textReveal.init();

  const premiumUI = new PremiumUIInteractions();
  premiumUI.init();

  // Shopping cart
  const cart = new ShoppingCart();

  // Lazy loading
  const lazyLoad = new LazyLoadImages();
  lazyLoad.init();

  // FAQ
  const faq = new FAQAccordion();
  faq.init();

  // Product interactions
  const products = new ProductCardInteractions(cart);
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

  if (!prefersReducedMotion) {
    window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }

  return { scrollReveal, textReveal, premiumUI, cart, lazyLoad, faq, products, wishlist, subscribe, inspirationPopups };
}

export default ScrollReveal;