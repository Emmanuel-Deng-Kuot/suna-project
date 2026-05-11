/**
 * Product countdowns
 * Finds elements with `.product-countdown` and updates a live timer for each.
 * Each element may set a `data-deadline` ISO string. If missing, a 3-day default is used.
 */

function formatTwo(n) {
  return String(n).padStart(2, '0');
}

function getParts(ms) {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return { days, hours, mins, secs };
}

function renderCompact(el, parts) {
  // compact layout like: 03 : 14 : 12 : 30
  el.innerHTML = `
    <div class="cd-pill">
      <span class="cd-part"><strong>${formatTwo(parts.days)}</strong><small>days</small></span>
      <span class="cd-sep">:</span>
      <span class="cd-part"><strong>${formatTwo(parts.hours)}</strong><small>Hours</small></span>
      <span class="cd-sep">:</span>
      <span class="cd-part"><strong>${formatTwo(parts.mins)}</strong><small>min</small></span>
      <span class="cd-sep">:</span>
      <span class="cd-part"><strong>${formatTwo(parts.secs)}</strong><small>sec</small></span>
    </div>
  `;
}

export function initProductCountdowns() {
  const nodes = Array.from(document.querySelectorAll('.product-countdown'));
  if (!nodes.length) return [];

  const instances = [];

  nodes.forEach((el) => {
    // parse deadline from attribute; if empty use +3 days
    const attr = el.getAttribute('data-deadline');
    let deadline = null;
    if (attr) {
      const parsed = Date.parse(attr);
      if (!Number.isNaN(parsed)) deadline = parsed;
    }
    if (!deadline) deadline = Date.now() + 3 * 24 * 60 * 60 * 1000;

    // initial render
    const tick = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) {
        renderCompact(el, { days: 0, hours: 0, mins: 0, secs: 0 });
        clearInterval(intervalId);
        el.classList.add('cd-ended');
        return;
      }
      const parts = getParts(diff);
      renderCompact(el, parts);
    };

    tick();
    const intervalId = setInterval(tick, 1000);

    instances.push({ el, deadline, intervalId });
  });

  return instances;
}

export default initProductCountdowns;
