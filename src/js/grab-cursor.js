/**
 * Grab Cursor Interaction
 * Adds smooth grab/grabbing cursor states to draggable slider containers
 * Works with mouse, touch, and native scroll interactions
 */

/**
 * Initialize grab cursor for a scrollable container
 * Manages grab/grabbing cursor states during user interaction
 */
function initGrabCursor(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  let isGrabbing = false;
  let startX = 0;
  let scrollLeft = 0;

  /**
   * Mouse events - traditional drag detection
   */
  container.addEventListener('mousedown', (e) => {
    isGrabbing = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    container.classList.add('grabbing');
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
  });

  container.addEventListener('mouseleave', () => {
    if (isGrabbing) {
      isGrabbing = false;
      container.classList.remove('grabbing');
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    }
  });

  container.addEventListener('mouseup', () => {
    if (isGrabbing) {
      isGrabbing = false;
      container.classList.remove('grabbing');
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    }
  });

  container.addEventListener('mousemove', (e) => {
    if (!isGrabbing) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1; // scroll-fast
    container.scrollLeft = scrollLeft - walk;
  });

  /**
   * Touch events - swipe detection
   */
  let touchStartX = 0;
  let touchScrollLeft = 0;

  container.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchScrollLeft = container.scrollLeft;
    container.classList.add('grabbing');
    container.style.cursor = 'grabbing';
  });

  container.addEventListener('touchend', () => {
    container.classList.remove('grabbing');
    container.style.cursor = 'grab';
  });

  container.addEventListener('touchmove', (e) => {
    const x = e.touches[0].clientX;
    const walk = (touchStartX - x) * 1;
    container.scrollLeft = touchScrollLeft + walk;
  });

  // Set initial grab cursor
  container.style.cursor = 'grab';
}

/**
 * Initialize grab cursors for all draggable sections
 */
export function initAllGrabCursors() {
  // Categories section
  const cardsContainer = document.querySelector('.cards');
  if (cardsContainer) {
    initGrabCursor('.cards');
    // Also add grab cursor to individual cards
    document.querySelectorAll('.category-card').forEach((card) => {
      card.style.cursor = 'grab';
      card.addEventListener('mousedown', () => {
        card.style.cursor = 'grabbing';
      });
      card.addEventListener('mouseup', () => {
        card.style.cursor = 'grab';
      });
      card.addEventListener('mouseleave', () => {
        card.style.cursor = 'grab';
      });
    });
  }

  // Collection section
  const collectionCards = document.querySelector('.collection-cards');
  if (collectionCards) {
    initGrabCursor('.collection-cards');
    document.querySelectorAll('.set-card').forEach((card) => {
      card.style.cursor = 'grab';
      card.addEventListener('mousedown', () => {
        card.style.cursor = 'grabbing';
      });
      card.addEventListener('mouseup', () => {
        card.style.cursor = 'grab';
      });
      card.addEventListener('mouseleave', () => {
        card.style.cursor = 'grab';
      });
    });
  }

  // Inspiration section
  const inspirationRow = document.querySelector('.inspiration-row');
  if (inspirationRow) {
    initGrabCursor('.inspiration-row');
    document.querySelectorAll('.inspiration-card').forEach((card) => {
      card.style.cursor = 'grab';
      card.addEventListener('mousedown', () => {
        card.style.cursor = 'grabbing';
      });
      card.addEventListener('mouseup', () => {
        card.style.cursor = 'grab';
      });
      card.addEventListener('mouseleave', () => {
        card.style.cursor = 'grab';
      });
    });
  }

  console.info('[GrabCursor] Grab/grabbing cursor interactions initialized');
}

export default initAllGrabCursors;
