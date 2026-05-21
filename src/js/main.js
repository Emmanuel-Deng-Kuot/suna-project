
import '../styles/main.scss';
import Header from '../components/header.js';
import MobileMenu from '../components/mobile-menu.js';
import { initAllSliders } from '../components/slider.js';
import { initAllDropdowns } from '../components/dropdown.js';
import { initCustomSelects } from '../components/custom-select.js';
import { initBestSellerTabs } from '../components/tabs.js';
import Countdown from '../components/countdown.js';
import initProductCountdowns from './product-countdown.js';
import { initAllAnimations } from '../components/animations.js';
import initFooterAccordion from './footer-accordion.js';
import { initHomeRooms } from '../components/home-rooms.js';
import { onReady } from './utils.js';

/**
 * Initialize all components
 */
function initializeApp() {
  console.info('[App] Initializing components...');

  // 1. Header with navigation (CRITICAL - visible immediately)
  const header = new Header();
  header.init();

  // 2. Mobile menu (CRITICAL - user interaction)
  const mobileMenu = new MobileMenu({
    mobileBreakpoint: 768,
  });
  mobileMenu.init();

  // 3. Sliders (ABOVE-THE-FOLD - hero, carousel visible)
  const sliders = initAllSliders();

  // 4. Custom selects (language/currency) + dropdowns (CRITICAL - user interaction)
  initCustomSelects();
  const dropdowns = initAllDropdowns();

  // 5-7. Defer non-critical components to next frame
  const components = { header, mobileMenu, sliders, dropdowns };

  // Use requestIdleCallback for low-priority initialization
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Product tabs
      const tabs = initBestSellerTabs();
      components.tabs = tabs;

      // Countdown timer
      const countdown = new Countdown({
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      countdown.init();
      components.countdown = countdown;

      // Per-product countdowns (small red pill on product cards)
      const productCountdowns = initProductCountdowns();
      components.productCountdowns = productCountdowns;

      // Animations (scroll reveal, lazy load, FAQs, product interactions, etc.)
      const animations = initAllAnimations();
      components.animations = animations;

      // Footer accordion (mobile)
      initFooterAccordion();

      // Home section click-to-card interaction
      initHomeRooms();

      console.info('[App] Deferred components initialized');
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      const tabs = initBestSellerTabs();
      components.tabs = tabs;

      const countdown = new Countdown({
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      countdown.init();
      components.countdown = countdown;

      // Per-product countdowns should also run in the fallback path
      const productCountdowns = initProductCountdowns();
      components.productCountdowns = productCountdowns;

      // Keep footer accordion behavior consistent in fallback path
      initFooterAccordion();

      // Home section click-to-card interaction
      initHomeRooms();

      const animations = initAllAnimations();
      components.animations = animations;
    }, 1000);
  }

  console.info('[App] Critical components initialized, deferring non-critical components');

  // Return components for potential external access
  return components;
}

/**
 * Start app when DOM is ready
 */
onReady(() => {
  const app = initializeApp();
  
  // Make app instance available globally if needed for debugging
  if (import.meta.env.DEV) {
    window.__SUNA_APP__ = app;
    console.info('[App] App instance available as window.__SUNA_APP__');
  }
});