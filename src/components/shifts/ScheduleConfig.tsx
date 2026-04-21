import { useState } from 'react';
import { ShiftSchedule, ShiftTime, ScheduleType } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { SCHEDULE_TYPE_LABELS, defaultShifts } from '../../services/scheduleGenerator';

interface ScheduleConfigProps {
  schedule?: ShiftSchedule | null;
  onSave: (data: Omit<ShiftSchedule, 'id'>) => void;
  onClose: () => void;
}

const TYPE_DESCRIPTIONS: Record<ScheduleType, string> = {
  '8_2':      '2 бригады · 5 раб.дн / 2 выходных',
  '8_3':      '3 бригады · 5 раб.дн / 2 выходных',
  '12_cycle': '2+2 дня / 2+2 ночи / 4 выходных',
};

export default function ScheduleConfig({ schedule, onSave, onClose }: ScheduleConfigProps) {
  const [name, setName] = useState(schedule?.name ?? '');
  const [type, setType] = useState<ScheduleType>(schedule?.type ?? '12_cycle');
  const [startDate, setStartDate] = useState(schedule?.startDate ?? format(new Date(), 'yyyy-MM-dd'));
  const [startShiftIndex, setStartShiftIndex] = useState(schedule?.startShiftIndex ?? 0);
  const [shifts, setShifts] = useState<ShiftTime[]>(schedule?.shifts ?? defaultShifts('12_cycle'));
  const [nightCoeff, setNightCoeff] = useState(String(schedule?.nightCoeff ?? '1.2'));
  const [holidayCoeff, setHolidayCoeff] = useState(String(schedule?.holidayCoeff ?? '2.0'));
  const [breakMinutes, setBreakMinutes] = useState(String(schedule?.breakMinutes ?? '30'));

  const handleTypeChange = (t: ScheduleType) => {
    setType(t);
    setShifts(defaultShifts(t));
    setStartShiftIndex(0);
  };

  const updateShift = (i: number, field: keyof ShiftTime, value: string) => {
    setShifts(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const addShift = () => {
    setShifts(prev => [...prev, { label: `${prev.length + 1}-я смена`, start: '08:00', end: '16:00' }]);
  };

  const removeShift = (i: number) => {
    setShifts(prev => prev.filter((_, idx) => idx !== i));
    if (startShiftIndex >= i && startShiftIndex > 0) setStartShiftIndex(s => s - 1);
  };

  const moveShift = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    setShifts(prev => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setStartShiftIndex(prev =>
      prev === i ? j : prev === j ? i : prev
    );
  };

  const handleSave = () => {
    if (!name.trim() || shifts.length === 0) return;
    onSave({
      name: name.trim(),
      type,
      startDate,
      startShiftIndex,
      shifts,
      nightCoeff: parseFloat(nightCoeff) || 1.2,
      holidayCoeff: parseFloat(holidayCoeff) || 2.0,
      breakMinutes: parseInt(breakMinutes) || 30,
    });
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
          className="w-full bg-card-bg rounded-t-2xl p-6 space-y-5 max-h-[92dvh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              {schedule ? 'Редактировать график' : 'Новый график'}
            </h2>
            <button onClick={onClose} className="text-muted-foreground"><X size={22} /></button>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Название</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Бригада А · Цех №1"
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-background text-foreground outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Тип графика</label>
            <div className="grid grid-cols-3 gap-2">
              {(['8_2', '8_3', '12_cycle'] as ScheduleType[]).map(t => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`p-3 rounded-xl border text-center transition-colors ${
                    type === t
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-card-border text-foreground'
                  }`}
                >
                  <div className="font-semibold text-sm">{SCHEDULE_TYPE_LABELS[t]}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{TYPE_DESCRIPTIONS[type]}</p>
          </div>

          {/* Start date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Дата старта цикла (позиция 0)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-card-border bg-background text-foreground outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Start shift index */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Первая смена на дату старта
            </label>
            <div className="flex gap-2">
              {shifts.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setStartShiftIndex(i)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    startShiftIndex === i
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-card-border text-foreground'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shift times */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Время смен</label>
            {shifts.map((s, i) => (
              <div key={i} className="bg-background rounded-xl border border-card-border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveShift(i, -1)}
                      disabled={i === 0}
                      className="text-muted-foreground disabled:opacity-20 active:text-foreground"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveShift(i, 1)}
                      disabled={i === shifts.length - 1}
                      className="text-muted-foreground disabled:opacity-20 active:text-foreground"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  <input
                    value={s.label}
                    onChange={e => updateShift(i, 'label', e.target.value)}
                    className="flex-1 bg-transparent text-foreground font-medium text-sm outline-none"
                  />
                  {shifts.length > 1 && (
                    <button onClick={() => removeShift(i)} className="text-red-500">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={s.start}
                    onChange={e => updateShift(i, 'start', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-card-border bg-card-bg text-foreground text-sm outline-none"
                  />
                  <span className="text-muted-foreground">—</span>
                  <input
                    type="time"
                    value={s.end}
                    onChange={e => updateShift(i, 'end', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-card-border bg-card-bg text-foreground text-sm outline-none"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addShift}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium"
            >
              <Plus size={16} /> Добавить смену
            </button>
          </div>

          {/* Coefficients */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Ночной коэф.</label>
              <input
                type="number"
                step="0.1"
                value={nightCoeff}
                onChange={e => setNightCoeff(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-background text-foreground text-sm outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Праздн. коэф.</label>
              <input
                type="number"
                step="0.1"
                value={holidayCoeff}
                onChange={e => setHolidayCoeff(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-background text-foreground text-sm outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Перерыв (мин)</label>
              <input
                type="number"
                value={breakMinutes}
                onChange={e => setBreakMinutes(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-background text-foreground text-sm outline-none"
              />
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
              disabled={!name.trim() || shifts.length === 0}
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
