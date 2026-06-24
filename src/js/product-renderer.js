/**
 * Product Renderer
 * Generates HTML for product cards based on DummyJSON API data
 * Preserves existing styling, classes, and structure
 */

import { getProductImage, formatPrice, formatRating, isInStock } from './api.js';

/**
 * Generate HTML for a single product card
 * @param {Object} product - Product object from DummyJSON API
 * @param {string} cardType - Type of card ('product-card' or 'image-box' for best-seller)
 * @returns {string} HTML string for product card
 */
export function generateProductCard(product, cardType = 'product-card') {
  const image = getProductImage(product);
  const price = formatPrice(product.price);
  const rating = formatRating(product.rating);
  const inStock = isInStock(product);
  const category = product.category || 'Furniture';
  const title = product.title || 'Product';
  
  // Generate badge HTML based on product properties
  let badgeHtml = '';
  if (!inStock) {
    badgeHtml = '<span class="product-sold-out">Sold out</span>';
  } else if (product.rating >= 4.8) {
    badgeHtml = '<span class="product-badge">Best seller</span>';
  }
  
  // Generate variants (use product images if available)
  let variantsHtml = '';
  if (product.images && product.images.length > 1) {
    const variantImages = product.images.slice(0, 3);
    variantsHtml = '<div class="variants">';
    variantImages.forEach((img, index) => {
      variantsHtml += `<img src="${img}" alt="${title} variant ${index + 1}" loading="lazy">`;
    });
    variantsHtml += '</div>';
  }
  
  // Generate rating HTML
  const ratingHtml = `<div class="rating">${rating} <span>(${Math.floor(Math.random() * 1000) + 100} Review)</span></div>`;
  
  // Different HTML structure for best-seller section (uses image-box instead of product-image)
  if (cardType === 'image-box') {
    return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="image-box">
        ${badgeHtml}
        <img src="${image}" alt="${title}" loading="lazy">
        <div class="hover-actions">
          <button class="btn-quick-view">Quick View</button>
          <button class="btn-add-to-cart">Add to Cart</button>
        </div>
      </div>
      <p class="category">${category}</p>
      <h4>${title}</h4>
      <span class="product-price">${price}</span>
      ${variantsHtml}
      ${ratingHtml}
    </div>
    `;
  }
  
  // Standard product card structure
  return `
  <div class="product-card" data-product-id="${product.id}">
    <div class="product-image">
      ${badgeHtml}
      <img src="${image}" alt="${title}" loading="lazy">
      <div class="hover-actions">
        <button class="btn-quick-view">Quick View</button>
        <button class="btn-add-to-cart">Add to Cart</button>
      </div>
    </div>
    <div class="product-info">
      <p class="product-category">${category}</p>
      <h3>${title}</h3>
      <span class="product-price">${price}</span>
      ${variantsHtml}
      ${ratingHtml}
    </div>
  </div>
  `;
}

/**
 * Render products into a container
 * @param {Array} products - Array of product objects
 * @param {string} containerSelector - CSS selector for the container
 * @param {string} cardType - Type of card to render
 * @param {number} limit - Maximum number of products to render
 */
export function renderProducts(products, containerSelector, cardType = 'product-card', limit = null) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error(`[ProductRenderer] Container not found: ${containerSelector}`);
    return;
  }
  
  const productsToRender = limit ? products.slice(0, limit) : products;
  
  container.innerHTML = productsToRender.map(product => 
    generateProductCard(product, cardType)
  ).join('');
  
  console.log(`[ProductRenderer] Rendered ${productsToRender.length} products in ${containerSelector}`);
}

/**
 * Show loading state in a container
 * @param {string} containerSelector - CSS selector for the container
 */
export function showLoading(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  container.innerHTML = `
    <div class="loading-state" style="display: flex; justify-content: center; align-items: center; padding: 60px 20px; grid-column: 1 / -1;">
      <div style="text-align: center;">
        <div style="width: 40px; height: 40px; border: 3px solid #ddd; border-top-color: #C74F32; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
        <p style="color: #777; font-size: 14px;">Loading products...</p>
      </div>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
}

/**
 * Show error state in a container
 * @param {string} containerSelector - CSS selector for the container
 * @param {string} message - Error message to display
 */
export function showError(containerSelector, message = 'Failed to load products. Please try again later.') {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  container.innerHTML = `
    <div class="error-state" style="text-align: center; padding: 60px 20px; grid-column: 1 / -1;">
      <p style="color: #dc412d; font-size: 16px; margin-bottom: 12px;">${message}</p>
      <button onclick="window.location.reload()" style="padding: 12px 24px; background: #C74F32; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">Retry</button>
    </div>
  `;
}
