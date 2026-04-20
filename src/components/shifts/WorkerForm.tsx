import { useState } from 'react';
import { Worker, ShiftSchedule } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { SCHEDULE_TYPE_LABELS } from '../../services/scheduleGenerator';

const WORKER_COLORS = [
  '#3b82f6','#ef4444','#10b981','#f59e0b',
  '#8b5cf6','#ec4899','#06b6d4','#84cc16',
];

interface WorkerFormProps {
  worker?: Worker | null;
  schedules: ShiftSchedule[];
  onSave: (data: Omit<Worker, 'id'>) => void;
  onClose: () => void;
}

export default function WorkerForm({ worker, schedules, onSave, onClose }: WorkerFormProps) {
  const [name, setName] = useState(worker?.name ?? '');
  const [rate, setRate] = useState(String(worker?.rate ?? ''));
  const [scheduleId, setScheduleId] = useState<string | null>(worker?.scheduleId ?? null);
  const [color, setColor] = useState(worker?.color ?? WORKER_COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), rate: parseFloat(rate) || 0, scheduleId, color });
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
          transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
          className="w-full bg-card-bg rounded-t-2xl p-6 space-y-5 max-h-[90dvh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              {worker ? 'Редактировать сотрудника' : 'Новый сотрудник'}
            </h2>
            <button onClick={onClose} className="text-muted-foreground">
              <X size={22} />
            </button>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">ФИО / Имя</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Иванов Иван"
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-background text-foreground outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Rate */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Ставка (₽/час)</label>
            <input
              type="number"
              value={rate}
              onChange={e => setRate(e.target.value)}
              placeholder="250"
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-background text-foreground outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Schedule */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">График</label>
            <select
              value={scheduleId ?? ''}
              onChange={e => setScheduleId(e.target.value || null)}
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-background text-foreground outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Без графика —</option>
              {schedules.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({SCHEDULE_TYPE_LABELS[s.type]})
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Цвет</label>
            <div className="flex gap-2 flex-wrap">
              {WORKER_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-card-border text-foreground font-medium"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-40"
            >
              Сохранить
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
