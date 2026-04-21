import { MoreHorizontal, Edit2, Trash2, LayoutGrid, List, Moon, Sun, Download, Upload, FileSpreadsheet, MessageCircle, Package, ClipboardList, Banknote, CalendarDays, RefreshCw, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useRef, useEffect } from 'react';

interface DashboardProps {
  partsCount: number;
  operationsCount: number;
  onOpenParts: () => void;
  onOpenOperations: () => void;
  onViewFinance: () => void;
  onViewShifts: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  onExport: () => void;
  onImport: () => void;
  onExportExcel: () => void;
  onImportExcel: () => void;
  onCsv: () => void;
  onTelegramSettings: () => void;
  onUpdateApp: () => void;
  onClearData: () => void;
}

const NOISE = 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")';

export default function Dashboard({ partsCount, operationsCount, onOpenParts, onOpenOperations, onViewFinance, onViewShifts, isDark, onThemeToggle, onExport, onImport, onExportExcel, onImportExcel, onCsv, onTelegramSettings, onUpdateApp, onClearData }: DashboardProps) {
  const [openMenu, setOpenMenu] = useState<'parts' | 'operations' | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAppMenu, setShowAppMenu] = useState(false);
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
            onClick={(e) => { e.stopPropagation(); setOpenMenu(null); }}
            className="w-full px-4 py-3 flex items-center gap-3 text-left text-white hover:bg-white/5 transition-colors font-medium text-sm"
          >
            <Edit2 size={16} strokeWidth={1.5} />
            <span>Переименовать</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setOpenMenu(null); }}
            className="w-full px-4 py-3 flex items-center gap-3 text-left text-red-400 hover:bg-red-500/10 transition-colors font-medium text-sm border-t border-white/5"
          >
            <Trash2 size={16} strokeWidth={1.5} />
            <span>Удалить</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const cards = [
    {
      key: 'parts' as const,
      icon: <div className="w-[60px] h-[60px] rounded-2xl bg-blue-500/20 flex items-center justify-center"><Package size={30} strokeWidth={1.5} className="text-blue-400" /></div>,
      title: 'Основной',
      sub: `${partsCount} записей`,
      onClick: onOpenParts,
      hasMenu: false,
    },
    {
      key: 'operations' as const,
      icon: <div className="w-[60px] h-[60px] rounded-2xl bg-orange-500/20 flex items-center justify-center"><ClipboardList size={30} strokeWidth={1.5} className="text-orange-400" /></div>,
      title: 'Журнал\nсписаний',
      sub: `${operationsCount} записей`,
      onClick: onOpenOperations,
      hasMenu: false,
    },
    {
      key: 'finance',
      icon: <div className="w-[60px] h-[60px] rounded-2xl bg-green-500/20 flex items-center justify-center"><Banknote size={30} strokeWidth={1.5} className="text-green-400" /></div>,
      title: 'Финансовый\nжурнал',
      sub: 'Зарплата и аванс',
      onClick: onViewFinance,
      hasMenu: false,
    },
    {
      key: 'shifts',
      icon: <div className="w-[60px] h-[60px] rounded-2xl bg-purple-500/20 flex items-center justify-center"><CalendarDays size={30} strokeWidth={1.5} className="text-purple-400" /></div>,
      title: 'Журнал\nсмен',
      sub: 'Мои смены',
      onClick: onViewShifts,
      hasMenu: false,
    },
  ];

  return (
    <div
      className={`relative min-h-[100dvh] flex flex-col ${isDark ? 'bg-[#0A0A0C]' : 'bg-gray-100'}`}
      ref={menuRef}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Background — only in dark mode */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80"
            alt=""
            className="w-full h-full object-cover grayscale opacity-30 contrast-[1.2]"
          />
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-overlay opacity-40 contrast-[1.2]"
          />
          <div className="absolute inset-0 bg-[#0A0A0C]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent" />
        </div>
      )}

      {/* Sticky top bar */}
      <div
        className={`sticky top-0 z-20 ${isDark ? 'bg-[#111113]' : 'bg-primary-600'}`}
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)', paddingBottom: '14px' }}
      >
        <div className="flex items-center justify-between px-5">
          <h1 className="text-white text-[20px] font-semibold tracking-tight">Учёт</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-white/10 p-[3px] rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/50'}`}
              >
                <LayoutGrid size={16} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/50'}`}
              >
                <List size={16} strokeWidth={1.5} />
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowAppMenu(v => !v)}
                className="bg-white/10 text-white p-2 rounded-full transition-colors hover:bg-white/20"
              >
                <MoreHorizontal size={20} strokeWidth={2} />
              </button>
              <AnimatePresence>
                {showAppMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 top-12 w-52 rounded-2xl overflow-hidden z-30 ${isDark ? 'bg-[#1e1e22] shadow-[0_12px_40px_rgba(0,0,0,0.8)] border border-white/[0.08]' : 'bg-white shadow-xl border border-gray-200'}`}
                  >
                    <button
                      onClick={() => { onThemeToggle(); setShowAppMenu(false); }}
                      className={`w-full px-4 py-3.5 flex items-center gap-3 transition-colors text-sm font-medium ${isDark ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-gray-50'}`}
                    >
                      {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
                      <span>{isDark ? 'Светлая тема' : 'Тёмная тема'}</span>
                    </button>
                    <div className={`h-px ${isDark ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
                    <button
                      onClick={() => { onExport(); setShowAppMenu(false); }}
                      className={`w-full px-4 py-3.5 flex items-center gap-3 transition-colors text-sm font-medium ${isDark ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-gray-50'}`}
                    >
                      <Download size={16} strokeWidth={1.5} />
                      <span>Экспорт данных</span>
                    </button>
                    <div className={`h-px ${isDark ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
                    <button
                      onClick={() => { onImport(); setShowAppMenu(false); }}
                      className={`w-full px-4 py-3.5 flex items-center gap-3 transition-colors text-sm font-medium ${isDark ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-gray-50'}`}
                    >
                      <Upload size={16} strokeWidth={1.5} />
                      <span>Импорт данных</span>
                    </button>
                    <div className={`h-px ${isDark ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
                    <button
                      onClick={() => { onExportExcel(); setShowAppMenu(false); }}
                      className={`w-full px-4 py-3.5 flex items-center gap-3 transition-colors text-sm font-medium ${isDark ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-gray-50'}`}
                    >
                      <FileSpreadsheet size={16} strokeWidth={1.5} />
                      <span>Экспорт Excel</span>
                    </button>
                    <div className={`h-px ${isDark ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
                    <button
                      onClick={() => { onImportExcel(); setShowAppMenu(false); }}
                      className={`w-full px-4 py-3.5 flex items-center gap-3 transition-colors text-sm font-medium ${isDark ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-gray-50'}`}
                    >
                      <FileSpreadsheet size={16} strokeWidth={1.5} />
                      <span>Импорт Excel</span>
                    </button>
                    <div className={`h-px ${isDark ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
                    <button
                      onClick={() => { onCsv(); setShowAppMenu(false); }}
                      className={`w-full px-4 py-3.5 flex items-center gap-3 transition-colors text-sm font-medium ${isDark ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-gray-50'}`}
                    >
                      <FileSpreadsheet size={16} strokeWidth={1.5} />
                      <span>CSV</span>
                    </button>
                    <div className={`h-px ${isDark ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
                    <button
                      onClick={() => { onTelegramSettings(); setShowAppMenu(false); }}
                      className={`w-full px-4 py-3.5 flex items-center gap-3 transition-colors text-sm font-medium ${isDark ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-gray-50'}`}
                    >
                      <MessageCircle size={16} strokeWidth={1.5} />
                      <span>Telegram</span>
                    </button>
                    <div className={`h-px ${isDark ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
                    <button
                      onClick={() => { onUpdateApp(); setShowAppMenu(false); }}
                      className={`w-full px-4 py-3.5 flex items-center gap-3 transition-colors text-sm font-medium ${isDark ? 'text-white hover:bg-white/5' : 'text-gray-800 hover:bg-gray-50'}`}
                    >
                      <RefreshCw size={16} strokeWidth={1.5} />
                      <span>Обновить приложение</span>
                    </button>
                    <div className={`h-px ${isDark ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
                    <button
                      onClick={() => { onClearData(); setShowAppMenu(false); }}
                      className="w-full px-4 py-3.5 flex items-center gap-3 text-left text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                    >
                      <Trash size={16} strokeWidth={1.5} />
                      <span>Очистить данные</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="relative z-10 p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {cards.map(card => (
              <motion.div
                key={card.key}
                whileTap={{ scale: 0.97 }}
                onClick={card.onClick}
                className={`rounded-[24px] p-5 flex flex-col cursor-pointer relative aspect-square ${isDark ? 'bg-[#242426] shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/[0.02]' : 'bg-white shadow-md border border-gray-100'}`}
              >
                {isDark && <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-[24px]" style={{ backgroundImage: NOISE }} />}
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start">
                    {card.icon}
                    {card.hasMenu && (
                      <div className="relative -mr-2 -mt-1">
                        <button
                          onClick={(e) => handleMenuClick(e, card.key as 'parts' | 'operations')}
                          className={`transition-colors p-1.5 rounded-full ${isDark ? 'text-[#6c6c70] hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
                        >
                          <MoreHorizontal size={18} strokeWidth={2} />
                        </button>
                        <MenuDropdown isOpen={openMenu === card.key} />
                      </div>
                    )}
                  </div>
                  <div className="mt-auto pt-4">
                    <h2 className={`text-[16px] font-medium leading-tight mb-1 whitespace-pre-line ${isDark ? 'text-white' : 'text-gray-900'}`}>{card.title}</h2>
                    <p className={`text-[12px] ${isDark ? 'text-[#8e8e93]' : 'text-gray-500'}`}>{card.sub}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cards.map(card => (
              <motion.div
                key={card.key}
                whileTap={{ scale: 0.98 }}
                onClick={card.onClick}
                className={`rounded-[20px] px-5 py-4 flex items-center gap-4 cursor-pointer relative ${isDark ? 'bg-[#242426] shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-white/[0.02]' : 'bg-white shadow-md border border-gray-100'}`}
              >
                {isDark && <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-[20px]" style={{ backgroundImage: NOISE }} />}
                <div className="relative z-10 flex items-center gap-4 w-full">
                  <div className="shrink-0">{card.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h2 className={`text-[16px] font-medium leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{card.title.replace('\n', ' ')}</h2>
                    <p className={`text-[12px] mt-0.5 ${isDark ? 'text-[#8e8e93]' : 'text-gray-500'}`}>{card.sub}</p>
                  </div>
                  {card.hasMenu && (
                    <div className="relative shrink-0">
                      <button
                        onClick={(e) => handleMenuClick(e, card.key as 'parts' | 'operations')}
                        className={`transition-colors p-1.5 rounded-full ${isDark ? 'text-[#6c6c70] hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
                      >
                        <MoreHorizontal size={18} strokeWidth={2} />
                      </button>
                      <MenuDropdown isOpen={openMenu === card.key} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
