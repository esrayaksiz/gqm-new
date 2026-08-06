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
  const menu = document.getElementById('site-menu');
  const openButtons = [...document.querySelectorAll('.menu-button, .sticky-navbar__menu')];
  const closeButton = menu?.querySelector('.site-menu__close');
  const menuLinks = menu ? [...menu.querySelectorAll('a')] : [];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!menu || !openButtons.length || !closeButton) return;

  let closeTimer;
  let activeOpenButton = openButtons[0];

  function openMenu(event) {
    window.clearTimeout(closeTimer);
    activeOpenButton = event.currentTarget;
    document.querySelectorAll('.real-estate-reveal__frame[data-src]').forEach((frame) => {
      if (!frame.getAttribute('src')) frame.src = frame.dataset.src;
    });
    menu.setAttribute('aria-hidden', 'false');
    openButtons.forEach((button) => button.setAttribute('aria-expanded', String(button === activeOpenButton)));
    document.body.classList.add('site-menu-open');
    window.requestAnimationFrame(() => {
      menu.classList.add('is-open');
      closeButton.focus();
    });
  }

  function closeMenu(restoreFocus = true) {
    window.clearTimeout(closeTimer);
    menu.classList.remove('is-open');
    openButtons.forEach((button) => button.setAttribute('aria-expanded', 'false'));
    document.body.classList.remove('site-menu-open');

    const delay = reducedMotion.matches ? 0 : 760;
    closeTimer = window.setTimeout(() => {
      menu.setAttribute('aria-hidden', 'true');
      if (restoreFocus) activeOpenButton.focus();
    }, delay);
  }

  openButtons.forEach((button) => button.addEventListener('click', openMenu));
  closeButton.addEventListener('click', () => closeMenu());

  menuLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const panelId = link.dataset.menuPanel;
      if (!panelId) {
        closeMenu(false);
        return;
      }

      event.preventDefault();
      closeMenu(false);
      window.requestAnimationFrame(() => {
        document.querySelector(`[aria-controls="${panelId}"]`)?.click();
      });
    });
  });

  document.addEventListener('keydown', (event) => {
    if (!menu.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = [closeButton, ...menuLinks].filter((element) => !element.hidden);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();

(() => {
  const navbar = document.querySelector('.sticky-navbar');
  if (!navbar) return;

  const revealThreshold = 160;
  let lastY = window.scrollY;
  let hasScrolledDown = lastY > revealThreshold;
  let animationFrame;

  function setVisible(visible) {
    navbar.classList.toggle('is-visible', visible);
    navbar.setAttribute('aria-hidden', String(!visible));
    navbar.inert = !visible;
  }

  function updateNavbar() {
    animationFrame = null;
    const currentY = Math.max(window.scrollY, 0);
    const movement = currentY - lastY;

    if (currentY <= 80) {
      setVisible(false);
      hasScrolledDown = false;
    } else if (movement > 4) {
      if (currentY > revealThreshold) hasScrolledDown = true;
      setVisible(false);
    } else if (movement < -4 && hasScrolledDown) {
      setVisible(true);
    }

    lastY = currentY;
  }

  window.addEventListener('scroll', () => {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(updateNavbar);
  }, { passive: true });

  setVisible(false);
})();

(() => {
  const triggers = [...document.querySelectorAll('[aria-controls$="-panel"]')];
  let activePanel = null;
  let activeTrigger = null;
  let focusTimer;

  function closePanel() {
    if (!activePanel || !activeTrigger) return;
    const panel = activePanel;
    const trigger = activeTrigger;
    window.clearTimeout(focusTimer);
    panel.classList.remove('is-open');
    document.body.classList.remove('real-estate-panel-open');
    trigger.setAttribute('aria-expanded', 'false');
    window.setTimeout(() => panel.setAttribute('aria-hidden', 'true'), 900);
    activePanel = null;
    activeTrigger = null;
    trigger.focus();
  }

  triggers.forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;
    const closeButton = panel.querySelector('.real-estate-reveal__close');
    const frame = panel.querySelector('.real-estate-reveal__frame');
    trigger.setAttribute('aria-expanded', 'false');

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      if (!frame.src) frame.src = frame.dataset.src;
      activePanel = panel;
      activeTrigger = trigger;
      panel.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
      window.requestAnimationFrame(() => {
        panel.classList.add('is-open');
        document.body.classList.add('real-estate-panel-open');
      });
      window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(() => closeButton.focus(), 900);
    });

    closeButton.addEventListener('click', closePanel);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activePanel) closePanel();
  });
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

(() => {
  const duration = 1550;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const anchorLinks = [...new Set([
    ...document.querySelectorAll('.site-menu__navigation a[href^="#"]'),
    ...document.querySelectorAll('a[href="#contact"]')
  ])];
  if (!anchorLinks.length) return;

  let animationFrame;

  function resolveTarget(hash) {
    if (hash === '#selected-projects-title') {
      return document.querySelector('.selected-projects__viewport');
    }

    if (hash === '#expertise-title') {
      return document.querySelector('.expertise-accordion');
    }

    return document.querySelector(hash);
  }

  function getTargetY(target, hash) {
    const startY = window.scrollY;
    const targetTop = target.getBoundingClientRect().top + startY;
    const targetHeight = target.getBoundingClientRect().height;
    const viewportHeight = window.innerHeight;
    let offset = 0;

    if (hash !== '#selected-projects-title' && hash !== '#expertise-title' && targetHeight < viewportHeight) {
      offset = (viewportHeight - targetHeight) / 2;
    }

    const maxScroll = Math.max(document.documentElement.scrollHeight - viewportHeight, 0);
    return Math.max(0, Math.min(targetTop - offset, maxScroll));
  }

  function updateHash(hash) {
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
  }

  function scrollToTarget(target, hash) {
    window.cancelAnimationFrame(animationFrame);
    const targetY = getTargetY(target, hash);

    if (reducedMotion.matches) {
      window.scrollTo(0, targetY);
      updateHash(hash);
      return;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = progress * progress * progress
        * (progress * (progress * 6 - 15) + 10);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        updateHash(hash);
      }
    }

    animationFrame = window.requestAnimationFrame(step);
  }

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const hash = link.getAttribute('href');
      const target = resolveTarget(hash);
      if (!target) return;

      event.preventDefault();
      if (hash === '#selected-projects-title') {
        document.querySelector('[data-project-go-to="0"]')?.click();
      }
      scrollToTarget(target, hash);
    });
  });
})();

(() => {
  const sections = [...document.querySelectorAll('main > section, .contact-footer')];
  if (!sections.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealTargets = [];

  sections.forEach((section) => {
    const textElements = [...section.querySelectorAll('h2, h3, p')]
      .filter((element) => !element.closest('[data-project-loop-clone]'));
    const imageElements = [...section.querySelectorAll('img, .project-detail__image')]
      .filter((element) => !element.closest('[data-project-loop-clone]'));

    textElements.forEach((element, index) => {
      element.classList.add('scroll-reveal');
      element.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 70}ms`);
      revealTargets.push(element);
    });

    imageElements.forEach((element, index) => {
      element.classList.add('scroll-reveal-image');
      element.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 80}ms`);
      revealTargets.push(element);
    });
  });

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealTargets.forEach((element) => element.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.14,
    rootMargin: '0px 0px -8% 0px'
  });

  revealTargets.forEach((element) => observer.observe(element));
})();

(() => {
  const section = document.querySelector('.team-section');
  const viewport = section?.querySelector('.team-carousel__viewport');
  const track = section?.querySelector('.team-section__grid');
  const pagination = section?.querySelector('.team-carousel__pagination');
  const previousButton = section?.querySelector('.team-carousel__arrow--previous');
  const nextButton = section?.querySelector('.team-carousel__arrow--next');
  const originalCards = track ? [...track.querySelectorAll('.team-member')] : [];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!section || !viewport || !track || !pagination || !previousButton || !nextButton || originalCards.length < 2) return;

  const firstClone = originalCards[0].cloneNode(true);
  const lastClone = originalCards[originalCards.length - 1].cloneNode(true);
  [firstClone, lastClone].forEach((clone) => {
    clone.dataset.teamClone = '';
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('.scroll-reveal, .scroll-reveal-image').forEach((element) => element.classList.add('is-revealed'));
  });
  track.prepend(lastClone);
  track.append(firstClone);

  const cards = [...track.querySelectorAll('.team-member')];
  const dots = originalCards.map((card, index) => {
    const name = card.querySelector('h3')?.textContent.trim() || `Team member ${index + 1}`;
    const button = document.createElement('button');
    button.className = 'team-carousel__dot';
    button.type = 'button';
    button.setAttribute('aria-label', `Show ${name}`);
    pagination.append(button);
    return button;
  });

  const AUTOPLAY_DELAY = 6500;
  let currentIndex = 0;
  let physicalIndex = 1;
  let pendingJump = null;
  let currentTranslate = 0;
  let autoplayTimer;
  let resizeFrame;
  let isAnimating = false;
  let isInView = false;
  let isHovering = false;
  let pointerId = null;
  let dragStartX = 0;
  let dragStartedAt = 0;
  let dragDelta = 0;
  let dragBaseTranslate = 0;

  function getTranslate(index) {
    const card = cards[index];
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    return viewport.clientWidth / 2 - cardCenter;
  }

  function updateActiveState() {
    cards.forEach((card, index) => card.classList.toggle('is-active', index === physicalIndex));
    dots.forEach((dot, index) => {
      const active = index === currentIndex;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });

    const activeName = originalCards[currentIndex].querySelector('h3')?.textContent.trim() || 'Team member';
    viewport.setAttribute('aria-label', `${activeName}, ${currentIndex + 1} of ${originalCards.length}`);
  }

  function render(animate = true) {
    if (!animate || reducedMotion.matches) track.classList.add('is-jumping');
    currentTranslate = getTranslate(physicalIndex);
    track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
    updateActiveState();

    if (!animate || reducedMotion.matches) {
      track.getBoundingClientRect();
      window.requestAnimationFrame(() => track.classList.remove('is-jumping'));
    }
  }

  function clearAutoplay() {
    window.clearTimeout(autoplayTimer);
    autoplayTimer = null;
  }

  function scheduleAutoplay() {
    clearAutoplay();
    if (reducedMotion.matches || !isInView || isHovering || document.hidden) return;
    autoplayTimer = window.setTimeout(() => {
      goNext(false);
      scheduleAutoplay();
    }, AUTOPLAY_DELAY);
  }

  function resetAutoplay() {
    clearAutoplay();
    scheduleAutoplay();
  }

  function goNext(userInitiated = true) {
    if (isAnimating) return;
    isAnimating = !reducedMotion.matches;

    if (currentIndex === originalCards.length - 1) {
      currentIndex = 0;
      physicalIndex = originalCards.length + 1;
      pendingJump = 1;
    } else {
      currentIndex += 1;
      physicalIndex += 1;
    }

    render();
    if (userInitiated) resetAutoplay();
  }

  function goPrevious(userInitiated = true) {
    if (isAnimating) return;
    isAnimating = !reducedMotion.matches;

    if (currentIndex === 0) {
      currentIndex = originalCards.length - 1;
      physicalIndex = 0;
      pendingJump = originalCards.length;
    } else {
      currentIndex -= 1;
      physicalIndex -= 1;
    }

    render();
    if (userInitiated) resetAutoplay();
  }

  function goTo(index) {
    if (index === currentIndex || isAnimating) {
      resetAutoplay();
      return;
    }
    currentIndex = index;
    physicalIndex = index + 1;
    pendingJump = null;
    isAnimating = !reducedMotion.matches;
    render();
    resetAutoplay();
  }

  track.addEventListener('transitionend', (event) => {
    if (event.target !== track || event.propertyName !== 'transform') return;
    isAnimating = false;
    if (pendingJump === null) return;
    physicalIndex = pendingJump;
    pendingJump = null;
    render(false);
  });

  previousButton.addEventListener('click', () => goPrevious());
  nextButton.addEventListener('click', () => goNext());
  dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));

  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrevious();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    }
  });

  viewport.addEventListener('pointerdown', (event) => {
    if (isAnimating || (event.pointerType === 'mouse' && event.button !== 0)) return;
    pointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartedAt = performance.now();
    dragDelta = 0;
    dragBaseTranslate = currentTranslate;
    viewport.classList.add('is-dragging');
    viewport.setPointerCapture(pointerId);
    clearAutoplay();
  });

  viewport.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    dragDelta = event.clientX - dragStartX;
    track.style.transform = `translate3d(${dragBaseTranslate + dragDelta}px, 0, 0)`;
  });

  viewport.addEventListener('dragstart', (event) => event.preventDefault());

  function finishDrag(event) {
    if (event.pointerId !== pointerId) return;
    const elapsed = Math.max(performance.now() - dragStartedAt, 1);
    const velocity = dragDelta / elapsed;
    const threshold = Math.min(76, viewport.clientWidth * .13);
    const shouldMove = Math.abs(dragDelta) >= threshold || Math.abs(velocity) > .45;
    pointerId = null;
    viewport.classList.remove('is-dragging');

    if (shouldMove) {
      dragDelta < 0 ? goNext() : goPrevious();
    } else if (Math.abs(dragDelta) < 1) {
      isAnimating = false;
      render(false);
      resetAutoplay();
    } else {
      isAnimating = !reducedMotion.matches;
      render();
      resetAutoplay();
    }
  }

  viewport.addEventListener('pointerup', finishDrag);
  viewport.addEventListener('pointercancel', finishDrag);

  if (window.matchMedia('(hover: hover)').matches) {
    viewport.addEventListener('mouseenter', () => {
      isHovering = true;
      clearAutoplay();
    });
    viewport.addEventListener('mouseleave', () => {
      isHovering = false;
      scheduleAutoplay();
    });
  }

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    isInView = entry.isIntersecting;
    isInView ? scheduleAutoplay() : clearAutoplay();
  }, { threshold: .25 });
  visibilityObserver.observe(section);

  document.addEventListener('visibilitychange', scheduleAutoplay);
  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      if (pendingJump !== null) {
        physicalIndex = pendingJump;
        pendingJump = null;
      }
      isAnimating = false;
      render(false);
    });
  });

  render(false);
})();
