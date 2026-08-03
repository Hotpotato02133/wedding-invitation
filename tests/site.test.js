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
