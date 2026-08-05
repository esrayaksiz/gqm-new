(() => {
  const items = [...document.querySelectorAll('.detail-item')];

  items.forEach((item) => {
    const trigger = item.querySelector('button');
    const panel = item.querySelector('.detail-item__panel');

    trigger.addEventListener('click', () => {
      const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
      item.classList.toggle('is-open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
      panel.setAttribute('aria-hidden', String(!willOpen));
    });
  });
})();
