import { useState, useMemo, useRef, useEffect } from 'react';
import { Worker, ShiftSchedule, ShiftActual, VacationPeriod } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ChevronLeft, ChevronRight, Calendar, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  getMonthStats, SCHEDULE_TYPE_LABELS,
  RUSSIAN_HOLIDAYS,
} from '../../services/scheduleGenerator';
import ScheduleConfig from './ScheduleConfig';
import ShiftCalendar from './ShiftCalendar';
import VacationModal from './VacationModal';

const SELF_WORKER: Worker = { id: 'self', name: 'Я', rate: 0, scheduleId: null, color: '#3b82f6' };

interface ShiftDashboardProps {
  schedules: ShiftSchedule[];
  actuals: ShiftActual[];
  vacations: VacationPeriod[];
  onAddSchedule: (data: Omit<ShiftSchedule, 'id'>) => void;
  onUpdateSchedule: (id: string, data: Omit<ShiftSchedule, 'id'>) => void;
  onDeleteSchedule: (id: string) => void;
  onMarkActual: (actual: ShiftActual) => void;
  onDeleteActual: (id: string) => void;
  onAddVacation: (data: Omit<VacationPeriod, 'id'>) => void;
  onUpdateVacation: (id: string, data: Omit<VacationPeriod, 'id'>) => void;
  onDeleteVacation: (id: string) => void;
}

export default function ShiftDashboard({
  schedules, actuals, vacations,
  onAddSchedule, onUpdateSchedule, onDeleteSchedule,
  onMarkActual, onDeleteActual,
  onAddVacation, onUpdateVacation, onDeleteVacation,
}: ShiftDashboardProps) {
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(() => {
    const saved = localStorage.getItem('shift_active_schedule');
    if (saved && schedules.find(s => s.id === saved)) return saved;
    return schedules[0]?.id ?? null;
  });
  const [month, setMonth] = useState(new Date());
  const [showScheduleConfig, setShowScheduleConfig] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ShiftSchedule | null>(null);
  const [showScheduleList, setShowScheduleList] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [editingVacation, setEditingVacation] = useState<VacationPeriod | null>(null);

  const prevScheduleLenRef = useRef(schedules.length);
  useEffect(() => {
    if (schedules.length > prevScheduleLenRef.current && schedules.length > 0) {
      const newest = schedules[schedules.length - 1];
      setActiveScheduleId(newest.id);
      localStorage.setItem('shift_active_schedule', newest.id);
    }
    prevScheduleLenRef.current = schedules.length;
  }, [schedules]);

  useEffect(() => {
    if (activeScheduleId && !schedules.find(s => s.id === activeScheduleId)) {
      const fallback = schedules[0]?.id ?? null;
      setActiveScheduleId(fallback);
      if (fallback) localStorage.setItem('shift_active_schedule', fallback);
    }
  }, [schedules, activeScheduleId]);

  const year = month.getFullYear();
  const mon = month.getMonth() + 1;

  const activeSchedule = schedules.find(s => s.id === activeScheduleId) ?? null;

  const stats = useMemo(() => {
    if (!activeSchedule) return null;
    return getMonthStats(activeSchedule, year, mon, RUSSIAN_HOLIDAYS);
  }, [activeSchedule, year, mon]);

  const markedCount = actuals.filter(a =>
    a.workerId === 'self' &&
    a.date >= format(startOfMonth(month), 'yyyy-MM-dd') &&
    a.date <= format(endOfMonth(month), 'yyyy-MM-dd')
  ).length;

  const handleSetActiveSchedule = (id: string) => {
    setActiveScheduleId(id);
    localStorage.setItem('shift_active_schedule', id);
    setShowScheduleList(false);
  };

  return (
    <div className="bg-background min-h-[calc(100dvh-64px)] relative">
      {/* Month Navigator */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setMonth(m => subMonths(m, 1))}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </button>
        <span className="text-lg font-bold text-foreground capitalize">
          {format(month, 'LLLL yyyy', { locale: ru })}
        </span>
        <button
          onClick={() => setMonth(m => addMonths(m, 1))}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <ChevronRight size={20} className="text-foreground" />
        </button>
      </div>

      <div className="px-4 space-y-3 pb-28">
        {activeSchedule ? (
          <>
            {/* Active schedule card */}
            <div className="bg-card-bg rounded-2xl border border-card-border p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-bold text-foreground text-base">{activeSchedule.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {SCHEDULE_TYPE_LABELS[activeSchedule.type]} · с {activeSchedule.startDate}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => { setEditingSchedule(activeSchedule); setShowScheduleConfig(true); }}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-card-border text-muted-foreground"
                  >
                    <Pencil size={15} />
                  </button>
                  {schedules.length > 1 && (
                    <button
                      onClick={() => setShowScheduleList(v => !v)}
                      className="px-3 h-9 flex items-center justify-center rounded-xl border border-card-border text-xs text-muted-foreground font-medium"
                    >
                      Сменить
                    </button>
                  )}
                </div>
              </div>

              {stats && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { label: 'смен',     value: stats.workDays,    color: 'text-blue-600 dark:text-blue-400' },
                    { label: 'часов',    value: stats.totalHours,  color: 'text-foreground' },
                    { label: 'ночных',   value: stats.nightHours,  color: 'text-purple-600 dark:text-purple-400' },
                    { label: 'отмечено', value: markedCount,       color: 'text-green-600 dark:text-green-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-background rounded-xl p-2 text-center">
                      <div className={`text-base font-bold ${color}`}>{value}</div>
                      <div className="text-[10px] text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Встроенный календарь */}
            <ShiftCalendar
              embedded
              worker={{ ...SELF_WORKER, scheduleId: activeSchedule.id }}
              schedule={activeSchedule}
              actuals={actuals}
              vacations={vacations}
              onMarkActual={onMarkActual}
              onDeleteActual={onDeleteActual}
              onBack={() => {}}
            />

            {/* Schedule switcher */}
            <AnimatePresence>
              {showScheduleList && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-card-bg rounded-2xl border border-card-border overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-card-border">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Мои графики</div>
                    </div>
                    {schedules.map(sch => (
                      <div
                        key={sch.id}
                        className="flex items-center gap-3 px-4 py-3 border-b border-card-border last:border-0"
                      >
                        <button
                          onClick={() => handleSetActiveSchedule(sch.id)}
                          className="flex items-center gap-3 flex-1 text-left min-w-0"
                        >
                          {sch.id === activeScheduleId
                            ? <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
                            : <div className="w-[18px] h-[18px] rounded-full border-2 border-muted-foreground/30 shrink-0" />
                          }
                          <div className="min-w-0">
                            <div className={`text-sm font-medium truncate ${sch.id === activeScheduleId ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                              {sch.name}
                            </div>
                            <div className="text-xs text-muted-foreground">{SCHEDULE_TYPE_LABELS[sch.type]}</div>
                          </div>
                        </button>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => { setEditingSchedule(sch); setShowScheduleConfig(true); setShowScheduleList(false); }}
                            className="p-2 rounded-lg text-muted-foreground"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteSchedule(sch.id)}
                            className="p-2 rounded-lg text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add another schedule */}
            <button
              onClick={() => { setEditingSchedule(null); setShowScheduleConfig(true); }}
              className="w-full py-2 rounded-xl border border-dashed border-card-border text-muted-foreground text-sm flex items-center justify-center gap-1.5 hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              <Plus size={14} /> Добавить ещё график
            </button>

            {/* Vacations */}
            <div className="bg-card-bg rounded-2xl border border-card-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Отпуска</div>
                <button
                  onClick={() => { setEditingVacation(null); setShowVacationModal(true); }}
                  className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-medium"
                >
                  <Plus size={13} /> Добавить
                </button>
              </div>
              {vacations.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-3">
                  Отпуска не добавлены
                </div>
              ) : (
                <div className="space-y-2">
                  {vacations
                    .slice()
                    .sort((a, b) => a.startDate.localeCompare(b.startDate))
                    .map(v => (
                      <div key={v.id} className="flex items-center gap-3">
                        <span className="text-base">🏖</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">
                            {format(new Date(v.startDate + 'T00:00:00'), 'd MMM', { locale: ru })} — {format(new Date(v.endDate + 'T00:00:00'), 'd MMM yyyy', { locale: ru })}
                          </div>
                          {v.label && <div className="text-xs text-muted-foreground truncate">{v.label}</div>}
                        </div>
                        <button
                          onClick={() => { setEditingVacation(v); setShowVacationModal(true); }}
                          className="p-1.5 rounded-lg text-muted-foreground"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteVacation(v.id)}
                          className="p-1.5 rounded-lg text-red-500"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Calendar size={56} className="text-muted-foreground/30 mb-4" />
            <p className="text-foreground font-semibold text-lg">График не настроен</p>
            <p className="text-muted-foreground text-sm mt-1 mb-8">Создайте свой рабочий график чтобы отслеживать смены</p>
            <button
              onClick={() => { setEditingSchedule(null); setShowScheduleConfig(true); }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm"
            >
              <Plus size={18} />
              Создать график
            </button>
          </div>
        )}
      </div>

      {/* FAB — только если нет ни одного графика */}
      {schedules.length === 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => { setEditingSchedule(null); setShowScheduleConfig(true); }}
          className="fixed bottom-6 right-4 z-20 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          <Plus size={28} strokeWidth={2.5} />
        </motion.button>
      )}

      {showScheduleConfig && (
        <ScheduleConfig
          schedule={editingSchedule}
          onSave={data => {
            if (editingSchedule) {
              onUpdateSchedule(editingSchedule.id, data);
            } else {
              onAddSchedule(data);
            }
            setShowScheduleConfig(false);
            setEditingSchedule(null);
          }}
          onClose={() => { setShowScheduleConfig(false); setEditingSchedule(null); }}
        />
      )}

      {showVacationModal && (
        <VacationModal
          vacation={editingVacation}
          onSave={data => {
            if (editingVacation) {
              onUpdateVacation(editingVacation.id, data);
            } else {
              onAddVacation(data);
            }
            setShowVacationModal(false);
            setEditingVacation(null);
          }}
          onDelete={editingVacation ? () => { onDeleteVacation(editingVacation.id); setShowVacationModal(false); setEditingVacation(null); } : undefined}
          onClose={() => { setShowVacationModal(false); setEditingVacation(null); }}
        />
      )}
    </div>
  );
}
