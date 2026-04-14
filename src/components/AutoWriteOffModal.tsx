import React, { useState } from 'react';
import { X, Wand2 } from 'lucide-react';

interface AutoWriteOffModalProps {
  onClose: () => void;
  onConfirm: (targetSum: number) => void;
}

export default function AutoWriteOffModal({ onClose, onConfirm }: AutoWriteOffModalProps) {
  const [sum, setSum] = useState<string>('3600');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numSum = parseFloat(sum);
    if (!isNaN(numSum) && numSum > 0) {
      onConfirm(numSum);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card-bg w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-card-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Wand2 size={20} className="text-blue-500" />
            Авто-списание
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Сумма списания (₽)
            </label>
            <input
              type="number"
              value={sum}
              onChange={(e) => setSum(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-foreground text-lg font-semibold"
              placeholder="3600"
              min="1"
              step="0.01"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              Будет выбрано от 1 до 5 случайных деталей из числа самых давних.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 font-semibold rounded-xl transition-colors active:scale-95"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all active:scale-[0.98]"
            >
              Списать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
