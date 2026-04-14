import { X, Calendar, DollarSign, Hash, ArrowDown, ArrowUp } from 'lucide-react';

export type SortKey = 'date' | 'cost' | 'quantity' | null;
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

interface SortModalProps {
  currentSort: SortConfig;
  onSort: (config: SortConfig) => void;
  onClose: () => void;
}

export default function SortModal({ currentSort, onSort, onClose }: SortModalProps) {
  const options = [
    { key: 'date', label: 'По дате (изменения)', icon: Calendar },
    { key: 'cost', label: 'По итоговой стоимости', icon: DollarSign },
    { key: 'quantity', label: 'По количеству', icon: Hash },
  ] as const;

  const handleToggle = (key: SortKey) => {
    if (currentSort.key === key) {
      // Turn off
      onSort({ key: null, direction: currentSort.direction });
    } else {
      // Turn on
      onSort({ key, direction: currentSort.direction });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 pb-8 sm:p-4">
      <div className="bg-card-bg w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-card-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">Сортировка</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Direction Toggle */}
          <div className="bg-muted/80 rounded-2xl p-1 flex">
            <button
              onClick={() => onSort({ key: currentSort.key, direction: 'desc' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${currentSort.direction === 'desc' ? 'bg-card-bg text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ArrowDown size={16} /> По убыванию
            </button>
            <button
              onClick={() => onSort({ key: currentSort.key, direction: 'asc' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${currentSort.direction === 'asc' ? 'bg-card-bg text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ArrowUp size={16} /> По возрастанию
            </button>
          </div>

          {/* Sort Options */}
          <div className="space-y-1">
            {options.map(opt => {
              const Icon = opt.icon;
              const isActive = currentSort.key === opt.key;
              return (
                <div key={opt.key} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200 font-medium">
                    <div className={`p-2.5 rounded-xl transition-colors ${isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-gray-100 text-muted-foreground dark:bg-gray-800 dark:text-gray-400'}`}>
                      <Icon size={18} />
                    </div>
                    {opt.label}
                  </div>
                  
                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggle(opt.key)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${isActive ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
