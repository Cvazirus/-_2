import { Part } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useState } from 'react';
import CalculatorModal from './CalculatorModal';
import WriteOffModal from './WriteOffModal';
import OperationsManagerModal from './OperationsManagerModal';
import { Trash2, X, MoreVertical } from 'lucide-react';

interface PartDetailProps {
  part: Part;
  onUpdate: (updatedData: Partial<Part>) => void;
  onDelete?: () => void;
  onManualWriteOff?: (qty: number, ops: string[]) => void;
}

export default function PartDetail({ part, onUpdate, onDelete, onManualWriteOff }: PartDetailProps) {
  const [editField, setEditField] = useState<{ 
    title: string, 
    key: keyof Part | 'newOperation' | 'operationPrice', 
    type: 'number' | 'text',
    meta?: string 
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOpsManager, setShowOpsManager] = useState(false);
  const [opToDelete, setOpToDelete] = useState<string | null>(null);
  const [pendingWriteOffQty, setPendingWriteOffQty] = useState<number | null>(null);

  const handleSave = (value: string | number) => {
    if (!editField) return;
    
    if (editField.key === 'currentQuantity' && typeof value === 'number') {
      if (value < part.currentQuantity && onManualWriteOff) {
        setPendingWriteOffQty(part.currentQuantity - value);
        setEditField(null);
        return;
      }
    }

    if (editField.key === 'newOperation' && typeof value === 'string') {
      const newOps = value.split(',').map(s => s.trim()).filter(s => s !== '');
      if (newOps.length > 0) {
        const combinedOps = [...part.operationNumbers, ...newOps];
        const newPrices = { ...(part.operationPrices || {}) };
        
        if (combinedOps.length === 1) {
          newPrices[combinedOps[0]] = part.pricePerUnit;
        }
        
        const newTotal = combinedOps.reduce((sum, op) => sum + (newPrices[op] || 0), 0);
        onUpdate({ 
          operationNumbers: combinedOps, 
          operationPrices: newPrices
        });
      }
      setEditField(null);
      return;
    }

    if (editField.key === 'operationPrice' && editField.meta && typeof value === 'number') {
      const currentPrices = part.operationPrices || {};
      const newPrices = {
        ...currentPrices,
        [editField.meta]: value
      };
      const newTotal = part.operationNumbers.reduce((sum, op) => sum + (newPrices[op] || 0), 0);
      onUpdate({
        operationPrices: newPrices
      });
      setEditField(null);
      return;
    }

    let finalValue: any = value;
    if (editField.key === 'operationNumbers' && typeof value === 'string') {
      finalValue = value.split(',').map(s => s.trim()).filter(s => s !== '');
    }

    onUpdate({ [editField.key as keyof Part]: finalValue });
    setEditField(null);
  };

  const InfoRow = ({ 
    label, 
    value, 
    colorClass = 'text-foreground', 
    onClick 
  }: { 
    label: string, 
    value: string | number, 
    colorClass?: string,
    onClick?: () => void
  }) => (
    <div 
      onClick={onClick}
      className={`flex justify-between items-center py-3 border-b border-card-border last:border-0 ${onClick ? 'cursor-pointer active:bg-muted transition-colors' : ''}`}
    >
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className={`font-semibold ${colorClass}`}>{value}</span>
    </div>
  );

  const getNeonColor = (cost: number) => {
    let r, g, b;
    if (cost < 1000) {
      const ratio = Math.max(0, cost) / 1000;
      r = Math.round(239 - (239 - 234) * ratio);
      g = Math.round(68 + (179 - 68) * ratio);
      b = Math.round(68 - (68 - 8) * ratio);
    } else if (cost <= 3000) {
      const ratio = (cost - 1000) / 2000;
      r = Math.round(234 - (234 - 34) * ratio);
      g = Math.round(179 + (197 - 179) * ratio);
      b = Math.round(8 + (94 - 8) * ratio);
    } else {
      r = 34;
      g = 197;
      b = 94;
    }
    return { r, g, b };
  };

  const totalCost = part.currentQuantity * part.pricePerUnit;
  const { r, g, b } = getNeonColor(totalCost);
  const neonColor = `rgba(${r}, ${g}, ${b}, 0.8)`; // Slightly more opaque for text

  return (
    <div className="bg-background min-h-[calc(100vh-64px)] p-4 space-y-6">
      <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-card-border">
        <InfoRow label="Номер детали" value={part.code} />
        <InfoRow label="Наименование детали" value={part.name} />
        <InfoRow label="Дата открытия карточки" value={format(new Date(part.history?.[part.history.length - 1]?.date || part.lastUpdate), 'dd.MM.yyyy HH:mm')} />
        <InfoRow 
          label="Цена за единицу" 
          value={`${part.pricePerUnit} ₽`} 
          onClick={() => setEditField({ title: 'Цена за единицу', key: 'pricePerUnit', type: 'number' })}
        />
        <InfoRow 
          label="Количество" 
          value={`${part.currentQuantity} шт.`} 
          colorClass="text-blue-600 dark:text-blue-400" 
          onClick={() => setEditField({ title: 'Количество', key: 'currentQuantity', type: 'number' })}
        />
        <div className="flex justify-between items-center py-3 border-b border-card-border last:border-0">
          <span className="text-muted-foreground font-medium">Итоговая сумма</span>
          <span 
            className="font-bold text-2xl"
            style={{ 
              color: `rgb(${r}, ${g}, ${b})`,
              textShadow: `0 0 10px ${neonColor}, 0 0 20px ${neonColor}`
            }}
          >
            {totalCost.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </div>
        
      <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-card-border">
        <div className="py-2">
          <div className="flex justify-between items-center mb-3">
            <span className="text-muted-foreground font-medium">Номера операций</span>
            <button 
              onClick={() => setShowOpsManager(true)} 
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <MoreVertical size={20} />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {part.operationNumbers.length > 0 ? part.operationNumbers.map((op, idx) => {
              const price = part.operationPrices?.[op] || 0;
              return (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-card-border last:border-0">
                <span className="font-medium text-foreground">{op}</span>
                <span className="text-muted-foreground">{price > 0 ? `${price} ₽` : 'Цена не указана'}</span>
              </div>
            )}) : (
              <span className="text-muted-foreground text-sm italic">Нет операций</span>
            )}
          </div>
          {part.operationNumbers.length > 0 && (
            <div className="mt-4 pt-3 border-t border-card-border flex justify-between items-center">
              <span className="text-muted-foreground font-medium text-sm">Общая цена операций</span>
              <span className="font-bold text-foreground">
                {part.operationNumbers.reduce((sum, op) => sum + (part.operationPrices?.[op] || 0), 0).toLocaleString('ru-RU')} ₽
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-card-border">
        <InfoRow 
          label="Примечания" 
          value={part.notes || '—'} 
          onClick={() => setEditField({ title: 'Примечания', key: 'notes', type: 'text' })}
        />
      </div>

      <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-card-border">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">История операций</h3>
        <div className="space-y-1">
          {part.history.length > 0 ? part.history.map((entry) => (
            <div key={entry.id} className="flex justify-between items-center py-2 border-b border-card-border last:border-0">
              <span className="text-muted-foreground text-sm">{format(new Date(entry.date), 'dd.MM.yyyy HH:mm')}</span>
              <span className={`font-medium ${entry.type === 'arrival' ? 'text-green-600 dark:text-green-500' : 'text-yellow-600 dark:text-yellow-500'}`}>
                {entry.type === 'arrival' ? 'Приход' : entry.type === 'write-off' ? 'Списание' : 'Возврат'} {entry.type === 'arrival' ? '+' : '-'}{entry.quantity} шт.
              </span>
            </div>
          )) : (
            <p className="text-muted-foreground text-center py-4 italic">История пуста</p>
          )}
        </div>
      </div>

      {onDelete && (
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
        >
          <Trash2 size={20} />
          Удалить деталь
        </button>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-card-bg w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-foreground mb-2">Удалить деталь?</h3>
            <p className="text-muted-foreground mb-6">
              Вы уверены, что хотите удалить деталь «{part.name}»? Это действие нельзя отменить, и вся история операций будет удалена.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl active:scale-95 transition-all"
              >
                Отмена
              </button>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete();
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl active:scale-95 transition-all shadow-lg shadow-red-500/30"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {opToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-card-bg w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-foreground mb-2">Удалить номер операции?</h3>
            <p className="text-muted-foreground mb-6">
              Вы уверены, что хотите удалить номер операции «{opToDelete}»?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setOpToDelete(null)}
                className="flex-1 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl active:scale-95 transition-all"
              >
                Отмена
              </button>
              <button 
                onClick={() => {
                  const newOps = part.operationNumbers.filter(o => o !== opToDelete);
                  onUpdate({ operationNumbers: newOps });
                  setOpToDelete(null);
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl active:scale-95 transition-all shadow-lg shadow-red-500/30"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {showOpsManager && (
        <OperationsManagerModal
          part={part}
          onUpdate={onUpdate}
          onClose={() => setShowOpsManager(false)}
        />
      )}

      {editField && (
        <CalculatorModal
          title={editField.title}
          initialValue={
            editField.key === 'newOperation' ? '' :
            editField.key === 'operationPrice' ? (editField.meta ? (part.operationPrices?.[editField.meta] || 0) : 0) :
            editField.key === 'operationNumbers' ? part.operationNumbers.join(', ') : 
            ((part[editField.key as keyof Part] ?? '') as string | number)
          }
          type={editField.type}
          manualOnly={editField.key === 'pricePerUnit' || editField.key === 'operationPrice'}
          onSave={handleSave}
          onClose={() => setEditField(null)}
        />
      )}

      {pendingWriteOffQty !== null && onManualWriteOff && (
        <WriteOffModal
          part={part}
          initialWriteOffQty={pendingWriteOffQty}
          onClose={() => setPendingWriteOffQty(null)}
          onConfirm={(qty, ops) => {
            setPendingWriteOffQty(null);
            onManualWriteOff(qty, ops);
          }}
        />
      )}
    </div>
  );
}
