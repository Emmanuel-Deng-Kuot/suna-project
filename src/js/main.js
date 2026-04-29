
import '../styles/main.scss';
import Header from '../components/header.js';
import MobileMenu from '../components/mobile-menu.js';
import { initAllSliders } from '../components/slider.js';
import { initAllDropdowns } from '../components/dropdown.js';
import { initBestSellerTabs } from '../components/tabs.js';
import Countdown from '../components/countdown.js';
import { initAllAnimations } from '../components/animations.js';
import { onReady } from './utils.js';

/**
 * Initialize all components
 */
function initializeApp() {
  console.info('[App] Initializing components...');

  // 1. Header with navigation
  const header = new Header();
  header.init();

  // 2. Mobile menu
  const mobileMenu = new MobileMenu({
    mobileBreakpoint: 768,
  });
  mobileMenu.init();

  // 3. Sliders (hero, carousel, testimonials, inspiration)
  const sliders = initAllSliders();

  // 4. Dropdowns (search, language, currency, tabs)
  const dropdowns = initAllDropdowns();

  // 5. Product tabs
  const tabs = initBestSellerTabs();

  // 6. Countdown timer
  const countdown = new Countdown({
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  countdown.init();

  // 7. Animations (scroll reveal, lazy load, FAQs, product interactions, etc.)
  const animations = initAllAnimations();

  console.info('[App] All components initialized successfully!');

  // Return components for potential external access
  return {
    header,
    mobileMenu,
    sliders,
    dropdowns,
    tabs,
    countdown,
    animations,
  };
}

/**
 * Start app when DOM is ready
 */
onReady(() => {
  const app = initializeApp();
  
  // Make app instance available globally if needed for debugging
  if (process.env.NODE_ENV !== 'production') {
    window.__SUNA_APP__ = app;
    console.info('[App] App instance available as window.__SUNA_APP__');
  }
});