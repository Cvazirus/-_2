import { Operation } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface OperationDetailProps {
  operation: Operation;
  onCancel: (id: string) => void;
}

export default function OperationDetail({ operation, onCancel }: OperationDetailProps) {
  const InfoRow = ({ label, value, colorClass = 'text-foreground' }: { label: string, value: string | number, colorClass?: string }) => (
    <div className="flex justify-between items-center py-3 border-b border-card-border last:border-0">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className={`font-semibold ${colorClass}`}>{value}</span>
    </div>
  );

  return (
    <div className="bg-background min-h-[calc(100vh-64px)] p-4 space-y-6">
      <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-card-border">
        <InfoRow 
          label="Тип операции" 
          value={operation.type === 'arrival' ? 'Приход' : operation.type === 'write-off' ? 'Списание' : 'Возврат'} 
          colorClass={operation.type === 'arrival' ? 'text-green-600 dark:text-green-500' : 'text-yellow-600 dark:text-yellow-500'}
        />
        <InfoRow label="Дата" value={format(new Date(operation.date), 'd MMMM yyyy г.', { locale: ru })} />
        <InfoRow label="Номер детали" value={`${operation.partCode} ${operation.partName}`} />
        <InfoRow label="Номера операций" value={operation.operationNumbers.join(', ')} />
      </div>

      <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-card-border">
        <InfoRow label="Количество" value={`${operation.quantity} шт.`} colorClass="text-blue-600 dark:text-blue-400" />
        <InfoRow label="Цена за единицу" value={`${operation.pricePerUnit} ₽`} />
        <InfoRow label="Сумма операции" value={`${operation.sum.toLocaleString()} ₽`} colorClass="text-blue-600 dark:text-blue-400" />
      </div>

      <div className="bg-card-bg rounded-2xl p-4 shadow-sm border border-card-border">
        <InfoRow label="Было" value={`${operation.wasQuantity} шт.`} colorClass="text-muted-foreground" />
        <InfoRow label="Стало" value={`${operation.becameQuantity} шт.`} colorClass="text-blue-600 dark:text-blue-400" />
      </div>

      <button
        onClick={() => onCancel(operation.id)}
        className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all active:scale-[0.98] mt-4"
      >
        Отменить операцию
      </button>
    </div>
  );
}
