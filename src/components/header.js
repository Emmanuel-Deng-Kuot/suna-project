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
    
    // Configuration
    this.scrollThreshold = 10;
    this.activeClass = 'active';
    this.scrolledClass = 'scrolled';
    
    // Throttle scroll handler
    this.handleScroll = throttle(() => this._onScroll(), 100);
  }

  /**
   * Initialize header component
   */
  init() {
    if (!this.header) return;
    
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this._initNavigation();
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
   * Destroy component and remove listeners
   */
  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}

export default Header;