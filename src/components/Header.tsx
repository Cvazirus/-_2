import { ArrowLeft, Search, MoreHorizontal, Plus, Sun, Moon, Edit2, Download, Upload, FileSpreadsheet, MessageCircle, Cloud, RefreshCcw, ArrowUpDown, Wand2, Database, ChevronRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
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
  onShowMissingPrices,
  isDark = false,
  fontSize = 1,
  onFontSizeChange,
  user,
  onLogin,
  onLogout,
  onSync,
  onPull,
  isSyncing = false,
  lastSync,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<'data' | 'theme' | null>(null);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const closeMenu = () => { setIsMenuOpen(false); setActiveSubmenu(null); };

  const MenuItem = ({ icon, label, onClick, className = '' }: { icon: React.ReactNode; label: string; onClick: () => void; className?: string }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-3.5 flex items-center gap-4 hover:bg-muted active:bg-muted transition-colors ${className}`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="font-medium text-base">{label}</span>
    </button>
  );

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
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center justify-center w-10 h-10 bg-card-bg text-foreground rounded-full hover:bg-muted transition-all active:scale-95 shadow-sm border border-card-border"
          >
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>

      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeMenu}
          />

          {/* Side panel */}
          <div className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-xs bg-card-bg z-50 flex flex-col shadow-2xl">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-card-border shrink-0">
              <span className="text-xl font-bold text-foreground">Меню</span>
              <button
                onClick={closeMenu}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-background border border-card-border text-foreground active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">

              {/* Context actions */}
              {(showSearch || showSort || showEdit || onShowMissingPrices) && (
                <>
                  <div className="pt-2">
                    {showSearch && (
                      <MenuItem icon={<Search size={20} className="text-muted-foreground" />} label="Поиск" onClick={() => { onSearch?.(); closeMenu(); }} />
                    )}
                    {showSort && (
                      <MenuItem icon={<ArrowUpDown size={20} className="text-muted-foreground" />} label="Сортировка" onClick={() => { onSort?.(); closeMenu(); }} />
                    )}
                    {showEdit && (
                      <MenuItem icon={<Edit2 size={20} className="text-muted-foreground" />} label="Редактировать" onClick={() => { onEdit?.(); closeMenu(); }} />
                    )}
                    {onShowMissingPrices && (
                      <MenuItem icon={<Search size={20} className="text-muted-foreground" />} label="Без цены" onClick={() => { onShowMissingPrices(); closeMenu(); }} />
                    )}
                  </div>
                  <div className="border-t border-card-border my-2" />
                </>
              )}

              {/* Data submenu */}
              {(onSyncSettings || onTelegramSettings || onCsvOperations || onExport || onExportExcel || onImport || onImportExcel) && (
                <>
                  <button
                    onClick={() => setActiveSubmenu(activeSubmenu === 'data' ? null : 'data')}
                    className="w-full text-left px-5 py-3.5 flex items-center justify-between hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Database size={20} className="text-muted-foreground shrink-0" />
                      <span className="font-medium text-base text-foreground">Данные</span>
                    </div>
                    <ChevronRight size={18} className={`text-muted-foreground transition-transform ${activeSubmenu === 'data' ? 'rotate-90' : ''}`} />
                  </button>
                  {activeSubmenu === 'data' && (
                    <div className="bg-muted border-t border-b border-card-border">
                      {onSyncSettings && (
                        <button onClick={() => { onSyncSettings(); closeMenu(); }} className="w-full text-left px-7 py-3 flex items-center gap-3 hover:bg-card-bg transition-colors">
                          <Cloud size={17} className="text-muted-foreground shrink-0" />
                          <span className="text-foreground text-sm font-medium">Синхронизация</span>
                        </button>
                      )}
                      {onTelegramSettings && (
                        <button onClick={() => { onTelegramSettings(); closeMenu(); }} className="w-full text-left px-7 py-3 flex items-center gap-3 hover:bg-card-bg transition-colors">
                          <MessageCircle size={17} className="text-muted-foreground shrink-0" />
                          <span className="text-foreground text-sm font-medium">Telegram</span>
                        </button>
                      )}
                      {(onSyncSettings || onTelegramSettings) && (onExportExcel || onExport || onImportExcel || onImport || onCsvOperations) && (
                        <div className="border-t border-card-border mx-5 my-1" />
                      )}
                      {onExportExcel && (
                        <button onClick={() => { onExportExcel(); closeMenu(); }} className="w-full text-left px-7 py-3 flex items-center gap-3 hover:bg-card-bg transition-colors">
                          <FileSpreadsheet size={17} className="text-green-600 dark:text-green-400 shrink-0" />
                          <span className="text-foreground text-sm font-medium">Экспорт в Excel</span>
                        </button>
                      )}
                      {onExport && (
                        <button onClick={() => { onExport(); closeMenu(); }} className="w-full text-left px-7 py-3 flex items-center gap-3 hover:bg-card-bg transition-colors">
                          <Download size={17} className="text-muted-foreground shrink-0" />
                          <span className="text-foreground text-sm font-medium">Экспорт БД (JSON)</span>
                        </button>
                      )}
                      {onImportExcel && (
                        <button onClick={() => { onImportExcel(); closeMenu(); }} className="w-full text-left px-7 py-3 flex items-center gap-3 hover:bg-card-bg transition-colors">
                          <FileSpreadsheet size={17} className="text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="text-foreground text-sm font-medium">Импорт из Excel</span>
                        </button>
                      )}
                      {onImport && (
                        <button onClick={() => { onImport(); closeMenu(); }} className="w-full text-left px-7 py-3 flex items-center gap-3 hover:bg-card-bg transition-colors">
                          <Upload size={17} className="text-muted-foreground shrink-0" />
                          <span className="text-foreground text-sm font-medium">Импорт БД (JSON)</span>
                        </button>
                      )}
                      {onCsvOperations && (
                        <button onClick={() => { onCsvOperations(); closeMenu(); }} className="w-full text-left px-7 py-3 flex items-center gap-3 hover:bg-card-bg transition-colors">
                          <FileSpreadsheet size={17} className="text-muted-foreground shrink-0" />
                          <span className="text-foreground text-sm font-medium">CSV операций</span>
                        </button>
                      )}
                    </div>
                  )}
                  <div className="border-t border-card-border my-2" />
                </>
              )}

              {/* Theme + Font size submenu */}
              <button
                onClick={() => setActiveSubmenu(activeSubmenu === 'theme' ? null : 'theme')}
                className="w-full text-left px-5 py-3.5 flex items-center justify-between hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  {isDark ? <Moon size={20} className="text-muted-foreground shrink-0" /> : <Sun size={20} className="text-muted-foreground shrink-0" />}
                  <span className="font-medium text-base text-foreground">Тема и шрифт</span>
                </div>
                <ChevronRight size={18} className={`text-muted-foreground transition-transform ${activeSubmenu === 'theme' ? 'rotate-90' : ''}`} />
              </button>
              {activeSubmenu === 'theme' && (
                <div className="bg-muted border-t border-b border-card-border">
                  {/* Theme buttons */}
                  <div className="px-4 py-3 grid grid-cols-1 gap-2">
                    <button onClick={() => { onThemeToggle?.('light'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg bg-card-bg border border-card-border text-foreground text-left">☀️ Светлая тема</button>
                    <button onClick={() => { onThemeToggle?.('mystic'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg bg-[#2d1b4e] text-[#e6d5b8] border border-[#4a3b69] text-left">🔮 Mystic</button>
                    <button onClick={() => { onThemeToggle?.('cyberpunk'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg bg-[#0a0a0a] text-[#00ffcc] border border-[#ff00ff] text-left">⚡ Cyberpunk</button>
                    <button onClick={() => { onThemeToggle?.('nordic'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg bg-white text-[#2c3e50] border border-[#cbd5e1] text-left">🏔 Nordic</button>
                    <button onClick={() => { onThemeToggle?.('sunset'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg bg-[#5c2a08] text-[#ffd8a8] border border-[#8a3f0c] text-left">🌅 Sunset</button>
                    <button onClick={() => { onThemeToggle?.('windows'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg bg-white text-[#111827] border border-[#d1d5db] text-left">🪟 Windows Style</button>
                    <button onClick={() => { onThemeToggle?.('apple'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg bg-[#2c2c2e] text-[#f2f2f7] border border-[#3a3a3c] text-left"> Apple Style</button>
                    <button onClick={() => { onThemeToggle?.('graphite'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg bg-[#1e1e1e] text-[#e0e0e0] border border-[#333333] text-left">🪨 Тёмный графит</button>
                    <button onClick={() => { onThemeToggle?.('linux'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg bg-[#3c3f41] text-[#f8f8f2] border border-[#4b4d4f] text-left">🐧 Linux</button>
                    <button onClick={() => { onThemeToggle?.('classic'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg bg-white text-[#212529] border border-[#dee2e6] text-left">📄 Классика</button>
                    <button onClick={() => { onThemeToggle?.('business'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg bg-[#334155] text-[#f8fafc] border border-[#475569] text-left">💼 Деловой синий</button>
                    <button onClick={() => { onThemeToggle?.('beige'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg bg-[#f5f0e6] text-[#4a3f35] border border-[#e6dfd3] text-left">🌾 Бежевая</button>
                    <button onClick={() => { onThemeToggle?.('walnut'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg bg-[#3d2b1f] text-[#e8dcc7] border border-[#5c4033] text-left">🌰 Тёмный орех</button>
                    <button onClick={() => { onThemeToggle?.('xp-light'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium border border-[#9c9a94] text-left" style={{background:'#ece9d8',color:'#000',fontFamily:'Tahoma,sans-serif',borderRadius:3}}>🪟 Windows XP</button>
                    <button onClick={() => { onThemeToggle?.('xp-dark'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium border border-[#3d4358] text-left" style={{background:'#1c1f2b',color:'#d4d0c8',fontFamily:'Tahoma,sans-serif',borderRadius:3}}>🪟 Windows XP Dark</button>
                  </div>

                  {/* Font size slider */}
                  <div className="px-5 pt-1 pb-4 border-t border-card-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Размер шрифта</span>
                      <span className="text-sm font-bold text-primary-500">{Math.round(fontSize * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground select-none">А</span>
                      <input
                        type="range"
                        min="0.75"
                        max="2.0"
                        step="0.05"
                        value={fontSize}
                        onChange={(e) => onFontSizeChange?.(parseFloat(e.target.value))}
                        className="flex-1 h-2 cursor-pointer accent-primary-500"
                      />
                      <span className="text-xl text-muted-foreground select-none leading-none">А</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-card-border my-2" />

              {/* Refresh app */}
              <button
                onClick={() => {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then((registrations) => {
                      for (const registration of registrations) registration.unregister();
                      window.location.reload();
                    });
                  } else {
                    window.location.reload();
                  }
                }}
                className="w-full text-left px-5 py-3.5 flex items-center gap-4 hover:bg-muted transition-colors text-orange-500 dark:text-orange-400"
              >
                <RefreshCcw size={20} className="shrink-0" />
                <span className="font-medium text-base">Обновить приложение</span>
              </button>

              <div className="h-6" />
            </div>
          </div>
        </>
      )}
    </header>
  );
}
