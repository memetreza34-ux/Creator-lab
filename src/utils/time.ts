const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_INPUT_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

interface DateParts {
  year: number;
  month: number;
  day: number;
}

interface DateTimeParts extends DateParts {
  hour: number;
  minute: number;
  second: number;
}

export interface ZonedDateTimeInput {
  date: string;
  time: string;
}

function parseDateInput(value: string): DateParts | null {
  const match = DATE_INPUT_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function parseTimeInput(value: string): { hour: number; minute: number } | null {
  const match = TIME_INPUT_PATTERN.exec(value);
  if (!match) return null;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

export function isValidDateInput(value: string): boolean {
  return parseDateInput(value) !== null;
}

export function isValidTimeInput(value: string): boolean {
  return parseTimeInput(value) !== null;
}

function getPartsInTimeZone(timestamp: number, timeZone: string): DateTimeParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const values = Object.fromEntries(
    formatter
      .formatToParts(new Date(timestamp))
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function getTimeZoneOffsetMs(timestamp: number, timeZone: string): number {
  const parts = getPartsInTimeZone(timestamp, timeZone);
  const representedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return representedAsUtc - timestamp;
}

export function zonedDateTimeToUtc(
  date: string,
  time: string,
  timeZone: string,
): string {
  const dateParts = parseDateInput(date);
  const timeParts = parseTimeInput(time);

  if (!dateParts || !timeParts) {
    throw new RangeError('Invalid date or time input');
  }

  if (!timeZone.trim()) {
    throw new RangeError('Timezone is required');
  }

  const localWallClockAsUtc = Date.UTC(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    timeParts.hour,
    timeParts.minute,
    0,
  );

  let candidate = localWallClockAsUtc;

  try {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const offset = getTimeZoneOffsetMs(candidate, timeZone);
      const nextCandidate = localWallClockAsUtc - offset;
      if (nextCandidate === candidate) break;
      candidate = nextCandidate;
    }
  } catch {
    throw new RangeError('Invalid IANA timezone');
  }

  const resolved = getPartsInTimeZone(candidate, timeZone);
  const matchesRequestedWallClock =
    resolved.year === dateParts.year &&
    resolved.month === dateParts.month &&
    resolved.day === dateParts.day &&
    resolved.hour === timeParts.hour &&
    resolved.minute === timeParts.minute;

  if (!matchesRequestedWallClock) {
    throw new RangeError('Local time does not exist in the workspace timezone');
  }

  return new Date(candidate).toISOString();
}

export function utcToZonedDateTime(
  isoTimestamp: string,
  timeZone: string,
): ZonedDateTimeInput {
  const timestamp = new Date(isoTimestamp).getTime();
  if (Number.isNaN(timestamp)) {
    throw new RangeError('Invalid UTC timestamp');
  }

  let parts: DateTimeParts;
  try {
    parts = getPartsInTimeZone(timestamp, timeZone);
  } catch {
    throw new RangeError('Invalid IANA timezone');
  }

  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    date: `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`,
    time: `${pad(parts.hour)}:${pad(parts.minute)}`,
  };
}
