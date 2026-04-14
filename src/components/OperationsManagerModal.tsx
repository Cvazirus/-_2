import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Part } from '../types';

interface OperationsManagerModalProps {
  part: Part;
  onUpdate: (updatedData: Partial<Part>) => void;
  onClose: () => void;
}

export default function OperationsManagerModal({ part, onUpdate, onClose }: OperationsManagerModalProps) {
  const [ops, setOps] = useState<{name: string, price: number}[]>(
    part.operationNumbers.map(op => ({
      name: op,
      price: part.operationPrices?.[op] || 0
    }))
  );
  const [newOpName, setNewOpName] = useState('');
  const [newOpPrice, setNewOpPrice] = useState('');

  const handleAdd = () => {
    if (!newOpName.trim()) return;
    // Split by comma in case user pastes multiple
    const newNames = newOpName.split(',').map(s => s.trim()).filter(s => s !== '');
    const price = Number(newOpPrice) || 0;
    
    const newOps = newNames.map(name => ({ name, price }));
    setOps([...ops, ...newOps]);
    setNewOpName('');
    setNewOpPrice('');
  };

  const handleRemove = (index: number) => {
    setOps(ops.filter((_, i) => i !== index));
  };

  const handlePriceChange = (index: number, price: number) => {
    const newOps = [...ops];
    newOps[index].price = price;
    setOps(newOps);
  };

  const handleSave = () => {
    const operationNumbers = ops.map(o => o.name);
    const operationPrices = ops.reduce((acc, o) => {
      acc[o.name] = o.price;
      return acc;
    }, {} as Record<string, number>);

    onUpdate({ operationNumbers, operationPrices });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
      <div className="bg-card-bg w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-card-border flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-foreground">Управление операциями</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Номер</label>
              <input 
                value={newOpName}
                onChange={e => setNewOpName(e.target.value)}
                placeholder="Напр. 015"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                className="w-full px-3 py-2 bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Цена (₽)</label>
              <input 
                type="number"
                value={newOpPrice}
                onChange={e => setNewOpPrice(e.target.value)}
                placeholder="0"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                className="w-full px-3 py-2 bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
              />
            </div>
            <button 
              onClick={handleAdd}
              disabled={!newOpName.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl disabled:opacity-50 hover:bg-blue-600 transition-colors h-[42px]"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2 mt-4">
            {ops.map((op, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <span className="font-medium text-foreground flex-1">{op.name}</span>
                <input 
                  type="number"
                  value={op.price || ''}
                  onChange={e => handlePriceChange(idx, Number(e.target.value))}
                  placeholder="Цена"
                  className="w-24 px-2 py-1 bg-background border border-input rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-foreground text-sm text-right"
                />
                <span className="text-muted-foreground text-sm">₽</span>
                <button 
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {ops.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Нет добавленных операций
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-card-border shrink-0">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
}
