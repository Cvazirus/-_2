import { useState, useMemo, useRef } from 'react';
import { Worker, ShiftSchedule, ShiftActual, VacationPeriod } from '../../types';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { format, startOfMonth, endOfMonth, getDay, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  generateSchedule, getMonthStats, RUSSIAN_HOLIDAYS,
  GeneratedShift, SCHEDULE_TYPE_LABELS,
} from '../../services/scheduleGenerator';
import DayMarkModal from './DayMarkModal';

interface ShiftCalendarProps {
  worker: Worker;
  schedule: ShiftSchedule;
  actuals: ShiftActual[];
  vacations: VacationPeriod[];
  onMarkActual: (actual: ShiftActual) => void;
  onDeleteActual: (id: string) => void;
  onBack: () => void;
}

const SHIFT_BG = [
  'bg-blue-400/40',
  'bg-amber-500/40',
  'bg-purple-400/40',
];
const SHIFT_TEXT = [
  'text-blue-900 dark:text-blue-100',
  'text-amber-900 dark:text-amber-100',
  'text-purple-900 dark:text-purple-100',
];
const STATUS_DOT: Record<ShiftActual['status'], string> = {
  ok:       'bg-green-500',
  late:     'bg-amber-500',
  miss:     'bg-red-500',
  overtime: 'bg-indigo-600',
  vacation: 'bg-teal-500',
};
const STATUS_LABEL: Record<ShiftActual['status'], string> = {
  ok: 'Вышел', late: 'Опоздание', miss: 'Не вышел', overtime: 'Переработка', vacation: 'Отпуск',
};
const STATUS_COLOR: Record<ShiftActual['status'], string> = {
  ok:       'text-green-600 dark:text-green-400',
  late:     'text-amber-600 dark:text-amber-400',
  miss:     'text-red-600 dark:text-red-400',
  overtime: 'text-indigo-600 dark:text-indigo-400',
  vacation: 'text-teal-600 dark:text-teal-400',
};
const STATUS_ICON: Record<ShiftActual['status'], string> = {
  ok: '✓', late: '!', miss: '✕', overtime: '+', vacation: '🏖',
};

const WEEK_DAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

interface Cell { shift: GeneratedShift; actual?: ShiftActual }

export default function ShiftCalendar({ worker, schedule, actuals, vacations, onMarkActual, onDeleteActual, onBack }: ShiftCalendarProps) {
  const isOnVacation = (date: string) =>
    vacations.some(v => date >= v.startDate && date <= v.endDate);
  const [month, setMonth] = useState(new Date());
  const [tab, setTab] = useState<'calendar' | 'log'>('calendar');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  const year = month.getFullYear();
  const mon = month.getMonth() + 1;

  const { cells, stats } = useMemo(() => {
    const first = startOfMonth(month);
    const last = endOfMonth(month);
    const shifts = generateSchedule(schedule, format(first, 'yyyy-MM-dd'), format(last, 'yyyy-MM-dd'), RUSSIAN_HOLIDAYS);
    const firstDOW = (getDay(first) + 6) % 7; // 0=Mon

    const grid: (Cell | null)[] = Array(firstDOW).fill(null);
    for (const s of shifts) {
      const actual = actuals.find(a => a.workerId === worker.id && a.date === s.date);
      grid.push({ shift: s, actual });
    }
    while (grid.length % 7 !== 0) grid.push(null);

    const st = getMonthStats(schedule, year, mon, RUSSIAN_HOLIDAYS);
    return { cells: grid, stats: st };
  }, [month, schedule, actuals, worker.id, year, mon]);

  const monthStart = format(startOfMonth(month), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd');

  const vacationCount = useMemo(() => {
    let count = 0;
    for (const cell of cells) {
      if (cell && isOnVacation(cell.shift.date) &&
          cell.shift.date >= monthStart && cell.shift.date <= monthEnd) count++;
    }
    return count;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells, vacations, monthStart, monthEnd]);

  const markedCount = actuals.filter(a => a.workerId === worker.id &&
    a.date >= format(startOfMonth(month), 'yyyy-MM-dd') &&
    a.date <= format(endOfMonth(month), 'yyyy-MM-dd')).length;

  const selectedShift = selectedDay
    ? cells.find(c => c?.shift.date === selectedDay)?.shift
    : null;
  const selectedActual = selectedDay
    ? actuals.find(a => a.workerId === worker.id && a.date === selectedDay)
    : undefined;

  return (
    <div className="bg-background min-h-[calc(100dvh-64px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-card-border">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground truncate">{schedule.name}</div>
          <div className="text-xs text-muted-foreground">{SCHEDULE_TYPE_LABELS[schedule.type]}</div>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <button onClick={() => setMonth(m => subMonths(m, 1))} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted">
          <ChevronLeft size={18} className="text-foreground" />
        </button>
        <span className="font-bold text-foreground capitalize">
          {format(month, 'LLLL yyyy', { locale: ru })}
        </span>
        <button onClick={() => setMonth(m => addMonths(m, 1))} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted">
          <ChevronRight size={18} className="text-foreground" />
        </button>
      </div>

      {/* Summary strip */}
      <div className="mx-4 mb-3 grid grid-cols-4 gap-2">
        {[
          { label: 'смен',     value: stats.workDays,    color: 'text-blue-600 dark:text-blue-400' },
          { label: 'часов',    value: stats.totalHours,  color: 'text-foreground' },
          { label: 'ночных',   value: stats.nightHours,  color: 'text-purple-600 dark:text-purple-400' },
          { label: 'отпуск',   value: vacationCount,     color: 'text-teal-600 dark:text-teal-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card-bg rounded-xl p-2 text-center border border-card-border">
            <div className={`font-bold text-base ${color}`}>{value}</div>
            <div className="text-[10px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mx-4 mb-3 flex rounded-xl overflow-hidden border border-card-border bg-card-bg">
        {(['calendar', 'log'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === t ? 'bg-blue-600 text-white' : 'text-muted-foreground'
            }`}
          >
            {t === 'calendar' ? 'Календарь' : 'Список'}
          </button>
        ))}
      </div>

      {tab === 'calendar' && (
        <div
          className="px-4 pb-8 select-none"
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (dx < -50) setMonth(m => addMonths(m, 1));
            else if (dx > 50) setMonth(m => subMonths(m, 1));
          }}
        >
          {/* Week day headers — Mon first */}
          <div className="grid grid-cols-7 mb-1">
            {WEEK_DAYS.map((d, i) => (
              <div key={d} className={`text-center text-[15px] font-semibold py-1 ${i >= 5 ? 'text-red-400' : 'text-muted-foreground'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              if (!cell) return <div key={`empty-${i}`} />;
              const { shift, actual } = cell;
              const dayNum = parseInt(shift.date.slice(8));
              const isToday = shift.date === format(new Date(), 'yyyy-MM-dd');
              const colIdx = shift.shiftIndex;
              const isWeekend = (getDay(new Date(shift.date + 'T00:00:00')) + 6) % 7 >= 5;
              const isVacation = isOnVacation(shift.date) || actual?.status === 'vacation';
              const isNonWorkHoliday = shift.isHoliday && shift.isOff && !isVacation;

              const bgClass = isVacation
                ? 'bg-teal-400/40'
                : isNonWorkHoliday
                  ? 'bg-rose-400/35'
                  : shift.isOff
                    ? isWeekend ? 'bg-red-100/60 dark:bg-red-900/15' : 'bg-muted/30'
                    : colIdx !== null
                      ? SHIFT_BG[colIdx % SHIFT_BG.length]
                      : 'bg-muted/30';

              const textClass = isVacation
                ? 'text-teal-900 dark:text-teal-100'
                : isNonWorkHoliday
                  ? 'text-rose-900 dark:text-rose-100'
                  : shift.isOff
                    ? isWeekend ? 'text-red-400' : 'text-muted-foreground'
                    : colIdx !== null ? SHIFT_TEXT[colIdx % SHIFT_TEXT.length] : 'text-muted-foreground';

              return (
                <button
                  key={shift.date}
                  onClick={() => setSelectedDay(shift.date)}
                  className={`relative rounded-xl aspect-square flex flex-col items-center justify-center p-0.5 transition-all active:scale-95 ${
                    isToday ? 'ring-2 ring-blue-500' : ''
                  } ${bgClass}`}
                >
                  <span className={`text-[25px] font-bold leading-none mb-0.5 ${textClass}`}>
                    {dayNum}
                  </span>

                  {isVacation ? (
                    <span className="text-[12px] leading-none">🏖</span>
                  ) : isNonWorkHoliday ? (
                    <span className="text-[12px] leading-none text-white/90">★</span>
                  ) : !shift.isOff && shift.shift ? (
                    <span className={`text-[13px] font-semibold leading-none ${textClass}`}>
                      {shift.shift.label.split('-')[0].trim().slice(0, 2)}с
                    </span>
                  ) : null}

                  {actual && actual.status !== 'vacation' && (
                    <span className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${STATUS_DOT[actual.status]}`} />
                  )}

                  {shift.isHoliday && !shift.isOff && !isVacation && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-400" />
                  )}

                  {shift.nightHours > 0 && !isVacation && (
                    <span className="absolute bottom-0.5 right-0.5 text-[8px] text-white/80">🌙</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Вышел</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Опоздание</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Не вышел</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Переработка</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" /> Отпуск</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" /> Праздник</div>
          </div>
        </div>
      )}

      {tab === 'log' && (
        <div className="px-4 pb-8 space-y-2">
          {cells.filter((c): c is Cell => !!c && (!c.shift.isOff || isOnVacation(c.shift.date) || c.actual?.status === 'vacation')).map(({ shift, actual }) => (
            <button
              key={shift.date}
              onClick={() => setSelectedDay(shift.date)}
              className="w-full bg-card-bg rounded-xl border border-card-border p-3 flex items-center gap-3 active:bg-muted transition-colors text-left"
            >
              <div className={`w-2 self-stretch rounded-full shrink-0 ${
                isOnVacation(shift.date) || actual?.status === 'vacation' ? 'bg-teal-400'
                : shift.shiftIndex !== null ? ['bg-blue-500','bg-orange-500','bg-purple-500'][shift.shiftIndex % 3] : 'bg-muted'
              }`} />

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  {format(new Date(shift.date + 'T00:00:00'), 'd MMMM, EEE', { locale: ru })}
                  {shift.isHoliday && !shift.isOff && <span className="ml-1.5 text-red-500 text-xs">Праздник</span>}
                  {shift.isOff && actual?.status === 'vacation' && <span className="ml-1.5 text-teal-500 text-xs">Выходной</span>}
                </div>
                {!shift.isOff && (
                  <div className="text-xs text-muted-foreground">
                    {shift.shift?.label} · {shift.shift?.start}–{shift.shift?.end} · {shift.hours}ч
                    {shift.nightHours > 0 && ` · 🌙${shift.nightHours}ч`}
                  </div>
                )}
                {actual && (
                  <div className={`text-xs mt-0.5 font-medium ${STATUS_COLOR[actual.status]}`}>
                    {STATUS_LABEL[actual.status]}
                    {actual.actualStart && ` · ${actual.actualStart}–${actual.actualEnd}`}
                    {actual.note && ` · ${actual.note}`}
                  </div>
                )}
              </div>

              {actual ? (
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${STATUS_DOT[actual.status]}`}>
                  {STATUS_ICON[actual.status]}
                </span>
              ) : (
                <span className="w-7 h-7 rounded-full border-2 border-dashed border-muted-foreground/30 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {selectedDay && selectedShift && (
        <DayMarkModal
          date={selectedDay}
          plannedShift={selectedShift}
          actual={selectedActual}
          workerId={worker.id}
          onSave={onMarkActual}
          onDelete={selectedActual ? () => onDeleteActual(selectedActual.id) : undefined}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
