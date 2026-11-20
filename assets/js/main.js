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
  const selectDomain = (tab) => {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.domainPanel === tab.dataset.domain));
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectDomain(tab));
    tab.addEventListener('keydown', (event) => {
      const destinations = {
        ArrowDown: (index + 1) % tabs.length,
        ArrowUp: (index + tabs.length - 1) % tabs.length,
        ArrowRight: (index + 1) % tabs.length,
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1
      };
      if (!Object.hasOwn(destinations, event.key)) return;
      event.preventDefault();
      const next = tabs[destinations[event.key]];
      selectDomain(next);
      next.focus();
    });
  });

  const emailForms = [...document.querySelectorAll('form[action^="https://formsubmit.co/"]')];
  emailForms.forEach((form) => {
    const language = document.documentElement.lang === 'bg' ? 'bg' : 'en';
    const interestField = form.querySelector('#e-interest, #b-interest');
    const interestWrapper = interestField?.closest('.field');
    const consentText = form.querySelector('.checkbox span');
    const subjectField = form.querySelector('input[name="_subject"]');

    if (interestField) {
      const messageWrapper = document.createElement('div');
      messageWrapper.className = 'field full';
      const messageId = language === 'bg' ? 'b-message' : 'e-message';
      messageWrapper.innerHTML = language === 'bg'
        ? `<label for="${messageId}">Съобщение <span>(по избор)</span></label><textarea id="${messageId}" name="message" rows="5" placeholder="Напиши кратко съобщение, ако имаш конкретен въпрос."></textarea>`
        : `<label for="${messageId}">Message <span>(optional)</span></label><textarea id="${messageId}" name="message" rows="5" placeholder="Add a short message if you have a specific question."></textarea>`;
      interestWrapper?.insertAdjacentElement('afterend', messageWrapper);

      const messageField = messageWrapper.querySelector('textarea');
      const updateFormMode = () => {
        const isGeneralInquiry = interestField.value === 'general_inquiry';
        if (messageField) {
          messageField.required = isGeneralInquiry;
          const label = messageWrapper.querySelector('label');
          if (label) {
            label.innerHTML = isGeneralInquiry
              ? (language === 'bg' ? 'Съобщение' : 'Message')
              : (language === 'bg' ? 'Съобщение <span>(по избор)</span>' : 'Message <span>(optional)</span>');
          }
        }
        if (consentText) {
          consentText.textContent = isGeneralInquiry
            ? (language === 'bg'
                ? 'Съгласявам се данните ми да бъдат използвани, за да получа отговор на запитването си.'
                : 'I agree that my details may be used to respond to my inquiry.')
            : (language === 'bg'
                ? 'Съгласявам се да получавам съобщения от KoleQuant и Nytheria. Разбирам, че мога да се отпиша по всяко време.'
                : 'I agree to receive communications from KoleQuant and Nytheria. I understand that I can unsubscribe at any time.');
        }
        if (subjectField) {
          const subjects = language === 'bg'
            ? {
                waiting_list: 'Нова регистрация в списъка с чакащи за Nytheria',
                newsletter: 'Нова регистрация за бюлетина на KoleQuant',
                general_inquiry: 'Ново общо запитване през kolequant.xyz'
              }
            : {
                waiting_list: 'New Nytheria waiting-list registration',
                newsletter: 'New KoleQuant newsletter registration',
                general_inquiry: 'New general inquiry from kolequant.xyz'
              };
          subjectField.value = subjects[interestField.value] || subjects.waiting_list;
        }
      };
      interestField.addEventListener('change', updateFormMode);
      if (/(?:#|\/)enquiries$/.test(window.location.hash)) interestField.value = 'general_inquiry';
      updateFormMode();
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const submitButton = form.querySelector('[type="submit"]');
      const originalButtonText = submitButton?.textContent;

      let status = form.querySelector('[data-form-status]');
      if (!status) {
        status = document.createElement('div');
        status.dataset.formStatus = '';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        status.hidden = true;
        form.appendChild(status);
      }

      const formData = new FormData(form);
      formData.set('_captcha', 'false');
      formData.delete('_next');

      const action = form.getAttribute('action') || '';
      const ajaxAction = action.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = language === 'bg' ? 'Изпращане...' : 'Sending...';
      }

      status.hidden = true;

      try {
        const response = await fetch(ajaxAction, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || ![true, 'true'].includes(result.success)) {
          throw new Error(result.message || 'Submission failed');
        }

        status.textContent = language === 'bg'
          ? 'Благодарим! Формата е изпратена успешно.'
          : 'Thank you! Your form has been sent successfully.';
        status.dataset.formStatus = 'success';
        status.hidden = false;
        form.reset();
        if (interestField) interestField.dispatchEvent(new Event('change'));
        status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (_) {
        status.textContent = language === 'bg'
          ? 'Не успяхме да изпратим формата. Моля, опитай отново след малко.'
          : 'We could not send the form. Please try again in a moment.';
        status.dataset.formStatus = 'error';
        status.hidden = false;
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          if (originalButtonText) submitButton.textContent = originalButtonText;
        }
      }
    });
  });
})();

