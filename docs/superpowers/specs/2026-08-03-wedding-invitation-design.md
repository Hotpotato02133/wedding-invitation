# Ivan & Leslie Wedding Invitation — Design Specification

## Purpose

Create a single-page digital wedding invitation for Ivan and Leslie that feels elegant, romantic, personal, and distinctly suited to a Filipino wedding celebration. The page must work as a polished sample immediately while making names, copy, imagery, colors, music, and event details straightforward to replace.

## Confirmed Event Details

- Couple: Ivan & Leslie
- Date: December 8, 2026
- Ceremony time: 4:30 PM
- Ceremony and reception venue: Grand Astoria Regency, Pasonanca, Zamboanga City
- RSVP deadline: November 8, 2026

## Visual Direction

Use a botanical editorial style with warm ivory, forest green, muted sage, soft champagne gold, and subtle blush accents. The visual language combines restrained botanical ornament, generous whitespace, rounded editorial photography, fine borders, and gentle shadows. Typography pairs Parisienne for cursive signature titles and headings, and Quicksand for clean interface, structural subheadings, and body copy.

The page should feel luxurious without becoming ornate or difficult to read. Decorations will be made with CSS, typographic symbols, and simple geometric accents. Placeholder photography will use stable remote image URLs with descriptive local replacement paths documented in HTML comments; neutral gradient fallbacks ensure the page remains presentable if an image fails.

## Page Structure

1. **Navigation and hero** — A transparent fixed navigation overlays the full-height hero, then gains an ivory surface on scroll. The hero includes the invitation eyebrow, Ivan and Leslie's names, date, venue, decorative divider, and a prominent View Details action. A floating music control remains reachable without obstructing content.
2. **Countdown** — Four live counters display days, hours, minutes, and seconds until December 8, 2026 at 4:30 PM Philippine time. Expired dates show a celebratory message instead of negative values.
3. **Celebration details** — Cards communicate ceremony, reception, schedule, and attire. Ceremony and reception both take place at Grand Astoria Regency. A directions action opens Google Maps in a new tab.
4. **The couple and story** — Two balanced profile cards introduce Ivan and Leslie, followed by a short sample love story and three-moment timeline. Copy is explicitly editable sample content.
5. **Entourage** — A structured responsive layout covers parents, principal sponsors, honor attendants, bridesmaids and groomsmen, bearers, and flower girls using tasteful sample names.
6. **Gallery** — A responsive editorial grid displays six engagement-style images. Each opens in an accessible lightbox with close, previous, and next controls, keyboard navigation, captions, and focus restoration.
7. **RSVP** — The form collects full name, guest count, attendance, and an optional message. Client-side validation reports accessible inline errors. Valid submission changes the panel to a thank-you state and stores no personal information; a source comment identifies where to connect Formspree, Netlify Forms, or another backend.
8. **Closing and footer** — A short 1 Corinthians 13:4 excerpt, couple sign-off, hashtag, copyright, and back-to-top control close the experience.

## Interaction Design

- Navigation links and calls to action use smooth scrolling while respecting reduced-motion preferences.
- Mobile navigation uses a 44px minimum hamburger control, closes after selection, closes on Escape, and exposes its state with `aria-expanded`.
- Scroll reveal animations use Intersection Observer and reveal immediately when the API is unavailable. Reduced-motion users receive no reveal transitions.
- The countdown updates once per second from an ISO timestamp containing the Philippine UTC offset.
- The music button begins in a safe paused state. The first user press attempts playback; subsequent presses toggle playback and update the accessible label. Missing audio produces a discreet status message without breaking the page.
- The lightbox supports pointer and keyboard use, keeps controls at least 44px, traps common close behavior with Escape, and restores focus to the originating gallery item.
- RSVP feedback is presented inside the form region and does not navigate away.

## Responsive Behavior

- **320–480px:** Single-column content, 2×2 countdown, full-width cards and buttons where appropriate, collapsed navigation, compact hero type, and 44px minimum interactive targets.
- **481–1024px:** Two-column couple and event layouts, two- or three-column gallery depending on available width, and a balanced entourage grid.
- **1025–1440px:** Full navigation and multi-column layouts inside a centered container capped near 1180px.
- **1441px and wider:** Content remains centered and does not stretch; hero imagery covers the viewport gracefully while display type scales with `clamp()`.

All layouts must avoid horizontal overflow. Images use `object-fit`, explicit aspect ratios, lazy loading below the fold, and meaningful alt text.

## Architecture

- `index.html` contains semantic document structure, editable content, metadata, favicon, accessible labels, and clear section comments.
- `styles.css` contains the theme variables, mobile-first layout, breakpoints, decorative treatments, animation states, and reduced-motion accommodations.
- `script.js` contains small isolated functions for countdown calculation/rendering, navigation, music state, scroll reveals, gallery lightbox, RSVP validation, and back-to-top visibility.
- `tests/site.test.js` uses Node's built-in test runner to exercise pure countdown calculations and RSVP validation without adding dependencies.
- `images/README.md` and `music/README.md` document the intended local asset filenames. The placeholder audio path remains `music/wedding-theme.mp3`.

## Error Handling and Graceful Degradation

- Failed remote images retain readable background colors and do not collapse their containers.
- Missing music displays a short non-blocking message.
- JavaScript-disabled visitors can still read all invitation content, follow directions, and view gallery images in the page.
- Invalid RSVP fields show specific inline guidance and focus the first invalid field.
- Countdown values never become negative or display `NaN`.

## Verification

- Use test-first development for countdown and form-validation logic.
- Run the Node test suite and a static asset/link audit.
- Check HTML semantics, required accessible labels, image alt/loading attributes, breakpoint rules, minimum touch targets, and reduced-motion support.
- Inspect the final file tree and verify no unintended files or horizontal-overflow-prone declarations were introduced.

## Out of Scope

- Live RSVP persistence or email delivery
- Real couple photography, biographies, entourage names, or licensed music
- Venue booking, guest authentication, seating management, or admin tools
- Deployment or domain configuration unless requested separately
