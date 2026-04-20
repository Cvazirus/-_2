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
          className="absolute right-0 top-10 w-48 bg-[#252528] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-white/[0.05] overflow-hidden z-20"
        >
          <button 
            onClick={handleRename}
            className="w-full px-4 py-3 flex items-center gap-3 text-left text-white hover:bg-white/5 transition-colors relative z-10 font-medium text-sm"
          >
            <Edit2 size={16} strokeWidth={1.5} />
            <span>Переименовать</span>
          </button>
          <button 
            onClick={handleDelete}
            className="w-full px-4 py-3 flex items-center gap-3 text-left text-red-400 hover:bg-red-500/10 transition-colors relative z-10 font-medium text-sm border-t border-white/5"
          >
            <Trash2 size={16} strokeWidth={1.5} />
            <span>Удалить</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative min-h-[calc(100dvh-80px)] overflow-hidden bg-[#0A0A0C]" ref={menuRef}>
      {/* Mechanical Background - using a visually similar dark tech/gear imagery */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img 
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80" 
          alt="Circuit Background" 
          className="w-full h-full object-cover grayscale opacity-30 contrast-[1.2]"
        />
        <img 
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80" 
          alt="Gears overlay" 
          className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-overlay opacity-40 contrast-[1.2]"
        />
        {/* Adjusted overlay to darken slightly based on feedback */}
        <div className="absolute inset-0 bg-[#0A0A0C]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-[#0a0a0c]/10" />
      </div>

      <div className="relative z-10 p-5 w-full max-w-lg mx-auto pt-6 flex flex-col min-h-full">
        
        {/* Header Area */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-[28px] font-semibold tracking-tight">Учёт</h1>
          <button className="bg-[#2C2C2E] text-[#8e8e93] hover:text-white p-2 rounded-full transition-colors border border-white/[0.05] shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <MoreHorizontal size={22} strokeWidth={2} />
          </button>
        </div>

        {/* Adjust Toolbar (Grid/List Toggle) */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-0.5 bg-[#1F1F21] p-[3px] rounded-2xl border border-white/[0.02] shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <button className="bg-[#38383A] text-white p-2 rounded-[14px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_2px_4px_rgba(0,0,0,0.4)]">
              <LayoutGrid size={18} strokeWidth={1.5} />
            </button>
            <button className="text-[#8e8e93] p-2 rounded-[14px] transition-colors hover:text-white">
              <List size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 content-start">
          {/* Учёт (Основной) */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={onOpenParts}
            className="bg-[#242426] rounded-[28px] p-5 flex flex-col cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/[0.02] transition-all aspect-[4/4.5] relative group"
          >
            {/* Fine grain noise for matte finish */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-[28px]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start w-full">
                <Box size={38} strokeWidth={1.5} className="text-white ml-1 mt-1" />
                <div className="relative -mr-2 -mt-2">
                  <button 
                    onClick={(e) => handleMenuClick(e, 'parts')}
                    className="text-[#6c6c70] hover:text-white transition-colors p-2 rounded-full"
                  >
                    <MoreHorizontal size={20} strokeWidth={2} />
                  </button>
                  <MenuDropdown isOpen={openMenu === 'parts'} />
                </div>
              </div>
              
              <div className="mt-auto">
                <h2 className="text-white text-[17px] font-medium leading-tight mb-1">Основной</h2>
                <p className="text-[#8e8e93] text-[13px]">{partsCount} записей</p>
              </div>
            </div>
          </motion.div>

          {/* Журнал списаний */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={onOpenOperations}
            className="bg-[#242426] rounded-[28px] p-5 flex flex-col cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/[0.02] transition-all aspect-[4/4.5] relative group"
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-[28px]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start w-full">
                <ClipboardList size={38} strokeWidth={1.5} className="text-white ml-1 mt-1" />
                <div className="relative -mr-2 -mt-2">
                  <button 
                    onClick={(e) => handleMenuClick(e, 'operations')}
                    className="text-[#6c6c70] hover:text-white transition-colors p-2 rounded-full"
                  >
                    <MoreHorizontal size={20} strokeWidth={2} />
                  </button>
                  <MenuDropdown isOpen={openMenu === 'operations'} />
                </div>
              </div>
              
              <div className="mt-auto">
                <h2 className="text-white text-[17px] font-medium leading-tight mb-1">Журнал<br/>списаний</h2>
                <p className="text-[#8e8e93] text-[13px]">{operationsCount} записей</p>
              </div>
            </div>
          </motion.div>

          {/* Финансовый журнал */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={onViewFinance}
            className="bg-[#242426] rounded-[28px] p-5 flex flex-col cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/[0.02] transition-all aspect-[4/4.5] relative group"
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-[28px]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start w-full">
                <Wallet size={38} strokeWidth={1.5} className="text-white ml-1 mt-1" />
                <div className="relative -mr-2 -mt-2">
                  <button className="text-[#6c6c70] hover:text-white transition-colors p-2 rounded-full">
                    <MoreHorizontal size={20} strokeWidth={2} />
                  </button>
                </div>
              </div>
              
              <div className="mt-auto">
                <h2 className="text-white text-[17px] font-medium leading-tight mb-1">Финансовый<br/>журнал</h2>
                <p className="text-[#8e8e93] text-[13px]">Зарплата и аванс</p>
              </div>
            </div>
          </motion.div>

          {/* Журнал смен */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-[#242426] rounded-[28px] p-5 flex flex-col cursor-not-allowed shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/[0.02] transition-all aspect-[4/4.5] relative group"
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-[28px]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            
            <div className="relative z-10 flex flex-col h-full opacity-50">
              <div className="flex justify-between items-start w-full">
                <Users size={38} strokeWidth={1.5} className="text-[#8e8e93] ml-1 mt-1" />
                <div className="relative -mr-2 -mt-2">
                  <button className="text-[#6c6c70] transition-colors p-2 rounded-full cursor-not-allowed">
                    <MoreHorizontal size={20} strokeWidth={2} />
                  </button>
                </div>
              </div>
              
              <div className="mt-auto">
                <h2 className="text-[#8e8e93] text-[17px] font-medium leading-tight mb-1">Журнал<br/>смен</h2>
                <p className="text-[#5c5c60] text-[13px]">1 график</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
