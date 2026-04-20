import { Box, ClipboardList, MoreHorizontal, Edit2, Trash2, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useRef, useEffect } from 'react';

interface DashboardProps {
  partsCount: number;
  operationsCount: number;
  onOpenParts: () => void;
  onOpenOperations: () => void;
  onViewFinance: () => void;
}

export default function Dashboard({ partsCount, operationsCount, onOpenParts, onOpenOperations, onViewFinance }: DashboardProps) {
  const [openMenu, setOpenMenu] = useState<'parts' | 'operations' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (e: React.MouseEvent, menu: 'parts' | 'operations') => {
    e.stopPropagation();
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenu(null);
    // TODO: Implement rename
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenu(null);
    // TODO: Implement delete
  };

  const MenuDropdown = ({ isOpen }: { isOpen: boolean }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-10 w-48 bg-card-bg rounded-xl shadow-lg border border-card-border overflow-hidden z-10"
        >
          <button 
            onClick={handleRename}
            className="w-full px-4 py-3 flex items-center gap-3 text-left text-foreground hover:bg-primary-50 transition-colors"
          >
            <Edit2 size={16} />
            <span className="font-medium">Переименовать</span>
          </button>
          <button 
            onClick={handleDelete}
            className="w-full px-4 py-3 flex items-center gap-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={16} />
            <span className="font-medium">Удалить</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-4 grid grid-cols-2 gap-4 content-start min-h-[calc(100dvh-80px)]" ref={menuRef}>
      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={onOpenParts}
        className="bg-card-bg rounded-3xl p-4 sm:p-5 flex flex-col cursor-pointer shadow-sm border border-card-border hover:shadow-md transition-all aspect-square relative"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="bg-primary-50 p-3 rounded-2xl">
            <Box size={32} strokeWidth={1.5} className="text-primary-600" />
          </div>
          <div className="relative">
            <button 
              onClick={(e) => handleMenuClick(e, 'parts')}
              className="text-foreground/40 hover:text-foreground/70 transition-colors p-1"
            >
              <MoreHorizontal size={20} />
            </button>
            <MenuDropdown isOpen={openMenu === 'parts'} />
          </div>
        </div>
        
        <div className="mt-auto">
          <h2 className="text-foreground text-base sm:text-lg font-semibold leading-tight mb-1">Учёт деталей</h2>
          <p className="text-foreground/60 text-xs sm:text-sm font-medium">{partsCount} записей</p>
        </div>
      </motion.div>

      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={onOpenOperations}
        className="bg-card-bg rounded-3xl p-4 sm:p-5 flex flex-col cursor-pointer shadow-sm border border-card-border hover:shadow-md transition-all aspect-square relative"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="bg-primary-50 p-3 rounded-2xl">
            <ClipboardList size={32} strokeWidth={1.5} className="text-primary-600" />
          </div>
          <div className="relative">
            <button 
              onClick={(e) => handleMenuClick(e, 'operations')}
              className="text-foreground/40 hover:text-foreground/70 transition-colors p-1"
            >
              <MoreHorizontal size={20} />
            </button>
            <MenuDropdown isOpen={openMenu === 'operations'} />
          </div>
        </div>
        
        <div className="mt-auto">
          <h2 className="text-foreground text-base sm:text-lg font-semibold leading-tight mb-1">Журнал списаний</h2>
          <p className="text-foreground/60 text-xs sm:text-sm font-medium">{operationsCount} записи</p>
        </div>
      </motion.div>

      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={onViewFinance}
        className="bg-card-bg rounded-3xl p-4 sm:p-5 flex flex-col cursor-pointer shadow-sm border border-card-border hover:shadow-md transition-all col-span-2 min-h-[140px] relative"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="bg-primary-50 p-3 rounded-2xl">
            <Wallet size={32} strokeWidth={1.5} className="text-primary-600" />
          </div>
        </div>
        
        <div className="mt-auto">
          <h2 className="text-foreground text-lg sm:text-lg font-semibold mb-1">Финансовый журнал</h2>
          <p className="text-foreground/60 text-sm font-medium">Зарплата и аванс</p>
        </div>
      </motion.div>
    </div>
  );
}
