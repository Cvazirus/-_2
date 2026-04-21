import { useState } from 'react';
import { ShiftActual } from '../../types';
import { GeneratedShift } from '../../services/scheduleGenerator';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DayMarkModalProps {
  date: string;
  plannedShift: GeneratedShift;
  actual?: ShiftActual;
  workerId: string;
  onSave: (actual: ShiftActual) => void;
  onDelete?: () => void;
  onClose: () => void;
}

type ActualStatus = ShiftActual['status'];

const STATUSES: { value: ActualStatus; label: string; icon: string; color: string; wide?: boolean }[] = [
  { value: 'ok',       label: 'Вышел',       icon: '✓',  color: 'bg-green-500 text-white' },
  { value: 'late',     label: 'Опоздание',   icon: '⏰', color: 'bg-amber-500 text-white' },
  { value: 'miss',     label: 'Не вышел',    icon: '✕',  color: 'bg-red-500 text-white' },
  { value: 'overtime', label: 'Переработка', icon: '+',  color: 'bg-indigo-600 text-white' },
  { value: 'vacation', label: 'Отпуск',      icon: '🏖', color: 'bg-teal-500 text-white', wide: true },
];

export default function DayMarkModal({
  date, plannedShift, actual, workerId, onSave, onDelete, onClose,
}: DayMarkModalProps) {
  const [status, setStatus] = useState<ActualStatus>(actual?.status ?? 'ok');
  const [actualStart, setActualStart] = useState(actual?.actualStart ?? plannedShift.shift?.start ?? '');
  const [actualEnd, setActualEnd] = useState(actual?.actualEnd ?? plannedShift.shift?.end ?? '');
  const [note, setNote] = useState(actual?.note ?? '');
  const [showTimes, setShowTimes] = useState(!!actual?.actualStart);

  const displayDate = format(new Date(date + 'T00:00:00'), 'd MMMM yyyy, EEEE', { locale: ru });

  const handleSave = () => {
    onSave({
      id: `${workerId}-${date}`,
      workerId,
      date,
      status,
      actualStart: showTimes ? actualStart : undefined,
      actualEnd: showTimes ? actualEnd : undefined,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', bounce: 0, duration: 0.32 }}
          className="w-full bg-card-bg rounded-t-2xl p-6 space-y-5 max-h-[85dvh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground capitalize">{displayDate}</div>
              <div className="font-bold text-foreground text-lg">Отметка выхода</div>
            </div>
            <button onClick={onClose} className="text-muted-foreground"><X size={22} /></button>
          </div>

          {/* Planned shift info */}
          {!plannedShift.isOff && plannedShift.shift && (
            <div className="bg-background rounded-xl p-3 border border-card-border">
              <div className="text-xs text-muted-foreground mb-1">По плану</div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{plannedShift.shift.label}</span>
                <span className="text-muted-foreground text-sm">
                  {plannedShift.shift.start} – {plannedShift.shift.end}
                </span>
              </div>
              <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                <span>{plannedShift.hours} ч</span>
                {plannedShift.nightHours > 0 && <span>🌙 {plannedShift.nightHours} ч ночных</span>}
                {plannedShift.isHoliday && <span className="text-red-500">Праздник</span>}
              </div>
            </div>
          )}

          {plannedShift.isOff && (
            <div className="bg-muted/50 rounded-xl p-3 text-center text-muted-foreground text-sm">
              По графику — выходной день
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Фактический статус</div>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.filter(s => !s.wide).map(s => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={`py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    status === s.value
                      ? s.color + ' shadow-sm'
                      : 'bg-background border border-card-border text-foreground'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
              {STATUSES.filter(s => s.wide).map(s => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={`col-span-2 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    status === s.value
                      ? s.color + ' shadow-sm'
                      : 'bg-background border border-card-border text-foreground'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Times toggle */}
          <button
            onClick={() => setShowTimes(v => !v)}
            className="text-blue-600 dark:text-blue-400 text-sm font-medium"
          >
            {showTimes ? '− Скрыть время' : '+ Указать фактическое время'}
          </button>

          {showTimes && (
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <div className="text-xs text-muted-foreground">Приход</div>
                <input
                  type="time"
                  value={actualStart}
                  onChange={e => setActualStart(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-background text-foreground outline-none"
                />
              </div>
              <div className="text-muted-foreground mt-4">—</div>
              <div className="flex-1 space-y-1">
                <div className="text-xs text-muted-foreground">Уход</div>
                <input
                  type="time"
                  value={actualEnd}
                  onChange={e => setActualEnd(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-background text-foreground outline-none"
                />
              </div>
            </div>
          )}

          {/* Note */}
          <div className="space-y-1.5">
            <div className="text-sm font-medium text-muted-foreground">Комментарий</div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Опционально..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-background text-foreground outline-none resize-none text-sm"
            />
          </div>

          <div className="flex gap-3">
            {actual && onDelete && (
              <button
                onClick={() => { onDelete(); onClose(); }}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-card-border text-foreground font-medium"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Сохранить
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
