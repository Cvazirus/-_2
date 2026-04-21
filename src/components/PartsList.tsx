import { Part } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import React, { useState, useRef, UIEvent } from 'react';

interface PartsListProps {
  parts: Part[];
  onSelectPart: (part: Part) => void;
  scrollPosition?: number;
  onScrollChange?: (position: number) => void;
}

export default function PartsList({ parts, onSelectPart, scrollPosition = 0, onScrollChange }: PartsListProps) {
  const totalValue = parts.reduce((acc, part) => acc + (part.currentQuantity * part.pricePerUnit), 0);
  const [showBottomBar, setShowBottomBar] = useState(true);
  const lastScrollY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, []); // Only on mount

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    
    if (onScrollChange) {
      onScrollChange(currentScrollY);
    }
    
    if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

    if (currentScrollY > lastScrollY.current) {
      // Scrolling down
      setShowBottomBar(true);
    } else if (currentScrollY < lastScrollY.current) {
      // Scrolling up
      setShowBottomBar(false);
    }
    
    lastScrollY.current = currentScrollY;
  };

  const getPartIcon = (code: string) => {
    const firstFour = code.substring(0, 4);
    const colors = [
      'bg-cyan-500', 'bg-pink-500', 'bg-purple-500', 
      'bg-orange-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-teal-500', 'bg-rose-500', 'bg-emerald-500'
    ];
    
    // Simple hash
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
      // Red to Yellow interpolation (0 to 1000)
      const ratio = Math.max(0, cost) / 1000;
      r = Math.round(239 - (239 - 234) * ratio);
      g = Math.round(68 + (179 - 68) * ratio);
      b = Math.round(68 - (68 - 8) * ratio);
    } else if (cost <= 3000) {
      // Yellow to Green interpolation (1000 to 3000)
      const ratio = (cost - 1000) / 2000;
      r = Math.round(234 - (234 - 34) * ratio);
      g = Math.round(179 + (197 - 179) * ratio);
      b = Math.round(8 + (94 - 8) * ratio);
    } else {
      // Green
      r = 34;
      g = 197;
      b = 94;
    }
    return { r, g, b };
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] bg-background relative overflow-hidden">
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 pb-24"
        onScroll={handleScroll}
      >
        {parts.map((part) => {
          const partTotalCost = part.currentQuantity * part.pricePerUnit;
          const { r, g, b } = getNeonColor(partTotalCost);
          const color = `rgba(${r}, ${g}, ${b}, 0.25)`;
          const borderColor = `rgba(${r}, ${g}, ${b}, 0.3)`;
          
          return (
            <motion.div
              key={part.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPart(part)}
              style={{ 
                '--neon-color': color
              } as React.CSSProperties}
              className="neon-card flex items-center p-4 rounded-2xl cursor-pointer transition-colors bg-card-bg hover:bg-muted active:bg-muted/80"
            >
              {getPartIcon(part.code)}
              <div className="flex-1 min-w-0">
                <div className="text-foreground font-semibold text-[17px] mb-0.5 truncate">
                  {part.code}
                </div>
                <div className="text-muted-foreground text-[15px] truncate">
                  {part.name}
                </div>
              </div>
              <div className="text-right ml-4 shrink-0">
                <div className="text-blue-500 text-[17px] font-bold mb-0.5">
                  {part.currentQuantity} шт.
                </div>
                <div className="text-muted-foreground text-[14px]">
                  {partTotalCost.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <AnimatePresence>
        {showBottomBar && (
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
    </div>
  );
}
