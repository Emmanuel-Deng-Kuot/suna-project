
/**
 * Countdown Component
 * Displays countdown timer with days, hours, minutes, seconds
 * Modular and reusable pattern
 */

class Countdown {
  constructor(options = {}) {
    // Configuration
    this.deadline = options.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    this.updateInterval = options.updateInterval || 1000;
    this.onComplete = options.onComplete || null;

    // Elements
    this.daysEl = document.getElementById('countdown-days');
    this.hoursEl = document.getElementById('countdown-hours');
    this.minsEl = document.getElementById('countdown-mins');
    this.secsEl = document.getElementById('countdown-secs');

    // State
    this.intervalId = null;
  }

  /**
   * Initialize countdown timer
   */
  init() {
    if (!this.daysEl || !this.hoursEl || !this.minsEl || !this.secsEl) {
      console.warn('[Countdown] Required elements not found');
      return;
    }

    // Tick immediately
    this._tick();

    // Start interval
    this.intervalId = setInterval(() => this._tick(), this.updateInterval);
  }

  /**
   * Update countdown display
   */
  _tick() {
    const now = Date.now();
    const diff = this.deadline - now;

    if (diff <= 0) {
      this._complete();
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    this.daysEl.textContent = this._pad(days);
    this.hoursEl.textContent = this._pad(hours);
    this.minsEl.textContent = this._pad(mins);
    this.secsEl.textContent = this._pad(secs);
  }

  /**
   * Pad number to 2 digits
   */
  _pad(n) {
    return String(n).padStart(2, '0');
  }

  /**
   * Handle countdown completion
   */
  _complete() {
    this.stop();
    
    // Show completion state
    this.daysEl.textContent = '00';
    this.hoursEl.textContent = '00';
    this.minsEl.textContent = '00';
    this.secsEl.textContent = '00';

    if (this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Stop countdown timer
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Resume countdown timer
   */
  resume() {
    if (!this.intervalId) {
      this._tick();
      this.intervalId = setInterval(() => this._tick(), this.updateInterval);
    }
  }

  /**
   * Set new deadline
   */
  setDeadline(deadline) {
    this.deadline = deadline;
    this._tick();
  }

  /**
   * Destroy countdown and remove listeners
   */
  destroy() {
    this.stop();
  }
}

export default Countdown;