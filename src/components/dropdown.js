

import { query, queryAll, addClass, removeClass, setSession, getSession } from '../js/utils.js';

class Selector {
  constructor(selectSelector, options = {}) {
    this.select = query(selectSelector);
    this.storageKey = options.storageKey || null;
    this.onChange = options.onChange || null;
  }

  init() {
    if (!this.select) return;

    // Restore saved value
    if (this.storageKey) {
      const saved = getSession(this.storageKey);
      if (saved) {
        this._setValue(saved);
      }
    }

    // Listen for changes
    this.select.addEventListener('change', () => this._handleChange());
  }

  _setValue(value) {
    const options = queryAll('option', this.select);
    options.forEach((opt) => {
      opt.selected = opt.value === value || opt.textContent === value;
    });
  }

  _handleChange() {
    const selected = this.select.value || this.select.options[this.select.selectedIndex]?.textContent;

    if (this.storageKey) {
      setSession(this.storageKey, selected);
    }

    if (this.onChange) {
      this.onChange(selected);
    }
  }
}

/**
 * Search focus handler
 */
class SearchBox {
  constructor(wrapperSelector) {
    this.wrapper = query(wrapperSelector);
    this.input = this.wrapper && query('input[type="text"]', this.wrapper);
    this.select = this.wrapper && query('select', this.wrapper);
  }

  init() {
    if (!this.wrapper || !this.input) return;

    this.input.addEventListener('focus', () => addClass(this.wrapper, 'focused'));
    this.input.addEventListener('blur', () => removeClass(this.wrapper, 'focused'));

    // Handle Enter key
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._handleSearch();
      }
    });
  }

  _handleSearch() {
    const query = this.input.value.trim();
    const category = this.select ? this.select.value : 'All Categories';

    if (query) {
      // Dispatch custom event or trigger search
      const event = new CustomEvent('search', {
        detail: { query, category }
      });
      document.dispatchEvent(event);
    }
  }
}

/**
 * Tab list handler (for home section tabs)
 */
class TabList {
  constructor(containerSelector, itemSelector) {
    this.container = query(containerSelector);
    this.list = this.container && query('ul', this.container);
    this.items = queryAll(itemSelector);
    this.mobileQuery = window.matchMedia('(max-width: 767px)');
  }

  init() {
    if (!this.container || !this.items.length) return;

    this.items.forEach((item) => {
      item.addEventListener('click', () => {
        if (this.mobileQuery.matches && item.classList.contains('active') && this.list && !this.list.classList.contains('open')) {
          this.list.classList.add('open');
          return;
        }

        this._setActive(item);
      });
    });

    document.addEventListener('click', (event) => {
      if (!this.mobileQuery.matches) return;

      if (!this.container.contains(event.target)) {
        this.list && this.list.classList.remove('open');
      }
    });
  }

  _setActive(target) {
    this.items.forEach((item) => removeClass(item, 'active'));
    addClass(target, 'active');

    if (this.mobileQuery.matches && this.list) {
      this.list.classList.remove('open');
    }
  }
}

/**
 * Initialize all dropdown-related components
 */
export function initAllDropdowns() {
  // Search box
  const searchBox = new SearchBox('.search-wrapper');
  searchBox.init();

  // Language selector
  const languageSelector = new Selector('.language-selector', {
    storageKey: 'suna-lang',
    onChange: (lang) => {
      console.info(`[Language] Switched to: ${lang}`);
    }
  });
  languageSelector.init();

  // Currency selector
  const currencySelector = new Selector('.currency-selector', {
    storageKey: 'suna-currency',
    onChange: (currency) => {
      console.info(`[Currency] Switched to: ${currency}`);
    }
  });
  currencySelector.init();

  // Home section tabs
  const homeTabs = new TabList('.home-section .left-content', '.home-section .left-content ul li');
  homeTabs.init();

  return { searchBox, languageSelector, currencySelector, homeTabs };
}

export { Selector, SearchBox, TabList };
export default Selector;