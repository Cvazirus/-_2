import React, { useState, useEffect } from 'react';
import { Part } from '../types';
import { X } from 'lucide-react';

interface PartFormProps {
  part?: Part | null;
  initialCode?: string;
  onSave: (part: Partial<Part>) => void;
  onClose: () => void;
}

export default function PartForm({ part, initialCode, onSave, onClose }: PartFormProps) {
  const [formData, setFormData] = useState<Partial<Part>>({
    code: initialCode || '',
    name: '',
    pricePerUnit: 0,
    currentQuantity: 0,
    operationNumbers: [],
    notes: '',
  });

  useEffect(() => {
    if (part) {
      setFormData(part);
    }
  }, [part]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-12 sm:pt-20 overflow-y-auto">
      <div className="bg-card-bg w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 mb-10">
        <div className="p-4 border-b border-card-border flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">{part ? 'Редактировать деталь' : 'Новая деталь'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-muted-foreground">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Номер детали</label>
            <input
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-foreground"
              placeholder="Например: 4516.12.05.112"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Название</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-foreground"
              placeholder="Например: Балка"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground ml-1">Цена за ед.</label>
              <input
                type="number"
                required
                value={formData.pricePerUnit?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, pricePerUnit: Number(e.target.value) })}
                className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground ml-1">Количество</label>
              <input
                type="number"
                required
                value={formData.currentQuantity?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, currentQuantity: Number(e.target.value) })}
                className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Номера операций (через запятую)</label>
            <input
              value={formData.operationNumbers?.join(', ')}
              onChange={(e) => setFormData({ ...formData, operationNumbers: e.target.value.split(',').map(s => s.trim()) })}
              className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-foreground"
              placeholder="005, 015"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Примечания</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-foreground min-h-[80px]"
              placeholder="Дополнительная информация..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all active:scale-[0.98] mt-4"
          >
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
}
