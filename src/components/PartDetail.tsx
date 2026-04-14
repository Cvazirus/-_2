import { Part } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useState } from 'react';
import CalculatorModal from './CalculatorModal';
import { Trash2, X } from 'lucide-react';

interface PartDetailProps {
  part: Part;
  onUpdate: (updatedData: Partial<Part>) => void;
  onDelete?: () => void;
}

export default function PartDetail({ part, onUpdate, onDelete }: PartDetailProps) {
  const [editField, setEditField] = useState<{ title: string, key: keyof Part | 'newOperation', type: 'number' | 'text' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = (value: string | number) => {
    if (!editField) return;
    
    if (editField.key === 'newOperation' && typeof value === 'string') {
      const newOps = value.split(',').map(s => s.trim()).filter(s => s !== '');
      if (newOps.length > 0) {
        onUpdate({ operationNumbers: [...part.operationNumbers, ...newOps] });
      }
      setEditField(null);
      return;
    }

    let finalValue: any = value;
    if (editField.key === 'operationNumbers' && typeof value === 'string') {
      finalValue = value.split(',').map(s => s.trim()).filter(s => s !== '');
    }

    onUpdate({ [editField.key]: finalValue });
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

  return (
    <div className="bg-background min-h-[calc(100vh-64px)] p-4 space-y-6">
      <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-card-border">
        <InfoRow label="Номер детали" value={`${part.code} ${part.name}`} />
        <InfoRow label="Дата изменения" value={format(new Date(part.lastUpdate), 'dd.MM.yyyy HH:mm')} />
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
      </div>
        
      <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-card-border">
        <div className="py-2">
          <div className="flex justify-between items-center mb-3">
            <span className="text-muted-foreground font-medium">Номера операций</span>
            <button 
              onClick={() => setEditField({ title: 'Добавить операцию', key: 'newOperation', type: 'text' })} 
              className="text-blue-600 dark:text-blue-400 text-sm font-medium px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg active:scale-95 transition-all"
            >
              Добавить
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {part.operationNumbers.length > 0 ? part.operationNumbers.map((op, idx) => (
              <span key={idx} className="bg-muted px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 text-foreground">
                {op}
                <button 
                  onClick={() => {
                    const newOps = part.operationNumbers.filter((_, i) => i !== idx);
                    onUpdate({ operationNumbers: newOps });
                  }} 
                  className="text-muted-foreground hover:text-red-500 active:scale-90 transition-all p-0.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X size={14} />
                </button>
              </span>
            )) : (
              <span className="text-muted-foreground text-sm italic">Нет операций</span>
            )}
          </div>
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

      {editField && (
        <CalculatorModal
          title={editField.title}
          initialValue={
            editField.key === 'newOperation' ? '' :
            editField.key === 'operationNumbers' ? part.operationNumbers.join(', ') : 
            ((part[editField.key as keyof Part] ?? '') as string | number)
          }
          type={editField.type}
          manualOnly={editField.key === 'pricePerUnit'}
          onSave={handleSave}
          onClose={() => setEditField(null)}
        />
      )}
    </div>
  );
}
