'use strict';

function calculateCountdown(targetDate, nowDate = new Date()) {
  const difference = targetDate.getTime() - nowDate.getTime();
  if (!Number.isFinite(difference) || difference <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    expired: false,
    days: Math.floor(difference / 86400000),
    hours: Math.floor((difference % 86400000) / 3600000),
    minutes: Math.floor((difference % 3600000) / 60000),
    seconds: Math.floor((difference % 60000) / 1000),
  };
}

function validateRsvp(input) {
  const values = {
    fullName: String(input.fullName || '').trim(),
    guests: Number(input.guests),
    attendance: String(input.attendance || ''),
    message: String(input.message || '').trim(),
  };
  const errors = {};

  if (!values.fullName) errors.fullName = 'Please enter your full name.';
  if (!Number.isInteger(values.guests) || values.guests < 1 || values.guests > 10) {
    errors.guests = 'Please choose between 1 and 10 guests.';
  }
  if (!['yes', 'no'].includes(values.attendance)) {
    errors.attendance = 'Please let us know if you can attend.';
  }

  return { isValid: Object.keys(errors).length === 0, errors, values };
}

function initSite() {
  const targetDate = new Date('2026-12-08T16:30:00+08:00');
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const countdown = document.querySelector('#countdown');
  const countdownStatus = document.querySelector('#countdown-status');
  let countdownTimer;

  function renderCountdown() {
    const remaining = calculateCountdown(targetDate);

    if (remaining.expired) {
      window.clearInterval(countdownTimer);
      if (countdown) countdown.querySelector('.countdown-grid').hidden = true;
      if (countdownStatus && !countdownStatus.textContent) {
        countdownStatus.textContent = 'Today is the day!';
      }
      return true;
    }

    Object.entries(remaining).forEach(([unit, value]) => {
      const display = document.querySelector(`[data-countdown="${unit}"]`);
      if (!display) return;
      const width = unit === 'days' ? 3 : 2;
      display.textContent = String(value).padStart(width, '0');
    });
    return false;
  }

  if (!renderCountdown()) {
    countdownTimer = window.setInterval(renderCountdown, 1000);
  }

  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('#nav-toggle');
  const siteNav = document.querySelector('#site-nav');
  const closeMenu = ({ returnFocus = false } = {}) => {
    if (!navToggle || !siteNav) return;
    const wasOpen = siteNav.classList.contains('is-open')
      || navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
    if (returnFocus && wasOpen) navToggle.focus();
  };
  const focusNavigationDestination = (link) => {
    if (!link.hash) return;
    const destination = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!destination) return;
    const focusTarget = destination.querySelector('h1, h2, h3') || destination;
    if (!focusTarget.hasAttribute('tabindex')) {
      focusTarget.setAttribute('tabindex', '-1');
      focusTarget.addEventListener('blur', () => focusTarget.removeAttribute('tabindex'), { once: true });
    }
    window.setTimeout(() => focusTarget.focus({ preventScroll: true }), 0);
  };
  const updateHeader = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = !siteNav.classList.contains('is-open');
      siteNav.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      const wasOpen = siteNav.classList.contains('is-open')
        || navToggle.getAttribute('aria-expanded') === 'true';
      closeMenu();
      if (wasOpen) focusNavigationDestination(link);
    }));
  }

  const revealElements = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    revealElements.forEach((element) => {
      element.classList.add('is-reveal-pending');
      revealObserver.observe(element);
    });
  }

  const audio = document.querySelector('#wedding-music');
  const musicToggle = document.querySelector('#music-toggle');
  const musicStatus = document.querySelector('#music-status');
  const musicIcon = musicToggle && musicToggle.querySelector('[aria-hidden="true"]');
  const setMusicState = (isPlaying) => {
    if (!musicToggle) return;
    musicToggle.classList.toggle('is-playing', isPlaying);
    musicToggle.setAttribute('aria-label', isPlaying ? 'Pause background music' : 'Play background music');
    musicToggle.setAttribute('aria-pressed', String(isPlaying));
    if (musicIcon) musicIcon.textContent = isPlaying ? '❚❚' : '♫';
  };
  const announceMusicUnavailable = () => {
    if (musicStatus) musicStatus.textContent = 'The wedding soundtrack could not be played.';
  };

  if (audio && musicToggle) {
    const clearFirstInteractionListeners = () => {
      document.removeEventListener('pointerdown', startMusicOnFirstInteraction);
      document.removeEventListener('keydown', startMusicOnFirstInteraction);
    };
    async function startMusicOnFirstInteraction(event) {
      if (musicToggle.contains(event.target)) return;
      if (!audio.paused) {
        clearFirstInteractionListeners();
        return;
      }
      try {
        await audio.play();
      } catch (error) {
        setMusicState(false);
        announceMusicUnavailable();
      }
    }
    document.addEventListener('pointerdown', startMusicOnFirstInteraction, { passive: true });
    document.addEventListener('keydown', startMusicOnFirstInteraction);
    audio.addEventListener('play', () => {
      clearFirstInteractionListeners();
      setMusicState(true);
    });
    audio.addEventListener('pause', () => setMusicState(false));
    audio.addEventListener('error', announceMusicUnavailable);
    musicToggle.addEventListener('click', async () => {
      if (!audio.paused) {
        audio.pause();
        return;
      }
      try {
        await audio.play();
      } catch (error) {
        setMusicState(false);
        announceMusicUnavailable();
      }
    });
  }

  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.querySelector('#gallery-lightbox');
  const lightboxImage = lightbox && lightbox.querySelector('figure img');
  const lightboxCaption = lightbox && lightbox.querySelector('figcaption');
  const lightboxClose = lightbox && lightbox.querySelector('.lightbox-close');
  const lightboxFigure = lightbox && lightbox.querySelector('figure');
  let selectedGalleryIndex = 0;
  let lightboxTrigger;
  let isFallbackModal = false;
  let fallbackBackgroundState = [];
  let fallbackDialogAttributes;

  function createLightboxControl(className, label, text, position) {
    if (!lightbox) return null;
    const existingControl = lightbox.querySelector(`.${className}`);
    if (existingControl) return existingControl;

    const control = document.createElement('button');
    control.type = 'button';
    control.className = `lightbox-close ${className}`;
    control.setAttribute('aria-label', label);
    control.textContent = text;
    control.style.cssText = position;
    lightbox.append(control);
    return control;
  }

  const lightboxPrevious = createLightboxControl('lightbox-previous', 'Previous image', '←', 'right: auto; left: 1rem;');
  const lightboxNext = createLightboxControl('lightbox-next', 'Next image', '→', 'right: 4.5rem;');

  function showGalleryImage(index) {
    if (!galleryItems.length || !lightboxImage || !lightboxCaption) return;
    selectedGalleryIndex = (index + galleryItems.length) % galleryItems.length;
    const galleryItem = galleryItems[selectedGalleryIndex];
    const thumbnail = galleryItem.querySelector('img');
    lightboxImage.src = galleryItem.dataset.full || (thumbnail && thumbnail.currentSrc) || (thumbnail && thumbnail.src) || '';
    lightboxImage.alt = (thumbnail && thumbnail.alt) || '';
    lightboxCaption.textContent = galleryItem.dataset.caption || '';
  }

  function activateLightboxFallback() {
    if (!lightbox || isFallbackModal) return;
    isFallbackModal = true;
    lightbox.classList.add('is-fallback-modal');
    fallbackDialogAttributes = {
      role: lightbox.getAttribute('role'),
      ariaModal: lightbox.getAttribute('aria-modal'),
    };
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    if (lightboxClose) lightboxClose.focus();
    fallbackBackgroundState = Array.from(document.body.children)
      .filter((element) => element !== lightbox)
      .map((element) => {
        const state = {
          element,
          hadInert: element.hasAttribute('inert'),
          ariaHidden: element.getAttribute('aria-hidden'),
        };
        element.setAttribute('inert', '');
        element.inert = true;
        element.setAttribute('aria-hidden', 'true');
        return state;
      });
  }

  function restoreAttribute(element, name, value) {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }

  function deactivateLightboxFallback() {
    if (!isFallbackModal) return;
    fallbackBackgroundState.forEach(({ element, hadInert, ariaHidden }) => {
      if (!hadInert) {
        element.removeAttribute('inert');
        element.inert = false;
      }
      if (ariaHidden === null) element.removeAttribute('aria-hidden');
      else element.setAttribute('aria-hidden', ariaHidden);
    });
    fallbackBackgroundState = [];
    isFallbackModal = false;
    if (lightbox) {
      lightbox.classList.remove('is-fallback-modal');
      restoreAttribute(lightbox, 'role', fallbackDialogAttributes.role);
      restoreAttribute(lightbox, 'aria-modal', fallbackDialogAttributes.ariaModal);
    }
    fallbackDialogAttributes = undefined;
  }

  function trapFallbackFocus(event) {
    if (!isFallbackModal || event.key !== 'Tab' || !lightbox) return;
    const focusable = Array.from(lightbox.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !lightbox.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !lightbox.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  }

  function containFallbackFocus(event) {
    if (isFallbackModal && lightbox && !lightbox.contains(event.target) && lightboxClose) {
      lightboxClose.focus();
    }
  }

  function closeLightbox() {
    if (!lightbox) return;
    if (!isFallbackModal && lightbox.open && typeof lightbox.close === 'function') lightbox.close();
    else {
      lightbox.removeAttribute('open');
      handleLightboxClose();
    }
  }

  function openLightbox(index, trigger) {
    if (!lightbox) return;
    lightboxTrigger = trigger;
    showGalleryImage(index);
    document.body.classList.add('lightbox-open');
    if (typeof lightbox.showModal === 'function') lightbox.showModal();
    else {
      lightbox.setAttribute('open', '');
      activateLightboxFallback();
    }
    if (lightboxClose && document.activeElement !== lightboxClose) lightboxClose.focus();
  }

  function handleLightboxClose() {
    deactivateLightboxFallback();
    document.body.classList.remove('lightbox-open');
    if (lightboxTrigger) lightboxTrigger.focus();
  }

  if (lightbox) {
    lightbox.addEventListener('close', handleLightboxClose);
    lightbox.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeLightbox();
    });
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox || event.target === lightboxFigure) closeLightbox();
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrevious) lightboxPrevious.addEventListener('click', () => showGalleryImage(selectedGalleryIndex - 1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => showGalleryImage(selectedGalleryIndex + 1));
  }
  document.addEventListener('focusin', containFallbackFocus);
  galleryItems.forEach((item, index) => item.addEventListener('click', () => openLightbox(index, item)));

  const rsvpForm = document.querySelector('#rsvp-form');
  const rsvpFields = document.querySelector('#rsvp-fields');
  if (rsvpForm && rsvpFields) {
    rsvpForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const response = validateRsvp(Object.fromEntries(new FormData(rsvpForm).entries()));
      const fields = ['fullName', 'guests', 'attendance'];

      fields.forEach((fieldName) => {
        const error = rsvpForm.querySelector(`[data-error-for="${fieldName}"]`);
        if (error) error.textContent = '';
        Array.from(rsvpForm.elements).filter((element) => element.name === fieldName)
          .forEach((element) => element.removeAttribute('aria-invalid'));
      });

      if (!response.isValid) {
        let firstInvalidField;
        Object.entries(response.errors).forEach(([fieldName, message]) => {
          const error = rsvpForm.querySelector(`[data-error-for="${fieldName}"]`);
          const fieldsWithName = Array.from(rsvpForm.elements).filter((element) => element.name === fieldName);
          if (error) error.textContent = message;
          fieldsWithName.forEach((field) => field.setAttribute('aria-invalid', 'true'));
          if (!firstInvalidField) firstInvalidField = fieldsWithName[0];
        });
        if (firstInvalidField) firstInvalidField.focus();
        return;
      }

      const firstName = response.values.fullName.split(/\s+/)[0];
      const confirmation = document.createElement('div');
      confirmation.className = 'rsvp-confirmation';
      confirmation.tabIndex = -1;
      confirmation.setAttribute('role', 'status');
      const heading = document.createElement('h3');
      const message = document.createElement('p');
      heading.textContent = `Thank you, ${firstName}!`;
      message.textContent = response.values.attendance === 'yes'
        ? 'We are so happy you will be celebrating with us.'
        : 'We will miss you, but thank you for letting us know.';
      confirmation.append(heading, message);
      rsvpForm.replaceChildren(confirmation);
      confirmation.focus();
    });
    rsvpFields.disabled = false;
  }

  const backToTop = document.querySelector('#back-to-top');
  const hero = document.querySelector('#home');
  const updateBackToTop = () => {
    if (backToTop) backToTop.hidden = window.scrollY <= 600;
  };

  updateBackToTop();
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  if (backToTop && hero) {
    backToTop.addEventListener('click', (event) => {
      event.preventDefault();
      hero.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') trapFallbackFocus(event);
    if (event.key === 'Escape') {
      closeMenu({ returnFocus: true });
      if (lightbox && (lightbox.open || lightbox.hasAttribute('open'))) closeLightbox();
    }
    if (!lightbox || (!lightbox.open && !lightbox.hasAttribute('open'))) return;
    if (event.key === 'ArrowLeft') showGalleryImage(selectedGalleryIndex - 1);
    if (event.key === 'ArrowRight') showGalleryImage(selectedGalleryIndex + 1);
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initSite, { once: true });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateCountdown, validateRsvp };
}
