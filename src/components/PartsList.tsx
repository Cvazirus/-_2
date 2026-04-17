import { Part } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, CheckCircle2, Circle, X } from 'lucide-react';
import React, { useState, useRef, UIEvent, useCallback } from 'react';

interface PartsListProps {
  parts: Part[];
  onSelectPart: (part: Part) => void;
  onDeleteParts: (ids: string[]) => void;
  scrollPosition?: number;
  onScrollChange?: (position: number) => void;
}

export default function PartsList({ parts, onSelectPart, onDeleteParts, scrollPosition = 0, onScrollChange }: PartsListProps) {
  const totalValue = parts.reduce((acc, part) => acc + (part.currentQuantity * part.pricePerUnit), 0);
  const [showBottomBar, setShowBottomBar] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const lastScrollY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  React.useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, []);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (onScrollChange) onScrollChange(currentScrollY);
    if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;
    setShowBottomBar(currentScrollY > lastScrollY.current);
    lastScrollY.current = currentScrollY;
  };

  const startLongPress = useCallback((partId: string) => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      navigator.vibrate?.(50);
      setIsSelecting(true);
      setSelectedIds(new Set([partId]));
    }, 500);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleCardClick = (part: Part) => {
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }
    if (isSelecting) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(part.id)) next.delete(part.id);
        else next.add(part.id);
        return next;
      });
    } else {
      onSelectPart(part);
    }
  };

  const exitSelection = () => {
    setIsSelecting(false);
    setSelectedIds(new Set());
  };

  const confirmDelete = () => {
    onDeleteParts(Array.from(selectedIds));
    setShowConfirm(false);
    setIsSelecting(false);
    setSelectedIds(new Set());
  };

  const getPartIcon = (code: string) => {
    const firstFour = code.substring(0, 4);
    const colors = [
      'bg-cyan-500', 'bg-pink-500', 'bg-purple-500',
      'bg-orange-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-teal-500', 'bg-rose-500', 'bg-emerald-500'
    ];
    let hash = 0;
    for (let i = 0; i < firstFour.length; i++) {
      hash = firstFour.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];
    const displayChars = firstFour.toUpperCase() || 'PART';
    return (
      <div className={`w-[52px] h-[52px] shrink-0 ${color} rounded-full flex items-center justify-center mr-4 text-white font-medium text-[15px]`}>
        {displayChars}
      </div>
    );
  };

  const getNeonColor = (cost: number) => {
    let r, g, b;
    if (cost < 1000) {
      const ratio = Math.max(0, cost) / 1000;
      r = Math.round(239 - (239 - 234) * ratio);
      g = Math.round(68 + (179 - 68) * ratio);
      b = Math.round(68 - (68 - 8) * ratio);
    } else if (cost <= 3000) {
      const ratio = (cost - 1000) / 2000;
      r = Math.round(234 - (234 - 34) * ratio);
      g = Math.round(179 + (197 - 179) * ratio);
      b = Math.round(8 + (94 - 8) * ratio);
    } else {
      r = 34; g = 197; b = 94;
    }
    return { r, g, b };
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] bg-background relative overflow-hidden">
      {/* Selection mode top bar */}
      <AnimatePresence>
        {isSelecting && (
          <motion.div
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -48, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
            className="flex items-center justify-between px-4 py-2.5 bg-red-600 text-white z-20 shadow-md"
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

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 pb-24"
        onScroll={handleScroll}
      >
        {parts.map((part) => {
          const partTotalCost = part.currentQuantity * part.pricePerUnit;
          const { r, g, b } = getNeonColor(partTotalCost);
          const color = `rgba(${r}, ${g}, ${b}, 0.25)`;
          const isSelected = selectedIds.has(part.id);

          return (
            <motion.div
              key={part.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(part)}
              onPointerDown={() => !isSelecting && startLongPress(part.id)}
              onPointerUp={cancelLongPress}
              onPointerLeave={cancelLongPress}
              onPointerCancel={cancelLongPress}
              style={{ '--neon-color': color } as React.CSSProperties}
              className={`neon-card flex items-center p-4 rounded-2xl cursor-pointer transition-colors bg-card-bg hover:bg-muted active:bg-muted/80 select-none ${isSelected ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950/30' : ''}`}
            >
              {isSelecting && (
                <div className="mr-3 shrink-0 text-red-500">
                  {isSelected ? <CheckCircle2 size={22} /> : <Circle size={22} className="text-muted-foreground" />}
                </div>
              )}
              {getPartIcon(part.code)}
              <div className="flex-1 min-w-0">
                <div className="text-foreground font-semibold text-[17px] mb-0.5 truncate">{part.code}</div>
                <div className="text-muted-foreground text-[15px] truncate">{part.name}</div>
              </div>
              <div className="text-right ml-4 shrink-0">
                <div className="text-blue-500 text-[17px] font-bold mb-0.5">{part.currentQuantity} шт.</div>
                <div className="text-muted-foreground text-[14px]">{partTotalCost.toLocaleString('ru-RU')} ₽</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showBottomBar && !isSelecting && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 p-5 bg-card-bg/90 backdrop-blur-md border-t border-card-border flex justify-between items-center text-foreground z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
          >
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Записей: {parts.length}</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalValue.toLocaleString()} ₽</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
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
                <h3 className="text-lg font-bold text-foreground">Удалить детали?</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Будет удалено <span className="font-semibold text-foreground">{selectedIds.size}</span> {selectedIds.size === 1 ? 'деталь' : selectedIds.size < 5 ? 'детали' : 'деталей'}. Действие необратимо. Остатки будут списаны в журнал.
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
