/**
 * Tabs Component
 * Reusable tab system for product filtering
 * Clean separation of tab logic and product filtering
 */

import { query, queryAll, addClass, removeClass } from '../js/utils.js';

class Tabs {
  constructor(tabContainerSelector, tabItemSelector, targetSelector, tabMap = {}) {
    this.tabContainer = query(tabContainerSelector);
    this.tabItems = queryAll(tabItemSelector);
    this.targetElements = queryAll(targetSelector);
    this.tabMap = tabMap;
    this.activeClass = 'active';
    this.hiddenClass = 'tab-hidden';
    this.visibleClass = 'tab-visible';
  }

  /**
   * Initialize tabs component
   */
  init() {
    if (!this.tabContainer || !this.tabItems.length) return;

    // Attach click handlers to all tabs
    this.tabItems.forEach((tab) => {
      tab.addEventListener('click', () => this._activateTab(tab));
    });

    // Set first tab active on load
    if (this.tabItems[0]) {
      this._activateTab(this.tabItems[0]);
    }
  }

  /**
   * Activate a specific tab
   */
  _activateTab(tabElement) {
    // Update active tab styling
    this.tabItems.forEach((tab) => removeClass(tab, this.activeClass));
    addClass(tabElement, this.activeClass);

    // Get the tab key from map or element text
    const label = tabElement.textContent.trim();
    const tabKey = this.tabMap[label] || label.toLowerCase().replace(/\s+/g, '-');

    // Filter target elements
    this._filterElements(tabKey);
  }

  /**
   * Filter elements based on tab key
   */
  _filterElements(tabKey) {
    if (!this.targetElements.length) return;

    // Check if any elements have data-tab attribute
    const hasTabData = this.targetElements.some((el) => el.dataset.tab);

    this.targetElements.forEach((element) => {
      const elementTab = element.dataset.tab;

      // If no data-tab attributes exist, show everything
      if (!hasTabData) {
        element.style.display = '';
        return;
      }

      // Show element if it matches the tab or has no tab restriction
      const shouldShow = !elementTab || elementTab === tabKey;

      if (shouldShow) {
        element.style.display = '';
        addClass(element, this.visibleClass);
        removeClass(element, this.hiddenClass);
      } else {
        element.style.display = 'none';
        addClass(element, this.hiddenClass);
        removeClass(element, this.visibleClass);
      }
    });
  }

  /**
   * Get currently active tab
   */
  getActiveTab() {
    return query(`.${this.activeClass}`, this.tabContainer);
  }

  /**
   * Destroy component and remove listeners
   */
  destroy() {
    // Could add cleanup logic here if needed
  }
}

/**
 * Factory function to initialize best seller tabs
 */
export function initBestSellerTabs() {
  const tabMap = {
    'Best Seller': 'best-seller',
    'New Arrivals': 'new-arrivals',
    'Hot Items': 'hot-items',
  };

  const tabs = new Tabs(
    '.best-seller .tabs',
    '.best-seller .tabs span',
    '.best-seller .products-row .product-card',
    tabMap
  );

  tabs.init();
  return tabs;
}

export default Tabs;