export function initHomeRooms() {
  const list = document.querySelector('.home-section .left-content ul');
  const cards = Array.from(document.querySelectorAll('.home-section .home-card'));

  if (!list || !cards.length) return null;

  const items = Array.from(list.querySelectorAll('li'));

  function setActive(index) {
    cards.forEach((card, cardIndex) => {
      const isActive = cardIndex === index;
      card.classList.toggle('is-selected', isActive);
    });

    items.forEach((item, itemIndex) => {
      item.classList.toggle('active', itemIndex === index);
    });
  }

  items.forEach((item, index) => {
    item.addEventListener('click', () => {
      setActive(index);
    });
  });

  setActive(0);

  return { items, cards, setActive };
}

export default initHomeRooms;
