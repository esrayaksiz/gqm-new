(() => {
  const slides = [...document.querySelectorAll('.hero__slide')];
  const copies = [...document.querySelectorAll('.hero__copy-item')];
  const pagers = [...document.querySelectorAll('.hero__pager')];
  const interval = 6000;
  let current = 0;
  let timer;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });

    copies.forEach((copy, i) => {
      const active = i === current;
      copy.classList.toggle('is-active', active);
      copy.setAttribute('aria-hidden', String(!active));
    });

    pagers.forEach((pager, i) => {
      const active = i === current;
      pager.classList.toggle('is-active', active);
      pager.setAttribute('aria-selected', String(active));
    });
  }

  function restartTimer() {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(current + 1), interval);
  }

  pagers.forEach((pager) => {
    pager.addEventListener('click', () => {
      showSlide(Number(pager.dataset.goTo));
      restartTimer();
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearInterval(timer);
    else restartTimer();
  });

  restartTimer();
})();

(() => {
  const items = [...document.querySelectorAll('.expertise-item')];
  if (!items.length) return;

  items.forEach((item) => {
    const trigger = item.querySelector('.expertise-item__trigger');
    const panel = item.querySelector('.expertise-item__panel');

    trigger.addEventListener('click', () => {
      const willOpen = trigger.getAttribute('aria-expanded') !== 'true';

      items.forEach((otherItem) => {
        const otherTrigger = otherItem.querySelector('.expertise-item__trigger');
        const otherPanel = otherItem.querySelector('.expertise-item__panel');
        otherItem.classList.remove('is-open');
        otherTrigger.setAttribute('aria-expanded', 'false');
        otherPanel.setAttribute('aria-hidden', 'true');
      });

      if (willOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
      }
    });
  });
})();

(() => {
  const gallery = document.querySelector('.selected-projects__gallery');
  if (!gallery) return;

  const track = gallery.querySelector('.selected-projects__track');
  const slides = [...gallery.querySelectorAll('.selected-projects__slide')];
  const indicators = [...document.querySelectorAll('.selected-projects__indicator span')];
  const dragThreshold = 0.14;
  let current = 0;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let axis = null;
  let dragging = false;

  function getSlideStride() {
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    return gallery.clientWidth + gap;
  }

  function render() {
    track.style.transform = `translate3d(${-current * getSlideStride()}px, 0, 0)`;
    gallery.setAttribute('aria-label', `Ramada Almaty project details, page ${current + 1} of ${slides.length}`);

    slides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', String(index !== current));
    });

    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('is-active', index === current);
    });
  }

  function beginDrag(event) {
    if (!event.isPrimary || event.button !== 0) return;

    dragging = true;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    deltaX = 0;
    axis = null;
    gallery.classList.add('is-dragging');
    gallery.setPointerCapture(pointerId);
  }

  function moveDrag(event) {
    if (!dragging || event.pointerId !== pointerId) return;

    const movementX = event.clientX - startX;
    const movementY = event.clientY - startY;

    if (!axis && Math.max(Math.abs(movementX), Math.abs(movementY)) > 6) {
      axis = Math.abs(movementX) > Math.abs(movementY) ? 'x' : 'y';
    }

    if (axis !== 'x') return;

    event.preventDefault();
    deltaX = movementX;

    if ((current === 0 && deltaX > 0) || (current === slides.length - 1 && deltaX < 0)) {
      deltaX *= .24;
    }

    track.style.transform = `translate3d(${-current * getSlideStride() + deltaX}px, 0, 0)`;
  }

  function endDrag(event, cancelled = false) {
    if (!dragging || event.pointerId !== pointerId) return;

    dragging = false;
    gallery.classList.remove('is-dragging');

    if (gallery.hasPointerCapture(pointerId)) {
      gallery.releasePointerCapture(pointerId);
    }

    if (!cancelled && axis === 'x') {
      const threshold = gallery.clientWidth * dragThreshold;
      if (deltaX < -threshold && current < slides.length - 1) current += 1;
      if (deltaX > threshold && current > 0) current -= 1;
    }

    pointerId = null;
    deltaX = 0;
    axis = null;
    render();
  }

  gallery.addEventListener('pointerdown', beginDrag);
  gallery.addEventListener('pointermove', moveDrag);
  gallery.addEventListener('pointerup', (event) => endDrag(event));
  gallery.addEventListener('pointercancel', (event) => endDrag(event, true));
  window.addEventListener('resize', render);
  gallery.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' && current < slides.length - 1) {
      event.preventDefault();
      current += 1;
      render();
    }

    if (event.key === 'ArrowLeft' && current > 0) {
      event.preventDefault();
      current -= 1;
      render();
    }
  });

  render();
})();
