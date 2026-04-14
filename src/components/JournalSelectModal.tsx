import React from 'react';
import { X, Folder, Wallet } from 'lucide-react';
import { Journal } from '../types';

interface JournalSelectModalProps {
  journals: Journal[];
  action: 'export' | 'import' | 'csv';
  onClose: () => void;
  onSelect: (journal: Journal) => void;
}

export default function JournalSelectModal({ journals, action, onClose, onSelect }: JournalSelectModalProps) {
  const getActionText = () => {
    if (action === 'export') return 'экспорта';
    if (action === 'import') return 'импорта';
    return 'CSV операций';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-12 sm:pt-20 overflow-y-auto">
      <div className="bg-card-bg w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 mb-10">
        <div className="p-4 border-b border-card-border flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">
            Выберите альбом для {getActionText()}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-muted-foreground">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-3">
          {journals.map((journal) => (
            <button
              key={journal.id}
              onClick={() => onSelect(journal)}
              className="w-full p-4 flex items-center gap-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors text-left"
            >
              <div 
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${journal.color}20` }}
              >
                {journal.type === 'parts' ? (
                  <Wallet size={24} style={{ color: journal.color }} />
                ) : (
                  <Folder size={24} style={{ color: journal.color }} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{journal.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {journal.type === 'parts' ? 'Учёт деталей' : 'Журнал операций'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
