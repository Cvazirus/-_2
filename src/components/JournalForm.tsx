import React, { useState } from 'react';
import { Journal } from '../types';
import { X } from 'lucide-react';

interface JournalFormProps {
  onSave: (journal: Partial<Journal>) => void;
  onClose: () => void;
}

export default function JournalForm({ onSave, onClose }: JournalFormProps) {
  const [formData, setFormData] = useState<Partial<Journal>>({
    name: '',
    type: 'parts',
    color: '#007AFF',
  });

  const colors = ['#007AFF', '#FF9500', '#34C759', '#FF3B30', '#AF52DE', '#5856D6'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-12 sm:pt-20 overflow-y-auto">
      <div className="bg-card-bg w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 mb-10">
        <div className="p-4 border-b border-card-border flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">Новый журнал</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-muted-foreground">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Название журнала</label>
            <input
              required
              autoFocus
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-foreground"
              placeholder="Например: Склад №1"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Тип журнала</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'parts' })}
                className={`p-3 rounded-xl border transition-all ${
                  formData.type === 'parts' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400 font-medium' 
                    : 'bg-background border-input text-muted-foreground'
                }`}
              >
                Детали
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'operations' })}
                className={`p-3 rounded-xl border transition-all ${
                  formData.type === 'operations' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400 font-medium' 
                    : 'bg-background border-input text-muted-foreground'
                }`}
              >
                Операции
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1">Цвет</label>
            <div className="flex gap-3 justify-between">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  className={`w-10 h-10 rounded-full transition-all ${
                    formData.color === c ? 'ring-4 ring-offset-2 ring-blue-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
          >
            Создать
          </button>
        </form>
      </div>
    </div>
  );
}
