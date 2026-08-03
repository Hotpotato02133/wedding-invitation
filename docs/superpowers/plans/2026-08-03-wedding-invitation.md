# Ivan & Lesley Wedding Invitation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, responsive, single-page HTML/CSS/JavaScript wedding invitation for Ivan and Lesley with a live countdown, gallery lightbox, music control, navigation, scroll reveals, and validated RSVP confirmation.

**Architecture:** A semantic `index.html` supplies all readable content and accessible controls; `styles.css` owns the complete mobile-first visual system; `script.js` exposes pure countdown and RSVP-validation functions for Node tests and initializes browser-only interactions behind a DOM guard. Static asset folders document drop-in replacement filenames while remote placeholder photography keeps the first version visually complete.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Node.js built-in test runner, Google Fonts

## Global Constraints

- No frontend framework or runtime dependency.
- Confirmed details: Ivan & Lesley; December 8, 2026; 4:30 PM; Grand Astoria Regency, Pasonanca, Zamboanga City.
- Theme: warm ivory, forest green, muted sage, champagne gold, and subtle blush, implemented with CSS custom properties.
- Breakpoints: mobile through 480px, tablet 481–1024px, laptop 1025–1440px, and centered large-screen layouts above 1440px.
- All interactive controls must have accessible names and at least 44×44px touch targets on mobile.
- All below-fold images must include meaningful `alt` text and `loading="lazy"`.
- Motion must respect `prefers-reduced-motion`.
- RSVP submission remains local and stores no personal information.

---

## File Map

- `index.html` — metadata, favicon, semantic content, editable invitation copy, navigation, forms, dialogs, and audio element.
- `styles.css` — theme tokens, typography, layout, section treatments, responsive breakpoints, interaction states, and motion preferences.
- `script.js` — pure countdown/form logic plus DOM initialization for navigation, music, reveal, lightbox, RSVP, and back-to-top behavior.
- `tests/site.test.js` — behavior tests for countdown boundaries and RSVP validation.
- `images/README.md` — replacement image names and recommended dimensions.
- `music/README.md` — replacement audio name and browser-policy note.

### Task 1: Pure countdown and RSVP behavior

**Files:**
- Create: `tests/site.test.js`
- Create: `script.js`

**Interfaces:**
- Produces: `calculateCountdown(targetDate, nowDate) -> { expired, days, hours, minutes, seconds }`
- Produces: `validateRsvp({ fullName, guests, attendance, message }) -> { isValid, errors, values }`
- `errors` keys are `fullName`, `guests`, and `attendance`; normalized `values.guests` is a number when valid.

- [ ] **Step 1: Write failing countdown tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateCountdown, validateRsvp } = require('../script.js');

test('calculateCountdown splits a future difference into calendar display units', () => {
  const result = calculateCountdown(
    new Date('2026-12-08T16:30:00+08:00'),
    new Date('2026-12-07T14:29:55+08:00')
  );
  assert.deepEqual(result, { expired: false, days: 1, hours: 2, minutes: 0, seconds: 5 });
});

test('calculateCountdown clamps elapsed events to zero', () => {
  const result = calculateCountdown(
    new Date('2026-12-08T16:30:00+08:00'),
    new Date('2026-12-08T16:30:01+08:00')
  );
  assert.deepEqual(result, { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 });
});
```

- [ ] **Step 2: Run the countdown tests and verify the expected module/function failure**

Run: `node --test tests/site.test.js`

Expected: FAIL because `script.js` or `calculateCountdown` does not exist.

- [ ] **Step 3: Implement minimal countdown calculation and CommonJS exports**

```js
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateCountdown };
}
```

- [ ] **Step 4: Run the countdown tests and verify they pass**

Run: `node --test tests/site.test.js`

Expected: both countdown tests PASS; the imported `validateRsvp` may remain unused until its tests are added.

- [ ] **Step 5: Add failing RSVP validation tests**

```js
test('validateRsvp rejects blank identity and missing attendance', () => {
  const result = validateRsvp({ fullName: '  ', guests: '0', attendance: '', message: '' });
  assert.equal(result.isValid, false);
  assert.deepEqual(result.errors, {
    fullName: 'Please enter your full name.',
    guests: 'Please choose between 1 and 10 guests.',
    attendance: 'Please let us know if you can attend.',
  });
});

test('validateRsvp trims text and accepts a complete response', () => {
  const result = validateRsvp({
    fullName: '  Maria Santos  ', guests: '2', attendance: 'yes', message: '  Best wishes!  '
  });
  assert.deepEqual(result, {
    isValid: true,
    errors: {},
    values: { fullName: 'Maria Santos', guests: 2, attendance: 'yes', message: 'Best wishes!' },
  });
});
```

- [ ] **Step 6: Run the RSVP tests and verify the expected missing-function failure**

Run: `node --test tests/site.test.js`

Expected: FAIL with `validateRsvp is not a function`.

- [ ] **Step 7: Implement RSVP normalization and validation**

```js
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
```

Update the CommonJS export to `{ calculateCountdown, validateRsvp }`.

- [ ] **Step 8: Run all pure behavior tests**

Run: `node --test tests/site.test.js`

Expected: 4 tests PASS, 0 failures.

- [ ] **Step 9: Commit the tested behavior**

```bash
git add script.js tests/site.test.js
git commit -m "test: define countdown and RSVP behavior"
```

### Task 2: Semantic invitation content and responsive visual system

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `images/README.md`
- Create: `music/README.md`

**Interfaces:**
- Consumes DOM hooks from Task 1 browser logic: `#countdown`, `[data-countdown]`, `#rsvp-form`, `[data-error-for]`, `#gallery-lightbox`, `#music-toggle`, `#nav-toggle`, `#site-nav`, and `#back-to-top`.
- Produces semantic sections with IDs: `home`, `countdown`, `details`, `couple`, `entourage`, `gallery`, and `rsvp`.

- [ ] **Step 1: Create the semantic HTML document**

Include in `index.html`:

- UTF-8, responsive viewport, title `Ivan & Lesley | December 8, 2026`, description, theme color, and a data-URI heart favicon.
- Google Fonts preconnect and stylesheet for Great Vibes, Cormorant Garamond, and Montserrat.
- Fixed header with monogram `I & L`, all section links, and accessible mobile toggle.
- Full-height hero with invitation eyebrow, `Ivan & Lesley`, `December 08, 2026`, venue, decorative divider, and View Details link to `#details`.
- Countdown heading and four `[data-countdown="days|hours|minutes|seconds"]` values.
- Celebration cards for ceremony at 4:30 PM, reception to follow, Grand Astoria Regency, and formal sage/champagne attire; add a Google Maps query link for the venue.
- Profile images and sample biographies for Ivan and Lesley, plus a three-entry story timeline.
- Filipino entourage groups covering parents, principal sponsors, honor attendants, bridesmaids/groomsmen, bearers, and flower girls with realistic sample names.
- Six gallery buttons with remote placeholder images, descriptive alt text, `loading="lazy"`, `data-full`, and `data-caption`.
- RSVP form with labels, `aria-describedby`, inline error elements, guest options 1–10, attendance options Yes/No, and an optional message.
- Native `<audio id="wedding-music" preload="none" loop>` with `music/wedding-theme.mp3`, a floating music button, status live region, lightbox dialog, closing quote, hashtag `#IVANfoundhisLESLEY`, footer, and back-to-top button.
- HTML comments identifying editable sections, local image replacement paths, and the backend integration point.

- [ ] **Step 2: Build the mobile-first CSS theme and component styling**

Define theme tokens in `:root`: `--ivory: #f8f4ec`, `--paper: #fffdf8`, `--forest: #233d34`, `--sage: #8da18d`, `--gold: #b39057`, `--blush: #dfc7bf`, `--ink: #2f312f`, plus spacing, radii, shadows, and a centered `--container: 1180px`.

Implement:

- Border-box sizing, overflow prevention, fluid `clamp()` typography, readable line height, visible `:focus-visible`, and minimum 44px controls.
- Sticky/fixed navigation states, full-viewport hero overlay, CSS botanical corner motifs, section eyebrow/title/divider patterns, and alternating ivory/paper surfaces.
- 2×2 mobile countdown, single-column detail/profile/entourage/gallery layouts, editorial cards, image aspect ratios, RSVP panel, floating controls, and full-screen lightbox.
- At 481px: two-column detail/couple/gallery layouts and wider form controls.
- At 768px: expanded gallery composition and balanced entourage columns.
- At 1025px: desktop navigation, hidden hamburger, 4-column countdown/details, and three-column gallery.
- At 1441px: preserve the 1180px content cap and modestly increase section spacing.
- `prefers-reduced-motion: reduce` override disabling smooth scrolling and transitions; print-friendly hiding for navigation and controls.

- [ ] **Step 3: Document replacement assets**

`images/README.md` lists `couple-hero.jpg` (2400×1600), `bride.jpg`, `groom.jpg` (1200×1500), and `gallery-1.jpg` through `gallery-6.jpg` (minimum 1600px wide), with instructions to update matching `src`/`data-full` values.

`music/README.md` identifies `wedding-theme.mp3`, recommends an optimized licensed MP3 under 5 MB, and explains that browsers require the visitor to press the music control before playback.

- [ ] **Step 4: Run a static content audit**

Run a PowerShell audit that parses `index.html` as text and asserts the required section IDs, six gallery buttons, RSVP controls, audio source, stylesheet, script, alt attributes, and lazy-loading attributes are present; exit nonzero on a missing requirement.

- [ ] **Step 5: Commit the complete presentation layer**

```bash
git add index.html styles.css images/README.md music/README.md
git commit -m "feat: create responsive wedding invitation layout"
```

### Task 3: Browser interactions and accessible state changes

**Files:**
- Modify: `script.js`

**Interfaces:**
- Consumes all DOM hooks defined in Task 2.
- Preserves `calculateCountdown` and `validateRsvp` exports from Task 1.
- Produces `initSite()` called on `DOMContentLoaded` only when `document` exists.

- [ ] **Step 1: Add countdown rendering**

Create `renderCountdown()` using target `new Date('2026-12-08T16:30:00+08:00')`, call `calculateCountdown`, write zero-padded values to `[data-countdown]`, replace the countdown status with `Today is the day!` when expired, call it immediately, and retain a one-second interval only while active.

- [ ] **Step 2: Add navigation and reveal behavior**

Toggle header `.is-scrolled` after 24px; toggle mobile menu `.is-open` and `aria-expanded`; close it after link activation and on Escape. Observe `.reveal` nodes with threshold `0.14`, add `.is-visible`, unobserve revealed nodes, and reveal all immediately when Intersection Observer is unavailable or reduced motion is requested.

- [ ] **Step 3: Add autoplay-safe music behavior**

On `#music-toggle` click, call `audio.play()` only after interaction; on success toggle `.is-playing`, icon text, and accessible label; on pause restore the muted-note state. Catch rejected/missing-source playback and announce `Add music/wedding-theme.mp3 to enable the soundtrack.` in the status live region.

- [ ] **Step 4: Add the gallery lightbox**

Open the selected gallery item into the dialog image/caption, maintain the selected index, support previous/next wraparound, close button, overlay click, ArrowLeft/ArrowRight, and Escape. Set `body.lightbox-open`, focus close on open, and restore focus to the triggering gallery button on close.

- [ ] **Step 5: Add RSVP field errors and confirmation state**

On submit, pass FormData values into `validateRsvp`, clear old errors, render each new error in `[data-error-for]`, set corresponding `aria-invalid`, and focus the first invalid field. For a valid response, replace the form controls with a confirmation containing the normalized first name and distinct attendance wording for `yes` and `no`; do not transmit or store the values.

- [ ] **Step 6: Add back-to-top visibility and current year**

Show `#back-to-top` after 600px, scroll to the hero when pressed, and write `new Date().getFullYear()` into `[data-current-year]`.

- [ ] **Step 7: Re-run behavior tests after DOM integration**

Run: `node --test tests/site.test.js`

Expected: 4 tests PASS with no attempt to access `document` in Node.

- [ ] **Step 8: Commit the interaction layer**

```bash
git add script.js
git commit -m "feat: add invitation interactions"
```

### Task 4: Final requirement verification

**Files:**
- Modify only files with verified defects.

**Interfaces:**
- Consumes the complete static site.
- Produces a clean, locally openable project with documented asset swaps.

- [ ] **Step 1: Run the full automated test suite**

Run: `node --test tests/site.test.js`

Expected: 4 tests PASS, 0 failures.

- [ ] **Step 2: Run syntax checks**

Run: `node --check script.js`

Expected: exit code 0 and no syntax errors.

- [ ] **Step 3: Run the static requirement audit**

Verify required IDs, metadata, navigation links, six lazy gallery images, audio placeholder, RSVP fields, lightbox controls, responsive media queries, `clamp()`, `prefers-reduced-motion`, visible focus styling, and 44px minimum controls. The audit exits nonzero for any missing item.

- [ ] **Step 4: Inspect version-control state and whitespace**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; only intentional uncommitted verification fixes, if any.

- [ ] **Step 5: Commit any verified final corrections**

```bash
git add index.html styles.css script.js tests/site.test.js images/README.md music/README.md
git commit -m "fix: finalize wedding invitation accessibility"
```

- [ ] **Step 6: Re-run the full verification after the final commit**

Run: `node --test tests/site.test.js`, `node --check script.js`, the static requirement audit, and `git status --short`.

Expected: all 4 tests pass, syntax and audit exit 0, and the worktree is clean.
