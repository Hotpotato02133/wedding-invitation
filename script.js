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
  let countdownTimer;

  function renderCountdown() {
    const remaining = calculateCountdown(targetDate);

    if (remaining.expired) {
      window.clearInterval(countdownTimer);
      if (countdown) countdown.querySelector('.countdown-grid').textContent = 'Today is the day!';
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
  const closeMenu = () => {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
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
    siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
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
    revealElements.forEach((element) => revealObserver.observe(element));
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
    if (musicStatus) musicStatus.textContent = 'Add music/wedding-theme.mp3 to enable the soundtrack.';
  };

  if (audio && musicToggle) {
    audio.addEventListener('play', () => setMusicState(true));
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
  let selectedGalleryIndex = 0;
  let lightboxTrigger;

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

  function closeLightbox() {
    if (!lightbox) return;
    if (lightbox.open && typeof lightbox.close === 'function') lightbox.close();
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
    else lightbox.setAttribute('open', '');
    if (lightboxClose) lightboxClose.focus();
  }

  function handleLightboxClose() {
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
      if (event.target === lightbox) closeLightbox();
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrevious) lightboxPrevious.addEventListener('click', () => showGalleryImage(selectedGalleryIndex - 1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => showGalleryImage(selectedGalleryIndex + 1));
  }
  galleryItems.forEach((item, index) => item.addEventListener('click', () => openLightbox(index, item)));

  const rsvpForm = document.querySelector('#rsvp-form');
  if (rsvpForm) {
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
    if (event.key === 'Escape') {
      closeMenu();
      if (lightbox && lightbox.open) closeLightbox();
    }
    if (!lightbox || !lightbox.open) return;
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
