/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Part, Operation, Journal, ShiftSchedule, ShiftActual, VacationPeriod } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PartsList from './components/PartsList';
import PartDetail from './components/PartDetail';
import OperationsLog from './components/OperationsLog';
import OperationDetail from './components/OperationDetail';
import PartForm from './components/PartForm';
import JournalForm from './components/JournalForm';
import SearchModal from './components/SearchModal';
import AutoWriteOffModal from './components/AutoWriteOffModal';
import TelegramSettingsModal from './components/TelegramSettingsModal';
import SyncModal from './components/SyncModal';
import JournalSelectModal from './components/JournalSelectModal';
import CsvOperationsModal from './components/CsvOperationsModal';
import SortModal, { SortConfig } from './components/SortModal';
import { sendTelegramMessage } from './services/telegram';
import { Sun, Moon, Cloud, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { auth, db, googleProvider } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { differenceInHours } from 'date-fns';

import FinanceJournal from './components/FinanceJournal';
import ShiftDashboard from './components/shifts/ShiftDashboard';

type View = 'dashboard' | 'parts-list' | 'part-detail' | 'operations-log' | 'operation-detail' | 'finance-journal' | 'parts-without-price' | 'shifts';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('app_theme') || 'light';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [journals, setJournals] = useState<Journal[]>(() => {
    try {
      const saved = localStorage.getItem('app_journals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error parsing journals', e);
    }
    return [{ id: 'default', name: 'Основной', description: 'Главный журнал', createdAt: new Date().toISOString() }];
  });
  const [parts, setParts] = useState<Part[]>(() => {
    try {
      const saved = localStorage.getItem('app_parts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((p: Part) => {
            if (p.operationNumbers?.length === 1) {
              const op = p.operationNumbers[0];
              if (!p.operationPrices || !p.operationPrices[op]) {
                return {
                  ...p,
                  operationPrices: {
                    ...(p.operationPrices || {}),
                    [op]: p.pricePerUnit
                  }
                };
              }
            }
            return p;
          });
        }
      }
    } catch (e) {
      console.error('Error parsing parts', e);
    }
    return [];
  });
  const [operations, setOperations] = useState<Operation[]>(() => {
    try {
      const saved = localStorage.getItem('app_operations');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing operations', e);
    }
    return [];
  });
  
  const [schedules, setSchedules] = useState<ShiftSchedule[]>(() => {
    try { const s = localStorage.getItem('app_schedules'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [shiftActuals, setShiftActuals] = useState<ShiftActual[]>(() => {
    try { const s = localStorage.getItem('app_shift_actuals'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [vacations, setVacations] = useState<VacationPeriod[]>(() => {
    try { const s = localStorage.getItem('app_shift_vacations'); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'desc' });
  
  const [showPartForm, setShowPartForm] = useState(false);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAutoWriteOffModal, setShowAutoWriteOffModal] = useState(false);
  const [showTgSettings, setShowTgSettings] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [selectedCsvJournal, setSelectedCsvJournal] = useState<Journal | null>(null);
  const [journalSelectAction, setJournalSelectAction] = useState<'export' | 'import' | 'csv' | null>(null);
  const [initialPartCode, setInitialPartCode] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => localStorage.getItem('app_last_sync'));
  const [localUpdatedAt, setLocalUpdatedAt] = useState<string>(() => localStorage.getItem('app_local_updated_at') || new Date(0).toISOString());

  const currentViewRef = useRef<View>(view);
  const scrollPositions = useRef<Record<string, number>>({});

  useEffect(() => {
    currentViewRef.current = view;
  }, [view]);

  useEffect(() => {
    // Restore scroll position when view changes
    if (view === 'parts-list' || view === 'parts-without-price') {
      window.scrollTo(0, 0);
    } else if (scrollPositions.current[view] !== undefined) {
      // Small timeout to ensure DOM is updated
      setTimeout(() => {
        window.scrollTo(0, scrollPositions.current[view]);
      }, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [view]);

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Set the initial state as root to trap the back button
    window.history.replaceState({ view: 'dashboard', modal: null, isRoot: true }, '');
    // Push the actual working state
    window.history.pushState({ view: 'dashboard', modal: null }, '');

    const handlePopState = (e: PopStateEvent) => {
      if (currentViewRef.current !== 'parts-list' && currentViewRef.current !== 'parts-without-price') {
        scrollPositions.current[currentViewRef.current] = window.scrollY;
      }
      const state = e.state;
      if (state) {
        if (state.isRoot) {
          // User tried to go back from the main dashboard
          // Prevent exit by pushing the state again
          window.history.pushState({ view: 'dashboard', modal: null }, '');
        } else {
          setView(state.view || 'dashboard');
          setShowPartForm(state.modal === 'part-form');
          setShowJournalForm(state.modal === 'journal-form');
          setShowSearchModal(state.modal === 'search');
          setShowAutoWriteOffModal(state.modal === 'auto-write-off');
          setShowTgSettings(state.modal === 'tg-settings');
          setShowSyncModal(state.modal === 'sync');
          setShowSortModal(state.modal === 'sort');
          setShowCsvModal(state.modal === 'csv');
          setJournalSelectAction(state.modal === 'journal-select' ? state.action : null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const changeView = (newView: View) => {
    if (view !== 'parts-list' && view !== 'parts-without-price') {
      scrollPositions.current[view] = window.scrollY;
    }
    window.history.pushState({ view: newView, modal: null }, '');
    setView(newView);
  };

  const openModal = (modal: string, action: string | null = null) => {
    window.history.pushState({ view, modal, action }, '');
    if (modal === 'part-form') setShowPartForm(true);
    if (modal === 'journal-form') setShowJournalForm(true);
    if (modal === 'search') setShowSearchModal(true);
    if (modal === 'auto-write-off') setShowAutoWriteOffModal(true);
    if (modal === 'tg-settings') setShowTgSettings(true);
    if (modal === 'sync') setShowSyncModal(true);
    if (modal === 'sort') setShowSortModal(true);
    if (modal === 'csv') setShowCsvModal(true);
    if (modal === 'journal-select') setJournalSelectAction(action as any);
  };

  const replaceModal = (modal: string, action: string | null = null) => {
    window.history.replaceState({ view, modal, action }, '');
    setShowPartForm(modal === 'part-form');
    setShowJournalForm(modal === 'journal-form');
    setShowSearchModal(modal === 'search');
    setShowAutoWriteOffModal(modal === 'auto-write-off');
    setShowTgSettings(modal === 'tg-settings');
    setShowSyncModal(modal === 'sync');
    setShowSortModal(modal === 'sort');
    setShowCsvModal(modal === 'csv');
    setJournalSelectAction(modal === 'journal-select' ? action as any : null);
  };

  const closeModal = () => {
    window.history.back();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Helper to update local data and timestamp
  const updateLocalTimestamp = () => {
    const now = new Date().toISOString();
    setLocalUpdatedAt(now);
    localStorage.setItem('app_local_updated_at', now);
  };

  const syncData = useCallback(async (force = false) => {
    if (!auth.currentUser) return;
    
    const now = new Date();
    if (!force && lastSyncTime) {
      const hoursSinceSync = differenceInHours(now, new Date(lastSyncTime));
      if (hoursSinceSync < 3) return;
    }

    setIsSyncing(true);
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      let docSnap;
      try {
        docSnap = await getDoc(userDocRef);
      } catch (e: any) {
        if (e.message?.includes('offline') || e.code === 'unavailable') {
          console.log('Offline mode detected, skipping sync');
          return;
        }
        throw e;
      }

      const localData = {
        journals,
        parts,
        operations,
        updatedAt: localUpdatedAt
      };

      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        const remoteUpdatedAt = remoteData.updatedAt ? new Date(remoteData.updatedAt) : new Date(0);
        const localUpdatedAtDate = new Date(localUpdatedAt);

        // Logic to prevent overwriting cloud with empty local data
        const isLocalEmpty = parts.length === 0 && operations.length === 0 && journals.length <= 1;
        const isRemoteEmpty = (!remoteData.parts || remoteData.parts.length === 0) && 
                              (!remoteData.operations || remoteData.operations.length === 0);

        if (force) {
          // In force mode, we just push local to remote (or we could have a separate pull)
          await setDoc(userDocRef, {
            ...localData,
            updatedAt: new Date().toISOString(), // Update timestamp on push
            syncTimestamp: serverTimestamp()
          }, { merge: true });
          showToast('Данные принудительно сохранены в облако');
        } else if (isLocalEmpty && !isRemoteEmpty) {
          // Local is empty but remote has data -> Pull from remote
          if (remoteData.journals) setJournals(remoteData.journals);
          if (remoteData.parts) setParts(remoteData.parts);
          if (remoteData.operations) setOperations(remoteData.operations);
          setLocalUpdatedAt(remoteData.updatedAt || new Date().toISOString());
          showToast('Данные восстановлены из облака');
        } else if (remoteUpdatedAt > localUpdatedAtDate) {
          // Remote is newer -> Pull from remote
          if (remoteData.journals) setJournals(remoteData.journals);
          if (remoteData.parts) setParts(remoteData.parts);
          if (remoteData.operations) setOperations(remoteData.operations);
          setLocalUpdatedAt(remoteData.updatedAt);
          showToast('Данные обновлены из облака');
        } else if (localUpdatedAtDate > remoteUpdatedAt || isRemoteEmpty) {
          // Local is newer or remote is empty -> Push to remote
          await setDoc(userDocRef, {
            ...localData,
            syncTimestamp: serverTimestamp()
          }, { merge: true });
          showToast('Данные сохранены в облако');
        }
      } else {
        // First time sync for this user
        await setDoc(userDocRef, {
          ...localData,
          syncTimestamp: serverTimestamp()
        });
        showToast('Данные впервые сохранены в облако');
      }

      const syncTimeStr = now.toISOString();
      setLastSyncTime(syncTimeStr);
      localStorage.setItem('app_last_sync', syncTimeStr);
    } catch (error) {
      console.error('Sync error:', error);
      showToast('Ошибка синхронизации');
    } finally {
      setIsSyncing(false);
    }
  }, [journals, parts, operations, lastSyncTime, localUpdatedAt]);

  // Periodic sync check
  useEffect(() => {
    if (user) {
      syncData();
      const interval = setInterval(() => syncData(), 600000); // Check every 10 minutes
      return () => clearInterval(interval);
    }
  }, [user, syncData]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Вход выполнен');
    } catch (error) {
      console.error('Login error:', error);
      showToast('Ошибка входа');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('Выход выполнен');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Ошибка выхода');
    }
  };

  useEffect(() => {
    localStorage.setItem('app_journals', JSON.stringify(journals));
  }, [journals]);

  useEffect(() => {
    localStorage.setItem('app_parts', JSON.stringify(parts));
  }, [parts]);

  useEffect(() => {
    localStorage.setItem('app_operations', JSON.stringify(operations));
  }, [operations]);

  useEffect(() => {
    if (!localStorage.getItem('app_cleaned_history_v1')) {
      setParts(prev => prev.filter(p => p.id !== 'seed'));
      setOperations(prev => prev.filter(op => op.partId !== 'seed'));
      
      // Optionally clean up the seeded finance data if it hasn't been modified much, 
      // but to be safe we just remove the dummy part and operations.
      
      localStorage.setItem('app_cleaned_history_v1', 'true');
      updateLocalTimestamp();
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExport = () => {
    const data = { journals, parts, operations };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('База данных успешно экспортирована');
  };

  const handleExportExcelForJournal = (journal: Journal) => {
    try {
      const wb = XLSX.utils.book_new();

      if (journal.type === 'parts') {
        const journalParts = parts.filter(p => p.journalId === journal.id);
        const partsData = journalParts.map(p => {
          const opsTotal = p.operationNumbers.reduce((sum, op) => sum + (p.operationPrices?.[op] || 0), 0);
          return {
            'Номер детали': p.code,
            'Название': p.name,
            'Цена за единицу': p.pricePerUnit,
            'Количество': p.currentQuantity,
            'Номера операций': p.operationNumbers.join(', '),
            'Общая цена операций': opsTotal,
            'Итоговая стоимость': p.pricePerUnit * p.currentQuantity
          };
        });
        const wsParts = XLSX.utils.json_to_sheet(partsData);
        XLSX.utils.book_append_sheet(wb, wsParts, journal.name.substring(0, 31));
      } else {
        const journalOps = operations.filter(o => o.journalId === journal.id);
        const operationsData = journalOps.map(o => ({
          'ID': o.id,
          'Дата': new Date(o.date).toLocaleString('ru-RU'),
          'Номер детали': o.partCode,
          'Тип': o.type === 'arrival' ? 'Приход' : o.type === 'write-off' ? 'Списание' : 'Возврат',
          'Количество': o.quantity,
          'Цена за единицу': o.pricePerUnit,
          'Сумма': o.sum
        }));
        const wsOperations = XLSX.utils.json_to_sheet(operationsData);
        XLSX.utils.book_append_sheet(wb, wsOperations, journal.name.substring(0, 31));
      }

      XLSX.writeFile(wb, `export_${journal.name}_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast(`Альбом "${journal.name}" успешно экспортирован`);
    } catch (error) {
      console.error(error);
      showToast('Ошибка при экспорте в Excel');
    }
  };

  const handlePullData = async () => {
    if (!auth.currentUser) return;
    setIsSyncing(true);
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      let docSnap;
      try {
        docSnap = await getDoc(userDocRef);
      } catch (e: any) {
        if (e.message?.includes('offline') || e.code === 'unavailable') {
          showToast('Нет подключения к интернету');
          return;
        }
        throw e;
      }
      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        if (remoteData.journals) setJournals(remoteData.journals);
        if (remoteData.parts) setParts(remoteData.parts);
        if (remoteData.operations) setOperations(remoteData.operations);
        const remoteUpdated = remoteData.updatedAt || new Date().toISOString();
        setLocalUpdatedAt(remoteUpdated);
        localStorage.setItem('app_local_updated_at', remoteUpdated);
        showToast('Данные загружены из облака');
      } else {
        showToast('В облаке нет данных');
      }
    } catch (error) {
      console.error('Pull error:', error);
      showToast('Ошибка загрузки');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportCsvForJournal = (journal: Journal, startDate: string, endDate: string, typeOverride?: 'parts' | 'operations') => {
    try {
      let csvContent = '';
      let filename = '';

      const effectiveType = typeOverride || journal.type || 'parts';

      if (effectiveType === 'parts') {
        const journalParts = parts.filter(p => p.journalId === journal.id);
        const headers = ['Номер детали', 'Название', 'Цена за единицу', 'Количество', 'Номера операций', 'Общая цена операций', 'Итоговая стоимость'];
        const rows = journalParts.map(p => {
          const opsTotal = p.operationNumbers.reduce((sum, op) => sum + (p.operationPrices?.[op] || 0), 0);
          return [
            p.code,
            p.name,
            p.pricePerUnit,
            p.currentQuantity,
            p.operationNumbers.join(', '),
            opsTotal,
            p.pricePerUnit * p.currentQuantity
          ];
        });
        
        csvContent = [
          headers.join(';'),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
        ].join('\n');
        filename = `parts_${journal.name}_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        let journalOps = operations.filter(o => o.journalId === journal.id);
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          journalOps = journalOps.filter(o => new Date(o.date) >= start);
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          journalOps = journalOps.filter(o => new Date(o.date) <= end);
        }

        const headers = ['ID', 'Дата', 'Номер детали', 'Тип', 'Количество', 'Цена за единицу', 'Сумма'];
        const rows = journalOps.map(o => [
          o.id,
          new Date(o.date).toLocaleString('ru-RU').replace(',', ''),
          o.partCode,
          o.type === 'arrival' ? 'Приход' : o.type === 'write-off' ? 'Списание' : 'Возврат',
          o.quantity,
          o.pricePerUnit,
          o.sum
        ]);

        csvContent = [
          headers.join(';'),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
        ].join('\n');
        filename = `operations_${journal.name}_${new Date().toISOString().split('T')[0]}.csv`;
      }

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast(`Данные успешно экспортированы в CSV`);
    } catch (error) {
      console.error(error);
      showToast('Ошибка при экспорте в CSV');
    }
  };

  const handleImportCsvForJournal = (journal: Journal, typeOverride?: 'parts' | 'operations') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.style.display = 'none';
    document.body.appendChild(input);

    const cleanup = () => {
      if (input.parentElement) {
        document.body.removeChild(input);
      }
    };

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        cleanup();
        return;
      }
      
      try {
        let text = '';
        try {
          const buffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(buffer);
          if (uint8Array[0] === 0xEF && uint8Array[1] === 0xBB && uint8Array[2] === 0xBF) {
            text = new TextDecoder('utf-8').decode(uint8Array);
          } else {
            try {
              text = new TextDecoder('utf-8', { fatal: true }).decode(uint8Array);
            } catch (e) {
              text = new TextDecoder('windows-1251').decode(uint8Array);
            }
          }
        } catch (e) {
          text = await file.text();
        }

        const parseCSV = (text: string, delimiter: string) => {
          const result: string[][] = [];
          let currentRow: string[] = [];
          let currentCell = '';
          let inQuotes = false;
          
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];
            
            if (char === '"') {
              if (inQuotes && nextChar === '"') {
                currentCell += '"';
                i++; // Skip escaped quote
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === delimiter && !inQuotes) {
              currentRow.push(currentCell);
              currentCell = '';
            } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
              currentRow.push(currentCell);
              result.push(currentRow);
              currentRow = [];
              currentCell = '';
              if (char === '\r') i++; // Skip \n
            } else {
              currentCell += char;
            }
          }
          
          if (currentCell !== '' || currentRow.length > 0) {
            currentRow.push(currentCell);
            result.push(currentRow);
          }
          
          return result;
        };

        const firstLineEnd = text.indexOf('\n');
        const firstLine = firstLineEnd !== -1 ? text.substring(0, firstLineEnd) : text;
        const separator = firstLine.includes(';') ? ';' : ',';
        
        const rows = parseCSV(text, separator);

        if (rows.length <= 1) {
          showToast('Файл пуст или содержит только заголовки');
          return;
        }
        
        const effectiveType = typeOverride || journal.type || 'parts';

        if (effectiveType === 'parts') {
          const newParts: Part[] = [];
          
          const headerRow = rows[0].map(h => h.toLowerCase().trim());
          
          let codeIdx = headerRow.findIndex(h => h.includes('номер детали') || h.includes('код') || h.includes('артикул'));
          let nameIdx = headerRow.findIndex(h => h.includes('название') || h.includes('наименование') || h.includes('номенклатура') || h.includes('товар'));
          if (nameIdx === -1) nameIdx = headerRow.findIndex((h, i) => i !== codeIdx && h.includes('деталь'));
          if (nameIdx === codeIdx) nameIdx = -1;
          let priceIdx = headerRow.findIndex(h => h.includes('цена'));
          let qtyIdx = headerRow.findIndex(h => h.includes('количество') || h.includes('кол-во') || h.includes('остаток'));
          let opsIdx = headerRow.findIndex(h => h.includes('операци'));

          let startIndex = 1;

          const isDate = (str: string) => /^\d{2}[\./]\d{2}[\./]\d{4}/.test(str?.trim() || '');

          if (codeIdx === -1 && nameIdx === -1 && qtyIdx === -1) {
            if (rows[0].length > 0 && (isDate(rows[0][0]) || !isNaN(Number(rows[0][rows[0].length - 1])))) {
              startIndex = 0;
            }
            
            const sampleRow = rows[startIndex];
            if (sampleRow) {
              if (isDate(sampleRow[0])) {
                nameIdx = 1;
                qtyIdx = sampleRow.length > 3 ? 3 : 2;
                priceIdx = sampleRow.length > 3 ? 2 : -1;
              } else {
                codeIdx = 0;
                nameIdx = 1;
                priceIdx = 2;
                qtyIdx = 3;
                opsIdx = 4;
              }
            }
          }

          for (let i = startIndex; i < rows.length; i++) {
            const row = rows[i].map(val => val.trim());
            if (row.length < 1 || (!row[0] && !row[1])) continue;
            
            let code = codeIdx >= 0 ? row[codeIdx] : '';
            let name = nameIdx >= 0 ? row[nameIdx] : '';
            
            // If the code column actually contains a date, ignore it
            if (code && isDate(code)) {
              code = '';
            }
            
            if (!code && name) {
              const match = name.match(/^(.*?)\s+([A-ZА-ЯЁ][a-zа-яё].*)$/);
              if (match) {
                code = match[1].trim();
                name = match[2].trim();
              } else {
                const parts = name.split(' ');
                let splitIdx = 0;
                for (let j = 0; j < parts.length; j++) {
                  if (/[\d]/.test(parts[j])) {
                    splitIdx = j + 1;
                  }
                }
                if (splitIdx > 0 && splitIdx < parts.length) {
                  code = parts.slice(0, splitIdx).join(' ');
                  name = parts.slice(splitIdx).join(' ');
                } else if (parts.length > 1) {
                  code = parts[0];
                  name = parts.slice(1).join(' ');
                }
              }
            }
            
            if (codeIdx === -1 && nameIdx === -1) {
               code = row[0] || '';
               name = row[1] || '';
            }

            const priceStr = priceIdx >= 0 ? row[priceIdx] : (codeIdx === -1 && nameIdx === -1 ? row[2] : '');
            const qtyStr = qtyIdx >= 0 ? row[qtyIdx] : (codeIdx === -1 && nameIdx === -1 ? row[3] : '');
            const opsStr = opsIdx >= 0 ? row[opsIdx] : (codeIdx === -1 && nameIdx === -1 ? row[4] : '');

            const pricePerUnit = Number((priceStr || '').replace(/\s/g, '').replace(',', '.')) || 0;
            const currentQuantity = Number((qtyStr || '').replace(/\s/g, '').replace(',', '.')) || 0;
            const operationNumbers = (opsStr || '').split(',').map(s => s.trim()).filter(Boolean);

            const newPart: Part = {
              id: Math.random().toString(36).substr(2, 9),
              journalId: journal.id,
              code,
              name,
              pricePerUnit,
              currentQuantity,
              operationNumbers,
              operationPrices: {},
              history: [],
              lastUpdate: new Date().toISOString(),
            };

            if (newPart.operationNumbers.length === 1) {
              newPart.operationPrices = {
                [newPart.operationNumbers[0]]: newPart.pricePerUnit
              };
            }

            newParts.push(newPart);
          }
          let addedCount = 0;
          let updatedCount = 0;
          setParts(prev => {
            const result = [...prev];
            for (const newPart of newParts) {
              if (!newPart.code) continue;
              const existingIdx = result.findIndex(
                p => p.journalId === journal.id &&
                     p.code.trim().toLowerCase() === newPart.code.trim().toLowerCase()
              );
              if (existingIdx >= 0) {
                const existing = result[existingIdx];
                result[existingIdx] = {
                  ...existing,
                  name: newPart.name || existing.name,
                  pricePerUnit: newPart.pricePerUnit > 0 ? newPart.pricePerUnit : existing.pricePerUnit,
                  currentQuantity: newPart.currentQuantity,
                  operationNumbers: newPart.operationNumbers.length > 0
                    ? newPart.operationNumbers
                    : existing.operationNumbers,
                  operationPrices: Object.keys(newPart.operationPrices || {}).length > 0
                    ? newPart.operationPrices
                    : existing.operationPrices,
                  lastUpdate: new Date().toISOString(),
                };
                updatedCount++;
              } else {
                result.push(newPart);
                addedCount++;
              }
            }
            return result;
          });
          showToast(`Добавлено: ${addedCount}, обновлено: ${updatedCount} деталей`);
        } else {
          const newOps: Operation[] = [];
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i].map(val => val.trim());
            if (row.length < 3) continue;
            
            newOps.push({
              id: String(row[0] || Math.random().toString(36).substr(2, 9)),
              journalId: journal.id,
              operationCode: `IMP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
              type: row[3] === 'Приход' ? 'arrival' : row[3] === 'Списание' ? 'write-off' : 'return',
              date: new Date().toISOString(), // Fallback
              partId: '',
              partCode: String(row[2] || ''),
              partName: '',
              operationNumbers: [],
              quantity: Number((row[4] || '').replace(',', '.')) || 0,
              pricePerUnit: Number((row[5] || '').replace(',', '.')) || 0,
              sum: Number((row[6] || '').replace(',', '.')) || 0,
              wasQuantity: 0,
              becameQuantity: 0
            });
          }
          setOperations([...operations, ...newOps]);
          showToast(`Импортировано ${newOps.length} операций в "${journal.name}"`);
        }
        
        updateLocalTimestamp();
        setShowCsvModal(false);
        closeModal();
      } catch (error) {
        console.error(error);
        showToast('Ошибка при импорте CSV');
      } finally {
        cleanup();
      }
    };
    input.click();
  };

  const handleImportExcelForJournal = (journal: Journal) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.style.display = 'none';
    document.body.appendChild(input);

    const cleanup = () => {
      if (input.parentElement) {
        document.body.removeChild(input);
      }
    };

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        cleanup();
        return;
      }
      
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (journal.type === 'parts') {
          const newParts: Part[] = jsonData.map((row: any) => {
            const operationNumbers = String(row['Номера операций'] || '').split(',').map(s => s.trim()).filter(Boolean);
            const pricePerUnit = Number(row['Цена за единицу']) || 0;
            const newPart: Part = {
              id: Math.random().toString(36).substr(2, 9),
              journalId: journal.id,
              code: String(row['Номер детали'] || ''),
              name: String(row['Название'] || ''),
              pricePerUnit,
              currentQuantity: Number(row['Количество']) || 0,
              operationNumbers,
              operationPrices: {},
              history: [],
              lastUpdate: new Date().toISOString(),
            };
            if (newPart.operationNumbers.length === 1) {
              newPart.operationPrices = {
                [newPart.operationNumbers[0]]: newPart.pricePerUnit
              };
            }
            return newPart;
          });
          setParts([...parts, ...newParts]);
        } else {
          const newOps: Operation[] = jsonData.map((row: any) => ({
            id: String(row['ID'] || Math.random().toString(36).substr(2, 9)),
            journalId: journal.id,
            operationCode: `IMP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            type: row['Тип'] === 'Приход' ? 'arrival' : row['Тип'] === 'Списание' ? 'write-off' : 'return',
            date: new Date().toISOString(), // Fallback, parsing ru-RU dates from Excel is complex
            partId: '',
            partCode: String(row['Номер детали'] || ''),
            partName: '',
            operationNumbers: [],
            quantity: Number(row['Количество']) || 0,
            pricePerUnit: Number(row['Цена за единицу']) || 0,
            sum: Number(row['Сумма']) || 0,
            wasQuantity: 0,
            becameQuantity: 0
          }));
          setOperations([...operations, ...newOps]);
        }
        updateLocalTimestamp();
        showToast(`Данные успешно импортированы в "${journal.name}"`);
      } catch (error) {
        console.error(error);
        showToast('Ошибка при импорте Excel');
      } finally {
        cleanup();
      }
    };
    input.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.style.display = 'none';
    document.body.appendChild(input);

    const cleanup = () => {
      if (input.parentElement) {
        document.body.removeChild(input);
      }
    };

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        cleanup();
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.journals && data.parts && data.operations) {
            setJournals(data.journals);
            setParts(data.parts);
            setOperations(data.operations);
            updateLocalTimestamp();
            showToast('База данных успешно импортирована');
          } else {
            showToast('Ошибка: Неверный формат файла');
          }
        } catch (error) {
          showToast('Ошибка при чтении файла');
        } finally {
          cleanup();
        }
      };
      reader.onerror = () => {
        cleanup();
      };
      reader.readAsText(file);
    };
    input.click();
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.removeAttribute('data-theme');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('app_theme', theme);
    const themeColor = theme === 'dark' ? '#111113' : '#2563eb';
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = themeColor;
  }, [theme]);

  const toggleTheme = (newTheme?: string) => {
    if (newTheme) {
      setTheme(newTheme);
    } else {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }
  };

  useEffect(() => { localStorage.setItem('app_schedules', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('app_shift_actuals', JSON.stringify(shiftActuals)); }, [shiftActuals]);
  useEffect(() => { localStorage.setItem('app_shift_vacations', JSON.stringify(vacations)); }, [vacations]);

  const addSchedule = (data: Omit<ShiftSchedule, 'id'>) => {
    setSchedules(prev => [...prev, { id: crypto.randomUUID(), ...data }]);
  };
  const updateSchedule = (id: string, data: Omit<ShiftSchedule, 'id'>) => {
    setSchedules(prev => prev.map(s => s.id === id ? { id, ...data } : s));
  };
  const deleteSchedule = (id: string) => {
    if (!window.confirm('Удалить график?')) return;
    setSchedules(prev => prev.filter(s => s.id !== id));
  };
  const markActual = (actual: ShiftActual) => {
    setShiftActuals(prev => {
      const idx = prev.findIndex(a => a.id === actual.id);
      return idx >= 0 ? prev.map(a => a.id === actual.id ? actual : a) : [...prev, actual];
    });
  };
  const deleteActual = (id: string) => {
    setShiftActuals(prev => prev.filter(a => a.id !== id));
  };
  const addVacation = (data: Omit<VacationPeriod, 'id'>) => {
    setVacations(prev => [...prev, { id: crypto.randomUUID(), ...data }]);
  };
  const updateVacation = (id: string, data: Omit<VacationPeriod, 'id'>) => {
    setVacations(prev => prev.map(v => v.id === id ? { id, ...data } : v));
  };
  const deleteVacation = (id: string) => {
    setVacations(prev => prev.filter(v => v.id !== id));
  };

  const handleBack = () => {
    setSearchQuery('');
    window.history.back();
  };

  const addPart = (newPartData: Partial<Part>) => {
    const newPart: Part = {
      id: Math.random().toString(36).substr(2, 9),
      journalId: selectedJournal?.id || journals[0].id,
      code: newPartData.code || '',
      name: newPartData.name || '',
      pricePerUnit: newPartData.pricePerUnit || 0,
      currentQuantity: newPartData.currentQuantity || 0,
      operationNumbers: newPartData.operationNumbers || [],
      operationPrices: {},
      history: [],
      lastUpdate: new Date().toISOString(),
    };

    if (newPart.operationNumbers.length === 1) {
      newPart.operationPrices = {
        [newPart.operationNumbers[0]]: newPart.pricePerUnit
      };
    }

    setParts([...parts, newPart]);
    
    if (newPart.currentQuantity > 0) {
      createOperation(newPart, newPart.currentQuantity, 0, 'arrival');
    }
    
    updateLocalTimestamp();
    
    sendTelegramMessage(`📦 <b>Новая деталь заведена</b>\nНомер: <code>${newPart.code}</code>\nНазвание: ${newPart.name}\nЦена: ${newPart.pricePerUnit} ₽\nНачальное кол-во: ${newPart.currentQuantity} шт.`);
  };

  const updatePart = (updatedData: Partial<Part>) => {
    const partToUpdate = selectedPart || parts.find(p => p.id === updatedData.id);
    if (!partToUpdate) return;

    const oldQuantity = partToUpdate.currentQuantity;
    const newQuantity = updatedData.currentQuantity !== undefined ? updatedData.currentQuantity : oldQuantity;
    
    const updatedPart: Part = {
      ...partToUpdate,
      ...updatedData,
      lastUpdate: new Date().toISOString(),
    };

    if (updatedPart.operationNumbers.length === 1) {
      const op = updatedPart.operationNumbers[0];
      updatedPart.operationPrices = {
        ...(updatedPart.operationPrices || {}),
        [op]: updatedPart.pricePerUnit
      };
    }

    setParts(parts.map(p => p.id === partToUpdate.id ? updatedPart : p));
    if (selectedPart?.id === partToUpdate.id) {
      setSelectedPart(updatedPart);
    }

    updateLocalTimestamp();
  };

  const createOperation = (part: Part, quantity: number, wasQuantity: number, type: 'arrival' | 'write-off') => {
    const opJournal = journals.find(j => j.type === 'operations') || journals[0];
    const becameQuantity = wasQuantity + (type === 'arrival' ? quantity : -quantity);
    
    // Generate MMDD-NNNN format
    const now = new Date();
    const mmdd = `${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    
    // Find operations from today to determine the next number
    const todayOps = operations.filter(op => {
      const opDate = new Date(op.date);
      return opDate.getMonth() === now.getMonth() && opDate.getDate() === now.getDate();
    });
    
    const nextNum = (todayOps.length + 1).toString().padStart(4, '0');
    const operationCode = `${mmdd}-${nextNum}`;
    
    const newOp: Operation = {
      id: Math.random().toString(36).substr(2, 9),
      journalId: opJournal.id,
      operationCode,
      type,
      date: now.toISOString(),
      partId: part.id,
      partCode: part.code,
      partName: part.name,
      operationNumbers: part.operationNumbers,
      quantity,
      pricePerUnit: part.pricePerUnit,
      sum: quantity * part.pricePerUnit,
      wasQuantity,
      becameQuantity
    };

    setOperations(prev => [newOp, ...prev]);

    // Update part history
    setParts(prevParts => prevParts.map(p => {
      if (p.id === part.id) {
        return {
          ...p,
          history: [newOp, ...(p.history || [])]
        };
      }
      return p;
    }));

    updateLocalTimestamp();
    if (selectedPart?.id === part.id) {
      setSelectedPart(prev => prev ? {
        ...prev,
        history: [newOp, ...(prev.history || [])]
      } : null);
    }

    const typeStr = type === 'arrival' ? '🟢 Приход' : type === 'write-off' ? '🔴 Списание' : '🟡 Возврат';
    sendTelegramMessage(`🔄 <b>Движение детали</b>\nТип: ${typeStr}\nДеталь: <code>${part.code}</code> (${part.name})\nКоличество: ${quantity} шт.\nОстаток: ${becameQuantity} шт.`);
  };

  const handleManualWriteOff = (partId: string, writeOffQty: number, includedOperations: string[]) => {
    const part = parts.find(p => p.id === partId);
    if (!part) return;

    const newQuantity = part.currentQuantity - writeOffQty;
    const customPricePerUnit = part.operationNumbers.length > 0 
      ? includedOperations.reduce((sum, op) => sum + (part.operationPrices?.[op] || 0), 0)
      : part.pricePerUnit;

    const updatedPart: Part = {
      ...part,
      currentQuantity: newQuantity,
      lastUpdate: new Date().toISOString()
    };

    const opJournal = journals.find(j => j.type === 'operations') || journals[0];
    const now = new Date();
    const mmdd = `${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    const opCode = `${mmdd}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const newOp: Operation = {
      id: Math.random().toString(36).substr(2, 9),
      journalId: opJournal.id,
      operationCode: opCode,
      type: 'write-off',
      date: now.toISOString(),
      partId: part.id,
      partCode: part.code,
      partName: part.name,
      operationNumbers: includedOperations,
      quantity: writeOffQty,
      pricePerUnit: customPricePerUnit,
      sum: writeOffQty * customPricePerUnit,
      wasQuantity: part.currentQuantity,
      becameQuantity: newQuantity
    };

    setOperations(prev => [newOp, ...prev]);

    updatedPart.history = [{
      id: newOp.id,
      date: newOp.date,
      type: newOp.type,
      quantity: newOp.quantity
    }, ...(part.history || [])];

    setParts(prev => prev.map(p => p.id === partId ? updatedPart : p));
    if (selectedPart?.id === partId) {
      setSelectedPart(updatedPart);
    }
    updateLocalTimestamp();
    
    sendTelegramMessage(`🔴 <b>Ручное списание</b>\nДеталь: <code>${part.code}</code> (${part.name})\nКоличество: ${writeOffQty} шт.\nОстаток: ${newQuantity} шт.\nОперации: ${includedOperations.length > 0 ? includedOperations.join(', ') : 'нет'}`);
  };

  const cancelOperation = (operationId: string) => {
    const opToCancel = operations.find(op => op.id === operationId);
    if (!opToCancel) return;

    // Update part
    setParts(prevParts => prevParts.map(p => {
      if (p.id === opToCancel.partId) {
        const quantityChange = opToCancel.type === 'arrival' ? -opToCancel.quantity : opToCancel.quantity;
        return {
          ...p,
          currentQuantity: Math.max(0, p.currentQuantity + quantityChange),
          history: p.history.filter(h => h.id !== operationId)
        };
      }
      return p;
    }));

    // Remove operation
    setOperations(prevOps => prevOps.filter(op => op.id !== operationId));

    updateLocalTimestamp();
    // Go back
    handleBack();
  };

  const addJournal = (data: Partial<Journal>) => {
    const newJournal: Journal = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || 'Новый журнал',
      type: data.type || 'parts',
      color: data.color || '#007AFF',
    };
    setJournals([...journals, newJournal]);
    updateLocalTimestamp();
    closeModal();
  };

  const renderView = () => {
    const themeIcon = theme === 'light' ? <Moon size={22} /> : <Sun size={22} />;
    
    const commonHeaderProps = {
      user,
      onLogin: handleLogin,
      onLogout: handleLogout,
      onSync: () => syncData(true),
      onPull: handlePullData,
      isSyncing,
      lastSync: lastSyncTime,
      onThemeToggle: toggleTheme,
      onSyncSettings: () => openModal('sync'),
      onCsvOperations: () => openModal('journal-select', 'csv'),
      isDark: theme === 'dark'
    };

    switch (view) {
      case 'dashboard':
        return (
          <div className="bg-[#0A0A0C] min-h-[100dvh]">
            <Dashboard
              partsCount={parts.length}
              operationsCount={operations.length}
              onOpenParts={() => {
                setSelectedJournal(journals.find(j => j.type === 'parts') || null);
                changeView('parts-list');
              }}
              onOpenOperations={() => {
                setSelectedJournal(journals.find(j => j.type === 'operations') || null);
                setSearchQuery('');
                changeView('operations-log');
              }}
              onViewFinance={() => changeView('finance-journal')}
              onViewShifts={() => changeView('shifts')}
              isDark={theme === 'dark'}
              onThemeToggle={toggleTheme}
              onExport={handleExport}
              onImport={handleImport}
              onExportExcel={() => openModal('journal-select', 'export')}
              onImportExcel={() => openModal('journal-select', 'import')}
              onCsv={() => openModal('journal-select', 'csv')}
              onTelegramSettings={() => openModal('tg-settings')}
              onUpdateApp={() => {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.ready.then(reg => reg.update());
                }
                window.location.reload();
              }}
            />
          </div>
        );
      case 'parts-list':
        let filteredParts = parts.filter(p => p.code.toLowerCase().includes(searchQuery.toLowerCase()));
        if (sortConfig.key) {
          filteredParts.sort((a, b) => {
            let valA: number | string = 0;
            let valB: number | string = 0;
            if (sortConfig.key === 'date') {
              valA = new Date(a.lastUpdate).getTime();
              valB = new Date(b.lastUpdate).getTime();
            } else if (sortConfig.key === 'cost') {
              valA = a.currentQuantity * a.pricePerUnit;
              valB = b.currentQuantity * b.pricePerUnit;
            } else if (sortConfig.key === 'quantity') {
              valA = a.currentQuantity;
              valB = b.currentQuantity;
            }
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
          });
        }
        return (
          <div className="bg-background min-h-[100dvh]">
            <Header
              title="Карточки деталей"
              onBack={handleBack}
              showSearch={true}
              onSearch={() => openModal('search')}
              showSort={true}
              onSort={() => openModal('sort')}
              showMenu={true}
              onAutoWriteOff={() => openModal('auto-write-off')}
              onShowMissingPrices={() => changeView('parts-without-price')}
              {...commonHeaderProps}
            />
            <PartsList 
              parts={filteredParts} 
              onSelectPart={(part) => {
                setSelectedPart(part);
                changeView('part-detail');
              }} 
              scrollPosition={scrollPositions.current['parts-list'] || 0}
              onScrollChange={(pos) => {
                scrollPositions.current['parts-list'] = pos;
              }}
            />
          </div>
        );
      case 'part-detail':
        return (
          <div className="bg-background min-h-[100dvh]">
            <Header 
              title="Карточка детали" 
              onBack={handleBack}
              showEdit={true}
              showSearch={false}
              onEdit={() => {
                openModal('part-form');
              }}
              onShowMissingPrices={() => changeView('parts-without-price')}
              {...commonHeaderProps}
            />
            {selectedPart && <PartDetail 
              part={selectedPart} 
              onUpdate={updatePart} 
              onDelete={() => {
                setParts(prev => prev.filter(p => p.id !== selectedPart.id));
                setOperations(prev => prev.filter(op => op.partId !== selectedPart.id));
                updateLocalTimestamp();
                setSelectedPart(null);
                handleBack();
                showToast('Деталь удалена');
              }}
              onManualWriteOff={(qty, ops) => handleManualWriteOff(selectedPart.id, qty, ops)}
            />}
          </div>
        );
      case 'parts-without-price':
        const missingPriceParts = parts.filter(p => p.currentQuantity > 0 && p.pricePerUnit === 0);
        return (
          <div className="bg-background min-h-[100dvh]">
            <Header 
              title="Детали без цены" 
              onBack={handleBack} 
              showSearch={false}
              showMenu={false}
              {...commonHeaderProps}
            />
            <PartsList 
              parts={missingPriceParts} 
              onSelectPart={(part) => {
                setSelectedPart(part);
                changeView('part-detail');
              }} 
              scrollPosition={scrollPositions.current['parts-without-price'] || 0}
              onScrollChange={(pos) => {
                scrollPositions.current['parts-without-price'] = pos;
              }}
            />
          </div>
        );
      case 'operations-log':
        const filteredOperations = operations.filter(op => op.partCode.toLowerCase().includes(searchQuery.toLowerCase()));
        return (
          <div className="bg-background min-h-[100dvh]">
            <Header 
              title="Перемещение деталей" 
              onBack={handleBack} 
              showSearch={true}
              onSearch={() => openModal('search')}
              {...commonHeaderProps}
            />
            <OperationsLog
              operations={filteredOperations}
              onSelectOperation={(op) => {
                setSelectedOperation(op);
                changeView('operation-detail');
              }}
              onDeleteOperations={(ids) => {
                setOperations(prev => prev.filter(op => !ids.includes(op.id)));
                updateLocalTimestamp();
                showToast(`Удалено ${ids.length} ${ids.length === 1 ? 'запись' : ids.length < 5 ? 'записи' : 'записей'}`);
              }}
            />
          </div>
        );
      case 'operation-detail':
        return (
          <div className="bg-background min-h-[100dvh]">
            <Header 
              title={selectedOperation ? selectedOperation.operationCode : 'Операция'} 
              onBack={handleBack} 
              showSearch={false}
              showMenu={false}
              {...commonHeaderProps}
            />
            {selectedOperation && <OperationDetail operation={selectedOperation} onCancel={cancelOperation} />}
          </div>
        );
      case 'finance-journal':
        return (
          <div className="bg-background min-h-[100dvh]">
            <Header
              title="Финансовый журнал"
              onBack={handleBack}
              showSearch={false}
              showMenu={false}
              {...commonHeaderProps}
            />
            <FinanceJournal operations={operations} />
          </div>
        );
      case 'shifts':
        return (
          <div className="bg-background min-h-[100dvh]">
            <Header
              title="Журнал смен"
              onBack={handleBack}
              showSearch={false}
              showMenu={false}
              {...commonHeaderProps}
            />
            <ShiftDashboard
              schedules={schedules}
              actuals={shiftActuals}
              vacations={vacations}
              onAddSchedule={addSchedule}
              onUpdateSchedule={updateSchedule}
              onDeleteSchedule={deleteSchedule}
              onMarkActual={markActual}
              onDeleteActual={deleteActual}
              onAddVacation={addVacation}
              onUpdateVacation={updateVacation}
              onDeleteVacation={deleteVacation}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30 text-foreground transition-colors duration-300">
      {renderView()}
      
      {showPartForm && (
        <PartForm 
          part={selectedPart} 
          initialCode={initialPartCode}
          onSave={(data) => {
            if (selectedPart) {
              updatePart(data);
            } else {
              addPart(data);
            }
            setShowPartForm(false);
            setInitialPartCode(undefined);
            closeModal();
          }} 
          onClose={() => {
            setShowPartForm(false);
            setInitialPartCode(undefined);
            closeModal();
          }} 
        />
      )}
      
      {showSearchModal && (
        <SearchModal
          parts={parts}
          onClose={() => {
            setShowSearchModal(false);
            closeModal();
          }}
          onSearch={(query) => setSearchQuery(query)}
          onCreatePart={(code) => {
            setInitialPartCode(code);
            setSelectedPart(null);
            replaceModal('part-form');
          }}
        />
      )}

      {showAutoWriteOffModal && (
        <AutoWriteOffModal
          onClose={() => {
            setShowAutoWriteOffModal(false);
            closeModal();
          }}
          onConfirm={(targetSum) => {
            let eligible = parts.filter(p => p.currentQuantity > 0 && p.pricePerUnit > 0);
            eligible.sort((a, b) => new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime());
            
            if (eligible.length === 0) {
              showToast('Нет доступных деталей для списания');
              return;
            }

            const poolSize = Math.min(eligible.length, 15);
            const pool = eligible.slice(0, poolSize);
            
            for (let i = pool.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [pool[i], pool[j]] = [pool[j], pool[i]];
            }

            const maxItems = Math.floor(Math.random() * 5) + 1;
            let remainingSum = targetSum;
            const selectedPartsToUpdate: { part: Part, qty: number }[] = [];
            
            for (const part of pool) {
              if (selectedPartsToUpdate.length >= maxItems) break;
              if (remainingSum <= 0) break;

              const maxQtyForSum = Math.ceil(remainingSum / part.pricePerUnit);
              const qtyToTake = Math.min(part.currentQuantity, maxQtyForSum);
              
              if (qtyToTake > 0) {
                selectedPartsToUpdate.push({ part, qty: qtyToTake });
                remainingSum -= (qtyToTake * part.pricePerUnit);
              }
            }

            if (selectedPartsToUpdate.length === 0) {
              showToast('Не удалось подобрать детали для списания');
              return;
            }

            const newOperations: Operation[] = [];
            const timestamp = new Date().toISOString();
            
            const updatedParts = parts.map(p => {
              const selected = selectedPartsToUpdate.find(sp => sp.part.id === p.id);
              if (selected) {
                const qty = selected.qty;
                const sum = qty * p.pricePerUnit;
                
                const op: Operation = {
                  id: crypto.randomUUID(),
                  partId: p.id,
                  partCode: p.code,
                  partName: p.name || '',
                  operationCode: 'Авто-списание',
                  operationNumbers: ['AUTO'],
                  pricePerUnit: p.pricePerUnit,
                  wasQuantity: p.currentQuantity,
                  becameQuantity: p.currentQuantity - qty,
                  type: 'write-off',
                  quantity: qty,
                  sum: sum,
                  date: timestamp,
                  journalId: 'default'
                };
                newOperations.push(op);

                return {
                  ...p,
                  currentQuantity: p.currentQuantity - qty,
                  lastUpdate: timestamp,
                  history: [op, ...p.history]
                };
              }
              return p;
            });

            setParts(updatedParts);
            setOperations(prev => [...newOperations, ...prev]);
            updateLocalTimestamp();
            
            const actualSum = newOperations.reduce((acc, op) => acc + op.sum, 0);
            showToast(`Списано ${newOperations.length} наим. на сумму ${actualSum.toLocaleString('ru-RU')} ₽`);
            
            setShowAutoWriteOffModal(false);
            closeModal();
          }}
        />
      )}

      {showJournalForm && (
        <JournalForm 
          onSave={addJournal} 
          onClose={() => {
            setShowJournalForm(false);
            closeModal();
          }} 
        />
      )}

      {journalSelectAction && (
        <JournalSelectModal
          journals={journals}
          action={journalSelectAction}
          onClose={() => {
            setJournalSelectAction(null);
            closeModal();
          }}
          onSelect={(journal) => {
            if (journalSelectAction === 'export') {
              handleExportExcelForJournal(journal);
              setJournalSelectAction(null);
              closeModal();
            } else if (journalSelectAction === 'import') {
              handleImportExcelForJournal(journal);
              setJournalSelectAction(null);
              closeModal();
            } else if (journalSelectAction === 'csv') {
              setSelectedCsvJournal(journal);
              setJournalSelectAction(null);
              replaceModal('csv');
            }
          }}
        />
      )}

      {showTgSettings && (
        <TelegramSettingsModal
          onClose={() => {
            setShowTgSettings(false);
            closeModal();
          }}
          onSave={() => {
            setShowTgSettings(false);
            closeModal();
            showToast('Настройки Telegram сохранены');
          }}
        />
      )}

      {showSyncModal && (
        <SyncModal
          user={user}
          isSyncing={isSyncing}
          lastSync={lastSyncTime}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onSync={() => syncData(true)}
          onPull={handlePullData}
          onClose={() => {
            setShowSyncModal(false);
            closeModal();
          }}
        />
      )}

      {showSortModal && (
        <SortModal
          currentSort={sortConfig}
          onSort={(config) => {
            setSortConfig(config);
            showToast(`Сортировка применена`);
          }}
          onClose={() => {
            setShowSortModal(false);
            closeModal();
          }}
        />
      )}

      {showCsvModal && selectedCsvJournal && (
        <CsvOperationsModal
          journalType={selectedCsvJournal.type}
          onClose={() => {
            setShowCsvModal(false);
            setSelectedCsvJournal(null);
            closeModal();
          }}
          onExport={(startDate, endDate, typeOverride) => {
            handleExportCsvForJournal(selectedCsvJournal, startDate, endDate, typeOverride);
          }}
          onImport={(typeOverride) => {
            handleImportCsvForJournal(selectedCsvJournal, typeOverride);
          }}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center gap-2">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
