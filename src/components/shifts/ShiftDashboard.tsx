import { useState, useMemo } from 'react';
import { Worker, ShiftSchedule, ShiftActual } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ChevronLeft, ChevronRight, Calendar, Settings, Pencil, Trash2 } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  getMonthStats, SCHEDULE_TYPE_LABELS, SHIFT_COLORS,
  RUSSIAN_HOLIDAYS, generateSchedule,
} from '../../services/scheduleGenerator';
import WorkerForm from './WorkerForm';
import ScheduleConfig from './ScheduleConfig';
import ShiftCalendar from './ShiftCalendar';

interface ShiftDashboardProps {
  workers: Worker[];
  schedules: ShiftSchedule[];
  actuals: ShiftActual[];
  onAddWorker: (data: Omit<Worker, 'id'>) => void;
  onUpdateWorker: (id: string, data: Omit<Worker, 'id'>) => void;
  onDeleteWorker: (id: string) => void;
  onAddSchedule: (data: Omit<ShiftSchedule, 'id'>) => void;
  onUpdateSchedule: (id: string, data: Omit<ShiftSchedule, 'id'>) => void;
  onDeleteSchedule: (id: string) => void;
  onMarkActual: (actual: ShiftActual) => void;
  onDeleteActual: (id: string) => void;
}

export default function ShiftDashboard({
  workers, schedules, actuals,
  onAddWorker, onUpdateWorker, onDeleteWorker,
  onAddSchedule, onUpdateSchedule, onDeleteSchedule,
  onMarkActual, onDeleteActual,
}: ShiftDashboardProps) {
  const [calendarWorker, setCalendarWorker] = useState<Worker | null>(null);
  const [month, setMonth] = useState(new Date());
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [showScheduleConfig, setShowScheduleConfig] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ShiftSchedule | null>(null);
  const [tab, setTab] = useState<'workers' | 'schedules'>('workers');
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null);

  const year = month.getFullYear();
  const mon = month.getMonth() + 1;

  const workerStats = useMemo(() => {
    return workers.map(w => {
      const sch = schedules.find(s => s.id === w.scheduleId);
      if (!sch) return { worker: w, stats: null, schedule: null };
      return { worker: w, stats: getMonthStats(sch, year, mon, RUSSIAN_HOLIDAYS), schedule: sch };
    });
  }, [workers, schedules, year, mon]);

  const totalHours = workerStats.reduce((a, ws) => a + (ws.stats?.totalHours ?? 0), 0);
  const totalWorkDays = workerStats.reduce((a, ws) => a + (ws.stats?.workDays ?? 0), 0);

  const getInitials = (name: string) =>
    name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

  const shiftColorClass = (idx: number | null) => {
    if (idx === null) return 'bg-muted text-muted-foreground';
    return `${SHIFT_COLORS[idx % SHIFT_COLORS.length]} text-white`;
  };

  // Show calendar if worker selected
  if (calendarWorker) {
    const sch = schedules.find(s => s.id === calendarWorker.scheduleId);
    if (sch) {
      return (
        <ShiftCalendar
          worker={calendarWorker}
          schedule={sch}
          actuals={actuals}
          onMarkActual={onMarkActual}
          onDeleteActual={onDeleteActual}
          onBack={() => setCalendarWorker(null)}
        />
      );
    }
  }

  return (
    <div className="bg-background min-h-[calc(100dvh-64px)] relative overflow-hidden">
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

      {/* Summary */}
      <div className="mx-4 mb-4 p-4 bg-card-bg rounded-2xl border border-card-border">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xl font-bold text-foreground">{workers.length}</div>
            <div className="text-xs text-muted-foreground">сотрудников</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalWorkDays}</div>
            <div className="text-xs text-muted-foreground">смен</div>
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">{totalHours}</div>
            <div className="text-xs text-muted-foreground">часов</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-4 mb-4 flex rounded-xl overflow-hidden border border-card-border bg-card-bg">
        {(['workers', 'schedules'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === t ? 'bg-blue-600 text-white' : 'text-muted-foreground'
            }`}
          >
            {t === 'workers' ? 'Сотрудники' : 'Графики'}
          </button>
        ))}
      </div>

      <div className="px-4 pb-28 space-y-3">
        {/* Workers tab */}
        {tab === 'workers' && (
          <>
            {workerStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar size={48} className="text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground font-medium">Нет сотрудников</p>
                <p className="text-muted-foreground/60 text-sm mt-1">Нажмите + чтобы добавить</p>
              </div>
            ) : (
              workerStats.map(({ worker, stats, schedule }) => {
                const isExpanded = expandedWorker === worker.id;
                const today = format(new Date(), 'yyyy-MM-dd');

                // Preview: next 7 days
                const preview = schedule
                  ? generateSchedule(
                      schedule,
                      format(new Date(), 'yyyy-MM-dd'),
                      format(new Date(Date.now() + 6 * 86400000), 'yyyy-MM-dd'),
                    )
                  : [];

                return (
                  <div key={worker.id} className="bg-card-bg rounded-2xl border border-card-border overflow-hidden">
                    <div
                      className="p-4 flex items-center gap-3 cursor-pointer active:bg-muted transition-colors"
                      onClick={() => setExpandedWorker(isExpanded ? null : worker.id)}
                    >
                      {/* Avatar */}
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ background: worker.color }}
                      >
                        {getInitials(worker.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">{worker.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {schedule ? `${schedule.name} · ${SCHEDULE_TYPE_LABELS[schedule.type]}` : 'Нет графика'}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {stats ? (
                          <>
                            <div className="font-bold text-blue-600 dark:text-blue-400">{stats.workDays} смен</div>
                            <div className="text-xs text-muted-foreground">{stats.totalHours} ч</div>
                          </>
                        ) : (
                          <div className="text-xs text-muted-foreground">—</div>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3">
                            {/* 7-day preview */}
                            {preview.length > 0 && (
                              <div>
                                <div className="text-xs text-muted-foreground font-medium mb-2">Ближайшие 7 дней</div>
                                <div className="flex gap-1.5">
                                  {preview.map(s => (
                                    <div key={s.date} className="flex-1 text-center">
                                      <div className="text-[10px] text-muted-foreground mb-1">
                                        {format(new Date(s.date + 'T00:00:00'), 'EEE', { locale: ru }).slice(0, 2)}
                                      </div>
                                      <div className={`rounded-lg py-1 text-[10px] font-bold ${s.isOff ? 'bg-muted text-muted-foreground' : shiftColorClass(s.shiftIndex)}`}>
                                        {s.isOff ? 'В' : s.shift?.label.split(' ')[0].slice(0, 1) + 'с'}
                                      </div>
                                      {s.isHoliday && !s.isOff && (
                                        <div className="text-[8px] text-red-500 mt-0.5">празд.</div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Month stats detail */}
                            {stats && (
                              <div className="grid grid-cols-3 gap-2 text-center bg-background rounded-xl p-3">
                                <div>
                                  <div className="text-sm font-bold text-foreground">{stats.workDays}</div>
                                  <div className="text-[10px] text-muted-foreground">смен</div>
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{stats.nightHours}</div>
                                  <div className="text-[10px] text-muted-foreground">ночных ч.</div>
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-red-600 dark:text-red-400">{stats.holidayHours}</div>
                                  <div className="text-[10px] text-muted-foreground">празд. ч.</div>
                                </div>
                              </div>
                            )}

                            {/* Earnings estimate */}
                            {stats && worker.rate > 0 && (
                              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 flex justify-between items-center">
                                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Расчётный заработок</span>
                                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                  {Math.round(
                                    stats.totalHours * worker.rate +
                                    stats.nightHours * worker.rate * (schedule!.nightCoeff - 1) +
                                    stats.holidayHours * worker.rate * (schedule!.holidayCoeff - 1)
                                  ).toLocaleString('ru-RU')} ₽
                                </span>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                              {schedule && (
                                <button
                                  onClick={() => setCalendarWorker(worker)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium"
                                >
                                  <Calendar size={14} /> Календарь
                                </button>
                              )}
                              <button
                                onClick={() => { setEditingWorker(worker); setShowWorkerForm(true); }}
                                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-card-border text-foreground text-sm"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => onDeleteWorker(worker.id)}
                                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* Schedules tab */}
        {tab === 'schedules' && (
          <>
            {schedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Settings size={48} className="text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground font-medium">Нет графиков</p>
                <p className="text-muted-foreground/60 text-sm mt-1">Нажмите + чтобы создать</p>
              </div>
            ) : (
              schedules.map(sch => {
                const s = getMonthStats(sch, year, mon, RUSSIAN_HOLIDAYS);
                const assignedCount = workers.filter(w => w.scheduleId === sch.id).length;
                return (
                  <div key={sch.id} className="bg-card-bg rounded-2xl border border-card-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground">{sch.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {SCHEDULE_TYPE_LABELS[sch.type]} · {assignedCount} чел. · старт {sch.startDate}
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {sch.shifts.map((sh, i) => (
                            <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SHIFT_COLORS[i % SHIFT_COLORS.length]} text-white`}>
                              {sh.label}: {sh.start}–{sh.end}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-blue-600 dark:text-blue-400 font-bold">{s.workDays} дн.</div>
                        <div className="text-xs text-muted-foreground">{s.totalHours} ч</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => { setEditingSchedule(sch); setShowScheduleConfig(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-card-border text-foreground text-sm"
                      >
                        <Pencil size={14} /> Изменить
                      </button>
                      <button
                        onClick={() => onDeleteSchedule(sch.id)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          if (tab === 'workers') { setEditingWorker(null); setShowWorkerForm(true); }
          else { setEditingSchedule(null); setShowScheduleConfig(true); }
        }}
        className="fixed bottom-6 right-4 z-20 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <Plus size={28} strokeWidth={2.5} />
      </motion.button>

      {/* Worker Form Modal */}
      {showWorkerForm && (
        <WorkerForm
          worker={editingWorker}
          schedules={schedules}
          onSave={data => {
            if (editingWorker) onUpdateWorker(editingWorker.id, data);
            else onAddWorker(data);
            setShowWorkerForm(false);
            setEditingWorker(null);
          }}
          onClose={() => { setShowWorkerForm(false); setEditingWorker(null); }}
        />
      )}

      {/* Schedule Config Modal */}
      {showScheduleConfig && (
        <ScheduleConfig
          schedule={editingSchedule}
          onSave={data => {
            if (editingSchedule) onUpdateSchedule(editingSchedule.id, data);
            else onAddSchedule(data);
            setShowScheduleConfig(false);
            setEditingSchedule(null);
          }}
          onClose={() => { setShowScheduleConfig(false); setEditingSchedule(null); }}
        />
      )}
    </div>
  );
}
