import { Box, ClipboardList, MoreHorizontal, Edit2, Trash2, Wallet, Users } from 'lucide-react';
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
    <div className="relative min-h-[calc(100dvh-80px)] overflow-hidden bg-[#0d111a]" ref={menuRef}>
      {/* Immersive Dark Fluid Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#1a2f55] rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[90vw] h-[90vw] max-w-[900px] max-h-[900px] bg-[#172545] rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[30%] left-[20%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#223555] rounded-full blur-[80px] mix-blend-screen" />
      </div>

      <div className="relative z-10 p-4 grid grid-cols-2 gap-3 sm:gap-4 content-start">
        {/* Учёт (Основной) */}
        <motion.div 
          whileTap={{ scale: 0.98 }}
          onClick={onOpenParts}
          className="bg-[#1e2536]/80 backdrop-blur-3xl rounded-[28px] p-4 sm:p-5 flex flex-col cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_10px_30px_rgba(0,0,0,0.5)] border border-white/5 transition-all aspect-square relative"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="bg-[#141b2a]/80 shadow-inner border border-white/5 p-3 rounded-2xl">
              <Box size={24} strokeWidth={1.5} className="text-[#5dade2]" />
            </div>
            <div className="relative">
              <button 
                onClick={(e) => handleMenuClick(e, 'parts')}
                className="text-white/30 hover:text-white/70 transition-colors p-1"
              >
                <MoreHorizontal size={20} />
              </button>
              <MenuDropdown isOpen={openMenu === 'parts'} />
            </div>
          </div>
          
          <div className="mt-auto">
            <h2 className="text-white text-base sm:text-lg font-semibold leading-tight mb-1">Основной</h2>
            <p className="text-white/40 text-xs sm:text-sm font-medium">{partsCount} записей</p>
          </div>
        </motion.div>

        {/* Журнал списаний */}
        <motion.div 
          whileTap={{ scale: 0.98 }}
          onClick={onOpenOperations}
          className="bg-[#1e2536]/80 backdrop-blur-3xl rounded-[28px] p-4 sm:p-5 flex flex-col cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_10px_30px_rgba(0,0,0,0.5)] border border-white/5 transition-all aspect-square relative"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="bg-[#141b2a]/80 shadow-inner border border-white/5 p-3 rounded-2xl">
              <ClipboardList size={24} strokeWidth={1.5} className="text-[#5dade2]" />
            </div>
            <div className="relative">
              <button 
                onClick={(e) => handleMenuClick(e, 'operations')}
                className="text-white/30 hover:text-white/70 transition-colors p-1"
              >
                <MoreHorizontal size={20} />
              </button>
              <MenuDropdown isOpen={openMenu === 'operations'} />
            </div>
          </div>
          
          <div className="mt-auto">
            <h2 className="text-white text-base sm:text-lg font-semibold leading-tight mb-1">Журнал списаний</h2>
            <p className="text-white/40 text-xs sm:text-sm font-medium">{operationsCount} записей</p>
          </div>
        </motion.div>

        {/* Финансовый журнал */}
        <motion.div 
          whileTap={{ scale: 0.98 }}
          onClick={onViewFinance}
          className="bg-[#1e2536]/80 backdrop-blur-3xl rounded-[28px] p-4 sm:p-5 flex flex-col cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_10px_30px_rgba(0,0,0,0.5)] border border-white/5 transition-all aspect-square relative"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="bg-[#141b2a]/80 shadow-inner border border-white/5 p-3 rounded-2xl">
              <Wallet size={24} strokeWidth={1.5} className="text-[#5dade2]" />
            </div>
            <div className="relative">
              <button className="text-white/30 hover:text-white/70 transition-colors p-1">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
          
          <div className="mt-auto">
            <h2 className="text-white text-base sm:text-lg font-semibold leading-tight mb-1">Финансовый журнал</h2>
            <p className="text-white/40 text-xs sm:text-sm font-medium">Зарплата и аванс</p>
          </div>
        </motion.div>

        {/* Журнал смен */}
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="bg-[#1e2536]/50 backdrop-blur-3xl rounded-[28px] p-4 sm:p-5 flex flex-col cursor-not-allowed shadow-[inset_0_1px_1px_rgba(255,255,255,0.03),_0_10px_30px_rgba(0,0,0,0.3)] border border-white/5 transition-all aspect-square relative"
        >
          <div className="flex justify-between items-start mb-4 opacity-70">
            <div className="bg-[#141b2a]/60 shadow-inner border border-white/5 p-3 rounded-2xl">
              <Users size={24} strokeWidth={1.5} className="text-[#5dade2]" />
            </div>
            <div className="relative">
              <button className="text-white/20 transition-colors p-1">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
          
          <div className="mt-auto opacity-70">
            <h2 className="text-white text-base sm:text-lg font-semibold leading-tight mb-1">Журнал смен</h2>
            <p className="text-white/30 text-xs sm:text-sm font-medium">В разработке</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
