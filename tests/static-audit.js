'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getRule(selector) {
  const match = css.match(new RegExp(`${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`));
  return match ? match[1] : '';
}

function getCustomProperty(name) {
  const match = css.match(new RegExp(`--${escapeRegExp(name)}\\s*:\\s*(#[0-9a-f]{6})`, 'i'));
  return match ? match[1] : '';
}

function luminance(hex) {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255);
  const linear = channels.map((channel) => (
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(first, second) {
  if (!first || !second) return 0;
  const firstLuminance = luminance(first);
  const secondLuminance = luminance(second);
  return (Math.max(firstLuminance, secondLuminance) + 0.05)
    / (Math.min(firstLuminance, secondLuminance) + 0.05);
}

check(/<!doctype html>/i.test(html), 'HTML5 doctype is present');
check(/<meta\s+charset="utf-8"/i.test(html), 'UTF-8 metadata is present');
check(/<meta\s+name="viewport"[^>]+width=device-width/i.test(html), 'responsive viewport metadata is present');
check(/<meta\s+name="description"[^>]+content="[^"]+"/i.test(html), 'description metadata is present');
check(/<meta\s+name="theme-color"[^>]+content="#[0-9a-f]{6}"/i.test(html), 'theme color metadata is present');
check(html.includes('<title>Ivan &amp; Leslie | December 8, 2026</title>'), 'confirmed page title is present');
check(/<a class="monogram" href="#home" aria-label="Ivan and Leslie, home">\s*<img[^>]+src="images\/MONOGRAM\.png"/i.test(html), 'navigation logo displays MONOGRAM.png');
check(/<footer class="site-footer"><a class="monogram" href="#home" aria-label="Back to top">\s*<img[^>]+src="images\/MONOGRAM\.png"/i.test(html), 'footer logo displays MONOGRAM.png');
check(/<link\s+rel="icon"[^>]+href="data:image\/svg\+xml,/i.test(html), 'data-URI favicon is present');
['Great+Vibes', 'Cormorant+Garamond', 'Montserrat'].forEach((font) => {
  check(html.includes(font), `${font.replaceAll('+', ' ')} font is requested`);
});
check(html.includes('href="styles.css"') && html.includes('src="script.js"'), 'local stylesheet and script are linked');
['December 08, 2026', '4:30 PM', 'Grand Astoria Regency'].forEach((detail) => {
  check(html.includes(detail), `confirmed content is preserved: ${detail}`);
});
check(html.includes('href="https://www.google.com/maps/search/?api=1&amp;query=W3XF%2BWCG%20Astoria%20Regency%2C%20Pasonanca%20Road%2C%20Zamboanga%20City%2C%20Zamboanga%20Del%20Sur"'), 'directions link targets Astoria Regency by exact Plus Code and address');

const sectionIds = ['home', 'countdown', 'details', 'couple', 'entourage', 'gallery'];
sectionIds.forEach((id) => {
  check(new RegExp(`<section\\b[^>]*\\bid="${id}"`, 'i').test(html), `section #${id} is present`);
  check(html.includes(`href="#${id}"`), `navigation link to #${id} is present`);
});
check(!/<section\b[^>]*\bid="rsvp"/i.test(html), 'RSVP section is absent');
check(!html.includes('href="#rsvp"'), 'RSVP navigation link is absent');
check(!html.includes('id="rsvp-form"'), 'RSVP form is absent');

const galleryItems = html.match(/<button\s+class="gallery-item"[\s\S]*?<\/button>/g) || [];
check(galleryItems.length === 6, 'gallery contains exactly six buttons');
galleryItems.forEach((item, index) => {
  check(/<img\b[^>]*\balt="[^"]+"/i.test(item), `gallery image ${index + 1} has meaningful alt text`);
  check(/<img\b[^>]*\bloading="lazy"/i.test(item), `gallery image ${index + 1} lazy loads`);
  check(/\bdata-full="[^"]+"/.test(item) && /\bdata-caption="[^"]+"/.test(item), `gallery item ${index + 1} has full image and caption data`);
});
const images = html.match(/<img\b[^>]*>/gi) || [];
images.forEach((image, index) => {
  check(/\balt="[^"]+"/i.test(image), `image ${index + 1} has meaningful alt text`);
  check(/\bloading="lazy"/i.test(image), `below-fold image ${index + 1} lazy loads`);
});

check(html.includes('id="wedding-music"') && html.includes('src="music/paulyudin-wedding-music-valentines-day-182505.mp3"'), 'selected wedding soundtrack is present');
check(/<audio\b[^>]*\bid="wedding-music"[^>]*\bautoplay[^>]*\bloop/i.test(html), 'background music attempts autoplay and loops');
check(script.includes('startMusicOnFirstInteraction') && script.includes("document.addEventListener('pointerdown'") && script.includes("document.addEventListener('keydown'"), 'blocked autoplay retries after the visitor first interacts');
check(html.includes('id="gallery-lightbox"') && html.includes('aria-label="Close image"'), 'lightbox and close control are present');
check(script.includes("'Previous image'") && script.includes("'Next image'"), 'previous and next lightbox controls are present');

['481px', '1025px', '1441px'].forEach((breakpoint) => {
  check(css.includes(`@media (min-width: ${breakpoint})`), `${breakpoint} responsive breakpoint is present`);
});
check(css.includes('clamp('), 'fluid clamp sizing is present');
check(css.includes('@media (prefers-reduced-motion: reduce)'), 'reduced-motion styles are present');
check(css.includes(':focus-visible'), 'visible focus styling is present');
check(/min-height:\s*44px/.test(getRule('button, a')), 'links and buttons have a 44px minimum target height');
check(/width:\s*44px/.test(getRule('.nav-toggle')), 'mobile navigation toggle has a 44px target width');
check(/min-height:\s*48px/.test(getRule('.form-field input:not([type="radio"]), .form-field select, .form-field textarea')), 'form controls exceed the 44px target minimum');
check(/padding:\s*2\.5rem 1rem \.75rem/.test(getRule('.site-footer')), 'footer uses compact bottom padding without excess space');
check(/width:\s*46px/.test(getRule('.lightbox-close')) && /height:\s*46px/.test(getRule('.lightbox-close')), 'lightbox controls exceed the 44px target minimum');
check(!/width:\s*100vw/.test(css), 'fixed-width viewport declarations do not risk horizontal overflow');

const scrolledHeader = getRule('.site-header.is-scrolled');
check(/color:\s*var\(--forest\)/.test(scrolledHeader), 'scrolled header uses forest text');
check(/background:\s*var\(--ivory\)/.test(scrolledHeader), 'scrolled header uses an opaque ivory surface');
check(/box-shadow:/.test(scrolledHeader), 'scrolled header has a separating shadow');
check(/\.site-header\.is-scrolled[\s\S]*@media \(prefers-reduced-motion/.test(css), 'scrolled header rule follows desktop header overrides');

const countdownGridTag = html.match(/<div\b[^>]*\bclass="countdown-grid"[^>]*>/i)?.[0] || '';
check(/\brole="timer"/.test(countdownGridTag) && /\baria-live="off"/.test(countdownGridTag), 'countdown numeric updates use a non-live timer');
check(/id="countdown-status"[^>]*aria-live="polite"/.test(html), 'countdown has a separate polite status region');
const countdownEmptyRule = getRule('.countdown-status:empty');
check(!/display\s*:\s*none|visibility\s*:\s*hidden/.test(countdownEmptyRule), 'empty countdown status remains exposed to assistive technology');
check(script.includes('countdownStatus') && script.includes("countdownStatus.textContent = 'Today is the day!';"), 'expired countdown announces through the separate status region');

const colors = {
  ivory: getCustomProperty('ivory'),
  paper: getCustomProperty('paper'),
  forest: getCustomProperty('forest'),
  goldText: getCustomProperty('gold-text'),
  champagneText: getCustomProperty('champagne-text'),
  sageText: getCustomProperty('sage-text'),
  focusRing: getCustomProperty('focus-ring'),
};
check(contrast(colors.goldText, colors.ivory) >= 4.5 && contrast(colors.goldText, colors.paper) >= 4.5, 'dark gold text meets 4.5:1 on light surfaces');
check(contrast(colors.champagneText, colors.forest) >= 4.5, 'champagne text meets 4.5:1 on forest');
check(contrast(colors.sageText, colors.paper) >= 4.5, 'sage text meets 4.5:1 on paper');
check(contrast(colors.focusRing, colors.paper) >= 3 && contrast(colors.focusRing, colors.forest) >= 3, 'focus ring meets 3:1 on light and forest surfaces');
check(/outline:\s*3px solid var\(--focus-ring\)/.test(getRule(':focus-visible')), 'global focus indicator uses the verified focus token');
check(/color:\s*var\(--gold-text\)/.test(getRule('.eyebrow')), 'small gold eyebrow text uses the accessible token');
check(/color:\s*var\(--champagne-text\)/.test(getRule('.site-nav a:hover')), 'small navigation hover text uses light champagne');
check(/background:\s*var\(--gold-text\)/.test(getRule('.button-dark:hover')), 'dark button hover retains text contrast');
check(/color:\s*var\(--gold-text\)/.test(getRule('.detail-card .detail-feature')), 'detail feature text uses dark gold');
check(/color:\s*var\(--gold-text\)/.test(getRule('.story-timeline span')), 'timeline year text uses dark gold');
check(/color:\s*var\(--champagne-text\)/.test(getRule('.closing strong')), 'closing hashtag uses light champagne');
check(/color:\s*var\(--sage-text\)/.test(getRule('.form-field label span')), 'optional field label uses dark sage');
check(/color:\s*var\(--gold-text\)/.test(getRule('.site-header.is-scrolled .monogram span')), 'scrolled monogram uses dark gold');

check(/opacity:\s*1/.test(getRule('.reveal')) && /transform:\s*none/.test(getRule('.reveal')), 'reveal content is visible by default');
check(/opacity:\s*0/.test(getRule('.reveal.is-reveal-pending')) && /transform:/.test(getRule('.reveal.is-reveal-pending')), 'JavaScript-ready reveal content has an initial transition state');
check(/opacity:\s*1/.test(getRule('.reveal.is-reveal-pending.is-visible')) && /transform:\s*none/.test(getRule('.reveal.is-reveal-pending.is-visible')), 'observed reveal content transitions to visible');
check(script.includes("element.classList.add('is-reveal-pending')") && script.includes("element.classList.add('is-visible')"), 'reveal observer opts elements into animation before revealing them');
check(/prefers-reduced-motion:[\s\S]*\.reveal[^{]*\{[^}]*opacity:\s*1\s*!important[^}]*transform:\s*none\s*!important/i.test(css), 'reduced-motion styles force reveal content visible');

check(script.includes('event.target === lightbox || event.target === lightboxFigure'), 'empty lightbox figure space acts as backdrop without matching media or controls');
check(script.includes('closeMenu({ returnFocus: true })'), 'Escape closes the mobile menu and returns focus to its toggle');
check(script.includes('focusNavigationDestination(link)'), 'mobile navigation activation moves focus to its destination');
check(script.includes('handleInternalNavigation') && script.includes("document.querySelectorAll('a[href^=\"#\"]')") && script.includes("link.addEventListener('click', handleInternalNavigation)"), 'internal links use JavaScript section navigation instead of file URL fragments');
check(script.includes("element.setAttribute('inert', '')") && script.includes("element.setAttribute('aria-hidden', 'true')"), 'fallback modal makes background content inert and hidden from accessibility APIs');
check(script.includes("event.key === 'Tab'") && script.includes('trapFallbackFocus'), 'fallback modal contains keyboard focus');
check(/body\.lightbox-open/.test(css) && /overflow:\s*hidden/.test(getRule('body.lightbox-open')), 'open lightbox locks background scrolling');
check(/position:\s*fixed/.test(getRule('.gallery-lightbox.is-fallback-modal')), 'fallback lightbox covers the viewport');
check(/display:\s*none/.test(getRule('.gallery-lightbox:not([open])')), 'unsupported dialog implementations keep the closed lightbox hidden');
check(/display:\s*block/.test(getRule('.gallery-lightbox.is-fallback-modal[open]')), 'fallback lightbox becomes visible only while open');
check(script.includes("lightbox.setAttribute('role', 'dialog')") && script.includes("lightbox.setAttribute('aria-modal', 'true')"), 'fallback lightbox exposes explicit modal dialog semantics');
check(script.includes("restoreAttribute(lightbox, 'role'") && script.includes("restoreAttribute(lightbox, 'aria-modal'"), 'fallback lightbox restores prior dialog semantics on close');

if (failures.length) {
  console.error(`Static requirement audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Static requirement audit passed (all site, accessibility, and fallback checks).');
}
