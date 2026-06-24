/**
 * API Service for DummyJSON Integration
 * Handles fetching furniture products from DummyJSON API
 */

const API_BASE_URL = 'https://dummyjson.com';

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Fetch all furniture-related products from multiple categories
 * @returns {Promise<Object>} Products data with products array
 */
export async function fetchFurnitureProducts() {
  try {
    const categories = ['furniture', 'home-decoration', 'kitchen-accessories'];

    const responses = await Promise.all(
      categories.map(cat =>
        fetch(`${API_BASE_URL}/products/category/${cat}?limit=100`)
          .then(r => {
            if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
            return r.json();
          })
      )
    );

    const allProducts = responses.flatMap(data => data.products || []);
    return { products: shuffleArray(allProducts) };
  } catch (error) {
    console.error('[API] Error fetching furniture products:', error);
    throw error;
  }
}

/**
 * Fetch a single product by ID
 * @param {number} productId - The product ID
 * @returns {Promise<Object>} Product data
 */
export async function fetchProductById(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[API] Error fetching product ${productId}:`, error);
    throw error;
  }
}

/**
 * Search products by query
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search results
 */
export async function searchProducts(query) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}&limit=20`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[API] Error searching products:', error);
    throw error;
  }
}

/**
 * Get product image URL (prefer thumbnail, fallback to first image)
 * @param {Object} product - Product object from API
 * @returns {string} Image URL
 */
export function getProductImage(product) {
  return product.thumbnail || (product.images && product.images[0]) || '';
}

/**
 * Format price from API to display format
 * @param {number} price - Price from API
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

/**
 * Format rating to display format
 * @param {number} rating - Rating from API
 * @returns {string} Formatted rating string
 */
export function formatRating(rating) {
  return `⭐ ${rating.toFixed(1)}`;
}

/**
 * Check if product is in stock
 * @param {Object} product - Product object from API
 * @returns {boolean} Whether product is in stock
 */
export function isInStock(product) {
  return product.stock > 0;
}