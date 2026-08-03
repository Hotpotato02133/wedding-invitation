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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateCountdown, validateRsvp };
}
