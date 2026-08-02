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

  const emailForms = [...document.querySelectorAll('form[action^="https://formsubmit.co/"]')];
  emailForms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const submitButton = form.querySelector('[type="submit"]');
      const originalButtonContent = submitButton?.innerHTML;
      const language = document.documentElement.lang === 'bg' ? 'bg' : 'en';

      let status = form.querySelector('[data-form-status]');
      if (!status) {
        status = document.createElement('div');
        status.dataset.formStatus = '';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        status.style.marginTop = '18px';
        status.style.padding = '14px 16px';
        status.style.borderRadius = '12px';
        status.style.display = 'none';
        form.appendChild(status);
      }

      const fieldNames = {
        'b-first': 'first_name',
        'b-last': 'last_name',
        'b-email': 'email',
        'b-country': 'country',
        'b-city': 'city',
        'b-interest': 'interest'
      };
      Object.entries(fieldNames).forEach(([id, name]) => {
        const field = form.querySelector(`#${id}`);
        if (field && !field.name) field.name = name;
      });

      const formData = new FormData(form);
      formData.set('_captcha', 'false');
      formData.delete('_next');

      const action = form.getAttribute('action') || '';
      const ajaxAction = action.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = language === 'bg' ? 'Изпращане...' : 'Sending...';
      }

      status.style.display = 'none';

      try {
        const response = await fetch(ajaxAction, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success === false) {
          throw new Error(result.message || 'Submission failed');
        }

        status.textContent = language === 'bg'
          ? 'Благодарим! Регистрацията ти е изпратена успешно.'
          : 'Thank you! Your registration has been sent successfully.';
        status.style.display = 'block';
        status.style.background = 'rgba(28, 120, 91, 0.12)';
        status.style.border = '1px solid rgba(28, 120, 91, 0.3)';
        status.style.color = 'inherit';
        form.reset();
        status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (_) {
        status.textContent = language === 'bg'
          ? 'Не успяхме да изпратим регистрацията. Моля, опитай отново след малко.'
          : 'We could not send your registration. Please try again in a moment.';
        status.style.display = 'block';
        status.style.background = 'rgba(160, 45, 55, 0.1)';
        status.style.border = '1px solid rgba(160, 45, 55, 0.28)';
        status.style.color = 'inherit';
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          if (originalButtonContent) submitButton.innerHTML = originalButtonContent;
        }
      }
    });
  });
})();
