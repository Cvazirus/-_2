import { Operation } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronDown, ChevronRight, Trash2, CheckCircle2, Circle, X } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OperationsLogProps {
  operations: Operation[];
  onSelectOperation: (op: Operation) => void;
  onDeleteOperations: (ids: string[]) => void;
}

export default function OperationsLog({ operations, onSelectOperation, onDeleteOperations }: OperationsLogProps) {
  const [expandedDates, setExpandedDates] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const grouped = operations.reduce((acc, op) => {
    const dateStr = format(new Date(op.date), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(op);
    return acc;
  }, {} as Record<string, Operation[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const toggleDate = (dateStr: string) => {
    if (isSelecting) return;
    setExpandedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  const startLongPress = useCallback((opId: string) => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      navigator.vibrate?.(50);
      setIsSelecting(true);
      setSelectedIds(new Set([opId]));
    }, 500);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleCardClick = (op: Operation) => {
    if (didLongPress.current) { didLongPress.current = false; return; }
    if (isSelecting) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(op.id)) next.delete(op.id); else next.add(op.id);
        return next;
      });
    } else {
      onSelectOperation(op);
    }
  };

  const exitSelection = () => {
    setIsSelecting(false);
    setSelectedIds(new Set());
  };

  const confirmDelete = () => {
    onDeleteOperations(Array.from(selectedIds));
    setShowConfirm(false);
    setIsSelecting(false);
    setSelectedIds(new Set());
  };

  return (
    <div className="bg-background min-h-[calc(100dvh-64px)] relative">
      <AnimatePresence>
        {isSelecting && (
          <motion.div
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -48, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
            className="sticky top-0 flex items-center justify-between px-4 py-2.5 bg-red-600 text-white z-20 shadow-md"
          >
            <button onClick={exitSelection} className="flex items-center gap-2 opacity-90">
              <X size={20} />
              <span className="font-medium">Отмена</span>
            </button>
            <span className="font-semibold">Выбрано: {selectedIds.size}</span>
            <button
              onClick={() => selectedIds.size > 0 && setShowConfirm(true)}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-2 opacity-90 disabled:opacity-40"
            >
              <Trash2 size={20} />
              <span className="font-medium">Удалить</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-card-bg"
                >
                  <div className="px-4 pb-4 space-y-3">
                    {dateOps.map((op) => (
                      <motion.div 
                        key={op.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectOperation(op)}
                        className="p-4 rounded-xl border border-card-border bg-background flex items-center gap-4 cursor-pointer active:bg-muted transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 ${
                          op.type === 'arrival' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                          {op.type === 'arrival' ? 'П' : 'С'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-foreground font-medium truncate">
                            {op.partCode} {op.partName}
                          </div>
                          <div className="text-muted-foreground text-sm truncate">
                            {op.operationNumbers.join(', ')}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {op.quantity} шт.
                          </div>
                        </div>
                        <div className="text-blue-600 dark:text-blue-400 font-bold text-lg shrink-0">
                          {op.sum.toLocaleString()} ₽
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-foreground">{displayDate}</div>
                    <div className="text-gray-400 dark:text-muted-foreground text-[11px] font-bold uppercase tracking-wider mt-0.5">
                      {dateOps.length} записи
                      {isSelecting && selectedInGroup > 0 && ` · выбрано ${selectedInGroup}`}
                    </div>
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-card-bg"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {dateOps.map((op) => {
                        const isSelected = selectedIds.has(op.id);
                        return (
                          <motion.div
                            key={op.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCardClick(op)}
                            onPointerDown={() => !isSelecting && startLongPress(op.id)}
                            onPointerUp={cancelLongPress}
                            onPointerLeave={cancelLongPress}
                            onPointerCancel={cancelLongPress}
                            className={`p-4 rounded-xl border border-card-border bg-background flex items-center gap-4 cursor-pointer active:bg-muted transition-colors select-none ${isSelected ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950/30' : ''}`}
                          >
                            {isSelecting && (
                              <div className="shrink-0 text-red-500">
                                {isSelected ? <CheckCircle2 size={22} /> : <Circle size={22} className="text-muted-foreground" />}
                              </div>
                            )}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 ${
                              op.type === 'arrival' ? 'bg-green-500' : op.type === 'delete' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}>
                              {op.type === 'arrival' ? 'П' : op.type === 'delete' ? 'У' : 'С'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-foreground font-medium truncate">{op.partCode} {op.partName}</div>
                              <div className="text-muted-foreground text-sm truncate">{op.operationNumbers.join(', ')}</div>
                              <div className="text-muted-foreground text-sm">{op.quantity} шт.</div>
                            </div>
                            <div className="text-blue-600 dark:text-blue-400 font-bold text-lg shrink-0">
                              {op.sum.toLocaleString()} ₽
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card-bg rounded-2xl shadow-2xl border border-card-border p-6 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                  <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Удалить записи?</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Будет удалено <span className="font-semibold text-foreground">{selectedIds.size}</span> {selectedIds.size === 1 ? 'запись' : selectedIds.size < 5 ? 'записи' : 'записей'}. Действие необратимо.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-card-border text-foreground font-medium hover:bg-muted transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                >
                  Удалить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
