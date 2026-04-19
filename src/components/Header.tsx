import { ArrowLeft, Search, MoreHorizontal, Plus, Sun, Moon, Edit2, Download, Upload,
         FileSpreadsheet, MessageCircle, Cloud, RefreshCcw, ArrowUpDown, Wand2,
         Database, ChevronRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User } from 'firebase/auth';
import {
  XPArrowLeft, XPPlus, XPSearch, XPMoreHorizontal, XPEdit, XPArrowUpDown, XPWand,
  XPX, XPDatabase, XPCloud, XPFileSpreadsheet, XPDownload, XPUpload, XPMessageCircle,
  XPSun, XPMoon, XPRefreshCcw, XPChevronRight,
} from './XPIcons';

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
  currentTheme?: string;
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
  currentTheme = 'light',
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

  const isXP = currentTheme === 'xp-light' || currentTheme === 'xp-dark';

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const closeMenu = () => { setIsMenuOpen(false); setActiveSubmenu(null); };

  // Picks XP or Lucide icon based on active theme
  function Ic({ xp, fallback, size }: { xp: React.ReactNode; fallback: React.ReactNode; size?: number }) {
    return <>{isXP ? xp : fallback}</>;
  }

  const MenuItem = ({
    icon, xpIcon, label, onClick, className = '',
  }: { icon: React.ReactNode; xpIcon?: React.ReactNode; label: string; onClick: () => void; className?: string }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-3.5 flex items-center gap-4 hover:bg-muted active:bg-muted transition-colors ${className}`}
    >
      <span className="shrink-0">{isXP && xpIcon ? xpIcon : icon}</span>
      <span className="font-medium text-base">{label}</span>
    </button>
  );

  // XP panel uses Tahoma font and boxy borders
  const panelClass = isXP
    ? 'fixed top-0 right-0 bottom-0 w-[85vw] max-w-xs z-50 flex flex-col shadow-2xl overflow-hidden'
    : 'fixed top-0 right-0 bottom-0 w-[85vw] max-w-xs bg-card-bg z-50 flex flex-col shadow-2xl';

  const panelStyle = isXP
    ? {
        background: currentTheme === 'xp-light' ? '#ece9d8' : '#1c1f2b',
        color: currentTheme === 'xp-light' ? '#000' : '#d4d0c8',
        fontFamily: 'Tahoma, "MS Sans Serif", Arial, sans-serif',
        borderLeft: currentTheme === 'xp-light'
          ? '2px solid #9c9a94'
          : '2px solid #3d4358',
      }
    : {};

  const xpHeaderStyle = isXP
    ? {
        background: currentTheme === 'xp-light'
          ? 'linear-gradient(to bottom, #1f6dd0 0%, #0a246a 35%, #1060c0 65%, #2e7fd6 100%)'
          : 'linear-gradient(to bottom, #2d3d6c 0%, #1a2545 35%, #243060 65%, #2d3d6c 100%)',
        color: '#fff',
        borderBottom: currentTheme === 'xp-light' ? '2px solid #003c74' : '2px solid #0d1530',
        padding: '6px 12px',
      }
    : {};

  const xpItemStyle = isXP
    ? { fontFamily: 'Tahoma, Arial, sans-serif', fontSize: '13px' }
    : {};

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-card-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 -ml-1 bg-card-bg text-foreground rounded-full hover:bg-muted transition-all active:scale-95 shadow-sm border border-card-border"
          >
            {isXP ? <XPArrowLeft size={22} /> : <ArrowLeft size={22} />}
          </button>
        )}
        <h1 className="text-xl font-bold text-foreground truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {onAutoWriteOff && (
          <button
            onClick={onAutoWriteOff}
            className="flex items-center justify-center w-10 h-10 bg-card-bg text-foreground rounded-full hover:bg-muted transition-all active:scale-95 shadow-sm border border-card-border"
            title="Авто-списание"
          >
            {isXP ? <XPWand size={20} /> : <Wand2 size={20} />}
          </button>
        )}
        {showSearch && (
          <button
            onClick={onSearch}
            className="flex items-center justify-center w-10 h-10 bg-card-bg text-foreground rounded-full hover:bg-muted transition-all active:scale-95 shadow-sm border border-card-border"
          >
            {isXP ? <XPSearch size={20} /> : <Search size={20} />}
          </button>
        )}
        {showMenu && (
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center justify-center w-10 h-10 bg-card-bg text-foreground rounded-full hover:bg-muted transition-all active:scale-95 shadow-sm border border-card-border"
          >
            {isXP ? <XPMoreHorizontal size={20} /> : <MoreHorizontal size={20} />}
          </button>
        )}
      </div>

      {isMenuOpen && createPortal(
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeMenu} />

          {/* Side panel */}
          <div className={panelClass} style={panelStyle}>

            {/* Panel header */}
            <div
              className="flex items-center justify-between shrink-0"
              style={isXP ? xpHeaderStyle : { padding: '16px 20px', borderBottom: '1px solid var(--card-border)' }}
            >
              <span className={isXP ? 'font-bold text-white text-sm' : 'text-xl font-bold text-foreground'}>
                {isXP ? '📁 Меню' : 'Меню'}
              </span>
              <button
                onClick={closeMenu}
                className={isXP
                  ? 'flex items-center justify-center w-7 h-7 font-bold text-white active:opacity-70'
                  : 'w-9 h-9 flex items-center justify-center rounded-full bg-background border border-card-border text-foreground active:scale-95'}
                style={isXP
                  ? { background: 'linear-gradient(to bottom,#e8453c,#a81010)', border: '1px outset #ff8888', borderRadius: 3 }
                  : {}}
              >
                {isXP ? <XPX size={16} /> : <X size={20} />}
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">

              {/* Context actions */}
              {(showSearch || showSort || showEdit || onShowMissingPrices) && (
                <>
                  <div className="pt-2">
                    {showSearch && (
                      <MenuItem
                        icon={<Search size={20} className="text-muted-foreground" />}
                        xpIcon={<XPSearch size={20} />}
                        label="Поиск"
                        onClick={() => { onSearch?.(); closeMenu(); }}
                      />
                    )}
                    {showSort && (
                      <MenuItem
                        icon={<ArrowUpDown size={20} className="text-muted-foreground" />}
                        xpIcon={<XPArrowUpDown size={20} />}
                        label="Сортировка"
                        onClick={() => { onSort?.(); closeMenu(); }}
                      />
                    )}
                    {showEdit && (
                      <MenuItem
                        icon={<Edit2 size={20} className="text-muted-foreground" />}
                        xpIcon={<XPEdit size={20} />}
                        label="Редактировать"
                        onClick={() => { onEdit?.(); closeMenu(); }}
                      />
                    )}
                    {onShowMissingPrices && (
                      <MenuItem
                        icon={<Search size={20} className="text-muted-foreground" />}
                        xpIcon={<XPSearch size={20} />}
                        label="Без цены"
                        onClick={() => { onShowMissingPrices(); closeMenu(); }}
                      />
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
                    style={xpItemStyle}
                  >
                    <div className="flex items-center gap-4">
                      {isXP ? <XPDatabase size={20} /> : <Database size={20} className="text-muted-foreground shrink-0" />}
                      <span className="font-medium text-base text-foreground">Данные</span>
                    </div>
                    {isXP
                      ? <XPChevronRight size={18} />
                      : <ChevronRight size={18} className={`text-muted-foreground transition-transform ${activeSubmenu === 'data' ? 'rotate-90' : ''}`} />}
                  </button>

                  {activeSubmenu === 'data' && (
                    <div className="bg-muted border-t border-b border-card-border">
                      {onSyncSettings && (
                        <button onClick={() => { onSyncSettings(); closeMenu(); }} className="w-full text-left px-7 py-3 flex items-center gap-3 hover:bg-card-bg transition-colors" style={xpItemStyle}>
                          {isXP ? <XPCloud size={17} /> : <Cloud size={17} className="text-muted-foreground shrink-0" />}
                          <span className="text-foreground text-sm font-medium">Синхронизация</span>
                        </button>
                      )}
                      {onTelegramSettings && (
                        <button onClick={() => { onTelegramSettings(); closeMenu(); }} className="w-full text-left px-7 py-3 flex items-center gap-3 hover:bg-card-bg transition-colors" style={xpItemStyle}>
                          {isXP ? <XPMessageCircle size={17} /> : <MessageCircle size={17} className="text-muted-foreground shrink-0" />}
                          <span className="text-foreground text-sm font-medium">Telegram</span>
                        </button>
                      )}
                      {(onSyncSettings || onTelegramSettings) && (onExportExcel || onExport || onImportExcel || onImport || onCsvOperations) && (
                        <div className="border-t border-card-border mx-5 my-1" />
                      )}
                      {onExportExcel && (
                        <button onClick={() => { onExportExcel(); closeMenu(); }} className="w-full text-left px-7 py-3 flex items-center gap-3 hover:bg-card-bg transition-colors" style={xpItemStyle}>
                          {isXP ? <XPFileSpreadsheet size={17} accent="#22aa22" /> : <FileSpreadsheet size={17} className="text-green-600 dark:text-green-400 shrink-0" />}
                          <span className="text-foreground text-sm font-medium">Экспорт в Excel</span>
                        </button>
                      )}
                      {onExport && (
                        <button onClick={() => { onExport(); closeMenu(); }} className="w-full text-left px-7 py-3 flex items-center gap-3 hover:bg-card-bg transition-colors" style={xpItemStyle}>
                          {isXP ? <XPDownload size={17} /> : <Download size={17} className="text-muted-foreground shrink-0" />}
                          <span className="text-foreground text-sm font-medium">Экспорт БД (JSON)</span>
                        </button>
                      )}
                      {onImportExcel && (
                        <button onClick={() => { onImportExcel(); closeMenu(); }} className="w-full text-left px-7 py-3 flex items-center gap-3 hover:bg-card-bg transition-colors" style={xpItemStyle}>
                          {isXP ? <XPFileSpreadsheet size={17} accent="#2266cc" /> : <FileSpreadsheet size={17} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                          <span className="text-foreground text-sm font-medium">Импорт из Excel</span>
                        </button>
                      )}
                      {onImport && (
                        <button onClick={() => { onImport(); closeMenu(); }} className="w-full text-left px-7 py-3 flex items-center gap-3 hover:bg-card-bg transition-colors" style={xpItemStyle}>
                          {isXP ? <XPUpload size={17} /> : <Upload size={17} className="text-muted-foreground shrink-0" />}
                          <span className="text-foreground text-sm font-medium">Импорт БД (JSON)</span>
                        </button>
                      )}
                      {onCsvOperations && (
                        <button onClick={() => { onCsvOperations(); closeMenu(); }} className="w-full text-left px-7 py-3 flex items-center gap-3 hover:bg-card-bg transition-colors" style={xpItemStyle}>
                          {isXP ? <XPFileSpreadsheet size={17} accent="#888" /> : <FileSpreadsheet size={17} className="text-muted-foreground shrink-0" />}
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
                style={xpItemStyle}
              >
                <div className="flex items-center gap-4">
                  {isXP
                    ? (isDark ? <XPMoon size={20} /> : <XPSun size={20} />)
                    : (isDark ? <Moon size={20} className="text-muted-foreground shrink-0" /> : <Sun size={20} className="text-muted-foreground shrink-0" />)}
                  <span className="font-medium text-base text-foreground">Тема и шрифт</span>
                </div>
                {isXP
                  ? <XPChevronRight size={18} />
                  : <ChevronRight size={18} className={`text-muted-foreground transition-transform ${activeSubmenu === 'theme' ? 'rotate-90' : ''}`} />}
              </button>

              {activeSubmenu === 'theme' && (
                <div className="bg-muted border-t border-b border-card-border">
                  <div className="px-4 py-3 grid grid-cols-1 gap-2">
                    <button onClick={() => { onThemeToggle?.('light');          closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg bg-white text-gray-900 border border-gray-200 text-left">☀️ Светлая</button>
                    <button onClick={() => { onThemeToggle?.('dark');           closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg bg-[#0f0f11] text-[#f0f0f2] border border-[#2e2e34] text-left">🌙 Тёмная</button>
                    <button onClick={() => { onThemeToggle?.('matte-gradient'); closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg text-left" style={{background:'linear-gradient(135deg,#7aae82,#aecfac)',color:'#182818',border:'1px solid rgba(255,255,255,0.5)'}}>🌿 Матовый Градиент</button>
                    <button onClick={() => { onThemeToggle?.('caustics');       closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg text-left" style={{background:'linear-gradient(135deg,#063a58,#0a5880)',color:'#b0e0ff',border:'1px solid rgba(135,222,255,0.48)'}}>🌊 Каустика</button>
                    <button onClick={() => { onThemeToggle?.('sunset-layers');  closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg text-left" style={{background:'linear-gradient(135deg,#dc5510,#782005)',color:'#ffd0a0',border:'1px solid rgba(255,152,68,0.52)'}}>🌅 Слоистый Закат</button>
                    <button onClick={() => { onThemeToggle?.('ice');            closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg text-left" style={{background:'linear-gradient(135deg,#e8f5fd,#c2daf5)',color:'#142030',border:'1px solid rgba(168,205,242,0.58)'}}>🧊 Лёд</button>
                    <button onClick={() => { onThemeToggle?.('brutalism');      closeMenu(); }} className="px-3 py-2.5 text-sm font-medium text-left" style={{background:'#f0ede6',color:'#111',border:'2px solid #111',borderRadius:4,boxShadow:'3px 3px 0 #111'}}>⬛ Нео-Брутализм</button>
                    <button onClick={() => { onThemeToggle?.('organic-glass');  closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg text-left" style={{background:'linear-gradient(135deg,#288852,#48a870)',color:'#e8fff4',border:'1px solid rgba(95,200,152,0.52)'}}>🌱 Органическое Стекло</button>
                    <button onClick={() => { onThemeToggle?.('neon');           closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg text-left" style={{background:'#100820',color:'#ff0dd8',border:'1.5px solid #ff0dd8',boxShadow:'0 0 8px rgba(255,13,216,0.38)'}}>⚡ Киберпанк Неон</button>
                    <button onClick={() => { onThemeToggle?.('retro-cyber');    closeMenu(); }} className="px-3 py-2.5 text-sm font-medium rounded-lg text-left" style={{background:'#08142a',color:'#00c8f0',border:'1px solid #0070e0',boxShadow:'0 0 8px rgba(0,112,224,0.3)'}}>🔲 Ретро-Киберпанк</button>
                    <button onClick={() => { onThemeToggle?.('xp-light');       closeMenu(); }} className="px-3 py-2.5 text-sm font-medium border text-left" style={{background:'#ece9d8',color:'#000',fontFamily:'Tahoma,sans-serif',borderColor:'#9c9a94',borderRadius:3}}>🪟 Windows XP</button>
                    <button onClick={() => { onThemeToggle?.('xp-dark');        closeMenu(); }} className="px-3 py-2.5 text-sm font-medium border text-left" style={{background:'#1c1f2b',color:'#d4d0c8',fontFamily:'Tahoma,sans-serif',borderColor:'#3d4358',borderRadius:3}}>🪟 Windows XP Dark</button>
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
                        type="range" min="0.75" max="2.0" step="0.05"
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
                    navigator.serviceWorker.getRegistrations().then(regs => {
                      regs.forEach(r => r.unregister());
                      window.location.reload();
                    });
                  } else {
                    window.location.reload();
                  }
                }}
                className="w-full text-left px-5 py-3.5 flex items-center gap-4 hover:bg-muted transition-colors text-orange-500 dark:text-orange-400"
                style={xpItemStyle}
              >
                {isXP ? <XPRefreshCcw size={20} /> : <RefreshCcw size={20} className="shrink-0" />}
                <span className="font-medium text-base">Обновить приложение</span>
              </button>

              <div className="h-6" />
            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
}
