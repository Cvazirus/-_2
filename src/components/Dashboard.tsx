import { Box, ClipboardList, MoreHorizontal, Edit2, Trash2, Wallet, Check, X, Users, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useRef, useEffect } from 'react';
import { Journal } from '../types';
import { XPBox, XPClipboardList, XPWallet, XPMoreHorizontal, XPEdit, XPTrash2, XPCheck, XPX } from './XPIcons';

interface DashboardProps {
  partsCount: number;
  operationsCount: number;
  workersCount: number;
  journals: Journal[];
  onOpenParts: () => void;
  onOpenOperations: () => void;
  onViewFinance: () => void;
  onViewShifts: () => void;
  onRenameJournal: (id: string, newName: string) => void;
  onDeleteJournal: (id: string) => void;
  currentTheme?: string;
}

export default function Dashboard({
  partsCount,
  operationsCount,
  workersCount,
  journals,
  onOpenParts,
  onOpenOperations,
  onViewFinance,
  onViewShifts,
  onRenameJournal,
  onDeleteJournal,
  currentTheme,
}: DashboardProps) {
  const isXP = currentTheme === 'xp-light' || currentTheme === 'xp-dark';
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(() =>
    (localStorage.getItem('dashboard_view_mode') as 'cards' | 'list') ?? 'cards'
  );
  const toggleViewMode = () => {
    const next = viewMode === 'cards' ? 'list' : 'cards';
    setViewMode(next);
    localStorage.setItem('dashboard_view_mode', next);
  };
  const [openMenu, setOpenMenu] = useState<'parts' | 'operations' | null>(null);
  const [renamingCard, setRenamingCard] = useState<'parts' | 'operations' | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    if (renamingCard && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingCard]);

  const journalForCard = (type: 'parts' | 'operations') =>
    journals.find(j => j.type === type) ?? null;

  const handleMenuClick = (e: React.MouseEvent, menu: 'parts' | 'operations') => {
    e.stopPropagation();
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleRename = (e: React.MouseEvent, cardType: 'parts' | 'operations') => {
    e.stopPropagation();
    const journal = journalForCard(cardType);
    if (!journal) return;
    setRenameValue(journal.name);
    setRenamingCard(cardType);
    setOpenMenu(null);
  };

  const commitRename = (cardType: 'parts' | 'operations') => {
    const journal = journalForCard(cardType);
    if (!journal) return;
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== journal.name) {
      onRenameJournal(journal.id, trimmed);
    }
    setRenamingCard(null);
  };

  const handleDelete = (e: React.MouseEvent, cardType: 'parts' | 'operations') => {
    e.stopPropagation();
    setOpenMenu(null);
    const journal = journalForCard(cardType);
    if (!journal) return;
    onDeleteJournal(journal.id);
  };

  const MenuDropdown = ({ isOpen, cardType }: { isOpen: boolean; cardType: 'parts' | 'operations' }) => (
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
            onClick={(e) => handleRename(e, cardType)}
            className="w-full px-4 py-3 flex items-center gap-3 text-left text-foreground hover:bg-primary-50 transition-colors"
          >
            {isXP ? <XPEdit size={16} /> : <Edit2 size={16} />}
            <span className="font-medium">Переименовать</span>
          </button>
          <button
            onClick={(e) => handleDelete(e, cardType)}
            className="w-full px-4 py-3 flex items-center gap-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            {isXP ? <XPTrash2 size={16} /> : <Trash2 size={16} />}
            <span className="font-medium">Удалить</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const cardTitle = (cardType: 'parts' | 'operations', fallback: string) =>
    journalForCard(cardType)?.name ?? fallback;

  const cardItems = [
    {
      key: 'parts' as const,
      icon: isXP ? <XPBox size={40} /> : <Box size={40} strokeWidth={1.5} className="text-primary-600" />,
      iconSm: isXP ? <XPBox size={22} /> : <Box size={22} strokeWidth={1.5} className="text-primary-600" />,
      title: cardTitle('parts', 'Учёт деталей'),
      subtitle: `${partsCount} записей`,
      onClick: renamingCard !== 'parts' ? onOpenParts : undefined,
      hasMenu: true,
      menuType: 'parts' as const,
    },
    {
      key: 'operations' as const,
      icon: isXP ? <XPClipboardList size={40} /> : <ClipboardList size={40} strokeWidth={1.5} className="text-primary-600" />,
      iconSm: isXP ? <XPClipboardList size={22} /> : <ClipboardList size={22} strokeWidth={1.5} className="text-primary-600" />,
      title: cardTitle('operations', 'Журнал списаний'),
      subtitle: `${operationsCount} записей`,
      onClick: renamingCard !== 'operations' ? onOpenOperations : undefined,
      hasMenu: true,
      menuType: 'operations' as const,
    },
    {
      key: 'finance',
      icon: isXP ? <XPWallet size={40} /> : <Wallet size={40} strokeWidth={1.5} className="text-primary-600" />,
      iconSm: isXP ? <XPWallet size={22} /> : <Wallet size={22} strokeWidth={1.5} className="text-primary-600" />,
      title: 'Финансовый журнал',
      subtitle: 'Зарплата и аванс',
      onClick: onViewFinance,
      hasMenu: false,
      menuType: null,
    },
    {
      key: 'shifts',
      icon: <Users size={40} strokeWidth={1.5} className="text-primary-600" />,
      iconSm: <Users size={22} strokeWidth={1.5} className="text-primary-600" />,
      title: 'Журнал смен',
      subtitle: workersCount > 0 ? `${workersCount} график${workersCount === 1 ? '' : 'ов'}` : 'Мои смены',
      onClick: onViewShifts,
      hasMenu: false,
      menuType: null,
    },
  ];

  return (
    <div className="p-4 flex flex-col min-h-[calc(100dvh-80px)]" ref={menuRef}>
      {/* View toggle */}
      <div className="flex justify-end mb-3">
        <div className="flex rounded-xl overflow-hidden border border-card-border bg-card-bg">
          <button
            onClick={() => { setViewMode('cards'); localStorage.setItem('dashboard_view_mode', 'cards'); }}
            className={`p-2 ${viewMode === 'cards' ? 'bg-primary-600 text-white' : 'text-muted-foreground'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => { setViewMode('list'); localStorage.setItem('dashboard_view_mode', 'list'); }}
            className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-muted-foreground'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="space-y-4">
          {cardItems.map(item => (
            <motion.div
              key={item.key}
              whileTap={{ scale: 0.98 }}
              onClick={item.onClick}
              className="bg-card-bg rounded-2xl p-5 flex flex-col cursor-pointer shadow-sm border border-card-border hover:shadow-md transition-all h-48 relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-primary-50 p-4 rounded-2xl">{item.icon}</div>
                {item.hasMenu && item.menuType && (
                  <div className="relative">
                    <button
                      onClick={(e) => handleMenuClick(e, item.menuType!)}
                      className="text-foreground/40 hover:text-foreground/70 transition-colors p-1"
                    >
                      {isXP ? <XPMoreHorizontal size={20} /> : <MoreHorizontal size={20} />}
                    </button>
                    <MenuDropdown isOpen={openMenu === item.menuType} cardType={item.menuType!} />
                  </div>
                )}
              </div>
              <div className="mt-auto">
                {(item.key === 'parts' || item.key === 'operations') && renamingCard === item.key ? (
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <input
                      ref={renameInputRef}
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitRename(item.key as 'parts' | 'operations');
                        if (e.key === 'Escape') setRenamingCard(null);
                      }}
                      className="flex-1 bg-transparent border-b border-primary-400 outline-none text-foreground text-xl font-semibold"
                    />
                    <button onClick={() => commitRename(item.key as 'parts' | 'operations')} className="text-green-500">
                      {isXP ? <XPCheck size={18} /> : <Check size={18} />}
                    </button>
                    <button onClick={() => setRenamingCard(null)} className="text-foreground/40">
                      {isXP ? <XPX size={18} /> : <X size={18} />}
                    </button>
                  </div>
                ) : (
                  <h2 className="text-foreground text-xl font-semibold">{item.title}</h2>
                )}
                <p className="text-foreground/60 text-sm font-medium mt-1">{item.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {cardItems.map(item => (
            <motion.div
              key={item.key}
              whileTap={{ scale: 0.98 }}
              onClick={item.onClick}
              className="bg-card-bg rounded-2xl px-4 py-3.5 flex items-center gap-4 cursor-pointer border border-card-border active:bg-muted/50 transition-colors relative"
            >
              <div className="bg-primary-50 w-11 h-11 flex items-center justify-center rounded-xl shrink-0">
                {item.iconSm}
              </div>
              <div className="flex-1 min-w-0">
                {(item.key === 'parts' || item.key === 'operations') && renamingCard === item.key ? (
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <input
                      ref={renameInputRef}
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitRename(item.key as 'parts' | 'operations');
                        if (e.key === 'Escape') setRenamingCard(null);
                      }}
                      className="flex-1 bg-transparent border-b border-primary-400 outline-none text-foreground font-semibold"
                    />
                    <button onClick={() => commitRename(item.key as 'parts' | 'operations')} className="text-green-500">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setRenamingCard(null)} className="text-foreground/40">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="font-semibold text-foreground">{item.title}</div>
                )}
                <div className="text-sm text-muted-foreground">{item.subtitle}</div>
              </div>
              {item.hasMenu && item.menuType && (
                <div className="relative shrink-0">
                  <button
                    onClick={(e) => handleMenuClick(e, item.menuType!)}
                    className="text-foreground/40 p-1"
                  >
                    {isXP ? <XPMoreHorizontal size={18} /> : <MoreHorizontal size={18} />}
                  </button>
                  <MenuDropdown isOpen={openMenu === item.menuType} cardType={item.menuType!} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
