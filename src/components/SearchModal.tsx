import React, { useState, useMemo } from 'react';
import { Search, X, Plus, PackageSearch } from 'lucide-react';
import { Part } from '../types';

interface SearchModalProps {
  parts: Part[];
  onClose: () => void;
  onSearch: (query: string) => void;
  onCreatePart: (code: string) => void;
}

export default function SearchModal({ parts, onClose, onSearch, onCreatePart }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [forceNotFound, setForceNotFound] = useState(false);

  const trimmedQuery = query.trim();
  
  const matchingParts = useMemo(() => {
    if (!trimmedQuery) return [];
    return parts.filter(p => p.code.toLowerCase().includes(trimmedQuery.toLowerCase()));
  }, [parts, trimmedQuery]);

  const exactMatch = useMemo(() => {
    if (!trimmedQuery) return null;
    return parts.find(p => p.code.toLowerCase() === trimmedQuery.toLowerCase());
  }, [parts, trimmedQuery]);

  const isNotFound = trimmedQuery.length > 0 && matchingParts.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedQuery) return;

    if (exactMatch || matchingParts.length > 0) {
      // If there's an exact match, search for it. Otherwise, search for the query to filter the list.
      onSearch(exactMatch ? exactMatch.code : trimmedQuery);
      onClose();
    } else {
      setForceNotFound(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-12 sm:pt-20 overflow-y-auto">
      <div className="bg-card-bg w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 mb-10">
        <div className="p-4 border-b border-card-border flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">Поиск детали</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-muted-foreground">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setForceNotFound(false);
                }}
                className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-foreground"
                placeholder="Введите номер детали..."
              />
            </div>

            {/* Suggestions List */}
            {trimmedQuery && matchingParts.length > 0 && !forceNotFound && (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-card-border bg-card-bg shadow-sm divide-y divide-card-border">
                {matchingParts.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSearch(p.code);
                      onClose();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform shrink-0">
                        <PackageSearch size={16} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-foreground truncate">{p.code}</span>
                        <span className="text-xs text-muted-foreground truncate">{p.name || 'Без названия'}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground shrink-0 ml-2">{p.currentQuantity} шт.</span>
                  </button>
                ))}
              </div>
            )}

            {(!isNotFound && !forceNotFound) ? (
              <button
                type="submit"
                disabled={!trimmedQuery}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all active:scale-[0.98]"
              >
                {matchingParts.length > 0 ? `Показать результаты (${matchingParts.length})` : 'Найти'}
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/30">
                  <p className="text-orange-800 dark:text-orange-300 text-sm font-medium text-center">
                    Деталь с номером «{trimmedQuery}» не найдена в базе.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onCreatePart(trimmedQuery);
                    onClose();
                  }}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-200 dark:shadow-green-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Завести карточку
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
