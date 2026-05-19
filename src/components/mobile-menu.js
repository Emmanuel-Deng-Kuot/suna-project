/**
 * Mobile Menu Component
 * Handles responsive navigation menu
 * Clean state management and event delegation
 */

import { query, queryAll, addClass, removeClass, toggleClass, hasClass } from '../js/utils.js';

class MobileMenu {
  constructor(options = {}) {
    // Configuration
    this.mobileBreakpoint = options.mobileBreakpoint || 768;
    this.navbarSelector = options.navbarSelector || '.navbar';
    this.topHeaderSelector = options.topHeaderSelector || '.top-header';
    this.headerIconsSelector = options.headerIconsSelector || '.header-icons';

    // DOM elements
    this.navbar = query(this.navbarSelector);
    this.topHeader = query(this.topHeaderSelector);
    this.headerIcons = query(this.headerIconsSelector);

    // State
    this.hamburger = null;
    this.overlay = null;
    this.isMenuOpen = false;
  }

  /**
   * Initialize mobile menu component
   */
  init() {
    if (!this.navbar || !this.topHeader) {
      console.warn('[MobileMenu] Required elements not found');
      return;
    }

    this._cleanup(); // Remove any existing menu elements
    this._create();
    this._attachListeners();
  }

  /**
   * Create hamburger button
   */
  _createHamburger() {
    const btn = document.createElement('button');
    btn.className = 'hamburger';
    btn.setAttribute('aria-label', 'Toggle navigation');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;
    return btn;
  }

  /**
   * Create overlay element
   */
  _createOverlay() {
    const overlayDiv = document.createElement('div');
    overlayDiv.className = 'nav-overlay';
    document.body.appendChild(overlayDiv);
    return overlayDiv;
  }

  /**
   * Create and insert menu elements
   */
  _create() {
    this.hamburger = this._createHamburger();
    this.overlay = this._createOverlay();

    // Insert hamburger before header icons
    if (this.headerIcons) {
      this.topHeader.insertBefore(this.hamburger, this.headerIcons);
    } else {
      this.topHeader.appendChild(this.hamburger);
    }
  }

  _moveHamburgerIntoMenu() {
    if (!this.hamburger || !this.navbar) return;

    if (this.hamburger.parentElement !== this.navbar) {
      this.navbar.insertBefore(this.hamburger, this.navbar.firstChild);
    }
  }

  _restoreHamburgerToHeader() {
    if (!this.hamburger || !this.topHeader) return;

    if (this.hamburger.parentElement !== this.topHeader) {
      if (this.headerIcons && this.headerIcons.parentElement === this.topHeader) {
        this.topHeader.insertBefore(this.hamburger, this.headerIcons);
      } else {
        this.topHeader.appendChild(this.hamburger);
      }
    }
  }

  /**
   * Attach event listeners
   */
  _attachListeners() {
    // Hamburger toggle
    this.hamburger.addEventListener('click', () => this._toggleMenu());

    // Overlay click to close
    this.overlay.addEventListener('click', () => this._closeMenu());

    // Close menu when nav link is clicked (mobile only), but keep dropdown toggles open
    queryAll('a, button', this.navbar).forEach((element) => {
      element.addEventListener('click', () => {
        if (window.innerWidth <= this.mobileBreakpoint && !element.classList.contains('navbar-toggle')) {
          this._closeMenu();
        }
      });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > this.mobileBreakpoint) {
        this._closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this._closeMenu();
      }
    });
  }

  /**
   * Open menu
   */
  _openMenu() {
    if (this.isMenuOpen) return;

    this._moveHamburgerIntoMenu();
    addClass(this.navbar, 'open');
    addClass(this.overlay, 'visible');
    addClass(this.hamburger, 'active');
    this.hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    this.isMenuOpen = true;
  }

  /**
   * Close menu
   */
  _closeMenu() {
    if (!this.isMenuOpen) return;

    removeClass(this.navbar, 'open');
    removeClass(this.overlay, 'visible');
    removeClass(this.hamburger, 'active');
    this.hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    this._restoreHamburgerToHeader();

    this.isMenuOpen = false;
  }

  /**
   * Toggle menu
   */
  _toggleMenu() {
    if (this.isMenuOpen) {
      this._closeMenu();
    } else {
      this._openMenu();
    }
  }

  /**
   * Clean up existing menu elements
   */
  _cleanup() {
    const existingHamburger = query('.hamburger');
    const existingOverlay = query('.nav-overlay');

    if (existingHamburger) existingHamburger.remove();
    if (existingOverlay) existingOverlay.remove();
  }

  /**
   * Destroy component and remove listeners
   */
  destroy() {
    this._cleanup();
    this._closeMenu();
  }
}

export default MobileMenu;