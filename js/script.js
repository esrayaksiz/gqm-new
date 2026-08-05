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
  const viewport = document.querySelector('.selected-projects__viewport');
  if (!viewport) return;

  const track = viewport.querySelector('.selected-projects__projects-track');
  const projects = [...viewport.querySelectorAll('.selected-projects__project')];
  const indicators = [...viewport.querySelectorAll('[data-project-go-to]')];
  const dragThreshold = 0.14;
  const autoplayDelay = 6500;
  const loopClone = projects[0].cloneNode(true);
  let current = 0;
  let autoplayTimer;
  let loopFallback;
  let wrapping = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let axis = null;
  let dragging = false;

  loopClone.classList.remove('is-active');
  loopClone.removeAttribute('data-project-index');
  loopClone.setAttribute('data-project-loop-clone', '');
  loopClone.setAttribute('aria-hidden', 'true');
  loopClone.setAttribute('inert', '');
  track.append(loopClone);

  function render() {
    const trackPosition = wrapping ? projects.length : current;
    track.style.transform = `translate3d(${-trackPosition * viewport.clientWidth}px, 0, 0)`;
    const projectName = projects[current].querySelector('.selected-projects__summary h3').textContent;
    viewport.setAttribute('aria-label', `Selected projects, ${projectName}, project ${current + 1} of ${projects.length}`);

    projects.forEach((project, index) => {
      const active = !wrapping && index === current;
      project.style.removeProperty('opacity');
      project.classList.toggle('is-active', active);
      project.setAttribute('aria-hidden', String(!active));
    });

    loopClone.classList.toggle('is-active', wrapping);
    loopClone.setAttribute('aria-hidden', String(!wrapping));

    indicators.forEach((indicator, index) => {
      const active = index === current;
      indicator.classList.toggle('is-active', active);
      indicator.setAttribute('aria-selected', String(active));
    });
  }

  function showProject(index) {
    if (wrapping) finishLoop();
    current = Math.max(0, Math.min(index, projects.length - 1));
    render();
  }

  function finishLoop() {
    if (!wrapping) return;

    window.clearTimeout(loopFallback);
    wrapping = false;

    const firstProject = projects[0];
    track.style.transition = 'none';
    firstProject.style.transition = 'none';
    loopClone.style.transition = 'none';
    track.style.transform = 'translate3d(0, 0, 0)';
    loopClone.classList.remove('is-active');
    loopClone.setAttribute('aria-hidden', 'true');
    firstProject.classList.add('is-active');
    firstProject.setAttribute('aria-hidden', 'false');
    track.getBoundingClientRect();
    track.style.removeProperty('transition');
    firstProject.style.removeProperty('transition');
    loopClone.style.removeProperty('transition');
  }

  function advanceAutoplay() {
    if (current === projects.length - 1) {
      current = 0;
      wrapping = true;
      render();
      loopFallback = window.setTimeout(finishLoop, 760);
      return;
    }

    showProject(current + 1);
  }

  function restartAutoplay() {
    window.clearTimeout(autoplayTimer);
    if (document.hidden || projects.length < 2) return;

    autoplayTimer = window.setTimeout(() => {
      advanceAutoplay();
      restartAutoplay();
    }, autoplayDelay);
  }

  function beginDrag(event) {
    if (!event.isPrimary || event.button !== 0) return;

    restartAutoplay();
    if (event.target.closest('.selected-projects__indicator, .project-pair__nav')) return;
    if (wrapping) finishLoop();

    dragging = true;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    deltaX = 0;
    axis = null;
    viewport.classList.add('is-dragging');
    viewport.setPointerCapture(pointerId);
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

    if ((current === 0 && deltaX > 0) || (current === projects.length - 1 && deltaX < 0)) {
      deltaX *= .24;
    }

    const progress = Math.min(Math.abs(deltaX) / viewport.clientWidth, 1);
    const nextIndex = current + (deltaX < 0 ? 1 : -1);
    projects[current].style.opacity = String(1 - progress * .82);
    if (projects[nextIndex]) projects[nextIndex].style.opacity = String(.18 + progress * .82);
    track.style.transform = `translate3d(${-current * viewport.clientWidth + deltaX}px, 0, 0)`;
  }

  function endDrag(event, cancelled = false) {
    if (!dragging || event.pointerId !== pointerId) return;

    dragging = false;
    viewport.classList.remove('is-dragging');

    if (viewport.hasPointerCapture(pointerId)) {
      viewport.releasePointerCapture(pointerId);
    }

    if (!cancelled && axis === 'x') {
      const threshold = viewport.clientWidth * dragThreshold;
      if (deltaX < -threshold && current < projects.length - 1) current += 1;
      if (deltaX > threshold && current > 0) current -= 1;
    }

    pointerId = null;
    deltaX = 0;
    axis = null;
    render();
    restartAutoplay();
  }

  viewport.addEventListener('pointerdown', beginDrag);
  viewport.addEventListener('pointermove', moveDrag);
  viewport.addEventListener('pointerup', (event) => endDrag(event));
  viewport.addEventListener('pointercancel', (event) => endDrag(event, true));
  track.addEventListener('transitionend', (event) => {
    if (event.target === track && event.propertyName === 'transform') finishLoop();
  });
  window.addEventListener('resize', render);
  viewport.addEventListener('keydown', (event) => {
    if (event.target.closest('.project-pair__nav')) return;

    if (event.key === 'ArrowRight' && current < projects.length - 1) {
      event.preventDefault();
      showProject(current + 1);
      restartAutoplay();
    }

    if (event.key === 'ArrowLeft' && current > 0) {
      event.preventDefault();
      showProject(current - 1);
      restartAutoplay();
    }
  });

  viewport.addEventListener('click', (event) => {
    if (event.target.closest('.project-pair__nav')) restartAutoplay();
  });

  indicators.forEach((indicator) => {
    indicator.addEventListener('click', () => {
      showProject(Number(indicator.dataset.projectGoTo));
      restartAutoplay();
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearTimeout(autoplayTimer);
    else restartAutoplay();
  });

  render();
  restartAutoplay();
})();

(() => {
  const carousels = [...document.querySelectorAll('[data-project-pair-carousel]')];

  carousels.forEach((carousel) => {
    const track = carousel.querySelector('.project-pair__track');
    const pages = [...carousel.querySelectorAll('.project-pair__page')];
    const previous = carousel.querySelector('.project-pair__nav--previous');
    const next = carousel.querySelector('.project-pair__nav--next');
    let current = 0;

    function render() {
      track.style.transform = `translate3d(${-current * 100}%, 0, 0)`;

      pages.forEach((page, index) => {
        const active = index === current;
        page.classList.toggle('is-active', active);
        page.setAttribute('aria-hidden', String(!active));
      });

      previous.disabled = current === 0;
      next.disabled = current === pages.length - 1;
    }

    previous.addEventListener('click', () => {
      current = Math.max(0, current - 1);
      render();
    });

    next.addEventListener('click', () => {
      current = Math.min(pages.length - 1, current + 1);
      render();
    });

    render();
  });
})();
