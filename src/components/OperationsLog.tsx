import { Operation } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OperationsLogProps {
  operations: Operation[];
  onSelectOperation: (op: Operation) => void;
}

export default function OperationsLog({ operations, onSelectOperation }: OperationsLogProps) {
  const [expandedDates, setExpandedDates] = useState<string[]>([]);

  const grouped = operations.reduce((acc, op) => {
    const dateStr = format(new Date(op.date), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(op);
    return acc;
  }, {} as Record<string, Operation[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const toggleDate = (dateStr: string) => {
    setExpandedDates(prev => 
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  return (
    <div className="bg-background min-h-[calc(100vh-64px)] p-4 pb-24 space-y-4">
      {sortedDates.map((dateStr) => {
        const dateOps = grouped[dateStr];
        const isExpanded = expandedDates.includes(dateStr);
        const displayDate = format(new Date(dateStr), 'd MMMM yyyy г.', { locale: ru });

        return (
          <div key={dateStr} className="bg-card-bg rounded-2xl shadow-sm border border-card-border overflow-hidden">
            <button 
              onClick={() => toggleDate(dateStr)}
              className="w-full p-4 flex items-center justify-between bg-card-bg transition-colors active:bg-gray-50 dark:active:bg-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="text-blue-600 dark:text-blue-400">
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-foreground">{displayDate}</div>
                  <div className="text-gray-400 dark:text-muted-foreground text-[11px] font-bold uppercase tracking-wider mt-0.5">{dateOps.length} записи</div>
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
