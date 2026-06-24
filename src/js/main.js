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
import { fetchFurnitureProducts } from './api.js';
import { renderProducts, showLoading, showError } from './product-renderer.js';

/**
 * Populate collection cards with API product data
 */
function renderCollectionCards(products) {
  const cards = document.querySelectorAll('.collection-cards .set-card');
  cards.forEach((card, i) => {
    const product = products[i % products.length];
    if (!product) return;

    const mainImg = card.querySelector('.set-image > img');
    const title = card.querySelector('.set-info h3');
    const price = card.querySelector('.product-price');
    const rating = card.querySelector('.rating');
    const variantImgs = card.querySelectorAll('.variants img');

    if (mainImg) {
      mainImg.src = product.thumbnail;
      mainImg.alt = product.title;
    }
    if (title) title.textContent = product.title;
    if (price) price.textContent = `$${product.price.toFixed(2)}`;
    if (rating) {
      rating.innerHTML = `⭐ ${product.rating.toFixed(1)} <span>(${product.reviews?.length || 0} Review)</span>`;
    }
    variantImgs.forEach((vImg, vi) => {
      vImg.src = product.images?.[vi] || product.thumbnail;
      vImg.alt = `${product.title} variant ${vi + 1}`;
    });
  });
}

/**
 * Replace features scroll bar images with product thumbnails
 */
function renderFeaturesScroll(products) {
  const featureImgs = document.querySelectorAll('.features-carousel .feature img');
  featureImgs.forEach((img, i) => {
    const product = products[i % products.length];
    if (product) {
      img.src = product.thumbnail;
      img.alt = product.title;
    }
  });
}

/**
 * Replace Inside the Design section images with product images
 */
function renderInsideDesign(products) {
  const designImg = document.querySelector('.design-image img');
  if (designImg && products[1]) {
    designImg.src = products[1].images?.[0] || products[1].thumbnail;
    designImg.alt = products[1].title;
  }

  const designItems = document.querySelectorAll('.design-item img');
  designItems.forEach((img, i) => {
    const product = products[i + 2] || products[0];
    if (product) {
      img.src = product.thumbnail;
      img.alt = product.title;
    }
  });
}

/**
 * Update the inspiration section product popup with first product
 */
function renderInspirationPopup(products) {
  const popup = document.querySelector('.product-popup');
  if (!popup || !products[0]) return;

  const img = popup.querySelector('img');
  const title = popup.querySelector('h4');
  const price = popup.querySelector('p');

  if (img) {
    img.src = products[0].thumbnail;
    img.alt = products[0].title;
  }
  if (title) title.textContent = products[0].title;
  if (price) price.textContent = `$${products[0].price.toFixed(2)}`;
}

/**
 * Replace story card images with product thumbnails
 */
function renderStories(products) {
  const storyImgs = document.querySelectorAll('.story-card .image-box img');
  storyImgs.forEach((img, i) => {
    const product = products[i % products.length];
    if (product) {
      img.src = product.thumbnail;
      img.alt = product.title;
    }
  });
}

/**
 * Replace category card images with product thumbnails
 */
function renderCategories(products) {
  const categoryImgs = document.querySelectorAll('.category-card img');
  categoryImgs.forEach((img, i) => {
    const product = products[i % products.length];
    if (product) {
      img.src = product.thumbnail;
      img.alt = product.title;
    }
  });
}

/**
 * Replace home layout card images with product thumbnails
 */
function renderHomeLayout(products) {
  const homeCards = document.querySelectorAll('.home-card img');
  homeCards.forEach((img, i) => {
    const product = products[i % products.length];
    if (product) {
      img.src = product.thumbnail;
      img.alt = product.title;
    }
  });
}

/**
 * Replace inspiration wrapper main image with product image
 */
function renderInspirationWrapper(products) {
  const wrapperImg = document.querySelector('.inspiration-wrapper > img');
  if (!wrapperImg || !products[0]) return;

  const product = products[Math.floor(Math.random() * products.length)];
  wrapperImg.src = product.images?.[0] || product.thumbnail;
  wrapperImg.alt = product.title;
}

/**
 * Replace material grid card images with product thumbnails
 */
function renderMaterialGrid(products) {
  const materialImgs = document.querySelectorAll('.material-card img');
  materialImgs.forEach((img, i) => {
    const product = products[i % products.length];
    if (product) {
      img.src = product.thumbnail;
      img.alt = product.title;
    }
  });
}

/**
 * Replace inspiration swiper (bottom) card images with product thumbnails
 */
function renderInspirationSwiper(products) {
  const swiperImgs = document.querySelectorAll('.inspiration-row .inspiration-card img:first-child');
  swiperImgs.forEach((img, i) => {
    const product = products[i % products.length];
    if (product) {
      img.src = product.thumbnail;
      img.alt = product.title;
    }
  });
}

/**
 * Load products from API and render them
 */
async function loadProducts() {
  const productGridSelector = '.products .product-grid';
  const bestSellerSelector = '.best-seller .products-row';

  showLoading(productGridSelector);
  showLoading(bestSellerSelector);

  try {
    const data = await fetchFurnitureProducts();
    const products = data.products || [];

    if (products.length === 0) {
      showError(productGridSelector, 'No products found');
      showError(bestSellerSelector, 'No products found');
      return;
    }

    // Hero slides
    document.querySelectorAll('.hero-slide-bg').forEach((img, i) => {
      if (products[i]) img.src = products[i].thumbnail || products[i].images[0];
    });

    // Main product grid (16 products)
    renderProducts(products, productGridSelector, 'product-card', 16);

    // Best seller section (8 products)
    renderProducts(products.slice(16, 24), bestSellerSelector, 'image-box', 8);

    // Collection cards
    renderCollectionCards(products);

    // Features scroll bar
    renderFeaturesScroll(products);

    // Inside the Design section
    renderInsideDesign(products);

    // Inspiration popup
    renderInspirationPopup(products);

    // Stories section
    renderStories(products);

    // Category cards
    renderCategories(products);

    // Home layout cards
    renderHomeLayout(products);

    // Inspiration wrapper main image
    renderInspirationWrapper(products);

    // Material grid
    renderMaterialGrid(products);

    // Inspiration swiper (bottom)
    renderInspirationSwiper(products);

    console.info(`[API] Loaded ${products.length} furniture products`);
  } catch (error) {
    console.error('[API] Failed to load products:', error);
    showError(productGridSelector);
    showError(bestSellerSelector);
  }
}

/**
 * Initialize all components
 */
function initializeApp() {
  console.info('[App] Initializing components...');

  const header = new Header();
  header.init();

  const mobileMenu = new MobileMenu({
    mobileBreakpoint: 768,
  });
  mobileMenu.init();

  const sliders = initAllSliders();

  initCustomSelects();
  const dropdowns = initAllDropdowns();

  const components = { header, mobileMenu, sliders, dropdowns };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const tabs = initBestSellerTabs();
      components.tabs = tabs;

      const countdown = new Countdown({
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      countdown.init();
      components.countdown = countdown;

      const productCountdowns = initProductCountdowns();
      components.productCountdowns = productCountdowns;

      const animations = initAllAnimations();
      components.animations = animations;

      loadProducts();

      initFooterAccordion();

      initHomeRooms();

      console.info('[App] Deferred components initialized');
    });
  } else {
    setTimeout(() => {
      const tabs = initBestSellerTabs();
      components.tabs = tabs;

      const countdown = new Countdown({
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      countdown.init();
      components.countdown = countdown;

      const productCountdowns = initProductCountdowns();
      components.productCountdowns = productCountdowns;

      initFooterAccordion();

      initHomeRooms();

      const animations = initAllAnimations();
      components.animations = animations;

      loadProducts();
    }, 1000);
  }

  console.info('[App] Critical components initialized, deferring non-critical components');

  return components;
}

/**
 * Start app when DOM is ready
 */
onReady(() => {
  const app = initializeApp();

  if (import.meta.env.DEV) {
    window.__SUNA_APP__ = app;
    console.info('[App] App instance available as window.__SUNA_APP__');
  }
});