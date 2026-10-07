import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isValidDateInput,
  isValidTimeInput,
  utcToZonedDateTime,
  zonedDateTimeToUtc,
} from './time';

test('validates calendar dates and 24-hour time inputs', () => {
  assert.equal(isValidDateInput('2026-10-07'), true);
  assert.equal(isValidDateInput('2026-02-30'), false);
  assert.equal(isValidDateInput('07-10-2026'), false);
  assert.equal(isValidTimeInput('18:05'), true);
  assert.equal(isValidTimeInput('24:00'), false);
});

test('converts Berlin workspace time to canonical UTC independent of browser timezone', () => {
  assert.equal(
    zonedDateTimeToUtc('2026-10-07', '18:00', 'Europe/Berlin'),
    '2026-10-07T16:00:00.000Z',
  );
});

test('converts New York standard time to UTC and back', () => {
  const utc = zonedDateTimeToUtc('2026-01-15', '09:30', 'America/New_York');
  assert.equal(utc, '2026-01-15T14:30:00.000Z');
  assert.deepEqual(utcToZonedDateTime(utc, 'America/New_York'), {
    date: '2026-01-15',
    time: '09:30',
  });
});

test('rejects a wall-clock time skipped by daylight saving transition', () => {
  assert.throws(
    () => zonedDateTimeToUtc('2026-03-29', '02:30', 'Europe/Berlin'),
    /does not exist/,
  );
});

test('rejects invalid IANA timezone names', () => {
  assert.throws(
    () => zonedDateTimeToUtc('2026-10-07', '18:00', 'Mars/Olympus_Mons'),
    /Invalid IANA timezone/,
  );
});
