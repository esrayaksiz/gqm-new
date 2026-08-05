(() => {
  document.querySelectorAll('.detail-item').forEach((item) => {
    const trigger = item.querySelector('button');
    const panel = item.querySelector('.detail-item__panel');
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') !== 'true';
      item.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
    });
  });

  const carousel = document.querySelector('.preopening__carousel');
  const track = carousel.querySelector('.preopening__track');
  const slides = [...carousel.querySelectorAll('.preopening__slide')];
  const pagination = carousel.querySelector('.preopening__pagination');
  let current = 0;

  const pagers = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-label', `Show pre-opening service ${index + 1}`);
    button.addEventListener('click', () => show(index));
    pagination.append(button);
    return button;
  });

  function show(index) {
    current = index;
    track.style.transform = `translate3d(${-current * 100}%, 0, 0)`;
    slides.forEach((slide, slideIndex) => slide.setAttribute('aria-hidden', String(slideIndex !== current)));
    pagers.forEach((pager, pagerIndex) => {
      const active = pagerIndex === current;
      pager.classList.toggle('is-active', active);
      pager.setAttribute('aria-selected', String(active));
    });
  }

  show(0);
})();
