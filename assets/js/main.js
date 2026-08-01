(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      mobilePanel.classList.toggle('open', !open);
      document.body.style.overflow = !open ? 'hidden' : '';
    });
    mobilePanel.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      mobilePanel.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  document.querySelectorAll('[data-current-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -30px' })
    : null;
  document.querySelectorAll('.reveal').forEach((el) => {
    if (observer) observer.observe(el);
    else el.classList.add('visible');
  });

  document.querySelectorAll('[data-language-choice]').forEach((link) => {
    link.addEventListener('click', () => {
      try { localStorage.setItem('kolequant-language', link.dataset.languageChoice); } catch (_) {}
    });
  });

  const tabs = [...document.querySelectorAll('.domain-tab')];
  const panels = [...document.querySelectorAll('.domain-panel')];
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.domain;
      tabs.forEach((item) => item.classList.toggle('active', item === tab));
      panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.domainPanel === target));
      tabs.forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
    });
  });

  document.querySelectorAll('form[data-prototype-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const message = form.querySelector('.form-message');
      if (message) message.classList.add('show');
      const submit = form.querySelector('[type="submit"]');
      if (submit) submit.disabled = true;
      message?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
})();
