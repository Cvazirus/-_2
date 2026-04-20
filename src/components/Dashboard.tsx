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
          className="absolute right-0 top-10 w-48 bg-white/10 backdrop-blur-3xl rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden z-20"
        >
          {/* Noise inside dropdown */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
          
          <button 
            onClick={handleRename}
            className="w-full px-4 py-3 flex items-center gap-3 text-left text-white hover:bg-white/10 transition-colors relative z-10 font-light"
          >
            <Edit2 size={16} strokeWidth={1.5} />
            <span>Переименовать</span>
          </button>
          <button 
            onClick={handleDelete}
            className="w-full px-4 py-3 flex items-center gap-3 text-left text-red-300 hover:bg-red-500/20 transition-colors relative z-10 font-light border-t border-white/10"
          >
            <Trash2 size={16} strokeWidth={1.5} />
            <span>Удалить</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative min-h-[calc(100dvh-80px)] overflow-hidden bg-black" ref={menuRef}>
      {/* Background with macro details image and dark overlay */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img 
          src="https://images.unsplash.com/photo-1628126235206-5260b9ea6441?auto=format&fit=crop&w=1000&q=80" 
          alt="Macro mechanics" 
          className="w-full h-full object-cover mix-blend-luminosity opacity-40 md:opacity-50 blur-[2px]"
        />
        {/* Fine Noise Texture over everything */}
        <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        {/* Soft edge gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
      </div>

      <div className="relative z-10 p-4 w-full max-w-lg mx-auto pt-6">
        {/* Toggle Grid/List matching the Ice screenshot top right corner */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-0.5 bg-white/[0.08] backdrop-blur-md p-[3px] rounded-[14px] border border-white/[0.15] shadow-[0_4px_12px_rgba(0,0,0,0.2)] relative overflow-hidden">
             {/* Micro-texture noise inside toggle */}
             <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            
            <button className="relative z-10 bg-white/[0.15] text-white p-1.5 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-md">
              <LayoutGrid size={18} strokeWidth={1.5} />
            </button>
            <button className="relative z-10 text-white/40 p-1.5 rounded-xl transition-colors hover:text-white/90">
              <List size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 content-start">
          {/* Учёт (Основной) */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={onOpenParts}
            className="bg-white/[0.08] backdrop-blur-2xl rounded-[32px] p-6 flex flex-col cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.4)] border border-white/[0.15] transition-all aspect-square relative overflow-hidden group"
          >
            {/* Ice Texture Noise overlay */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%221.5%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6 w-full">
                {/* Floating Icon without dark bounding box */}
                <Box size={44} strokeWidth={1} className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
                <div className="relative -mr-3 -mt-3">
                  <button 
                    onClick={(e) => handleMenuClick(e, 'parts')}
                    className="text-white/50 hover:text-white transition-colors p-2 rounded-full drop-shadow-md"
                  >
                    <MoreHorizontal size={22} strokeWidth={1.5} />
                  </button>
                  <MenuDropdown isOpen={openMenu === 'parts'} />
                </div>
              </div>
              
              <div className="mt-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                <h2 className="text-white text-[17px] font-medium leading-tight mb-1 tracking-wide">Основной</h2>
                <p className="text-white/60 text-[13px] font-light">{partsCount} записей</p>
              </div>
            </div>
          </motion.div>

          {/* Журнал списаний */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={onOpenOperations}
            className="bg-white/[0.08] backdrop-blur-2xl rounded-[32px] p-6 flex flex-col cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.4)] border border-white/[0.15] transition-all aspect-square relative overflow-hidden group"
          >
            {/* Ice Texture Noise overlay */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%221.5%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6 w-full">
                {/* Floating Icon without dark bounding box */}
                <ClipboardList size={44} strokeWidth={1} className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
                <div className="relative -mr-3 -mt-3">
                  <button 
                    onClick={(e) => handleMenuClick(e, 'operations')}
                    className="text-white/50 hover:text-white transition-colors p-2 rounded-full drop-shadow-md"
                  >
                    <MoreHorizontal size={22} strokeWidth={1.5} />
                  </button>
                  <MenuDropdown isOpen={openMenu === 'operations'} />
                </div>
              </div>
              
              <div className="mt-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                <h2 className="text-white text-[17px] font-medium leading-tight mb-1 tracking-wide">Журнал списаний</h2>
                <p className="text-white/60 text-[13px] font-light">{operationsCount} записей</p>
              </div>
            </div>
          </motion.div>

          {/* Финансовый журнал */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={onViewFinance}
            className="bg-white/[0.08] backdrop-blur-2xl rounded-[32px] p-6 flex flex-col cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.4)] border border-white/[0.15] transition-all aspect-square relative overflow-hidden group"
          >
            {/* Ice Texture Noise overlay */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%221.5%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6 w-full">
                {/* Floating Icon without dark bounding box */}
                <Wallet size={44} strokeWidth={1} className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
                <div className="relative -mr-3 -mt-3">
                  <button className="text-white/50 hover:text-white transition-colors p-2 rounded-full drop-shadow-md">
                    <MoreHorizontal size={22} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              
              <div className="mt-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                <h2 className="text-white text-[17px] font-medium leading-tight mb-1 tracking-wide">Финансовый журнал</h2>
                <p className="text-white/60 text-[13px] font-light">Зарплата и аванс</p>
              </div>
            </div>
          </motion.div>

          {/* Журнал смен */}
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="bg-white/[0.04] backdrop-blur-xl rounded-[32px] p-6 flex flex-col cursor-not-allowed shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.15)] border border-white/[0.05] transition-all aspect-square relative overflow-hidden group opacity-70"
          >
            {/* Ice Texture Noise overlay */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%221.5%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6 w-full">
                {/* Floating Icon without dark bounding box */}
                <Users size={44} strokeWidth={1} className="text-white/60 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
                <div className="relative -mr-3 -mt-3">
                  <button className="text-white/20 transition-colors p-2 rounded-full cursor-not-allowed">
                    <MoreHorizontal size={22} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              
              <div className="mt-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                <h2 className="text-white/80 text-[17px] font-medium leading-tight mb-1 tracking-wide">Журнал смен</h2>
                <p className="text-white/40 text-[13px] font-light">1 график</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
