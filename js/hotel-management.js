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

  const preopening = document.querySelector('.preopening');
  const carousel = preopening.querySelector('.preopening__carousel');
  const track = carousel.querySelector('.preopening__track');
  const slides = [...carousel.querySelectorAll('.preopening__slide')];
  const pagination = preopening.querySelector('.preopening__pagination');
  let current = 0;
  let dragStart = 0;
  let dragDistance = 0;
  let dragging = false;

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
    current = (index + slides.length) % slides.length;
    track.style.transform = `translate3d(${-current * 100}%, 0, 0)`;
    slides.forEach((slide, slideIndex) => slide.setAttribute('aria-hidden', String(slideIndex !== current)));
    pagers.forEach((pager, pagerIndex) => {
      const active = pagerIndex === current;
      pager.classList.toggle('is-active', active);
      pager.setAttribute('aria-selected', String(active));
    });
  }

  carousel.addEventListener('pointerdown', (event) => {
    dragging = true;
    dragStart = event.clientX;
    dragDistance = 0;
    carousel.classList.add('is-dragging');
    track.style.transition = 'none';
    carousel.setPointerCapture(event.pointerId);
  });

  carousel.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    dragDistance = event.clientX - dragStart;
    track.style.transform = `translate3d(calc(${-current * 100}% + ${dragDistance}px), 0, 0)`;
  });

  const finishDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    carousel.classList.remove('is-dragging');
    track.style.removeProperty('transition');
    if (carousel.hasPointerCapture(event.pointerId)) carousel.releasePointerCapture(event.pointerId);
    const threshold = Math.min(90, carousel.clientWidth * .12);
    if (dragDistance < -threshold) show(current + 1);
    else if (dragDistance > threshold) show(current - 1);
    else show(current);
  };

  carousel.addEventListener('pointerup', finishDrag);
  carousel.addEventListener('pointercancel', finishDrag);
  show(0);
})();
