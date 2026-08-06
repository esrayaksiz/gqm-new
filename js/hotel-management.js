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
  const autoplayDelay = 4000;
  const firstSlideClone = slides[0].cloneNode(true);
  let current = 0;
  let dragStart = 0;
  let dragDistance = 0;
  let dragging = false;
  let isLooping = false;
  let autoplayTimer;

  firstSlideClone.classList.add('is-loop-clone');
  firstSlideClone.setAttribute('aria-hidden', 'true');
  track.append(firstSlideClone);

  const pagers = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-label', `Show pre-opening service ${index + 1}`);
    button.addEventListener('click', () => {
      completeLoop();
      show(index);
      restartAutoplay();
    });
    pagination.append(button);
    return button;
  });

  function show(index) {
    if (index === slides.length && current === slides.length - 1) {
      current = 0;
      isLooping = true;
      track.style.transform = `translate3d(${-slides.length * 100}%, 0, 0)`;
    } else {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translate3d(${-current * 100}%, 0, 0)`;
    }
    slides.forEach((slide, slideIndex) => slide.setAttribute('aria-hidden', String(slideIndex !== current)));
    pagers.forEach((pager, pagerIndex) => {
      const active = pagerIndex === current;
      pager.classList.toggle('is-active', active);
      pager.setAttribute('aria-selected', String(active));
    });
  }

  function completeLoop() {
    if (!isLooping) return;
    isLooping = false;
    track.style.transition = 'none';
    track.style.transform = 'translate3d(0, 0, 0)';
    track.getBoundingClientRect();
    track.style.removeProperty('transition');
  }

  function stopAutoplay() {
    window.clearTimeout(autoplayTimer);
  }

  function restartAutoplay() {
    stopAutoplay();
    autoplayTimer = window.setTimeout(() => {
      show(current + 1);
      restartAutoplay();
    }, autoplayDelay);
  }

  track.addEventListener('transitionend', completeLoop);

  carousel.addEventListener('pointerdown', (event) => {
    stopAutoplay();
    completeLoop();
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
    restartAutoplay();
  };

  carousel.addEventListener('pointerup', finishDrag);
  carousel.addEventListener('pointercancel', finishDrag);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else restartAutoplay();
  });
  show(0);
  restartAutoplay();
})();
