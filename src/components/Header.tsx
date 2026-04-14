import { ArrowLeft, Search, MoreHorizontal, Plus, Sun, Moon, Edit2, Download, Upload, FileSpreadsheet, MessageCircle, LogIn, LogOut, Cloud, RefreshCw, RefreshCcw, User as UserIcon, ArrowUpDown, Wand2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showSearch?: boolean;
  showMenu?: boolean;
  showAdd?: boolean;
  showEdit?: boolean;
  showSort?: boolean;
  onAdd?: () => void;
  onEdit?: () => void;
  onSearch?: () => void;
  onSort?: () => void;
  onAutoWriteOff?: () => void;
  onThemeToggle?: (newTheme?: string) => void;
  onExport?: () => void;
  onExportExcel?: () => void;
  onImport?: () => void;
  onImportExcel?: () => void;
  onCsvOperations?: () => void;
  onTelegramSettings?: () => void;
  onSyncSettings?: () => void;
  onShowMissingPrices?: () => void;
  isDark?: boolean;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onSync?: () => void;
  onPull?: () => void;
  isSyncing?: boolean;
  lastSync?: string | null;
}

export default function Header({ 
  title, 
  onBack, 
  showSearch = true, 
  showMenu = true,
  showAdd = false,
  showEdit = false,
  showSort = false,
  onAdd,
  onEdit,
  onSearch,
  onSort,
  onAutoWriteOff,
  onThemeToggle,
  onExport,
  onExportExcel,
  onImport,
  onImportExcel,
  onCsvOperations,
  onTelegramSettings,
  onSyncSettings,
  isDark = false,
  user,
  onLogin,
  onLogout,
  onSync,
  onPull,
  isSyncing = false,
  lastSync
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<'export' | 'import' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setActiveSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeToggle = (newTheme?: string) => {
    if (onThemeToggle) {
      onThemeToggle(newTheme);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-card-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button onClick={onBack} className="flex items-center justify-center w-10 h-10 -ml-1 bg-card-bg text-foreground rounded-full hover:bg-muted transition-all active:scale-95 shadow-sm border border-card-border">
            <ArrowLeft size={22} />
          </button>
        )}
        <h1 className="text-xl font-bold text-foreground truncate">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {onAutoWriteOff && (
          <button onClick={onAutoWriteOff} className="flex items-center justify-center w-10 h-10 bg-card-bg text-foreground rounded-full hover:bg-muted transition-all active:scale-95 shadow-sm border border-card-border" title="Авто-списание">
            <Wand2 size={20} />
          </button>
        )}
        {showAdd && (
          <button onClick={onAdd} className="flex items-center justify-center w-10 h-10 bg-card-bg text-foreground rounded-full hover:bg-muted transition-all active:scale-95 shadow-sm border border-card-border">
            <Plus size={22} />
          </button>
        )}
        {showMenu && (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-10 h-10 bg-card-bg text-foreground rounded-full hover:bg-muted transition-all active:scale-95 shadow-sm border border-card-border"
            >
              <MoreHorizontal size={20} />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-card-bg rounded-xl shadow-lg border border-card-border overflow-hidden z-50 py-1">
                {showSearch && (
                  <button 
                    onClick={() => { onSearch?.(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors"
                  >
                    <Search size={20} className="text-muted-foreground" />
                    <span className="text-foreground font-medium">Поиск</span>
                  </button>
                )}
                {showSort && (
                  <button 
                    onClick={() => { onSort?.(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors"
                  >
                    <ArrowUpDown size={20} className="text-muted-foreground" />
                    <span className="text-foreground font-medium">Сортировка</span>
                  </button>
                )}
                {showEdit && (
                  <button 
                    onClick={() => { onEdit?.(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors"
                  >
                    <Edit2 size={20} className="text-muted-foreground" />
                    <span className="text-foreground font-medium">Редактировать</span>
                  </button>
                )}
                
                {onShowMissingPrices && (
                  <button 
                    onClick={() => { onShowMissingPrices(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors"
                  >
                    <Search size={20} className="text-muted-foreground" />
                    <span className="text-foreground font-medium">Без цены</span>
                  </button>
                )}
                
                {(showSearch || showSort || showEdit || onShowMissingPrices) && (
                  <div className="border-t border-card-border my-1"></div>
                )}

                {onSyncSettings && (
                  <button 
                    onClick={() => { onSyncSettings(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors"
                  >
                    <Cloud size={20} className="text-muted-foreground" />
                    <span className="text-foreground font-medium">Синхронизация</span>
                  </button>
                )}
                {onTelegramSettings && (
                  <button 
                    onClick={() => { onTelegramSettings(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors"
                  >
                    <MessageCircle size={20} className="text-muted-foreground" />
                    <span className="text-foreground font-medium">Настройки Telegram</span>
                  </button>
                )}
                {onCsvOperations && (
                  <button 
                    onClick={() => { onCsvOperations(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors"
                  >
                    <FileSpreadsheet size={20} className="text-muted-foreground" />
                    <span className="text-foreground font-medium">Экспорт и импорт в CSV</span>
                  </button>
                )}
                
                <div className="border-t border-card-border my-1"></div>

                {(onExport || onExportExcel) && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveSubmenu(activeSubmenu === 'export' ? null : 'export'); }}
                      className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Download size={20} className="text-muted-foreground" />
                        <span className="text-foreground font-medium">Экспорт</span>
                      </div>
                      <span className="text-gray-400 text-xs">{activeSubmenu === 'export' ? '▲' : '▼'}</span>
                    </button>
                    {activeSubmenu === 'export' && (
                      <div className="bg-muted">
                        {onExportExcel && (
                          <button 
                            onClick={() => { onExportExcel(); setIsMenuOpen(false); setActiveSubmenu(null); }}
                            className="w-full text-left px-8 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          >
                            <FileSpreadsheet size={16} className="text-green-600 dark:text-green-500" />
                            <span className="text-foreground text-sm font-medium">В Excel</span>
                          </button>
                        )}
                        {onExport && (
                          <button 
                            onClick={() => { onExport(); setIsMenuOpen(false); setActiveSubmenu(null); }}
                            className="w-full text-left px-8 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          >
                            <Download size={16} className="text-muted-foreground" />
                            <span className="text-foreground text-sm font-medium">БД (JSON)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}

                {(onImport || onImportExcel) && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveSubmenu(activeSubmenu === 'import' ? null : 'import'); }}
                      className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Upload size={20} className="text-muted-foreground" />
                        <span className="text-foreground font-medium">Импорт</span>
                      </div>
                      <span className="text-gray-400 text-xs">{activeSubmenu === 'import' ? '▲' : '▼'}</span>
                    </button>
                    {activeSubmenu === 'import' && (
                      <div className="bg-muted">
                        {onImportExcel && (
                          <button 
                            onClick={() => { onImportExcel(); setIsMenuOpen(false); setActiveSubmenu(null); }}
                            className="w-full text-left px-8 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          >
                            <FileSpreadsheet size={16} className="text-green-600 dark:text-green-500" />
                            <span className="text-foreground text-sm font-medium">Из Excel</span>
                          </button>
                        )}
                        {onImport && (
                          <button 
                            onClick={() => { onImport(); setIsMenuOpen(false); setActiveSubmenu(null); }}
                            className="w-full text-left px-8 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          >
                            <Upload size={16} className="text-muted-foreground" />
                            <span className="text-foreground text-sm font-medium">БД (JSON)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
                
                <div className="border-t border-card-border my-1"></div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveSubmenu(activeSubmenu === 'theme' ? null : 'theme'); }}
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isDark ? <Moon size={20} className="text-gray-400" /> : <Sun size={20} className="text-muted-foreground" />}
                    <span className="text-foreground font-medium">Тема</span>
                  </div>
                  <span className="text-gray-400 text-xs">{activeSubmenu === 'theme' ? '▲' : '▼'}</span>
                </button>
                {activeSubmenu === 'theme' && (
                  <div className="bg-muted py-2 px-4 grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                    <button onClick={() => { onThemeToggle?.('light'); setIsMenuOpen(false); setActiveSubmenu(null); }} className="px-3 py-2 text-sm font-medium rounded-lg bg-card-bg border border-card-border text-foreground">Светлая тема</button>
                    <button onClick={() => { onThemeToggle?.('mystic'); setIsMenuOpen(false); setActiveSubmenu(null); }} className="px-3 py-2 text-sm font-medium rounded-lg bg-[#2d1b4e] text-[#e6d5b8] border border-[#4a3b69]">Mystic Theme</button>
                    <button onClick={() => { onThemeToggle?.('cyberpunk'); setIsMenuOpen(false); setActiveSubmenu(null); }} className="px-3 py-2 text-sm font-medium rounded-lg bg-[#0a0a0a] text-[#00ffcc] border border-[#ff00ff]">Cyberpunk Theme</button>
                    <button onClick={() => { onThemeToggle?.('nordic'); setIsMenuOpen(false); setActiveSubmenu(null); }} className="px-3 py-2 text-sm font-medium rounded-lg bg-white text-[#2c3e50] border border-[#cbd5e1]">Nordic Theme</button>
                    <button onClick={() => { onThemeToggle?.('sunset'); setIsMenuOpen(false); setActiveSubmenu(null); }} className="px-3 py-2 text-sm font-medium rounded-lg bg-[#5c2a08] text-[#ffd8a8] border border-[#8a3f0c]">Sunset Theme</button>
                    
                    <button onClick={() => { onThemeToggle?.('windows'); setIsMenuOpen(false); setActiveSubmenu(null); }} className="px-3 py-2 text-sm font-medium rounded-lg bg-[#ffffff] text-[#111827] border border-[#d1d5db]">Windows Style</button>
                    <button onClick={() => { onThemeToggle?.('apple'); setIsMenuOpen(false); setActiveSubmenu(null); }} className="px-3 py-2 text-sm font-medium rounded-lg bg-[#2c2c2e] text-[#f2f2f7] border border-[#3a3a3c]">Apple Style</button>
                    <button onClick={() => { onThemeToggle?.('graphite'); setIsMenuOpen(false); setActiveSubmenu(null); }} className="px-3 py-2 text-sm font-medium rounded-lg bg-[#1e1e1e] text-[#e0e0e0] border border-[#333333]">Темный графит (Dark Graphite)</button>
                    <button onClick={() => { onThemeToggle?.('linux'); setIsMenuOpen(false); setActiveSubmenu(null); }} className="px-3 py-2 text-sm font-medium rounded-lg bg-[#3c3f41] text-[#f8f8f2] border border-[#4b4d4f]">Linux Style</button>
                    
                    <button onClick={() => { onThemeToggle?.('classic'); setIsMenuOpen(false); setActiveSubmenu(null); }} className="px-3 py-2 text-sm font-medium rounded-lg bg-[#ffffff] text-[#212529] border border-[#dee2e6]">Светлая классика (Light Classic)</button>
                    <button onClick={() => { onThemeToggle?.('business'); setIsMenuOpen(false); setActiveSubmenu(null); }} className="px-3 py-2 text-sm font-medium rounded-lg bg-[#334155] text-[#f8fafc] border border-[#475569]">Деловой синий (Business Blue)</button>
                    <button onClick={() => { onThemeToggle?.('beige'); setIsMenuOpen(false); setActiveSubmenu(null); }} className="px-3 py-2 text-sm font-medium rounded-lg bg-[#f5f0e6] text-[#4a3f35] border border-[#e6dfd3]">Светло-бежевая (Light Beige)</button>
                    <button onClick={() => { onThemeToggle?.('walnut'); setIsMenuOpen(false); setActiveSubmenu(null); }} className="px-3 py-2 text-sm font-medium rounded-lg bg-[#3d2b1f] text-[#e8dcc7] border border-[#5c4033]">Темный орех</button>
                  </div>
                )}

                <button 
                  onClick={() => {
                    if ('serviceWorker' in navigator) {
                      navigator.serviceWorker.getRegistrations().then((registrations) => {
                        for (const registration of registrations) {
                          registration.unregister();
                        }
                        window.location.reload();
                      });
                    } else {
                      window.location.reload();
                    }
                  }}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-orange-500 dark:text-orange-400"
                >
                  <RefreshCcw size={20} />
                  <span className="font-medium">Обновить приложение</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
