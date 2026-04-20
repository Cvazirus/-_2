import { Box, ClipboardList, MoreHorizontal, Edit2, Trash2, Wallet, Users, LayoutGrid, List } from 'lucide-react';
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
    <div className="relative min-h-[calc(100dvh-80px)] overflow-hidden bg-[#050505]" ref={menuRef}>
      {/* Immersive Dark Fluid Background - Grayscale */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#2a2a2a] rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[90vw] h-[90vw] max-w-[900px] max-h-[900px] bg-[#1a1a1a] rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[30%] left-[20%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#333333] rounded-full blur-[80px] mix-blend-screen" />
      </div>

      <div className="relative z-10 p-4 w-full max-w-lg mx-auto">
        {/* Toggle Grid/List matching the screenshot top right corner */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-1 bg-[#161616]/80 backdrop-blur-md p-1 rounded-xl border border-white/5">
            <button className="bg-[#333333] text-white p-1 rounded-[8px] shadow-sm">
              <LayoutGrid size={16} />
            </button>
            <button className="text-white/40 p-1 rounded-[8px] px-1.5 transition-colors hover:text-white/70">
              <List size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 content-start">
          {/* Учёт (Основной) */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={onOpenParts}
            className="bg-gradient-to-br from-[#222222]/80 to-[#111111]/80 backdrop-blur-3xl rounded-[32px] p-5 sm:p-6 flex flex-col cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_10px_30px_rgba(0,0,0,0.8)] border border-transparent transition-all aspect-square relative"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 rounded-[20px] bg-[#0a0a0a]/90 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.03)] border border-white/[0.02] flex items-center justify-center">
                <Box size={34} strokeWidth={1.5} className="text-[#a3a3a3]" />
              </div>
              <div className="relative -mr-2 -mt-2">
                <button 
                  onClick={(e) => handleMenuClick(e, 'parts')}
                  className="text-white/30 hover:text-white/70 transition-colors p-2 rounded-full"
                >
                  <MoreHorizontal size={20} />
                </button>
                <MenuDropdown isOpen={openMenu === 'parts'} />
              </div>
            </div>
            
            <div className="mt-auto">
              <h2 className="text-[#e2e8f0] text-base sm:text-lg font-semibold leading-tight mb-1">Основной</h2>
              <p className="text-[#737373] text-xs sm:text-sm font-medium">{partsCount} записей</p>
            </div>
          </motion.div>

          {/* Журнал списаний */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={onOpenOperations}
            className="bg-gradient-to-br from-[#222222]/80 to-[#111111]/80 backdrop-blur-3xl rounded-[32px] p-5 sm:p-6 flex flex-col cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_10px_30px_rgba(0,0,0,0.8)] border border-transparent transition-all aspect-square relative"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 rounded-[20px] bg-[#0a0a0a]/90 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.03)] border border-white/[0.02] flex items-center justify-center">
                <ClipboardList size={34} strokeWidth={1.5} className="text-[#a3a3a3]" />
              </div>
              <div className="relative -mr-2 -mt-2">
                <button 
                  onClick={(e) => handleMenuClick(e, 'operations')}
                  className="text-white/30 hover:text-white/70 transition-colors p-2 rounded-full"
                >
                  <MoreHorizontal size={20} />
                </button>
                <MenuDropdown isOpen={openMenu === 'operations'} />
              </div>
            </div>
            
            <div className="mt-auto">
              <h2 className="text-[#e2e8f0] text-base sm:text-lg font-semibold leading-tight mb-1">Журнал списаний</h2>
              <p className="text-[#737373] text-xs sm:text-sm font-medium">{operationsCount} записей</p>
            </div>
          </motion.div>

          {/* Финансовый журнал */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={onViewFinance}
            className="bg-gradient-to-br from-[#222222]/80 to-[#111111]/80 backdrop-blur-3xl rounded-[32px] p-5 sm:p-6 flex flex-col cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_10px_30px_rgba(0,0,0,0.8)] border border-transparent transition-all aspect-square relative"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 rounded-[20px] bg-[#0a0a0a]/90 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.03)] border border-white/[0.02] flex items-center justify-center">
                <Wallet size={34} strokeWidth={1.5} className="text-[#a3a3a3]" />
              </div>
              <div className="relative -mr-2 -mt-2">
                <button className="text-white/30 hover:text-white/70 transition-colors p-2 rounded-full">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
            
            <div className="mt-auto">
              <h2 className="text-[#e2e8f0] text-base sm:text-lg font-semibold leading-tight mb-1">Финансовый журнал</h2>
              <p className="text-[#737373] text-xs sm:text-sm font-medium">Зарплата и аванс</p>
            </div>
          </motion.div>

          {/* Журнал смен */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-[#222222]/50 to-[#111111]/50 backdrop-blur-3xl rounded-[32px] p-5 sm:p-6 flex flex-col cursor-not-allowed shadow-[inset_0_1px_1px_rgba(255,255,255,0.02),_0_10px_30px_rgba(0,0,0,0.5)] border border-transparent transition-all aspect-square relative"
          >
            <div className="flex justify-between items-start mb-4 opacity-70">
              <div className="w-14 h-14 rounded-[20px] bg-[#0a0a0a]/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.03)] border border-white/[0.02] flex items-center justify-center">
                <Users size={34} strokeWidth={1.5} className="text-[#737373]" />
              </div>
              <div className="relative -mr-2 -mt-2">
                <button className="text-white/20 transition-colors p-2 rounded-full cursor-not-allowed">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
            
            <div className="mt-auto opacity-70">
              <h2 className="text-[#e2e8f0] text-base sm:text-lg font-semibold leading-tight mb-1">Журнал смен</h2>
              <p className="text-[#737373] text-xs sm:text-sm font-medium opacity-60">1 график</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
