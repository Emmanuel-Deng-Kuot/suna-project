// Small helper to toggle footer link groups on mobile
export default function initFooterAccordion(breakpoint = 768) {
  const groups = document.querySelectorAll('.footer-links > div');
  if (!groups.length) return;

  function onClick(e) {
    const width = window.innerWidth || document.documentElement.clientWidth;
    if (width >= breakpoint) return; // only on mobile
    const parent = e.currentTarget.parentElement;
    parent.classList.toggle('open');
  }

  groups.forEach((group) => {
    const heading = group.querySelector('h4');
    if (!heading) return;
    heading.setAttribute('role', 'button');
    heading.addEventListener('click', onClick);
  });

  // Close all on resize above breakpoint
  window.addEventListener('resize', () => {
    const width = window.innerWidth || document.documentElement.clientWidth;
    if (width >= breakpoint) {
      groups.forEach((g) => g.classList.remove('open'));
    }
  });
}
