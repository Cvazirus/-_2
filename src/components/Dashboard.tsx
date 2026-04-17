import { Box, ClipboardList, MoreHorizontal, Edit2, Trash2, Wallet, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useRef, useEffect } from 'react';
import { Journal } from '../types';
import { XPBox, XPClipboardList, XPWallet, XPMoreHorizontal, XPEdit, XPTrash2, XPCheck, XPX } from './XPIcons';

interface DashboardProps {
  partsCount: number;
  operationsCount: number;
  journals: Journal[];
  onOpenParts: () => void;
  onOpenOperations: () => void;
  onViewFinance: () => void;
  onRenameJournal: (id: string, newName: string) => void;
  onDeleteJournal: (id: string) => void;
  currentTheme?: string;
}

export default function Dashboard({
  partsCount,
  operationsCount,
  journals,
  onOpenParts,
  onOpenOperations,
  onViewFinance,
  onRenameJournal,
  onDeleteJournal,
  currentTheme,
}: DashboardProps) {
  const isXP = currentTheme === 'xp-light' || currentTheme === 'xp-dark';
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

  return (
    <div className="p-4 space-y-4 flex flex-col min-h-[calc(100dvh-80px)]" ref={menuRef}>
      {/* Parts card */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={renamingCard !== 'parts' ? onOpenParts : undefined}
        className="bg-card-bg rounded-2xl p-5 flex flex-col cursor-pointer shadow-sm border border-card-border hover:shadow-md transition-all h-48 relative"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="bg-primary-50 p-4 rounded-2xl">
            {isXP ? <XPBox size={40} /> : <Box size={40} strokeWidth={1.5} className="text-primary-600" />}
          </div>
          <div className="relative">
            <button
              onClick={(e) => handleMenuClick(e, 'parts')}
              className="text-foreground/40 hover:text-foreground/70 transition-colors p-1"
            >
              {isXP ? <XPMoreHorizontal size={20} /> : <MoreHorizontal size={20} />}
            </button>
            <MenuDropdown isOpen={openMenu === 'parts'} cardType="parts" />
          </div>
        </div>

        <div className="mt-auto">
          {renamingCard === 'parts' ? (
            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitRename('parts');
                  if (e.key === 'Escape') setRenamingCard(null);
                }}
                className="flex-1 bg-transparent border-b border-primary-400 outline-none text-foreground text-xl font-semibold"
              />
              <button onClick={() => commitRename('parts')} className="text-green-500">
                {isXP ? <XPCheck size={18} /> : <Check size={18} />}
              </button>
              <button onClick={() => setRenamingCard(null)} className="text-foreground/40">
                {isXP ? <XPX size={18} /> : <X size={18} />}
              </button>
            </div>
          ) : (
            <h2 className="text-foreground text-xl font-semibold">{cardTitle('parts', 'Учёт деталей')}</h2>
          )}
          <p className="text-foreground/60 text-sm font-medium mt-1">{partsCount} записей</p>
        </div>
      </motion.div>

      {/* Operations card */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={renamingCard !== 'operations' ? onOpenOperations : undefined}
        className="bg-card-bg rounded-2xl p-5 flex flex-col cursor-pointer shadow-sm border border-card-border hover:shadow-md transition-all h-48 relative"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="bg-primary-50 p-4 rounded-2xl">
            {isXP ? <XPClipboardList size={40} /> : <ClipboardList size={40} strokeWidth={1.5} className="text-primary-600" />}
          </div>
          <div className="relative">
            <button
              onClick={(e) => handleMenuClick(e, 'operations')}
              className="text-foreground/40 hover:text-foreground/70 transition-colors p-1"
            >
              {isXP ? <XPMoreHorizontal size={20} /> : <MoreHorizontal size={20} />}
            </button>
            <MenuDropdown isOpen={openMenu === 'operations'} cardType="operations" />
          </div>
        </div>

        <div className="mt-auto">
          {renamingCard === 'operations' ? (
            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitRename('operations');
                  if (e.key === 'Escape') setRenamingCard(null);
                }}
                className="flex-1 bg-transparent border-b border-primary-400 outline-none text-foreground text-xl font-semibold"
              />
              <button onClick={() => commitRename('operations')} className="text-green-500">
                {isXP ? <XPCheck size={18} /> : <Check size={18} />}
              </button>
              <button onClick={() => setRenamingCard(null)} className="text-foreground/40">
                {isXP ? <XPX size={18} /> : <X size={18} />}
              </button>
            </div>
          ) : (
            <h2 className="text-foreground text-xl font-semibold">{cardTitle('operations', 'Журнал списаний')}</h2>
          )}
          <p className="text-foreground/60 text-sm font-medium mt-1">{operationsCount} записи</p>
        </div>
      </motion.div>

      {/* Finance card */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onViewFinance}
        className="bg-card-bg rounded-2xl p-5 flex flex-col cursor-pointer shadow-sm border border-card-border hover:shadow-md transition-all h-48 relative"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="bg-primary-50 p-4 rounded-2xl">
            {isXP ? <XPWallet size={40} /> : <Wallet size={40} strokeWidth={1.5} className="text-primary-600" />}
          </div>
        </div>

        <div className="mt-auto">
          <h2 className="text-foreground text-xl font-semibold">Финансовый журнал</h2>
          <p className="text-foreground/60 text-sm font-medium mt-1">Зарплата и аванс</p>
        </div>
      </motion.div>
    </div>
  );
}
