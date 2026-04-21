export type OperationType = 'arrival' | 'write-off' | 'return';

export interface HistoryEntry {
  id: string;
  date: string;
  type: OperationType;
  quantity: number;
}

export interface Part {
  id: string;
  journalId: string;
  code: string;
  name: string;
  pricePerUnit: number;
  currentQuantity: number;
  operationNumbers: string[];
  operationPrices?: Record<string, number>;
  notes?: string;
  history: HistoryEntry[];
  lastUpdate: string;
}

export interface Operation {
  id: string;
  journalId: string;
  operationCode: string;
  type: OperationType;
  date: string;
  partId: string;
  partCode: string;
  partName: string;
  operationNumbers: string[];
  quantity: number;
  pricePerUnit: number;
  sum: number;
  wasQuantity: number;
  becameQuantity: number;
}

export interface Journal {
  id: string;
  name: string;
  type: 'parts' | 'operations';
  color: string;
}

// ─── Shifts module ────────────────────────────────────────────────────────────

export interface ShiftTime {
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  label: string;
}

export type ScheduleType = '8_2' | '8_3' | '12_cycle';

export interface ShiftSchedule {
  id: string;
  name: string;
  type: ScheduleType;
  startDate: string;       // YYYY-MM-DD — дата, соответствующая позиции 0 цикла
  shifts: ShiftTime[];
  nightCoeff: number;      // коэф. ночных часов, по умолчанию 1.2
  holidayCoeff: number;    // коэф. праздников, по умолчанию 2.0
  breakMinutes: number;    // перерыв в минутах, по умолчанию 30
}

export interface Worker {
  id: string;
  name: string;
  rate: number;            // часовая ставка, руб.
  scheduleId: string | null;
  color: string;
}

export interface VacationPeriod {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  label?: string;
}

export interface ShiftActual {
  id: string;              // workerId + '-' + date
  workerId: string;
  date: string;            // YYYY-MM-DD
  status: 'ok' | 'miss' | 'late' | 'overtime' | 'vacation';
  actualStart?: string;    // HH:MM
  actualEnd?: string;
  note?: string;
  payrollId?: string;
}

export interface PayrollEntry {
  id: string;
  workerId: string;
  period: string;          // YYYY-MM
  baseHours: number;
  nightHours: number;
  holidayHours: number;
  base: number;
  nightBonus: number;
  holidayBonus: number;
  deductions: number;
  total: number;
  status: 'draft' | 'posted' | 'adjusted';
  shiftDates: string[];
  createdAt: string;
  updatedAt: string;
}
