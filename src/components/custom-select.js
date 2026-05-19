// Text-only lightweight Select2-like replacement (no jQuery, no flags)
function buildCustomSelect(originalSelect) {
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-select';
  wrapper.style.position = 'relative';

  // hide original but keep it in the DOM and in forms
  originalSelect.style.position = 'absolute';
  originalSelect.style.left = '-9999px';
  originalSelect.style.width = '1px';
  originalSelect.style.height = '1px';
  originalSelect.style.opacity = '0';
  originalSelect.style.pointerEvents = 'none';
  originalSelect.tabIndex = -1;

  originalSelect.parentNode.insertBefore(wrapper, originalSelect);
  wrapper.appendChild(originalSelect);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'custom-select-toggle';
  toggle.setAttribute('aria-haspopup', 'listbox');
  toggle.setAttribute('aria-expanded', 'false');

  const menu = document.createElement('div');
  menu.className = 'custom-select-menu';
  menu.setAttribute('role', 'listbox');
  menu.setAttribute('aria-hidden', 'true');

  const list = document.createElement('ul');
  list.className = 'custom-select-list';

  const options = Array.from(originalSelect.options);

  // optional search when many options
  let searchInput = null;
  if (options.length > 5) {
    searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.className = 'custom-select-search';
    searchInput.setAttribute('placeholder', 'Search');
    menu.appendChild(searchInput);

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      list.querySelectorAll('li').forEach(li => {
        const text = li.dataset.label.toLowerCase();
        li.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  options.forEach(opt => {
    const li = document.createElement('li');
    li.className = 'custom-select-option';
    li.tabIndex = 0;
    li.dataset.value = opt.value !== undefined && opt.value !== '' ? opt.value : opt.text;
    li.dataset.label = opt.textContent.trim();
    li.textContent = opt.textContent.trim();

    li.addEventListener('click', (e) => {
      e.stopPropagation();
      originalSelect.value = li.dataset.value;
      originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
      updateToggle();
      close();
    });

    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
      if (e.key === 'Escape') { close(); toggle.focus(); }
    });

    list.appendChild(li);
  });

  menu.appendChild(list);
  wrapper.appendChild(toggle);
  wrapper.appendChild(menu);

  function updateToggle() {
    const cur = originalSelect.selectedOptions[0];
    toggle.textContent = cur ? cur.textContent.trim() : '';
  }

  updateToggle();

  function open() {
    wrapper.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
  }

  function close() {
    wrapper.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  }

  function toggleMenu(e) {
    e.stopPropagation();
    if (wrapper.classList.contains('open')) close(); else open();
  }

  // click/tap toggle for mobile
  toggle.addEventListener('click', toggleMenu);
  toggle.addEventListener('pointerdown', (e) => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      e.preventDefault();
    }
  });

  // keyboard
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); open(); const first = list.querySelector('li'); if (first) first.focus(); }
    if (e.key === 'Escape') { close(); }
  });

  // close on outside click
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) close();
  });

  // keep UI in sync if original select changes externally
  originalSelect.addEventListener('change', updateToggle);

  return { wrapper, open, close };
}

export function initCustomSelects() {
  const selects = document.querySelectorAll('select.language-selector, select.currency-selector');
  selects.forEach(s => buildCustomSelect(s));
}

export default initCustomSelects;
