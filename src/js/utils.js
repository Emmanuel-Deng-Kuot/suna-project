/**
 * Utility functions for common DOM and event operations
 * Promotes code reusability and clean separation
 */

/**
 * Query single element safely
 */
export const query = (selector, parent = document) => {
  return parent.querySelector(selector);
};

/**
 * Query multiple elements safely
 */
export const queryAll = (selector, parent = document) => {
  return Array.from(parent.querySelectorAll(selector));
};

/**
 * Add class to element
 */
export const addClass = (el, className) => {
  el && el.classList.add(className);
};

/**
 * Remove class from element
 */
export const removeClass = (el, className) => {
  el && el.classList.remove(className);
};

/**
 * Toggle class on element
 */
export const toggleClass = (el, className, force) => {
  el && el.classList.toggle(className, force);
};

/**
 * Check if element has class
 */
export const hasClass = (el, className) => {
  return el && el.classList.contains(className);
};

/**
 * Remove all active classes from a list and add to target
 */
export const setActive = (elements, target, className = 'active') => {
  queryAll(elements).forEach((el) => removeClass(el, className));
  addClass(target, className);
};

/**
 * Throttle function calls
 */
export const throttle = (func, delay = 100) => {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  };
};

/**
 * Debounce function calls
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Get computed numeric property value (e.g., width, margin)
 */
export const getNumericStyle = (el, prop) => {
  const value = window.getComputedStyle(el)[prop];
  return parseInt(value, 10) || 0;
};

/**
 * Store in sessionStorage
 */
export const setSession = (key, value) => {
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {
    console.warn('SessionStorage unavailable:', e);
  }
};

/**
 * Retrieve from sessionStorage
 */
export const getSession = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch (e) {
    console.warn('SessionStorage unavailable:', e);
    return null;
  }
};

/**
 * Initialize component when DOM is ready
 */
export const onReady = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};
