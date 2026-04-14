import { Part } from '../types';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';

interface PartsListProps {
  parts: Part[];
  onSelectPart: (part: Part) => void;
}

export default function PartsList({ parts, onSelectPart }: PartsListProps) {
  const totalValue = parts.reduce((acc, part) => acc + (part.currentQuantity * part.pricePerUnit), 0);

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

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {parts.map((part) => {
          const partTotalCost = part.currentQuantity * part.pricePerUnit;
          
          return (
            <motion.div
              key={part.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPart(part)}
              className="flex items-center p-4 rounded-2xl border border-card-border cursor-pointer transition-colors bg-card-bg hover:bg-muted active:bg-muted/80"
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
      
      <div className="p-5 bg-card-bg/80 backdrop-blur-md border-t border-card-border flex justify-between items-center text-foreground">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Записей: {parts.length}</span>
        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalValue.toLocaleString()} ₽</span>
      </div>
    </div>
  );
}
