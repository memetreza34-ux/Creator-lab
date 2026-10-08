import { PostStatus } from '../types';
import {
  utcToZonedDateTime,
  zonedDateTimeToUtc,
} from './time';

export type CalendarViewMode = 'Month' | 'Week' | 'Day';

export interface CalendarSlot {
  date: string;
  time?: string;
}

export function getWorkspaceTodayDate(
  timeZone: string,
  nowIso = new Date().toISOString(),
): string {
  return utcToZonedDateTime(nowIso, timeZone).date;
}

export function getScheduledLocalDateTime(
  scheduledAt: string,
  timeZone: string,
): { date: string; time: string } {
  return utcToZonedDateTime(scheduledAt, timeZone);
}

export function isScheduledOnLocalDate(
  scheduledAt: string | undefined,
  date: string,
  timeZone: string,
): boolean {
  if (!scheduledAt) return false;
  return getScheduledLocalDateTime(scheduledAt, timeZone).date === date;
}

export function isScheduledInLocalHour(
  scheduledAt: string | undefined,
  date: string,
  hour: number,
  timeZone: string,
): boolean {
  if (!scheduledAt || hour < 0 || hour > 23) return false;

  const local = getScheduledLocalDateTime(scheduledAt, timeZone);
  const scheduledHour = Number(local.time.slice(0, 2));

  return local.date === date && scheduledHour === hour;
}

export function rescheduleUtcForCalendarSlot({
  scheduledAt,
  targetDate,
  targetTime,
  viewMode,
  timeZone,
  defaultTime = '18:00',
}: {
  scheduledAt?: string;
  targetDate: string;
  targetTime?: string;
  viewMode: CalendarViewMode;
  timeZone: string;
  defaultTime?: string;
}): string {
  let localTime: string;

  if (viewMode === 'Month') {
    localTime = scheduledAt
      ? getScheduledLocalDateTime(scheduledAt, timeZone).time
      : defaultTime;
  } else {
    if (!targetTime) {
      throw new RangeError('Timed calendar views require a target time');
    }
    localTime = targetTime;
  }

  return zonedDateTimeToUtc(targetDate, localTime, timeZone);
}

export function isCalendarDraggableStatus(status: PostStatus): boolean {
  return status === 'draft' || status === 'scheduled';
}

export function getStatusAfterCalendarReschedule(
  status: PostStatus,
): PostStatus {
  return status === 'draft' ? 'scheduled' : status;
}
