import React, { useState } from 'react';
import { X, Download, Upload } from 'lucide-react';

interface CsvOperationsModalProps {
  onClose: () => void;
  onExport: (startDate: string, endDate: string, typeOverride?: 'parts' | 'operations') => void;
  onImport: (typeOverride?: 'parts' | 'operations') => void;
  journalType?: 'parts' | 'operations';
}

export default function CsvOperationsModal({ onClose, onExport, onImport, journalType }: CsvOperationsModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedType, setSelectedType] = useState<'parts' | 'operations'>(journalType || 'parts');

  const isOperations = selectedType === 'operations';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-12 sm:pt-20 overflow-y-auto">
      <div className="bg-card-bg w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 mb-10">
        <div className="p-4 border-b border-card-border flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">
            Экспорт и импорт в CSV
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          {!journalType && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">Тип данных</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedType('parts')}
                  className={`p-3 rounded-xl border transition-all ${
                    selectedType === 'parts' 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400 font-medium' 
                      : 'bg-background border-input text-muted-foreground'
                  }`}
                >
                  Детали
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('operations')}
                  className={`p-3 rounded-xl border transition-all ${
                    selectedType === 'operations' 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400 font-medium' 
                      : 'bg-background border-input text-muted-foreground'
                  }`}
                >
                  Операции
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Экспорт {isOperations ? 'операций' : 'деталей'}</h3>
            
            {isOperations && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Начало периода (необязательно)</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Конец периода (необязательно)</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-muted border border-card-border rounded-xl px-3 py-2 text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}
            
            <button
              onClick={() => onExport(startDate, endDate, !journalType ? selectedType : undefined)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Экспортировать в CSV
            </button>
          </div>

          <div className="border-t border-card-border pt-4 space-y-4">
            <h3 className="font-medium text-foreground">Импорт {isOperations ? 'операций' : 'деталей'}</h3>
            <button
              onClick={() => onImport(!journalType ? selectedType : undefined)}
              className="w-full py-3 px-4 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              Импортировать из CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
