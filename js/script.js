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
