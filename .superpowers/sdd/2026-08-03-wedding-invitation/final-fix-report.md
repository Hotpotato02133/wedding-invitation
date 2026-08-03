# Wedding Invitation Final Fix Report

Date: 2026-08-03
Branch: `feature/wedding-site`
Fix base: `5d75f7f79e788c4189b4ae12288507f56f195d4f`

## Outcome

All five Important and all four Minor findings in `final-review-findings.md` were addressed in one focused wave. Confirmed invitation content and the exported `calculateCountdown` / `validateRsvp` contracts were preserved. A repeatable static/accessibility audit was added and observed failing against the original implementation before the fixes, then passing afterward. A read-only completion review found one additional fallback-dialog gap; that gap received its own red/green audit cycle and was re-reviewed as resolved.

## Per-finding changes

### Important 1 — scrolled header surface

- Files: `styles.css`, `tests/static-audit.js`
- Added a high-specificity `.site-header.is-scrolled` rule after the desktop header media rules, with opaque ivory background, forest text, and shadow.
- Added desktop scrolled-navigation colors and a darker-gold scrolled monogram override so the state remains readable at 1025px and above.
- Audit verifies the scrolled surface, foreground, shadow, cascade position, and accessible hover token.

### Important 2 — RSVP URL/privacy leak without JavaScript

- Files: `index.html`, `script.js`, `styles.css`, `tests/static-audit.js`
- Wrapped all RSVP controls and the submit button in `#rsvp-fields`, disabled in source HTML.
- Added a `<noscript>` explanation. With scripting unavailable, no control can be focused, activated, or submitted as a successful form control.
- The local `submit` handler is installed before `rsvpFields.disabled = false`; its first action remains `event.preventDefault()`. No persistence or transmission was added.
- Moved the two-column layout from the form element to the new fieldset without changing fields or content.

### Important 3 — per-second countdown announcements

- Files: `index.html`, `script.js`, `styles.css`, `tests/static-audit.js`
- Changed the numeric container to `role="timer"` with `aria-live="off"`.
- Added a separate polite `#countdown-status` region.
- Expiration hides the numeric grid and writes `Today is the day!` once to the status region; normal per-second updates remain non-live.

### Important 4 — WCAG color contrast

- Files: `styles.css`, `tests/static-audit.js`
- Preserved `--gold` and `--sage` for decorative or already-conforming large/dark-context use.
- Added context tokens:
  - `--gold-text: #745b32` — 6.29:1 on paper and 5.83:1 on ivory.
  - `--champagne-text: #e7d6b5` — 8.21:1 on forest.
  - `--sage-text: #5b735c` — 5.10:1 on paper.
  - `--focus-ring: #a27b3e` — 3.80:1 on paper, 3.52:1 on ivory, and 3.04:1 on forest.
- Applied the accessible tokens to small eyebrow text, navigation hover text, button hover background, detail features, timeline years, optional form text, closing hashtag, scrolled monogram, and focus outlines.
- Audit calculates contrast from the declared hex values rather than hard-coding a pass result.

### Important 5 — scroll reveal presentation

- Files: `styles.css`, `script.js`, `tests/static-audit.js`
- `.reveal` remains visible by default, so content is readable without JavaScript.
- Intersection Observer now opts observed elements into `.is-reveal-pending`; `.is-visible` transitions opacity and vertical transform to the visible state.
- Reduced-motion and missing-Intersection-Observer paths remain immediately visible, with a CSS `!important` visibility safeguard under `prefers-reduced-motion`.

### Minor 1 — lightbox backdrop target

- Files: `script.js`, `tests/static-audit.js`
- Empty space belonging to either the dialog or its full-height figure closes the lightbox.
- Image, caption, close, previous, and next controls do not match the backdrop condition.

### Minor 2 — mobile navigation focus

- Files: `script.js`, `tests/static-audit.js`
- Escape closes an open mobile menu and returns focus to the navigation toggle.
- Activating a link from the open mobile menu closes it, then moves focus to the destination heading (or destination section fallback) after native anchor navigation.
- Temporary `tabindex="-1"` is removed on blur.

### Minor 3 — attendance group error association

- Files: `index.html`, `tests/static-audit.js`
- Moved `aria-describedby="attendance-error"` to the attendance fieldset so the error describes the complete Yes/No radio group.

### Minor 4 — functional non-`showModal()` fallback

- Files: `script.js`, `styles.css`, `tests/static-audit.js`
- Added fixed full-viewport fallback styling, background scroll lock, background `inert` plus `aria-hidden`, Tab/Shift+Tab containment, outside-focus recovery, and exact cleanup/restoration.
- Moved focus into the dialog before hiding background content, preventing a focused element from remaining under `aria-hidden`.
- Added explicit unsupported-dialog closed-state hiding and fallback-open display.
- Added fallback-only `role="dialog"` and `aria-modal="true"`, restoring any prior values on close.
- Native `showModal()` behavior is left intact; both paths restore focus to the originating gallery item.

## Files changed

- `index.html` — timer/status semantics, inert RSVP baseline, group error association.
- `styles.css` — contrast tokens, scrolled header, reveals, RSVP fieldset layout, lightbox scroll/fallback states.
- `script.js` — timer status, navigation focus, reveal opt-in, fallback modal behavior, RSVP enable ordering.
- `tests/static-audit.js` — complete static requirement, contrast, accessibility-state, fallback, target-size, metadata, content, and asset audit.
- `.superpowers/sdd/2026-08-03-wedding-invitation/final-fix-report.md` — this evidence report.

## Red/green evidence

### Existing baseline tests before changes

Command:

```text
node --test tests/site.test.js
```

Output (exit 0):

```text
✔ calculateCountdown splits a future difference into calendar display units (1.0242ms)
✔ calculateCountdown clamps elapsed events to zero (0.1305ms)
✔ validateRsvp rejects blank identity and missing attendance (0.1613ms)
✔ validateRsvp trims text and accepts a complete response (0.1135ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 73.3401
```

### RED — original final-review findings

Command:

```text
node tests/static-audit.js
```

Output (exit 1):

```text
Static requirement audit failed (37):
- fixed-width viewport declarations do not risk horizontal overflow
- scrolled header uses forest text
- scrolled header uses an opaque ivory surface
- scrolled header has a separating shadow
- scrolled header rule follows desktop header overrides
- RSVP controls are disabled in the HTML baseline
- RSVP includes a no-JavaScript explanation
- RSVP controls enable only after the local submit handler is installed
- countdown numeric updates use a non-live timer
- countdown has a separate polite status region
- expired countdown announces through the separate status region
- dark gold text meets 4.5:1 on light surfaces
- champagne text meets 4.5:1 on forest
- sage text meets 4.5:1 on paper
- focus ring meets 3:1 on light and forest surfaces
- global focus indicator uses the verified focus token
- small gold eyebrow text uses the accessible token
- small navigation hover text uses light champagne
- dark button hover retains text contrast
- detail feature text uses dark gold
- timeline year text uses dark gold
- closing hashtag uses light champagne
- optional field label uses dark sage
- scrolled monogram uses dark gold
- reveal content is visible by default
- JavaScript-ready reveal content has an initial transition state
- observed reveal content transitions to visible
- reveal observer opts elements into animation before revealing them
- reduced-motion styles force reveal content visible
- empty lightbox figure space acts as backdrop without matching media or controls
- Escape closes the mobile menu and returns focus to its toggle
- mobile navigation activation moves focus to its destination
- attendance error describes the full radio group
- fallback modal makes background content inert and hidden from accessibility APIs
- fallback modal contains keyboard focus
- open lightbox locks background scrolling
- fallback lightbox covers the viewport
```

### GREEN — original final-review findings

Command:

```text
node tests/static-audit.js
```

Output (exit 0):

```text
Static requirement audit passed (all site, accessibility, and fallback checks).
```

### RED — completion-review fallback correction

Command:

```text
node tests/static-audit.js
```

Output (exit 1):

```text
Static requirement audit failed (4):
- unsupported dialog implementations keep the closed lightbox hidden
- fallback lightbox becomes visible only while open
- fallback lightbox exposes explicit modal dialog semantics
- fallback lightbox restores prior dialog semantics on close
```

### GREEN — completion-review fallback correction

Command:

```text
node tests/static-audit.js
```

Output (exit 0):

```text
Static requirement audit passed (all site, accessibility, and fallback checks).
```

The read-only reviewer rechecked this correction and returned: `Resolved. ... No remaining blocker in this finding.`

## Fresh final verification

### Pure behavior suite

Command:

```text
node --test tests/site.test.js
```

Output (exit 0):

```text
✔ calculateCountdown splits a future difference into calendar display units (1.0989ms)
✔ calculateCountdown clamps elapsed events to zero (0.1275ms)
✔ validateRsvp rejects blank identity and missing attendance (0.1742ms)
✔ validateRsvp trims text and accepts a complete response (0.1222ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 75.8408
```

### Complete static requirement/accessibility audit

Command:

```text
node tests/static-audit.js
```

Output (exit 0):

```text
Static requirement audit passed (all site, accessibility, and fallback checks).
```

### JavaScript syntax

Command:

```text
node --check script.js
```

Output: empty; exit 0.

### Whitespace

Command:

```text
git diff --check
```

Output (exit 0):

```text
warning: in the working copy of 'index.html', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'script.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'styles.css', LF will be replaced by CRLF the next time Git touches it
```

These are Git line-ending normalization notices, not whitespace errors.

## Self-review

- Re-read every Important and Minor finding against the final diff.
- Confirmed `calculateCountdown` and `validateRsvp` bodies/exports are unchanged and all four original contract tests pass.
- Confirmed RSVP values are neither stored nor transmitted and the no-JavaScript controls cannot submit.
- Confirmed modal fallback restores prior `inert`, `aria-hidden`, `role`, and `aria-modal` state before restoring trigger focus.
- Confirmed backdrop matching excludes media, caption, and controls.
- Confirmed scrolled desktop link rules override the transparent desktop header state.
- Confirmed no `width: 100vw` declarations remain and the intended file set contains no runtime dependencies or generated artifacts.

## Concerns

- No functional blocker remains.
- The new audit is intentionally dependency-free and repeatable, but DOM focus wrapping and assistive-technology announcements were not exercised in a real browser or screen reader in this wave. The relevant state changes, semantics, containment branches, and cleanup are statically audited and independently reviewed.
- Remote placeholder photographs/fonts and the absent local licensed MP3 remain expected sample-site asset concerns documented by the approved spec; they were not changed in this fix wave.
- Git reports expected LF-to-CRLF normalization notices on the three edited existing files; `git diff --check` exits 0.
