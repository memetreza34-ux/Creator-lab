import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getScheduledLocalDateTime,
  getStatusAfterCalendarReschedule,
  getWorkspaceTodayDate,
  isCalendarDraggableStatus,
  isScheduledInLocalHour,
  isScheduledOnLocalDate,
  rescheduleUtcForCalendarSlot,
} from './scheduling';

test('calendar membership uses workspace timezone instead of browser timezone', () => {
  const scheduledAt = '2026-10-08T00:30:00.000Z';

  assert.equal(
    isScheduledOnLocalDate(scheduledAt, '2026-10-07', 'America/New_York'),
    true,
  );
  assert.equal(
    isScheduledOnLocalDate(scheduledAt, '2026-10-08', 'Europe/Berlin'),
    true,
  );
});

test('hour membership uses workspace-local hour', () => {
  const scheduledAt = '2026-10-07T16:30:00.000Z';

  assert.equal(
    isScheduledInLocalHour(
      scheduledAt,
      '2026-10-07',
      18,
      'Europe/Berlin',
    ),
    true,
  );
  assert.equal(
    isScheduledInLocalHour(
      scheduledAt,
      '2026-10-07',
      16,
      'Europe/Berlin',
    ),
    false,
  );
});

test('month reschedule preserves local wall-clock time across DST offset change', () => {
  const original = '2026-07-15T16:30:00.000Z'; // 18:30 Berlin summer

  assert.equal(
    rescheduleUtcForCalendarSlot({
      scheduledAt: original,
      targetDate: '2026-12-15',
      viewMode: 'Month',
      timeZone: 'Europe/Berlin',
    }),
    '2026-12-15T17:30:00.000Z',
  );
});

test('month reschedule uses default time for an unscheduled draft', () => {
  assert.equal(
    rescheduleUtcForCalendarSlot({
      targetDate: '2026-10-10',
      viewMode: 'Month',
      timeZone: 'Europe/Berlin',
    }),
    '2026-10-10T16:00:00.000Z',
  );
});

test('week and day reschedule use explicit workspace-local slot time', () => {
  assert.equal(
    rescheduleUtcForCalendarSlot({
      scheduledAt: '2026-10-07T16:30:00.000Z',
      targetDate: '2026-10-09',
      targetTime: '09:00',
      viewMode: 'Week',
      timeZone: 'Europe/Berlin',
    }),
    '2026-10-09T07:00:00.000Z',
  );
});

test('calendar reschedule rejects nonexistent DST wall-clock slots', () => {
  assert.throws(
    () =>
      rescheduleUtcForCalendarSlot({
        targetDate: '2026-03-29',
        targetTime: '02:00',
        viewMode: 'Day',
        timeZone: 'Europe/Berlin',
      }),
    /does not exist/,
  );
});

test('workspace today date can differ by timezone for the same instant', () => {
  const now = '2026-10-08T00:30:00.000Z';

  assert.equal(
    getWorkspaceTodayDate('America/New_York', now),
    '2026-10-07',
  );
  assert.equal(
    getWorkspaceTodayDate('Europe/Berlin', now),
    '2026-10-08',
  );
});

test('calendar drag is limited to draft and scheduled posts', () => {
  assert.equal(isCalendarDraggableStatus('draft'), true);
  assert.equal(isCalendarDraggableStatus('scheduled'), true);
  assert.equal(isCalendarDraggableStatus('published'), false);
  assert.equal(isCalendarDraggableStatus('failed'), false);
  assert.equal(isCalendarDraggableStatus('needs_review'), false);
});

test('calendar reschedule upgrades draft status only', () => {
  assert.equal(getStatusAfterCalendarReschedule('draft'), 'scheduled');
  assert.equal(getStatusAfterCalendarReschedule('scheduled'), 'scheduled');
  assert.equal(getStatusAfterCalendarReschedule('failed'), 'failed');
});

test('scheduled local date-time is stable and explicit', () => {
  assert.deepEqual(
    getScheduledLocalDateTime(
      '2026-10-07T16:30:00.000Z',
      'Europe/Berlin',
    ),
    { date: '2026-10-07', time: '18:30' },
  );
});
