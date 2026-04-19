import { useState } from 'react';
import { VacationPeriod } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2 } from 'lucide-react';
import { format, differenceInDays, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import { ru } from 'date-fns/locale';

interface VacationModalProps {
  vacation?: VacationPeriod | null;
  onSave: (data: Omit<VacationPeriod, 'id'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function daysCount(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = parseISO(start);
  const e = parseISO(end);
  if (isBefore(e, s)) return 0;
  return differenceInDays(e, s) + 1;
}

export default function VacationModal({ vacation, onSave, onDelete, onClose }: VacationModalProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(vacation?.startDate ?? today);
  const [endDate, setEndDate] = useState(vacation?.endDate ?? today);
  const [label, setLabel] = useState(vacation?.label ?? '');

  const days = daysCount(startDate, endDate);
  const valid = !!startDate && !!endDate && days > 0;

  const handleStartChange = (val: string) => {
    setStartDate(val);
    if (val && endDate && val > endDate) setEndDate(val);
  };

  const handleSave = () => {
    if (!valid) return;
    onSave({ startDate, endDate, label: label.trim() || undefined });
    onClose();
  };

  const fmt = (d: string) => {
    try { return format(parseISO(d), 'd MMMM yyyy', { locale: ru }); } catch { return d; }
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
              <div className="font-bold text-foreground text-lg">
                {vacation ? 'Редактировать отпуск' : 'Добавить отпуск'}
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground"><X size={22} /></button>
          </div>

          {/* Preview */}
          {valid && (
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-3 border border-teal-200 dark:border-teal-800">
              <div className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                🏖 {fmt(startDate)} — {fmt(endDate)}
              </div>
              <div className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">
                {days} {days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}
              </div>
            </div>
          )}

          {/* Start date */}
          <div className="space-y-1.5">
            <div className="text-sm font-medium text-muted-foreground">Начало отпуска</div>
            <input
              type="date"
              value={startDate}
              onChange={e => handleStartChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-background text-foreground outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* End date */}
          <div className="space-y-1.5">
            <div className="text-sm font-medium text-muted-foreground">Конец отпуска</div>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-background text-foreground outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Label */}
          <div className="space-y-1.5">
            <div className="text-sm font-medium text-muted-foreground">Название (опционально)</div>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Летний отпуск..."
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-background text-foreground outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-3">
            {vacation && onDelete && (
              <button
                onClick={() => { onDelete(); onClose(); }}
                className="flex items-center justify-center px-4 py-3 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
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
              disabled={!valid}
              className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold disabled:opacity-40"
            >
              Сохранить
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
