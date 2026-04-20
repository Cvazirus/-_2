import { ShiftSchedule, ShiftTime, ScheduleType } from '../types';
import { differenceInDays, parseISO, format, addDays } from 'date-fns';

export interface GeneratedShift {
  date: string;
  shiftIndex: number | null;
  shift: ShiftTime | null;
  hours: number;
  nightHours: number;
  isHoliday: boolean;
  isOff: boolean;
}

export interface MonthStats {
  workDays: number;
  offDays: number;
  totalHours: number;
  nightHours: number;
  holidayHours: number;
  shifts: GeneratedShift[];
}

// Российские праздники 2025–2026
export const RUSSIAN_HOLIDAYS: string[] = [
  // 2025
  '2025-01-01','2025-01-02','2025-01-03','2025-01-04','2025-01-05',
  '2025-01-06','2025-01-07','2025-01-08',
  '2025-02-24',
  '2025-03-10',
  '2025-05-01','2025-05-02','2025-05-08','2025-05-09',
  '2025-06-12','2025-06-13',
  '2025-11-03','2025-11-04',
  '2025-12-31',
  // 2026
  '2026-01-01','2026-01-02','2026-01-03','2026-01-04','2026-01-05',
  '2026-01-06','2026-01-07','2026-01-08','2026-01-09',
  '2026-02-23',
  '2026-03-09',
  '2026-05-01','2026-05-09','2026-05-11',
  '2026-06-12',
  '2026-11-04',
];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function calcShiftHours(shift: ShiftTime, breakMinutes: number): number {
  const start = timeToMinutes(shift.start);
  let end = timeToMinutes(shift.end);
  if (end <= start) end += 1440;
  const worked = end - start - breakMinutes;
  return Math.round((worked / 60) * 10) / 10;
}

function calcNightHours(shift: ShiftTime, breakMinutes: number): number {
  const start = timeToMinutes(shift.start);
  let end = timeToMinutes(shift.end);
  if (end <= start) end += 1440;

  const NIGHT_START = 22 * 60;
  const NIGHT_END = 6 * 60;

  let nightMin = 0;
  for (let m = start; m < end; m++) {
    const mod = m % 1440;
    if (mod >= NIGHT_START || mod < NIGHT_END) nightMin++;
  }

  const totalWorked = end - start - breakMinutes;
  return Math.round((Math.min(nightMin, totalWorked) / 60) * 10) / 10;
}

function cyclePattern(type: ScheduleType): (number | null)[] {
  switch (type) {
    case '8_2':
      return [0,0,0,0,0,null,null, 1,1,1,1,1,null,null];
    case '8_3':
      return [0,0,0,0,0,null,null, 1,1,1,1,1,null,null, 2,2,2,2,2,null,null];
    case '12_cycle':
      return [0,0,null,null, 1,1,null,null, 2,2,null,null];
  }
}

export function getShiftForDate(
  schedule: ShiftSchedule,
  date: string,
): { shiftIndex: number | null; shift: ShiftTime | null } {
  const pattern = cyclePattern(schedule.type);
  const days = differenceInDays(parseISO(date), parseISO(schedule.startDate));
  const pos = ((days % pattern.length) + pattern.length) % pattern.length;
  const idx = pattern[pos];
  if (idx === null || idx >= schedule.shifts.length) return { shiftIndex: null, shift: null };
  return { shiftIndex: idx, shift: schedule.shifts[idx] };
}

export function generateSchedule(
  schedule: ShiftSchedule,
  fromDate: string,
  toDate: string,
  holidays: string[] = RUSSIAN_HOLIDAYS,
): GeneratedShift[] {
  const results: GeneratedShift[] = [];
  let current = parseISO(fromDate);
  const to = parseISO(toDate);

  while (current <= to) {
    const dateStr = format(current, 'yyyy-MM-dd');
    const { shiftIndex, shift } = getShiftForDate(schedule, dateStr);
    const isHoliday = holidays.includes(dateStr);

    if (!shift || isHoliday) {
      results.push({ date: dateStr, shiftIndex: null, shift: null, hours: 0, nightHours: 0, isHoliday, isOff: true });
    } else {
      results.push({
        date: dateStr,
        shiftIndex,
        shift,
        hours: calcShiftHours(shift, schedule.breakMinutes),
        nightHours: calcNightHours(shift, schedule.breakMinutes),
        isHoliday,
        isOff: false,
      });
    }
    current = addDays(current, 1);
  }
  return results;
}

export function getMonthStats(
  schedule: ShiftSchedule,
  year: number,
  month: number,
  holidays: string[] = RUSSIAN_HOLIDAYS,
): MonthStats {
  const from = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
  const to = format(new Date(year, month, 0), 'yyyy-MM-dd');
  const shifts = generateSchedule(schedule, from, to, holidays);
  const worked = shifts.filter(s => !s.isOff);

  return {
    workDays: worked.length,
    offDays: shifts.filter(s => s.isOff).length,
    totalHours: Math.round(worked.reduce((a, s) => a + s.hours, 0) * 10) / 10,
    nightHours: Math.round(worked.reduce((a, s) => a + s.nightHours, 0) * 10) / 10,
    holidayHours: Math.round(worked.filter(s => s.isHoliday).reduce((a, s) => a + s.hours, 0) * 10) / 10,
    shifts,
  };
}

export const DEFAULT_SHIFTS_8: ShiftTime[] = [
  { label: '1-я смена', start: '06:30', end: '15:00' },
  { label: '2-я смена', start: '15:00', end: '23:30' },
];

export const DEFAULT_SHIFTS_8_3: ShiftTime[] = [
  { label: '1-я смена', start: '06:30', end: '15:00' },
  { label: '2-я смена', start: '15:00', end: '23:30' },
  { label: '3-я смена', start: '23:30', end: '06:30' },
];

export const DEFAULT_SHIFTS_12: ShiftTime[] = [
  { label: 'Дневная', start: '07:00', end: '19:00' },
  { label: 'Ночная',  start: '19:00', end: '07:00' },
];

export function defaultShifts(type: ScheduleType): ShiftTime[] {
  if (type === '8_2') return DEFAULT_SHIFTS_8;
  if (type === '8_3') return DEFAULT_SHIFTS_8_3;
  return DEFAULT_SHIFTS_12;
}

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  '8_2':      '8ч 2-смен.',
  '8_3':      '8ч 3-смен.',
  '12_cycle': '12ч цикл',
};

export const SHIFT_COLORS = ['bg-blue-500', 'bg-orange-500', 'bg-purple-500'];
export const SHIFT_TEXT_COLORS = ['text-blue-600 dark:text-blue-400', 'text-orange-600 dark:text-orange-400', 'text-purple-600 dark:text-purple-400'];
