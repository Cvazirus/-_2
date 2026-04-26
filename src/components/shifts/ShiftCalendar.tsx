import { useState, useMemo, useRef } from 'react';
import { Worker, ShiftSchedule, ShiftActual, VacationPeriod } from '../../types';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, getDay, addMonths, subMonths, addDays, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  generateSchedule, getMonthStats, RUSSIAN_HOLIDAYS, getShiftForDate,
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
  embedded?: boolean;
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
  ok: '✓', late: '!', miss: '✕', overtime: '+', vacation: 'О',
};

const WEEK_DAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

interface Cell { shift: GeneratedShift; actual?: ShiftActual }

export default function ShiftCalendar({ worker, schedule, actuals, vacations, onMarkActual, onDeleteActual, onBack, embedded }: ShiftCalendarProps) {
  const isOnVacation = (date: string) =>
    vacations.some(v => date >= v.startDate && date <= v.endDate);
  const [month, setMonth] = useState(new Date());
  const [direction, setDirection] = useState<1 | -1>(1);
  const [tab, setTab] = useState<'calendar' | 'log'>('calendar');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  const changeMonth = (dir: 1 | -1) => {
    setDirection(dir);
    setMonth(m => dir === 1 ? addMonths(m, 1) : subMonths(m, 1));
  };

  const monthStats = useMemo(() =>
    getMonthStats(schedule, month.getFullYear(), month.getMonth() + 1),
  [month, schedule]);

  const cells = useMemo(() => {
    const first = startOfMonth(month);
    const last = endOfMonth(month);
    const shifts = generateSchedule(schedule, format(first, 'yyyy-MM-dd'), format(last, 'yyyy-MM-dd'), RUSSIAN_HOLIDAYS);
    const firstDOW = (getDay(first) + 6) % 7;

    const grid: (Cell | null)[] = Array(firstDOW).fill(null);
    for (const s of shifts) {
      const actual = actuals.find(a => a.workerId === worker.id && a.date === s.date);
      grid.push({ shift: s, actual });
    }
    while (grid.length % 7 !== 0) grid.push(null);
    return grid;
  }, [month, schedule, actuals, worker.id]);

  const selectedShift = selectedDay
    ? cells.find(c => c?.shift.date === selectedDay)?.shift
    : null;
  const selectedActual = selectedDay
    ? actuals.find(a => a.workerId === worker.id && a.date === selectedDay)
    : undefined;

  return (
    <div className={embedded ? '' : 'bg-background min-h-[calc(100dvh-64px)]'}>
      {!embedded && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-card-border">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground truncate">{schedule.name}</div>
            <div className="text-xs text-muted-foreground">{SCHEDULE_TYPE_LABELS[schedule.type]}</div>
          </div>
        </div>
      )}

      {/* Month nav */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <button onClick={() => changeMonth(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted">
          <ChevronLeft size={18} className="text-foreground" />
        </button>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={format(month, 'yyyy-MM')}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            transition={{ duration: 0.2 }}
            className="font-bold text-foreground capitalize"
          >
            {format(month, 'LLLL yyyy', { locale: ru })}
          </motion.span>
        </AnimatePresence>
        <button onClick={() => changeMonth(1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted">
          <ChevronRight size={18} className="text-foreground" />
        </button>
      </div>

      {/* Stats strip */}
      <div className="flex gap-2 px-4 pb-2">
        <div className="flex-1 bg-card-bg border border-card-border rounded-xl py-2 flex flex-col items-center">
          <span className="text-[10px] text-muted-foreground leading-none mb-0.5">Смен</span>
          <span className="text-sm font-bold text-foreground">{monthStats.workDays}</span>
        </div>
        <div className="flex-1 bg-card-bg border border-card-border rounded-xl py-2 flex flex-col items-center">
          <span className="text-[10px] text-muted-foreground leading-none mb-0.5">Часов</span>
          <span className="text-sm font-bold text-foreground">{monthStats.totalHours}</span>
        </div>
        <div className="flex-1 bg-card-bg border border-card-border rounded-xl py-2 flex flex-col items-center">
          <span className="text-[10px] text-muted-foreground leading-none mb-0.5">Ночных</span>
          <span className="text-sm font-bold text-purple-500">{monthStats.nightHours}</span>
        </div>
      </div>

      {/* Tabs */}
      {!embedded && (
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
      )}

      {(embedded || tab === 'calendar') && (
        <div
          className="px-4 pb-8 select-none"
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (dx < -50) changeMonth(1);
            else if (dx > 50) changeMonth(-1);
          }}
        >
          {/* Week day headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEK_DAYS.map((d, i) => (
              <div key={d} className={`text-center text-[15px] font-semibold py-1 ${i >= 5 ? 'text-green-500' : 'text-muted-foreground'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid — анимация слайда */}
          <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={format(month, 'yyyy-MM')}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="grid grid-cols-7 gap-1"
          >
            {cells.map((cell, i) => {
              if (!cell) return <div key={`empty-${i}`} />;
              const { shift, actual } = cell;
              const dayNum = parseInt(shift.date.slice(8));
              const isToday = shift.date === format(new Date(), 'yyyy-MM-dd');
              const colIdx = shift.shiftIndex;
              const dayOfWeekIdx = (getDay(new Date(shift.date + 'T00:00:00')) + 6) % 7;
              const isWeekend = dayOfWeekIdx >= 5;
              const isSunday = dayOfWeekIdx === 6;

              // Показать метку на воскресенье только если следующий понедельник — ночная смена (старт после 20:00)
              let showNightWeekStart = false;
              if (isSunday) {
                const mondayStr = format(addDays(parseISO(shift.date), 1), 'yyyy-MM-dd');
                const { shift: mondayShift } = getShiftForDate(schedule, mondayStr);
                if (mondayShift && !RUSSIAN_HOLIDAYS.includes(mondayStr)) {
                  const [startH] = mondayShift.start.split(':').map(Number);
                  showNightWeekStart = startH >= 20;
                }
              }
              const isVacation = isOnVacation(shift.date) || actual?.status === 'vacation';
              const isNonWorkHoliday = shift.isHoliday && shift.isOff && !isVacation;

              const bgClass = isVacation
                ? 'bg-teal-400/40'
                : isNonWorkHoliday
                  ? 'bg-green-400/40'
                  : shift.isOff
                    ? isWeekend ? 'bg-green-100/60 dark:bg-green-900/20' : 'bg-muted/30'
                    : colIdx !== null
                      ? SHIFT_BG[colIdx % SHIFT_BG.length]
                      : 'bg-muted/30';

              const textClass = isVacation
                ? 'text-teal-900 dark:text-teal-100'
                : isNonWorkHoliday
                  ? 'text-green-900 dark:text-green-100'
                  : shift.isOff
                    ? isWeekend ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                    : colIdx !== null ? SHIFT_TEXT[colIdx % SHIFT_TEXT.length] : 'text-muted-foreground';

              return (
                <button
                  key={shift.date}
                  onClick={() => setSelectedDay(shift.date)}
                  className={`relative rounded-xl aspect-square flex flex-col items-center justify-center p-0.5 transition-all active:scale-95 ${bgClass}`}
                >
                  <span className={`text-[18px] font-bold leading-none mb-0.5 ${
                    isToday
                      ? 'w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white'
                      : textClass
                  }`}>
                    {dayNum}
                  </span>

                  {isVacation ? (
                    <span className="text-[9px] font-semibold leading-none text-teal-700 dark:text-teal-300">ОТП</span>
                  ) : isNonWorkHoliday ? (
                    <span className="text-[9px] font-semibold leading-none text-green-700 dark:text-green-300">ПР</span>
                  ) : !shift.isOff && shift.shift ? (
                    <span className={`text-[9px] font-semibold leading-none text-center ${textClass}`}>
                      {shift.shift.label}
                    </span>
                  ) : null}

                  {showNightWeekStart && (
                    <span className="absolute bottom-0.5 left-0.5 text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center bg-purple-600 text-white">
                      3
                    </span>
                  )}

                  {actual && actual.status !== 'vacation' && (
                    <span className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${STATUS_DOT[actual.status]}`} />
                  )}

                  {shift.isHoliday && !shift.isOff && !isVacation && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-400" />
                  )}

                </button>
              );
            })}
          </motion.div>
          </AnimatePresence>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Вышел</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Опоздание</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Не вышел</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Переработка</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" /> Отпуск</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" /> Праздник</div>
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
                    {shift.nightHours > 0 && ` · ночных: ${shift.nightHours}ч`}
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
