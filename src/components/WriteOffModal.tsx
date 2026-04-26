import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Part } from '../types';

interface WriteOffModalProps {
  part: Part;
  initialWriteOffQty: number;
  onClose: () => void;
  onConfirm: (qty: number, includedOps: string[], pricePerUnit: number) => void;
}

export default function WriteOffModal({ part, initialWriteOffQty, onClose, onConfirm }: WriteOffModalProps) {
  const [qty, setQty] = useState(initialWriteOffQty.toString());
  const [mode, setMode] = useState<'total' | 'ops'>('total');
  const [includedOps, setIncludedOps] = useState<string[]>(part.operationNumbers);

  const toggleOp = (op: string) => {
    setIncludedOps(prev =>
      prev.includes(op) ? prev.filter(o => o !== op) : [...prev, op]
    );
  };

  const numQty = parseInt(qty) || 0;

  const effectivePrice = mode === 'total'
    ? part.pricePerUnit
    : includedOps.reduce((sum, op) => sum + (part.operationPrices?.[op] || 0), 0);

  const hasOps = part.operationNumbers.length > 0;
  const partialOps = mode === 'ops' && includedOps.length < part.operationNumbers.length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
      <div className="bg-card-bg w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-card-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">Списание детали</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Количество */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Количество к списанию</label>
            <input
              type="number"
              value={qty}
              onChange={e => setQty(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-foreground text-lg"
              min="1"
              max={part.currentQuantity}
            />
          </div>

          {/* Режим списания */}
          {hasOps && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Режим списания</label>
              <div className="flex bg-background rounded-xl border border-card-border p-1 gap-1">
                <button
                  onClick={() => setMode('total')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'total' ? 'bg-blue-600 text-white' : 'text-muted-foreground'
                  }`}
                >
                  Всей суммой
                </button>
                <button
                  onClick={() => setMode('ops')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'ops' ? 'bg-blue-600 text-white' : 'text-muted-foreground'
                  }`}
                >
                  По операциям
                </button>
              </div>
            </div>
          )}

          {/* Всей суммой */}
          {mode === 'total' && (
            <div className="bg-muted/50 rounded-xl p-4 flex justify-between items-center border border-card-border">
              <span className="text-sm text-muted-foreground">Цена за единицу</span>
              <span className="font-bold text-foreground">{part.pricePerUnit.toLocaleString('ru-RU')} ₽</span>
            </div>
          )}

          {/* По операциям */}
          {mode === 'ops' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Выберите выполненные операции</label>
              <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                {part.operationNumbers.map(op => (
                  <label key={op} className="flex items-center gap-3 p-3 rounded-xl border border-card-border cursor-pointer hover:bg-muted transition-colors">
                    <input
                      type="checkbox"
                      checked={includedOps.includes(op)}
                      onChange={() => toggleOp(op)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="font-medium text-foreground">Операция {op}</span>
                      <span className="text-muted-foreground font-medium">{(part.operationPrices?.[op] || 0).toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {partialOps && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex gap-3 text-yellow-600 dark:text-yellow-500">
              <AlertTriangle className="shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium leading-snug">Выбраны не все операции — сумма будет рассчитана только по выбранным.</p>
            </div>
          )}

          {/* Итог */}
          <div className="bg-muted rounded-xl p-4 flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Итоговая сумма:</span>
            <span className="text-xl font-bold text-foreground">{(numQty * effectivePrice).toLocaleString('ru-RU')} ₽</span>
          </div>

          <button
            onClick={() => onConfirm(numQty, mode === 'ops' ? includedOps : part.operationNumbers, effectivePrice)}
            disabled={numQty <= 0 || numQty > part.currentQuantity}
            className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
          >
            Подтвердить списание
          </button>
        </div>
      </div>
    </div>
  );
}
