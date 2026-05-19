/**
 * Header Component
 * Handles: sticky header, active nav highlighting, smooth scrolling
 * Clean separation: DOM queries, state management, event delegation
 */

import { query, queryAll, addClass, removeClass, throttle } from '../js/utils.js';

class Header {
  constructor() {
    // DOM elements
    this.header = query('header');
    this.navLinks = queryAll('.navbar li a');
    this.sections = queryAll('main > section[id]');
    this.dropdownItems = queryAll('.navbar-item-dropdown');
    
    // Configuration
    this.scrollThreshold = 10;
    this.activeClass = 'active';
    this.scrolledClass = 'scrolled';
    this.dropdownOpenClass = 'open';
    
    // Throttle scroll handler
    this.handleScroll = throttle(() => this._onScroll(), 100);
    this.handleDocumentClick = (event) => this._handleDocumentClick(event);
    this.handleKeydown = (event) => this._handleKeydown(event);
    this.handleResize = throttle(() => this._closeDropdowns(), 100);
  }

  /**
   * Initialize header component
   */
  init() {
    if (!this.header) return;
    
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this._initNavigation();
    this._initDropdowns();
    this._onScroll(); // Run once on load
  }

  /**
   * Handle scroll events - update sticky state and active nav
   */
  _onScroll() {
    // Toggle sticky class
    const isScrolled = window.scrollY > this.scrollThreshold;
    if (isScrolled) {
      addClass(this.header, this.scrolledClass);
    } else {
      removeClass(this.header, this.scrolledClass);
    }

    // Update active nav link based on section in view
    this._highlightActiveNav();
  }

  /**
   * Highlight nav link for currently visible section
   */
  _highlightActiveNav() {
    if (!this.sections.length) return;

    let current = '';
    this.sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    this.navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const isActive = href === `#${current}`;
      
      if (isActive) {
        addClass(link, this.activeClass);
      } else {
        removeClass(link, this.activeClass);
      }
    });
  }

  /**
   * Initialize navigation smooth scrolling and click handling
   */
  _initNavigation() {
    this.navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = query(href);
          
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Update active immediately on click
            this.navLinks.forEach((l) => removeClass(l, this.activeClass));
            addClass(link, this.activeClass);
          }
        }
      });
    });
  }

  /**
   * Initialize navbar dropdown menus
   */
  _initDropdowns() {
    if (!this.dropdownItems.length) return;

    this.dropdownItems.forEach((item, index) => {
      const toggle = query('.navbar-toggle', item);
      const dropdown = query('.navbar-dropdown', item);

      if (!toggle || !dropdown) return;

      if (!dropdown.id) {
        dropdown.id = `navbar-dropdown-${index}`;
      }

      toggle.setAttribute('aria-controls', dropdown.id);
      toggle.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-hidden', 'true');

      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const shouldOpen = !item.classList.contains(this.dropdownOpenClass);
        if (shouldOpen) {
          this._closeDropdowns();
        }

        this._setDropdownState(item, shouldOpen);
      });

      item.addEventListener('mouseenter', () => {
        if (!this._isMobileViewport()) {
          this._setDropdownState(item, true);
        }
      });

      item.addEventListener('mouseleave', () => {
        if (!this._isMobileViewport()) {
          this._setDropdownState(item, false);
        }
      });

      item.addEventListener('focusin', () => {
        if (!this._isMobileViewport()) {
          this._setDropdownState(item, true);
        }
      });

      item.addEventListener('focusout', (event) => {
        if (!this._isMobileViewport() && !item.contains(event.relatedTarget)) {
          this._setDropdownState(item, false);
        }
      });

      queryAll('a', dropdown).forEach((link) => {
        link.addEventListener('click', () => {
          this._closeDropdowns();
        });
      });
    });

    document.addEventListener('click', this.handleDocumentClick);
    document.addEventListener('keydown', this.handleKeydown);
    window.addEventListener('resize', this.handleResize, { passive: true });
  }

  _isMobileViewport() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  _setDropdownState(item, isOpen) {
    const toggle = query('.navbar-toggle', item);
    const dropdown = query('.navbar-dropdown', item);

    if (!toggle || !dropdown) return;

    if (isOpen) {
      addClass(item, this.dropdownOpenClass);
      toggle.setAttribute('aria-expanded', 'true');
      dropdown.setAttribute('aria-hidden', 'false');
    } else {
      removeClass(item, this.dropdownOpenClass);
      toggle.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-hidden', 'true');
    }
  }

  _closeDropdowns() {
    this.dropdownItems.forEach((item) => {
      this._setDropdownState(item, false);
    });
  }

  _handleDocumentClick(event) {
    if (!event.target.closest('.navbar-item-dropdown')) {
      this._closeDropdowns();
    }
  }

  _handleKeydown(event) {
    if (event.key === 'Escape') {
      this._closeDropdowns();
    }
  }

  /**
   * Destroy component and remove listeners
   */
  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('keydown', this.handleKeydown);
  }
}

export default Header;